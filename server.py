"""
LandingForge IA · Servidor local
- Sirve la app en http://localhost:8765
- Lee la clave de API desde el archivo .env (nunca la envía al navegador)
- Reenvía las peticiones de la app al proveedor de IA (Gemini por defecto) con streaming

Uso:  python server.py
Solo usa la biblioteca estándar de Python: no hay que instalar nada.
"""
import http.server
import json
import os
import re
import sys
import urllib.error
import urllib.request
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", "8765"))  # python server.py [puerto]


def load_env(path):
    """Lee KEY=VALOR de un archivo .env (ignora líneas vacías y comentarios)."""
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


ENV = {**load_env(ROOT / ".env"), **{k: v for k, v in os.environ.items() if k.startswith("AI_")}}
# Varias claves separadas por comas (AI_API_KEYS); si una falla se usa la siguiente. AI_API_KEY sigue valiendo.
API_KEYS = [k.strip() for k in (ENV.get("AI_API_KEYS") or ENV.get("AI_API_KEY", "")).split(",") if k.strip()]
BASE_URL = ENV.get("AI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai").rstrip("/")
MODEL = ENV.get("AI_MODEL", "gemini-3.8-flash")
# Si el modelo principal falla (saturado, sin permiso o sin cuota), se prueban estos en orden
FALLBACKS = [m.strip() for m in ENV.get("AI_FALLBACK_MODELS", "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash,gemini-3-flash-preview").split(",") if m.strip()]
RETRY_CODES = {403, 404, 429, 500, 503}
# (clave, modelo) que agotaron la cuota gratuita del día: se saltan y se vuelven a probar cada hora
EXHAUSTED = {}
RECHECK_SECONDS = 3600
BAD_KEYS = set()  # claves rechazadas por Google (inválidas o revocadas)
LAST_GOOD = None                  # último modelo que completó una respuesta
FINISH_RE = re.compile(rb'"finish_reason":"(?:stop|length|content_filter|tool_calls|STOP|MAX_TOKENS)"')
# Banco de landings compartido: un archivo JSON por landing en la carpeta bank/ (se sube a git con el proyecto)
BANK_DIR = ROOT / "bank"
BANK_ID = re.compile(r"^[A-Za-z0-9_-]{1,40}$")
MAX_ITEM_BYTES = 8 * 1024 * 1024

def summary(results):
    """Resume en español por qué fallaron todos los modelos."""
    quota = [m for m, c in results if c == 429]
    busy = [m for m, c in results if c in (500, 503)]
    other = [f"{m} ({'ninguna clave válida' if c == 401 else c})" for m, c in results if c not in (429, 500, 503)]
    parts = []
    if quota:
        parts.append("sin cuota gratuita por hoy: " + ", ".join(quota))
    if busy:
        parts.append("saturados por Google ahora mismo: " + ", ".join(busy))
    if other:
        parts.append("no disponibles: " + ", ".join(other))
    advice = ("Prueba de nuevo en unos minutos." if busy else
              "La cuota gratuita se renueva cada día; mientras tanto usa el motor local.")
    return "Ningún modelo de IA pudo responder (" + "; ".join(parts) + "). " + advice


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Evita que el navegador use versiones viejas de los archivos de la app
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        # Nunca servir .env, server.py ni archivos ocultos
        if any(part.startswith(".") for part in path.split("/")) or path.endswith(".py"):
            self.send_error(404)
            return
        if path == "/api/bank":
            items = []
            for f in BANK_DIR.glob("*.json"):
                try:
                    items.append(json.loads(f.read_text(encoding="utf-8")))
                except (OSError, json.JSONDecodeError):
                    print(f"  aviso: no se pudo leer {f.name}", flush=True)
            items.sort(key=lambda x: x.get("createdAt", 0), reverse=True)
            self.send_json(200, items)
            return
        if path == "/api/config":
            self.send_json(200, {"ready": bool(API_KEYS), "model": MODEL, "keys": len(API_KEYS)})
            return
        super().do_GET()

    def bank_id(self):
        """Devuelve el id de /api/bank/<id> si es válido; si no, responde el error y devuelve None."""
        m = re.fullmatch(r"/api/bank/([^/?]+)", self.path.split("?", 1)[0])
        if not m or not BANK_ID.match(m.group(1)):
            self.send_json(404, {"error": {"message": "Landing no encontrada"}})
            return None
        return m.group(1)

    def do_PUT(self):
        item_id = self.bank_id()
        if not item_id:
            return
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_ITEM_BYTES:
            self.send_json(413, {"error": {"message": "La landing es demasiado grande"}})
            return
        try:
            item = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": {"message": "JSON inválido"}})
            return
        if not isinstance(item, dict) or not isinstance(item.get("html"), str) or not isinstance(item.get("prompt"), str):
            self.send_json(400, {"error": {"message": "Faltan el HTML o el prompt de la landing"}})
            return
        item["id"] = item_id
        BANK_DIR.mkdir(exist_ok=True)
        (BANK_DIR / f"{item_id}.json").write_text(json.dumps(item, ensure_ascii=False, indent=1), encoding="utf-8")
        self.send_json(200, {"ok": True})

    def do_DELETE(self):
        item_id = self.bank_id()
        if not item_id:
            return
        (BANK_DIR / f"{item_id}.json").unlink(missing_ok=True)
        self.send_json(200, {"ok": True})

    def do_POST(self):
        if self.path != "/api/chat/completions":
            self.send_error(404)
            return
        if not API_KEYS:
            self.send_json(500, {"error": {"message": "Falta AI_API_KEYS en el archivo .env"}})
            return
        length = int(self.headers.get("Content-Length") or 0)
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self.send_json(400, {"error": {"message": "JSON inválido"}})
            return
        models = list(dict.fromkeys([payload.get("model") or MODEL] + FALLBACKS))  # sin repetidos, en orden
        # La respuesta empieza de inmediato: mientras se buscan modelo y clave, la app recibe avisos de progreso
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.end_headers()

        def emit(obj):
            self.wfile.write(("data: " + json.dumps(obj, ensure_ascii=False) + "\n\n").encode("utf-8"))
            self.wfile.flush()

        global LAST_GOOD
        tried_bad = []
        try:
            while True:
                cand = [m for m in models if m not in tried_bad]
                if LAST_GOOD in cand:                      # el último modelo que terminó bien va primero
                    cand.remove(LAST_GOOD)
                    cand.insert(0, LAST_GOOD)
                upstream = self.find_upstream(payload, cand, emit)
                if upstream is None:
                    return
                used = payload.get("model")
                sent, finished, tail, cut = 0, False, b"", None
                with upstream:
                    try:
                        while chunk := upstream.read1(8192):
                            self.wfile.write(chunk)
                            self.wfile.flush()
                            sent += len(chunk)
                            window = (tail + chunk).replace(b" ", b"")
                            if FINISH_RE.search(window):
                                finished = True
                            tail = chunk[-80:]
                    except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                        raise
                    except Exception as err:  # Google cortó la conexión a mitad de la respuesta
                        cut = repr(err)
                if finished:
                    LAST_GOOD = used
                    print(f"  respuesta completa de {used}: {sent} bytes", flush=True)
                    return
                # La respuesta terminó sin señal de fin: Google la cortó. Se descarta y se prueba otro modelo.
                print(f"  {used} cortó la respuesta tras {sent} bytes{' (' + cut + ')' if cut else ''}", flush=True)
                tried_bad.append(used)
                if len(tried_bad) >= 4 or len(tried_bad) >= len(models):
                    self.wfile.write(b"\n\n")
                    emit({"error": {"message": "Google cortó la respuesta varias veces seguidas (modelos gratuitos inestables ahora mismo). Vuelve a intentarlo en un minuto o usa el motor local.", "lf": True}})
                    return
                self.wfile.write(b"\n\n")
                emit({"lf_restart": True, "lf_status": f"{used} cortó la respuesta a los {sent // 1024} KB. Probando otro modelo…"})
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # el usuario pulsó «Detener» o cerró la pestaña

    def find_upstream(self, payload, models, emit):
        """Prueba modelo por modelo y clave por clave hasta que uno responda. Devuelve la respuesta o None."""
        results = []
        total = len(API_KEYS)
        # Primero el mejor modelo con cualquier clave; si el modelo está saturado se pasa al siguiente modelo,
        # si la clave no tiene cuota o no es válida se prueba la siguiente clave con el mismo modelo
        for model in models:
            code = None
            for n, key in enumerate(API_KEYS, 1):
                if key in BAD_KEYS:
                    continue
                if time.time() - EXHAUSTED.get((key, model), 0) < RECHECK_SECONDS:
                    code = code or 429
                    continue
                emit({"lf_status": f"Esperando a {model} (clave {n} de {total}). Si acepta, primero piensa el diseño: puede tardar 1–2 min…"})
                payload["model"] = model
                req = urllib.request.Request(
                    BASE_URL + "/chat/completions",
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json", "Authorization": "Bearer " + key},
                    method="POST",
                )
                try:
                    upstream = urllib.request.urlopen(req, timeout=600)
                    print(f"  {model} con la clave {n}: respondiendo", flush=True)
                    emit({"lf_status": f"Conectado con {model} (clave {n}). La IA está pensando el diseño…", "lf_model": model})
                    return upstream
                except urllib.error.HTTPError as err:
                    body = err.read().decode("utf-8", "replace")
                    print(f"  {model} con la clave {n}: {err.code}", flush=True)
                    if err.code == 401 or (err.code in (400, 403) and "API key" in body):
                        BAD_KEYS.add(key)  # clave inválida: no se vuelve a usar
                        continue
                    if err.code == 429:
                        if "PerDay" in body:
                            EXHAUSTED[(key, model)] = time.time()
                        code = 429
                        continue  # otra clave puede tener cuota
                    code = err.code
                    break  # saturado o no disponible: lo mismo pasará con otras claves
                except urllib.error.URLError as err:
                    emit({"error": {"message": f"No se pudo conectar con el proveedor: {err.reason}", "lf": True}})
                    return None
            results.append((model, code or 401))
            if code is not None and code not in RETRY_CODES:
                break  # error de la petición (no del modelo): no tiene sentido probar otros
        emit({"error": {"message": summary(results), "lf": True}})
        return None

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")  # tildes correctas en la consola de Windows
    # Solo escucha en este computador: nadie de la red puede usar la clave
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    estado = f"{len(API_KEYS)} clave(s) cargada(s), modelo {MODEL}" if API_KEYS else "SIN clave: crea el archivo .env (mira .env.example)"
    print(f"LandingForge IA en http://localhost:{PORT}  ·  IA: {estado}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
