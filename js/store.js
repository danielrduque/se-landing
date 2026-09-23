/* ==========================================================================
   LandingForge IA · Persistencia local (localStorage)
   Guarda el brief en curso, el historial de prompts, la configuración y el
   banco de landing pages. Todo queda en este navegador; se puede exportar.
   ========================================================================== */
window.LF = window.LF || {};

LF.store = (function () {
  const K = { brief: 'lf.brief', history: 'lf.history', bank: 'lf.bank', settings: 'lf.settings', seeded: 'lf.seeded.v1', key: 'lf.apikey' };
  let memory = {};

  function get(k, fallback) {
    try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); }
    catch (e) { return k in memory ? memory[k] : fallback; }
  }
  function set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { memory[k] = v; return false; }
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  return {
    uid,
    getBrief: () => Object.assign({}, LF.data.emptyBrief, get(K.brief, {})),
    setBrief: b => set(K.brief, b),

    getHistory: () => get(K.history, []),
    addHistory(p) {
      const h = get(K.history, []);
      p.id = p.id || uid(); p.createdAt = p.createdAt || Date.now();
      h.unshift(p);
      set(K.history, h.slice(0, 60));
      return p;
    },
    updateHistory(id, patch) {
      const h = get(K.history, []);
      const i = h.findIndex(x => x.id === id);
      if (i >= 0) { h[i] = Object.assign(h[i], patch); set(K.history, h); }
    },
    removeHistory(id) { set(K.history, get(K.history, []).filter(x => x.id !== id)); },
    clearHistory: () => set(K.history, []),

    getBank: () => get(K.bank, []),
    addBank(item) {
      const b = get(K.bank, []);
      item.id = item.id || uid(); item.createdAt = item.createdAt || Date.now();
      b.unshift(item);
      if (!set(K.bank, b)) return { item, warn: 'El almacenamiento del navegador está lleno: la landing solo durará esta sesión. Exporta el banco para no perderla.' };
      return { item };
    },
    updateBank(id, patch) {
      const b = get(K.bank, []);
      const i = b.findIndex(x => x.id === id);
      if (i >= 0) { b[i] = Object.assign(b[i], patch); set(K.bank, b); return b[i]; }
    },
    removeBank(id) { set(K.bank, get(K.bank, []).filter(x => x.id !== id)); },
    replaceBank: arr => set(K.bank, arr),

    isSeeded: () => !!get(K.seeded, false),
    markSeeded: () => set(K.seeded, true),

    getSettings: () => Object.assign({ provider: 'claude', model: 'claude-opus-5', effort: 'high', compat: 'openai', base: LF.ai.COMPAT_PRESETS.openai.base, compatModel: '', remember: false, theme: 'auto', intro: true }, get(K.settings, {})),
    setSettings: s => set(K.settings, s),

    /* La clave de API se guarda en sessionStorage salvo que el usuario pida recordarla */
    getKey() {
      try { return sessionStorage.getItem(K.key) || localStorage.getItem(K.key) || ''; } catch (e) { return memory[K.key] || ''; }
    },
    setKey(v, remember) {
      try {
        sessionStorage.setItem(K.key, v || '');
        if (remember && v) localStorage.setItem(K.key, v); else localStorage.removeItem(K.key);
      } catch (e) { memory[K.key] = v; }
    }
  };
})();
