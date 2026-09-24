# LandingForge IA

**Aplicación web para generar automáticamente prompts de landing pages, combinarlos, ejecutarlos y guardar las mejores landings junto al prompt que las creó.**

La app convierte las **8 técnicas avanzadas de diseño de landing pages con IA** del tratado de la clase en prompts completos, listos para usar:

| Fase | Técnica | Qué aporta al prompt |
|---|---|---|
| Descubrir | **T1 · Cadenas semilla (SSoT)** | Ancla la estética a 1 o 2 estilos (Bauhaus, suizo, brutalismo, Art Déco, Ma japonés, Fibonacci…) y prohíbe los clichés. |
| Descubrir | **T2 · Prompts ambiciosos** | Marco de copy (AIDA, PAS, BAB, 4P, StoryBrand), nivel de consciencia del mercado, sesgos cognitivos, inoculación de objeciones. |
| Definir | **T3 · Bucles con subagentes** | Agente creador + agente crítico (UX, CRO, accesibilidad…), iteraciones y test A/B del CTA. |
| Definir | **T6 · Diseño sustractivo** | % de elementos a eliminar, navegación mínima, máximo de campos del formulario. |
| Entregar | **T4 · Generación de imágenes** | Prompts de imagen en inglés para Midjourney / DALL·E / Flux, coherentes con la marca. |
| Entregar | **T5 · Generación de vídeo** | Prompt de vídeo (Runway, Luma, Sora…) con cámara, duración y propósito. |
| Entregar | **T7 · Restricciones negativas** | Palabras prohibidas y negativas visuales para quitar la «huella» de la IA. |
| Entregar | **T8 · Redacción humana** | Voz de marca, storytelling problema → alivio, micro-copy persuasivo. |

---

## Cómo abrirla

No necesita instalación ni internet para funcionar (solo para las fuentes tipográficas y el modo «IA real»).

1. Abre la carpeta `LandingForge`.
2. Haz doble clic en **`index.html`** (Chrome, Edge o Firefox actualizados).

### Con IA real y la clave en `.env` (recomendado)

1. Copia `.env.example` como `.env` y pega tu clave en `AI_API_KEYS` (puedes poner varias separadas por comas: si una falla se usa la siguiente). Gemini gratis: https://aistudio.google.com/apikey.
2. Dentro de la carpeta `LandingForge`, ejecuta `python server.py` (no hay que instalar nada).
3. Entra a `http://localhost:8765`. En el Estudio, «IA real» queda seleccionada con la clave del servidor: no hay que pegar nada.

- El servidor lee la clave del `.env` y llama a la IA por su cuenta: **la clave nunca llega al navegador** y el servidor no deja descargar el `.env`.
- Si el modelo principal (`AI_MODEL`) está saturado o sin cuota, prueba en orden los de `AI_FALLBACK_MODELS`.
- La cuota gratuita de Gemini es de unas 20 peticiones al día por modelo.
- **No entregues ni compartas el archivo `.env`**; entrega `.env.example`.

---

## Cómo se usa (4 pasos)

### 1 · Proyecto
Escribe el **tema** (único campo obligatorio) y los datos básicos: marca, sector, objetivo de conversión, público, problema, propuesta de valor, beneficios, objeciones, prueba social, oferta, tono, idioma, colores y formato de salida.
- **Cargar un ejemplo** rellena un proyecto completo (6 ejemplos) y sugiere técnicas.
- El medidor **Fuerza del brief** indica qué falta para que el prompt sea más preciso.
- Todo se guarda automáticamente en el navegador.

### 2 · Técnicas y prompts
- Marca una o varias técnicas. Cada tarjeta tiene **opciones propias** (semillas, marco de copy, perfiles del crítico, herramienta de imagen, etc.) y un botón **«¿Por qué funciona?»**.
- **Generar solo esta** → un prompt de esa técnica.
- **✨ Redactar con IA** (activo cuando hay IA configurada): la IA escribe el prompt a partir de tu proyecto, las técnicas elegidas y su fundamento del tratado; se ve redactándose en vivo y lleva la etiqueta «✨ IA». Sin IA, los prompts se arman al instante con plantillas.
- **Un prompt por técnica** → genera un prompt independiente por cada técnica marcada.
- **Prompt combinado** (2 o más técnicas) → un único prompt que ordena las técnicas por fases (Descubrir → Definir → Entregar), añade **sinergias entre técnicas**, **restricciones consolidadas**, **entregables** y un **checklist de calidad**.
- Combinaciones rápidas: *Máxima conversión*, *Disruptivo visual*, *Auténtico anti-IA* y *Tratado completo*.
- Cada prompt se puede **editar**, **copiar**, **descargar en .md** o **ejecutar**. El historial guarda los últimos 60.

### 3 · Estudio (ejecutar el prompt)
Elige el prompt y el motor:
- **Motor local** (instantáneo, sin conexión): construye una landing page real aplicando las técnicas del prompt. Cada técnica cambia el resultado de forma visible (ver tabla abajo).
- **IA real**: envía el prompt a **Claude** (API de Anthropic, modelos Opus 5, Sonnet 5 o Haiku 4.5) o a cualquier proveedor compatible con `/chat/completions` (OpenAI, Gemini, Groq, OpenRouter, Ollama local). La landing se va dibujando en vivo mientras se genera.

Con IA real, la pestaña **En vivo** muestra la construcción paso a paso: los pasos que va completando la IA (estilos, encabezado, cada sección con su título, formulario, pie…), la página a medio construir y el código apareciendo en tiempo real.

La vista previa tiene modos **escritorio / tableta / móvil**, pestañas **Vista / Código / Informe**, y botones para **abrir en otra pestaña**, **descargar el HTML** y **guardar en el banco**.

### 4 · Banco de landings
- Cada landing aparece con su **miniatura en vivo y, al lado, el prompt que la creó**.
- **Ver landing + prompt** abre la vista dividida: la web a la izquierda y el prompt completo a la derecha.
- Valoración con **estrellas**, marca de **destacada**, **búsqueda**, **filtro por técnica** y orden por **mejor valoradas**.
- **Re-ejecutar** un prompt del banco, **descargar**, **eliminar**, **exportar/importar** el banco en JSON y **restaurar ejemplos**.
- Viene precargado con 6 landings de ejemplo.
- Con `server.py`, el banco se guarda en la carpeta **`bank/`** del proyecto (un archivo JSON por landing, con su HTML y su prompt): no se pierde al borrar el navegador y viaja con el repositorio. Sin servidor, se guarda solo en el navegador.

---

## Cumplimiento de los requisitos de la actividad

| Requisito | Dónde se cumple |
|---|---|
| 1. Colocar el tema y los datos básicos | Paso 1 «Proyecto» (formulario guiado, ejemplos, medidor de calidad). |
| 2. Crear un prompt por cada técnica o la que se escoja | Paso 2: «Generar solo esta» en cada tarjeta y «Un prompt por técnica». |
| 3. Seleccionar dos o más técnicas y generar otro prompt | Paso 2: «Prompt combinado» (activo desde 2 técnicas) + combinaciones rápidas. |
| 4. Banco de landing pages con el prompt al lado | Paso 4: tarjetas y vista detallada con la web y su prompt lado a lado, valoración y destacadas. |
| 5. Ejecutar el prompt dentro de la app y construir la landing | Paso 3 «Estudio»: motor local sin conexión o IA real con streaming. |
| Nota: intuitiva y fácil de manejar | Flujo de 4 pasos numerados, ejemplos, textos de ayuda, guía integrada, modo claro/oscuro, diseño adaptable a móvil, atajo Ctrl+Enter. |

---

## Qué hace cada técnica en el motor local

| Técnica | Efecto en la landing construida |
|---|---|
| T1 Semilla | Cambia tipografías, paleta, retícula del hero, ornamentos SVG y estilo de tarjetas (11 estilos; con 2 semillas los fusiona). Sin semilla la landing cae a propósito en la estética «promedio» de IA para mostrar la diferencia. |
| T2 Ambicioso | Reordena las secciones según el marco de copy, adapta el titular al nivel de consciencia y añade inoculación de objeciones, escasez o prueba social. |
| T3 Subagentes | Agente crítico que corrige contraste (WCAG AA), titulares largos, CTA y formulario, y deja un informe con propuesta de test A/B. |
| T4 Imágenes | Ilustraciones SVG generativas coherentes con la semilla + galería + prompts de imagen incluidos en el código. |
| T5 Vídeo | Fondo animado en canvas que simula el vídeo (respeta «reducir movimiento») + prompt de vídeo. |
| T6 Sustractivo | Elimina secciones decorativas según el %, reduce menú, beneficios y campos del formulario. |
| T7 Negativas | Sustituye las palabras prohibidas y quita degradados y púrpuras típicos de IA. |
| T8 Humana | Historia «antes → giro → después», micro-copy en botones y voz de marca. |

La pestaña **Informe** del Estudio explica qué hizo cada técnica en cada construcción.

---

## Estructura del proyecto

```
LandingForge/
├── server.py         Servidor local: sirve la app y llama a la IA con la clave del .env
├── .env.example      Plantilla de configuración (copiar como .env)
├── index.html        Interfaz (4 pasos + guía)
├── css/styles.css    Estilos (modo claro/oscuro, responsive)
└── js/
    ├── data.js       Catálogo de técnicas, semillas, opciones y ejemplos
    ├── prompts.js    Generador de prompts: individual, combinado, lectura y puntuación
    ├── engine.js     Motor local que construye la landing HTML
    ├── ai.js         Conexión con Claude u otros proveedores (streaming)
    ├── store.js      Guardado local (brief, historial, banco, configuración)
    └── app.js        Lógica de la interfaz
```

Tecnologías: HTML5, CSS3 y JavaScript sin frameworks ni dependencias (funciona con doble clic, sin servidor).

## Privacidad y seguridad
- El brief y el historial se guardan en el `localStorage` de tu navegador; el banco, además, en la carpeta `bank/` cuando usas `server.py`. Nada sale de tu computador salvo lo que se envía al proveedor de IA en el modo «IA real».
- La clave de API se guarda solo durante la sesión, salvo que marques «Recordar».
- Las landings se muestran dentro de un `iframe` aislado (`sandbox`), para que el código generado no pueda acceder a la app.
- Los testimonios del motor local son de ejemplo y están marcados como tales: reemplázalos por testimonios reales antes de publicar.
