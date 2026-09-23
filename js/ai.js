/* ==========================================================================
   LandingForge IA · Ejecución con IA real
   - Claude (API de Anthropic, llamada directa desde el navegador con streaming)
   - Cualquier proveedor compatible con /chat/completions (opcional)
   ========================================================================== */
window.LF = window.LF || {};

LF.ai = (function () {
  const SYSTEM = [
    'Eres un diseñador y desarrollador front-end senior especializado en landing pages de alta conversión.',
    'Construye la landing page que describe el prompt del usuario, aplicando todas las técnicas, restricciones y entregables que indique.',
    'Formato de respuesta obligatorio: responde únicamente con un documento HTML completo que empiece por <!DOCTYPE html> y termine en </html>, con CSS y JavaScript embebidos.',
    'Si el prompt pide informes, prompts de imagen/vídeo, mapas de bloques o checklists, inclúyelos como comentarios HTML dentro del documento, no como texto fuera de él.',
    'Nunca generes imágenes ni vídeos: los prompts de imagen o vídeo que aparecen en el mensaje son solo texto para copiar en esos comentarios.',
    'No uses imágenes externas ni bancos de fotos: crea las piezas visuales con SVG inline, CSS o canvas. Puedes cargar Google Fonts.',
    'El resultado debe ser responsive, accesible (WCAG AA) y funcionar dentro de un iframe aislado.',
    'Si el prompt pide otro formato (por ejemplo wireframe o Tailwind), entrega igualmente un HTML ejecutable que lo represente.'
  ].join('\n');

  const CLAUDE_MODELS = [
    { id: 'claude-opus-5', label: 'Claude Opus 5 (máxima calidad)' },
    { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 (equilibrio)' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (rápido)' }
  ];

  const COMPAT_PRESETS = {
    openai: { label: 'OpenAI', base: 'https://api.openai.com/v1' },
    gemini: { label: 'Google Gemini (endpoint compatible)', base: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-3.8-flash' },
    groq: { label: 'Groq', base: 'https://api.groq.com/openai/v1' },
    openrouter: { label: 'OpenRouter', base: 'https://openrouter.ai/api/v1' },
    ollama: { label: 'Ollama (local, sin clave)', base: 'http://localhost:11434/v1' },
    custom: { label: 'Otro (URL personalizada)', base: '' }
  };

  /* Lee un stream SSE y llama onEvent(objetoJSON) por cada línea "data:" */
  async function readSSE(res, onEvent, signal) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      if (signal && signal.aborted) { try { reader.cancel(); } catch (e) { /* ignorar */ } throw new DOMException('Cancelado', 'AbortError'); }
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).replace(/\r$/, '');
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          let ev = JSON.parse(data);
          if (Array.isArray(ev)) ev = ev[0] || {}; // Gemini a veces envía los errores dentro de un arreglo
          onEvent(ev);
        } catch (e) { if (e && e.lfFatal) throw e; }
      }
    }
  }

  async function httpError(res) {
    let msg = `HTTP ${res.status}`;
    try {
      let j = await res.json();
      if (Array.isArray(j)) j = j[0] || {}; // Gemini devuelve el error dentro de un arreglo
      if (j.error && j.error.lf) return new Error(j.error.message); // mensaje ya explicado por server.py
      msg += ' · ' + ((j.error && (j.error.message || j.error.type)) || JSON.stringify(j));
    } catch (e) { /* sin cuerpo */ }
    if (res.status === 401 || /api key/i.test(msg)) msg += ' — revisa la clave de API.';
    if (res.status === 429) msg = /per ?day|free_tier/i.test(msg)
      ? 'Se agotó la cuota gratuita del proveedor de IA para los modelos configurados. Vuelve a intentarlo más tarde o usa el motor local.'
      : msg + ' — límite de uso alcanzado, espera un minuto.';
    if (res.status === 503) msg = 'Los servidores del proveedor de IA están saturados en este momento. Espera un minuto y vuelve a intentarlo, o usa el motor local.';
    return new Error(msg);
  }

  /* ---------- Claude ---------- */
  async function runClaude(cfg, prompt, onText, signal) {
    const model = cfg.model || 'claude-opus-5';
    const headers = {
      'content-type': 'application/json',
      'x-api-key': cfg.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    };
    const body = {
      model,
      max_tokens: model.startsWith('claude-haiku') ? 32000 : 64000,
      stream: true,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    };
    if (!model.startsWith('claude-haiku')) {
      body.thinking = { type: 'adaptive' };
      if (cfg.effort && cfg.effort !== 'high') body.output_config = { effort: cfg.effort };
    }
    if (model === 'claude-opus-5') {
      // Si el filtro de seguridad rechaza la petición, la API reintenta con el modelo de respaldo recomendado.
      headers['anthropic-beta'] = 'server-side-fallback-2026-07-01';
      body.fallbacks = 'default';
    }
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body), signal });
    if (!res.ok) throw await httpError(res);
    let stop = null, usage = {};
    await readSSE(res, ev => {
      if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') onText(ev.delta.text);
      else if (ev.type === 'message_start' && ev.message) usage = Object.assign(usage, ev.message.usage || {}, { model: ev.message.model });
      else if (ev.type === 'message_delta') { stop = (ev.delta && ev.delta.stop_reason) || stop; Object.assign(usage, ev.usage || {}); }
      else if (ev.type === 'error') { const e = new Error((ev.error && ev.error.message) || 'Error en el stream'); e.lfFatal = true; throw e; }
    }, signal);
    if (stop === 'refusal') throw new Error('El modelo rechazó la solicitud. Revisa el contenido del prompt.');
    return { stop, usage };
  }

  /* ---------- Compatible /chat/completions ---------- */
  async function runCompat(cfg, prompt, onText, signal, onStatus) {
    const base = String(cfg.base || '').replace(/\/+$/, '');
    if (!base) throw new Error('Falta la URL base del proveedor.');
    if (!cfg.model) throw new Error('Escribe el nombre del modelo de tu proveedor.');
    const headers = { 'content-type': 'application/json' };
    if (cfg.key) headers.authorization = 'Bearer ' + cfg.key;
    const res = await fetch(base + '/chat/completions', {
      method: 'POST', headers, signal,
      body: JSON.stringify({ model: cfg.model, stream: true, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }] })
    });
    if (!res.ok) throw await httpError(res);
    let stop = null, model = cfg.model;
    await readSSE(res, ev => {
      if (ev.lf_status) { if (ev.lf_model) model = ev.lf_model; if (onStatus) onStatus(ev.lf_status, ev.lf_model); return; } // avisos de server.py
      if (ev.model) model = ev.model; // el servidor puede haber usado un modelo de respaldo
      const ch = ev.choices && ev.choices[0];
      if (ch && ch.delta && ch.delta.content) onText(ch.delta.content);
      if (ch && ch.finish_reason) stop = ch.finish_reason;
      if (ev.error) { const e = new Error(ev.error.message || 'Error del proveedor'); e.lfFatal = true; throw e; }
    }, signal);
    return { stop, usage: { model } };
  }

  function run(cfg, prompt, onText, signal, onStatus) {
    if (cfg.provider === 'claude') {
      if (!cfg.key) return Promise.reject(new Error('Pega tu clave de API de Anthropic en la configuración.'));
      return runClaude(cfg, prompt, onText, signal);
    }
    return runCompat(cfg, prompt, onText, signal, onStatus);
  }

  /* Extrae el documento HTML de la respuesta (tolera ```html ... ``` o texto alrededor) */
  function extractHtml(text) {
    const t = String(text || '');
    const fence = t.match(/```(?:html)?\s*([\s\S]*?)(```|$)/i);
    let s = t;
    const start = t.search(/<!doctype html|<html[\s>]/i);
    if (start >= 0) s = t.slice(start);
    else if (fence && /</.test(fence[1])) s = fence[1];
    const end = s.toLowerCase().lastIndexOf('</html>');
    if (end >= 0) s = s.slice(0, end + 7);
    if (!/<html[\s>]/i.test(s)) s = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${s}</body></html>`;
    return s;
  }

  return { run, extractHtml, CLAUDE_MODELS, COMPAT_PRESETS, SYSTEM };
})();
