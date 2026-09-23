/* ==========================================================================
   LandingForge IA · Motor local de construcción
   Convierte un prompt (brief + técnicas + opciones) en una landing page HTML
   completa, sin conexión. Cada técnica modifica el resultado de forma visible:
     T1 semilla      → tema visual, tipografías, retícula del hero, ornamentos
     T2 ambicioso    → estructura por marco de copy, inoculación, sesgos
     T3 subagentes   → auditoría automática (contraste, CTA, formulario) + informe
     T4 imágenes     → ilustraciones SVG generativas + prompts de imagen
     T5 vídeo        → fondo animado en canvas + prompt de vídeo
     T6 sustractivo  → elimina secciones, menú y campos
     T7 negativas    → filtra palabras prohibidas y paletas "de IA"
     T8 humana       → storytelling y micro-copy persuasivo
   ========================================================================== */
window.LF = window.LF || {};

LF.engine = (function () {
  const D = LF.data;
  const P = LF.prompts;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = s => String(s || '').trim();
  const cap = s => { s = clean(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  const low = s => { s = clean(s); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; };
  const noDot = s => clean(s).replace(/[.。]+$/, '');

  /* ---------- color ---------- */
  function hexToRgb(h) {
    h = String(h || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  function lum(h) {
    const [r, g, b] = hexToRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrast(a, b) { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); }
  function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  function onColor(bg) { return contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111'; }
  function ensure(fg, bg, min) {
    // Acerca fg al negro o al blanco hasta lograr el contraste mínimo
    if (contrast(fg, bg) >= min) return fg;
    const target = lum(bg) > 0.4 ? '#000000' : '#ffffff';
    for (let t = 0.1; t <= 1.001; t += 0.1) { const c = mix(fg, target, t); if (contrast(c, bg) >= min) return c; }
    return target;
  }
  function hue(h) {
    const [r, g, b] = hexToRgb(h).map(v => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    if (!d) return { h: 0, s: 0 };
    let hh = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    hh = Math.round(hh * 60); if (hh < 0) hh += 360;
    const l = (max + min) / 2;
    return { h: hh, s: d / (1 - Math.abs(2 * l - 1)) };
  }
  const isPurple = h => { const x = hue(h); return x.s > 0.25 && x.h >= 255 && x.h <= 300; };

  /* ---------- temas por semilla ---------- */
  const THEMES = {
    default: { name: 'Genérico de IA', fonts: 'Plus+Jakarta+Sans:wght@400;500;600;700;800', fd: "'Plus Jakarta Sans', system-ui, sans-serif", fb: "'Plus Jakarta Sans', system-ui, sans-serif", bg: '#ffffff', surface: '#f5f3ff', text: '#0f172a', muted: '#475569', primary: '#7c3aed', accent: '#a855f7', accent2: '#ec4899', line: '#e2e8f0', radius: '16px', btnRadius: '999px', hero: 'split', benefits: 'cards', gradient: true, dark: false },
    bauhaus: { name: 'Bauhaus', fonts: 'Josefin+Sans:wght@400;600;700&family=Work+Sans:wght@400;500;600', fd: "'Josefin Sans', 'Futura', sans-serif", fb: "'Work Sans', system-ui, sans-serif", bg: '#f4efe6', surface: '#ffffff', text: '#111111', muted: '#44403c', primary: '#d7263d', accent: '#1b4ddb', accent2: '#f2b705', line: '#111111', radius: '0px', btnRadius: '0px', hero: 'asym', benefits: 'blocks', upper: true },
    patent50: { name: 'Patente años 50', fonts: 'IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600', fd: "'IBM Plex Mono', ui-monospace, monospace", fb: "'IBM Plex Sans', system-ui, sans-serif", bg: '#0e2a47', surface: '#123559', text: '#e8f1fa', muted: '#b4c9de', primary: '#f4f1e8', accent: '#7fd1ff', accent2: '#ffd166', line: 'rgba(232,241,250,.28)', radius: '2px', btnRadius: '2px', hero: 'blueprint', benefits: 'figures', dark: true, grid: true },
    swiss: { name: 'Suizo', fonts: 'Inter+Tight:wght@400;500;700;800&family=Inter:wght@400;500', fd: "'Inter Tight', 'Helvetica Neue', Arial, sans-serif", fb: "'Inter', 'Helvetica Neue', Arial, sans-serif", bg: '#ffffff', surface: '#f2f2f2', text: '#0a0a0a', muted: '#4b4b4b', primary: '#e30613', accent: '#0a0a0a', accent2: '#e30613', line: '#0a0a0a', radius: '0px', btnRadius: '0px', hero: 'swiss', benefits: 'numbered' },
    brutalism: { name: 'Brutalista', fonts: 'Archivo+Black&family=Space+Mono:wght@400;700', fd: "'Archivo Black', Impact, sans-serif", fb: "'Space Mono', ui-monospace, monospace", bg: '#f5f5f0', surface: '#ffffff', text: '#000000', muted: '#262626', primary: '#ff3b00', accent: '#0047ff', accent2: '#ffe600', line: '#000000', radius: '0px', btnRadius: '0px', hero: 'stack', benefits: 'bordered', border: '3px solid #000', shadow: '6px 6px 0 #000', upper: true },
    editorial70: { name: 'Editorial 70s', fonts: 'Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400;1,9..144,600&family=Libre+Franklin:wght@400;500;600', fd: "'Fraunces', Georgia, serif", fb: "'Libre Franklin', system-ui, sans-serif", bg: '#f3e9d7', surface: '#fbf5ea', text: '#2b1d14', muted: '#5f4a3a', primary: '#c8553d', accent: '#e09f3e', accent2: '#3e6259', line: '#2b1d14', radius: '2px', btnRadius: '999px', hero: 'editorial', benefits: 'columns', italic: true },
    artdeco: { name: 'Art Déco', fonts: 'Marcellus&family=Josefin+Sans:wght@300;400;600', fd: "'Marcellus', Georgia, serif", fb: "'Josefin Sans', system-ui, sans-serif", bg: '#0d0d0d', surface: '#171717', text: '#f3ebdd', muted: '#c9bda9', primary: '#c9a227', accent: '#1f6f5c', accent2: '#c9a227', line: 'rgba(201,162,39,.45)', radius: '0px', btnRadius: '0px', hero: 'center', benefits: 'framed', dark: true, upper: true },
    japanma: { name: 'Ma japonés', fonts: 'Shippori+Mincho:wght@500;700&family=Zen+Kaku+Gothic+New:wght@400;500', fd: "'Shippori Mincho', 'Yu Mincho', serif", fb: "'Zen Kaku Gothic New', system-ui, sans-serif", bg: '#f7f4ee', surface: '#ffffff', text: '#1e1e1e', muted: '#5c5751', primary: '#b7282e', accent: '#1e1e1e', accent2: '#b7282e', line: '#d9d3c7', radius: '0px', btnRadius: '0px', hero: 'ma', benefits: 'minimal' },
    fibonacci: { name: 'Fibonacci', fonts: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Manrope:wght@400;500;600', fd: "'Cormorant Garamond', Georgia, serif", fb: "'Manrope', system-ui, sans-serif", bg: '#f5f1ea', surface: '#fffdf9', text: '#26221e', muted: '#5b534a', primary: '#2f5d50', accent: '#c9a66b', accent2: '#8a6f4d', line: '#d8cfc1', radius: '24px', btnRadius: '999px', hero: 'spiral', benefits: 'stagger', italic: true },
    memphis: { name: 'Memphis', fonts: 'Rubik:wght@400;500;700;900', fd: "'Rubik', system-ui, sans-serif", fb: "'Rubik', system-ui, sans-serif", bg: '#fff8e7', surface: '#ffffff', text: '#1a1a2e', muted: '#3d3d55', primary: '#ff4f79', accent: '#00b8a9', accent2: '#ffd23f', line: '#1a1a2e', radius: '18px', btnRadius: '14px', hero: 'split', benefits: 'cards', border: '2.5px solid #1a1a2e', shadow: '5px 5px 0 #1a1a2e' },
    phosphor: { name: 'Fósforo', fonts: 'JetBrains+Mono:wght@400;600;800&family=Inter:wght@400;500', fd: "'JetBrains Mono', ui-monospace, monospace", fb: "'Inter', system-ui, sans-serif", bg: '#0a0c0b', surface: '#111513', text: '#d9f7e4', muted: '#9cc3aa', primary: '#39ff88', accent: '#39ff88', accent2: '#1f8f4e', line: 'rgba(57,255,136,.25)', radius: '2px', btnRadius: '2px', hero: 'asym', benefits: 'terminal', dark: true, scan: true },
    didot: { name: 'Didot', fonts: 'Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Jost:wght@300;400;500', fd: "'Bodoni Moda', Didot, 'Times New Roman', serif", fb: "'Jost', system-ui, sans-serif", bg: '#f4f1ec', surface: '#ffffff', text: '#121212', muted: '#55504a', primary: '#121212', accent: '#9c7a3c', accent2: '#9c7a3c', line: '#cfc7ba', radius: '0px', btnRadius: '0px', hero: 'center', benefits: 'editorial', italic: true, upper: true }
  };

  /* ---------- ornamentos SVG por tema ---------- */
  function art(themeId, c, rich, uid) {
    const p = c.primary, a = c.accent, a2 = c.accent2, t = c.text, l = c.lineSolid;
    const k = rich ? 1 : 0;
    switch (themeId) {
      case 'bauhaus': return `<svg viewBox="0 0 400 400" aria-hidden="true"><rect x="40" y="40" width="200" height="200" fill="${a}"/><circle cx="250" cy="230" r="120" fill="${p}" style="mix-blend-mode:multiply"/><polygon points="60,360 180,360 120,250" fill="${a2}"/>${k ? `<rect x="280" y="40" width="80" height="80" fill="none" stroke="${t}" stroke-width="6"/><line x1="20" y1="380" x2="380" y2="380" stroke="${t}" stroke-width="8"/><circle cx="320" cy="340" r="22" fill="${t}"/>` : ''}</svg>`;
      case 'patent50': return `<svg viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="${t}" stroke-width="1.4"><circle cx="200" cy="200" r="120"/><circle cx="200" cy="200" r="70" stroke-dasharray="6 6"/><circle cx="200" cy="200" r="18" fill="${a}" stroke="none"/><line x1="40" y1="200" x2="360" y2="200"/><line x1="200" y1="40" x2="200" y2="360"/><path d="M80 330 L320 330 M80 322 L80 338 M320 322 L320 338"/><text x="200" y="352" fill="${t}" stroke="none" font-size="12" text-anchor="middle" font-family="monospace">240 mm</text><text x="30" y="40" fill="${a}" stroke="none" font-size="14" font-family="monospace">FIG. 1</text>${k ? `<path d="M285 115 L340 60 L380 60"/><text x="300" y="52" fill="${t}" stroke="none" font-size="11" font-family="monospace">núcleo</text><rect x="150" y="150" width="100" height="100" transform="rotate(45 200 200)" stroke="${a}"/><path d="M60 90 q40 -40 80 0 t80 0" stroke="${a2}"/>` : ''}</svg>`;
      case 'swiss': return `<svg viewBox="0 0 400 400" aria-hidden="true"><rect x="0" y="0" width="400" height="400" fill="none"/><rect x="220" y="20" width="160" height="160" fill="${p}"/><g stroke="${t}" stroke-width="2">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${20 + i * 50}" y1="200" x2="${20 + i * 50}" y2="380"/>`).join('')}</g>${k ? `<circle cx="110" cy="100" r="80" fill="none" stroke="${t}" stroke-width="16"/><rect x="20" y="300" width="360" height="16" fill="${t}"/>` : ''}</svg>`;
      case 'brutalism': return `<svg viewBox="0 0 400 400" aria-hidden="true"><rect x="30" y="30" width="250" height="180" fill="${a2}" stroke="#000" stroke-width="6"/><rect x="120" y="150" width="250" height="200" fill="${p}" stroke="#000" stroke-width="6"/><text x="140" y="270" font-family="Archivo Black, Impact, sans-serif" font-size="70" fill="#000">!!!</text>${k ? `<rect x="40" y="260" width="60" height="110" fill="${a}" stroke="#000" stroke-width="6"/><line x1="0" y1="390" x2="400" y2="390" stroke="#000" stroke-width="10"/>` : ''}</svg>`;
      case 'editorial70': return `<svg viewBox="0 0 400 400" aria-hidden="true"><defs><clipPath id="c${uid}"><circle cx="200" cy="200" r="170"/></clipPath></defs><g clip-path="url(#c${uid})">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="0" y="${30 + i * 44}" width="400" height="22" fill="${[p, a, a2][i % 3]}"/>`).join('')}</g>${k ? `<circle cx="200" cy="200" r="182" fill="none" stroke="${t}" stroke-width="2"/><text x="200" y="395" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="16" fill="${t}">edición n.º 01</text>` : ''}</svg>`;
      case 'artdeco': return `<svg viewBox="0 0 400 300" aria-hidden="true" fill="none" stroke="${p}" stroke-width="1.5">${Array.from({ length: 13 }, (_, i) => { const ang = Math.PI + (i / 12) * Math.PI; return `<line x1="200" y1="260" x2="${200 + Math.cos(ang) * 190}" y2="${260 + Math.sin(ang) * 190}"/>`; }).join('')}<path d="M40 260 A160 160 0 0 1 360 260"/><path d="M90 260 A110 110 0 0 1 310 260"/>${k ? `<path d="M140 260 A60 60 0 0 1 260 260" fill="${p}" fill-opacity=".25"/><rect x="20" y="270" width="360" height="4" fill="${p}"/><rect x="60" y="282" width="280" height="2" fill="${p}"/>` : ''}</svg>`;
      case 'japanma': return `<svg viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="${k ? 120 : 90}" fill="${p}"/>${k ? `<path d="M60 330 C140 300 260 300 340 330" stroke="${t}" stroke-width="2" fill="none"/><line x1="360" y1="40" x2="360" y2="160" stroke="${t}" stroke-width="1"/>` : ''}</svg>`;
      case 'fibonacci': {
        const sq = [[0, 0, 233], [233, 0, 144], [288, 144, 89], [233, 178, 55], [233, 144, 34]];
        return `<svg viewBox="0 0 377 233" aria-hidden="true" fill="none" stroke="${t}" stroke-opacity=".35" stroke-width="1">${k ? sq.map(s => `<rect x="${s[0]}" y="${s[1]}" width="${s[2]}" height="${s[2]}"/>`).join('') : ''}<path d="M233 233 A233 233 0 0 1 0 0 M233 0 A144 144 0 0 1 377 144 M377 144 A89 89 0 0 1 288 233 M288 233 A55 55 0 0 1 233 178 M233 178 A34 34 0 0 1 267 144" stroke="${p}" stroke-opacity="1" stroke-width="3"/><circle cx="262" cy="170" r="${k ? 10 : 6}" fill="${a}" stroke="none"/></svg>`;
      }
      case 'memphis': return `<svg viewBox="0 0 400 400" aria-hidden="true"><circle cx="140" cy="150" r="90" fill="${a2}" stroke="${t}" stroke-width="4"/><rect x="190" y="160" width="160" height="160" rx="18" fill="${p}" stroke="${t}" stroke-width="4" transform="rotate(12 270 240)"/><path d="M40 330 q30 -40 60 0 t60 0 t60 0" stroke="${a}" stroke-width="10" fill="none" stroke-linecap="round"/>${k ? `<polygon points="300,40 360,120 250,110" fill="${a}" stroke="${t}" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${40 + (i % 4) * 22}" cy="${40 + Math.floor(i / 4) * 22}" r="5" fill="${t}"/>`).join('')}` : ''}</svg>`;
      case 'phosphor': return `<svg viewBox="0 0 400 300" aria-hidden="true" font-family="JetBrains Mono, monospace" font-size="13" fill="${p}"><rect x="1" y="1" width="398" height="298" fill="none" stroke="${p}" stroke-opacity=".4"/><text x="16" y="34">$ scan --target infra</text><text x="16" y="58" fill-opacity=".7">› 1.284 activos analizados</text><text x="16" y="82" fill-opacity=".7">› algoritmos vulnerables: 37</text><text x="16" y="106">› estado: protegido ▮</text>${k ? `<g stroke="${p}" stroke-opacity=".5">${Array.from({ length: 20 }, (_, i) => `<line x1="${16 + i * 19}" y1="270" x2="${16 + i * 19}" y2="${270 - (((i * 37) % 11) + 2) * 10}"/>`).join('')}</g>` : ''}</svg>`;
      case 'didot': return `<svg viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="${t}"><circle cx="200" cy="200" r="150" stroke-width="1"/><circle cx="200" cy="200" r="138" stroke-width=".5"/>${Array.from({ length: 60 }, (_, i) => { const an = i / 60 * Math.PI * 2; const r1 = i % 5 ? 132 : 122; return `<line x1="${200 + Math.cos(an) * r1}" y1="${200 + Math.sin(an) * r1}" x2="${200 + Math.cos(an) * 138}" y2="${200 + Math.sin(an) * 138}" stroke-width="${i % 5 ? .6 : 1.6}"/>`; }).join('')}<line x1="200" y1="200" x2="200" y2="110" stroke-width="2.5"/><line x1="200" y1="200" x2="262" y2="236" stroke-width="1.6"/><circle cx="200" cy="200" r="4" fill="${a}" stroke="none"/>${k ? `<circle cx="200" cy="270" r="26" stroke="${a}" stroke-width=".8"/><text x="200" y="330" text-anchor="middle" font-family="Bodoni Moda, serif" font-style="italic" font-size="14" fill="${t}" stroke="none">n.º 07 / 48</text>` : ''}</svg>`;
      default: return `<svg viewBox="0 0 400 400" aria-hidden="true"><defs><linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p}"/><stop offset="1" stop-color="${a2}"/></linearGradient></defs><rect x="40" y="60" width="320" height="260" rx="24" fill="url(#g${uid})" opacity=".92"/><rect x="70" y="100" width="150" height="14" rx="7" fill="#fff" opacity=".85"/><rect x="70" y="128" width="220" height="10" rx="5" fill="#fff" opacity=".55"/><rect x="70" y="200" width="110" height="90" rx="14" fill="#fff" opacity=".3"/><rect x="195" y="200" width="135" height="90" rx="14" fill="#fff" opacity=".3"/>${k ? `<circle cx="340" cy="70" r="36" fill="${a}" opacity=".7"/>` : ''}</svg>`;
    }
  }

  function icon(i, c) {
    const s = `fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
    return [
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M4 12h16M12 4v16"/><circle cx="12" cy="12" r="9"/></svg>`,
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><rect x="4" y="4" width="16" height="16"/><path d="M4 12h16"/></svg>`,
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M12 3l9 16H3z"/></svg>`,
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9"/></svg>`,
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>`,
      `<svg viewBox="0 0 24 24" ${s} aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/></svg>`
    ][i % 6];
  }

  /* ---------- palabras prohibidas ---------- */
  const SUBST = {
    'revolucionario': 'distinto', 'revolucionaria': 'distinta', 'potenciar': 'mejorar', 'potencia': 'mejora', 'ecosistema': 'conjunto de herramientas',
    'innovador': 'nuevo', 'innovadora': 'nueva', 'soluciones integrales': 'todo lo que necesitas', 'sinergia': 'trabajo conjunto', 'de vanguardia': 'actual',
    'desbloquear': 'abrir', 'desbloquea': 'abre', 'sumérgete': 'entra', 'transformar tu vida': 'cambiar tu día a día', 'llevar al siguiente nivel': 'mejorar de verdad'
  };
  function scrub(text, banned, log) {
    let out = String(text);
    banned.forEach(w => {
      if (!w) return;
      const re = new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
      out = out.replace(re, m => { log.push(m); const r = SUBST[w.toLowerCase()] || ''; return m[0] === m[0].toUpperCase() ? cap(r) : r; });
    });
    return out.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1');
  }

  /* ---------- construcción ---------- */
  function build(spec) {
    const brief = Object.assign({}, D.emptyBrief, spec.brief || {});
    const T = new Set(spec.techniques || []);
    const O = {};
    D.techniques.forEach(t => { O[t.id] = Object.assign(D.defaultOpts(t.id), (spec.opts || {})[t.id] || {}); });
    const report = [];
    const note = (agent, msg, kind) => report.push({ agent, msg, kind: kind || 'info' });
    const uid = Math.random().toString(36).slice(2, 7);

    /* 1 · Tema visual */
    const seedIds = T.has('seed') ? (O.seed.seeds && O.seed.seeds.length ? O.seed.seeds : ['bauhaus']) : [];
    const themeId = seedIds[0] || 'default';
    const th = Object.assign({}, THEMES[themeId]);
    if (seedIds[1] && THEMES[seedIds[1]]) {
      const s2 = THEMES[seedIds[1]];
      th.accent = s2.primary === th.primary ? s2.accent : s2.primary;
      th.benefits = s2.benefits; th.grid = th.grid || s2.grid; th.scan = th.scan || s2.scan;
      note('Semilla', `Fusión «${D.seeds.find(s => s.id === seedIds[0]).name}» + «${D.seeds.find(s => s.id === seedIds[1]).name}»: base de la primera, acento y sistema de beneficios de la segunda.`);
    }
    if (T.has('seed')) note('Semilla', `Sistema visual anclado a «${th.name}» (retícula de hero «${th.hero}»).`, 'ok');
    else note('Semilla', 'Sin semilla de estilo: el resultado cae en la estética «promedio» (degradado púrpura, texto izquierda + imagen derecha). Añade la técnica 1 para diferenciarte.', 'warn');

    if (!brief.colorAuto && brief.color1) {
      th.primary = brief.color1; th.accent = brief.color2 || th.accent;
      if (!th.dark && T.has('seed')) th.accent2 = th.accent2 || brief.color2;
      if (!T.has('seed')) th.accent2 = brief.color2 || th.accent2;
    }

    /* 7 · Negativas visuales */
    if (T.has('negative')) {
      if (th.gradient) { th.gradient = false; note('Restricciones negativas', 'Degradado decorativo desactivado.', 'ok'); }
      ['primary', 'accent', 'accent2'].forEach(k => {
        if (isPurple(th[k])) { const old = th[k]; th[k] = k === 'primary' ? '#1f7a6d' : k === 'accent' ? '#e4572e' : '#f2b705'; note('Restricciones negativas', `Color púrpura típico de IA (${old}) sustituido por ${th[k]}.`, 'ok'); }
      });
      if (themeId === 'default') { th.surface = '#f4f6f5'; }
    }

    /* 3 · Auditoría de contraste (siempre segura; informada si hay subagentes) */
    const c = Object.assign({}, th);
    c.lineSolid = /^#/.test(th.line) ? th.line : th.text;
    const fix = [];
    const t0 = c.text; c.text = ensure(c.text, c.bg, 7); if (t0 !== c.text) fix.push('texto principal');
    const m0 = c.muted; c.muted = ensure(c.muted, c.bg, 4.6); if (m0 !== c.muted) fix.push('texto secundario');
    c.onPrimary = onColor(c.primary);
    if (th.gradient) {
      // En botones con degradado el texto debe leerse sobre los dos extremos
      const minC = col => Math.min(contrast(col, c.primary), contrast(col, c.accent2));
      c.onPrimary = minC('#ffffff') >= minC('#111111') ? '#ffffff' : '#111111';
    }
    c.primaryInk = contrast(c.primary, c.bg) >= 3.2 ? c.primary : c.text;
    c.accentInk = contrast(c.accent, c.bg) >= 3.2 ? c.accent : c.text;
    const btnC = th.gradient ? Math.min(contrast(c.primary, c.onPrimary), contrast(c.accent2, c.onPrimary)) : contrast(c.primary, c.onPrimary);
    if (btnC < 4.5) {
      c.primary = ensure(c.primary, c.onPrimary, 4.6);
      if (th.gradient) c.accent2 = ensure(c.accent2, c.onPrimary, 4.6);
      fix.push('botón primario');
    }

    /* 2 · Copy */
    const g = D.goals[brief.objetivo] || D.goals.leads;
    const marca = clean(brief.marca) || cap(clean(brief.tema).split(/\s+/).slice(0, 2).join(' ')) || 'Tu marca';
    const tema = clean(brief.tema) || 'tu producto';
    const publico = clean(brief.publico);
    const problema = clean(brief.problema);
    const benefits = P.lines(brief.beneficios).map(l => { const m = l.split(/:|\s[-–—]\s/); return { title: cap(clean(m[0])), desc: cap(clean(m.slice(1).join(':'))) }; });
    const fillers = [
      publico ? `Pensado para ${publico}, sin curva de aprendizaje.` : 'Funciona desde el primer día, sin curva de aprendizaje.',
      'Todo en un mismo lugar: menos pasos, menos herramientas.',
      clean(brief.prueba) ? `Respaldado por ${low(brief.prueba.split(/·|,|\n/)[0])}.` : 'Con acompañamiento real cuando lo necesitas.',
      'Resultados que puedes medir, no promesas.'
    ];
    while (benefits.length < 3) benefits.push({ title: ['Empieza hoy', 'Todo en un lugar', 'Acompañamiento real'][benefits.length], desc: '' });
    benefits.forEach((b, i) => { if (!b.desc) b.desc = fillers[i % fillers.length]; });
    const objections = P.objectionList(brief).map(([q, a]) => ({ q: cap(q), a: cap(a) || (clean(brief.prueba) ? `Es una duda razonable. Por eso hablamos con datos: ${low(brief.prueba)}.` : 'Es una duda razonable: pregúntanos lo que necesites antes de decidir.') }));
    const proof = clean(brief.prueba).split(/\s*[·|\n]\s*|,\s(?=\D)/).map(clean).filter(Boolean);
    const oferta = clean(brief.oferta);

    const human = T.has('human');
    const amb = T.has('ambitious');
    const sub = T.has('subtractive');
    const lvl = +O.ambitious.awareness || 3;
    const biases = amb ? (O.ambitious.biases || []) : [];

    let cta = clean(brief.cta) || g.cta;
    if ((human && O.human.microcopy) || (T.has('subagents') && O.subagents.abtest)) {
      const generic = /^(enviar|saber m[aá]s|registrarse|registrar|comprar|descargar|reservar|inscribirse|comenzar|solicitar informaci[oó]n)$/i;
      if (!clean(brief.cta) || generic.test(clean(brief.cta))) { note(human ? 'Redacción humana' : 'Agente CRO', `CTA genérico «${cta}» reescrito como «${g.micro}».`, 'ok'); cta = g.micro; }
    }
    const reassure = g.reassure;

    let eyebrow = cap(tema);
    let headline = clean(brief.propuesta) || `${cap(tema)}, sin complicaciones`;
    let sub_ = publico ? `Para ${publico}. ${benefits.slice(0, 2).map(b => noDot(b.title)).join(' · ')}.` : `${benefits.slice(0, 2).map(b => noDot(b.title)).join(' · ')}.`;
    if (amb && lvl <= 2 && problema) { headline = `¿${cap(noDot(problema))}?`; sub_ = `${cap(noDot(brief.propuesta || tema))}. ${publico ? 'Pensado para ' + publico + '.' : ''}`; note('Prompt ambicioso', `Mercado en nivel ${lvl} de consciencia: el hero abre nombrando el problema.`, 'ok'); }
    else if (amb && lvl >= 5 && oferta) { headline = `${cap(noDot(brief.propuesta || tema))}. ${oferta}.`; note('Prompt ambicioso', 'Mercado muy consciente: el hero va directo a la oferta.', 'ok'); }
    else if (amb) note('Prompt ambicioso', `Estructura ${O.ambitious.framework} aplicada al orden de las secciones.`, 'ok');
    if (human && problema && !(amb && lvl <= 2)) eyebrow = `Si ${low(noDot(problema))}, esto es para ti`;

    /* 3 · Crítico: titular largo */
    if (T.has('subagents') && headline.length > 72) {
      const cut = headline.slice(0, 72).replace(/\s+\S*$/, '');
      sub_ = headline.slice(cut.length).trim() + ' ' + sub_;
      headline = cut;
      note('Agente crítico · UX', 'Titular de más de 72 caracteres: se divide en titular + subtítulo para entenderlo en ' + O.subagents.seconds + ' s.', 'ok');
    }

    /* 7 · Filtrado de palabras prohibidas */
    const banned = T.has('negative') ? String(O.negative.banned || '').split(',').map(clean).filter(Boolean) : [];
    const removed = [];
    const S = s => banned.length ? scrub(s, banned, removed) : String(s);

    /* 6 · Sustractivo: decide secciones */
    let sections;
    const fw = amb ? O.ambitious.framework : null;
    if (fw === 'PAS') sections = ['hero', 'proof', 'story', 'benefits', 'inoculation', 'testimonials', 'offer', 'steps', 'faq', 'form'];
    else if (fw === 'BAB') sections = ['hero', 'story', 'benefits', 'proof', 'steps', 'testimonials', 'inoculation', 'offer', 'faq', 'form'];
    else if (fw === 'StoryBrand') sections = ['hero', 'story', 'proof', 'steps', 'benefits', 'testimonials', 'inoculation', 'offer', 'faq', 'form'];
    else sections = ['hero', 'proof', 'benefits', 'story', 'visuals', 'steps', 'testimonials', 'inoculation', 'offer', 'faq', 'form'];
    const want = {
      proof: proof.length > 0,
      story: (human && O.human.storytelling && !!problema) || (amb && (fw === 'PAS' || fw === 'BAB' || fw === 'StoryBrand') && !!problema),
      visuals: T.has('image'),
      steps: true,
      testimonials: (amb && biases.includes('Prueba social')) || (!sub && proof.length > 0),
      inoculation: amb && (biases.includes('Inoculación') || objections.length > 0),
      offer: !!oferta || (amb && biases.includes('Escasez')),
      faq: objections.length > 0 && !(amb && (biases.includes('Inoculación') || objections.length > 0)),
      form: true, hero: true, benefits: true
    };
    sections = sections.filter(s => want[s]);
    if (sub) {
      const before = sections.slice();
      const drop = ['visuals', 'steps', 'testimonials', 'faq'];
      const quota = Math.max(1, Math.round(before.length * (O.subtractive.pct / 100)));
      const cut = [];
      drop.forEach(s => { if (cut.length < quota && sections.includes(s)) { cut.push(s); sections = sections.filter(x => x !== s); } });
      const names = { visuals: 'galería decorativa', steps: '«cómo funciona»', testimonials: 'testimonios', faq: 'preguntas frecuentes' };
      if (cut.length) note('Diseño sustractivo', `Eliminado ${cut.map(x => names[x]).join(', ')} (${Math.round(cut.length / before.length * 100)} % de las secciones). Peso visual en: ${O.subtractive.focus.toLowerCase()}.`, 'ok');
      if (benefits.length > 3) { note('Diseño sustractivo', `Beneficios reducidos de ${benefits.length} a 3.`, 'ok'); benefits.length = 3; }
    }

    /* Formulario */
    let maxFields = sub ? +O.subtractive.fields : 3;
    const fieldDefs = { nombre: ['text', 'Tu nombre', 'name'], email: ['email', 'Correo electrónico', 'email'], telefono: ['tel', 'Teléfono / WhatsApp', 'tel'], empresa: ['text', 'Empresa', 'organization'], fecha: ['date', 'Fecha preferida', 'off'] };
    let fields = g.fields.slice(0, maxFields);
    if (!fields.includes('email') && brief.objetivo !== 'booking') fields[fields.length - 1] = 'email';
    if (T.has('subagents') && g.fields.length > 3 && !sub) note('Agente crítico · CRO', `Formulario limitado a 3 campos (de ${g.fields.length} posibles) para reducir abandono.`, 'ok');

    /* Navegación */
    const navMode = sub ? O.subtractive.nav : 'Anclas a 3 secciones';
    const anchors = [['benefits', 'Beneficios'], ['story', 'Historia'], ['steps', 'Cómo funciona'], ['offer', 'Oferta'], ['faq', 'Preguntas']].filter(a => sections.includes(a[0])).slice(0, 3);

    /* 4 · Imágenes y 5 · vídeo */
    const rich = T.has('image');
    const motion = T.has('video');
    const imgPrompts = rich ? P.imagePrompts(brief, Object.assign({}, O.image, { _negative: T.has('negative') }), seedIds) : [];
    const vidPrompt = motion ? P.videoPrompt(brief, O.video) : '';
    if (rich) note('Generación de imágenes', `${imgPrompts.length} prompt(s) de imagen para ${O.image.tool} incluidos en el código; ilustraciones SVG generativas como marcador de posición.`, 'ok');
    if (motion) note('Generación de vídeo', `Fondo animado en canvas (simula el vídeo de ${O.video.tool}, respeta prefers-reduced-motion). Prompt de vídeo incluido en el código.`, 'ok');

    /* ---------- HTML de secciones ---------- */
    const btn = (label, cls) => `<a class="btn ${cls || ''}" href="#form">${esc(S(label))}<span aria-hidden="true">→</span></a>`;
    const H = {};
    const heroArt = `<div class="hero-art">${art(themeId, c, rich, uid)}</div>`;
    const navHtml = navMode.startsWith('Sin menú')
      ? `<header class="top"><div class="wrap nav"><a class="logo" href="#">${esc(marca)}</a></div></header>`
      : `<header class="top"><div class="wrap nav"><a class="logo" href="#">${esc(marca)}</a>${navMode.startsWith('Anclas') && anchors.length ? `<nav aria-label="Secciones">${anchors.map(a => `<a href="#${a[0]}">${a[1]}</a>`).join('')}</nav>` : ''}<a class="btn sm" href="#form">${esc(S(cta))}</a></div></header>`;

    H.hero = `<section class="hero hero--${th.hero}" id="top">${motion ? '<canvas class="motion" aria-hidden="true"></canvas>' : ''}${th.grid ? '<div class="gridbg" aria-hidden="true"></div>' : ''}${th.scan ? '<div class="scan" aria-hidden="true"></div>' : ''}
<div class="wrap hero-grid">
  <div class="hero-copy">
    <p class="eyebrow">${esc(S(eyebrow))}</p>
    <h1>${esc(S(headline))}</h1>
    <p class="lead">${esc(S(sub_))}</p>
    <div class="actions">${btn(cta)}${!sub && sections.includes('steps') ? '<a class="btn ghost" href="#steps">Ver cómo funciona</a>' : ''}</div>
    <p class="reassure">${esc(reassure)}</p>
    ${amb && biases.includes('Escasez') ? `<p class="badge">${oferta ? 'Oferta de lanzamiento · ' : ''}Cupos limitados este mes</p>` : ''}
  </div>
  ${heroArt}
</div></section>`;

    H.proof = `<section class="proof" aria-label="Prueba social"><div class="wrap proof-row">${proof.map(p => `<span>${esc(S(p))}</span>`).join('<i aria-hidden="true"></i>')}</div></section>`;

    H.benefits = `<section id="benefits" class="benefits b--${th.benefits}"><div class="wrap">
  <p class="eyebrow">${human ? 'En la práctica' : 'Beneficios'}</p>
  <h2>${esc(S(human ? `Lo que cambia cuando usas ${marca}` : `Por qué elegir ${marca}`))}</h2>
  <div class="b-list">${benefits.map((b, i) => `<article class="b-item reveal" style="--i:${i}">
    <div class="b-mark">${th.benefits === 'numbered' || th.benefits === 'columns' || th.benefits === 'editorial' ? String(i + 1).padStart(2, '0') : th.benefits === 'figures' ? 'FIG. ' + (i + 1) : th.benefits === 'terminal' ? '> 0' + (i + 1) : icon(i, c.primaryInk)}</div>
    <h3>${esc(S(b.title))}</h3><p>${esc(S(b.desc))}</p></article>`).join('')}</div>
</div></section>`;

    const storyVoice = (O.human && O.human.voice) || 'Directa y cercana';
    H.story = `<section id="story" class="story"><div class="wrap story-grid">
  <p class="eyebrow">Una historia conocida</p>
  <div class="story-steps">
    <div class="reveal"><span>Antes</span><p>${esc(S(`${cap(publico ? `Si eres parte de ${publico}, lo conoces` : 'Lo conoces')}: ${low(noDot(problema || 'el día se va en tareas que no deberían costar tanto'))}. ${storyVoice.startsWith('Sofisticada') ? 'Y lo aceptas, porque no parecía haber alternativa.' : 'Y cada semana cuesta un poco más.'}`))}</p></div>
    <div class="reveal"><span>El giro</span><p>${esc(S(`${marca} nace de esa frustración: ${low(noDot(brief.propuesta || tema))}.`))}</p></div>
    <div class="reveal"><span>Después</span><p>${esc(S(`${cap(noDot(benefits[0].title))}. ${benefits[0].desc}`))}</p></div>
  </div>
</div></section>`;

    H.visuals = `<section class="visuals" aria-label="Galería"><div class="wrap v-grid">${[0, 1, 2].map(i => `<figure class="v-item reveal" style="--i:${i}">${art(i === 0 ? themeId : (seedIds[1] || themeId), Object.assign({}, c, { primary: [c.primary, c.accent, c.accent2][i], accent: [c.accent, c.accent2, c.primary][i] }), i !== 1, uid + i)}<figcaption>${esc(S((imgPrompts[i] || {}).use || ['Hero', 'Textura', 'Iconos'][i]))}</figcaption></figure>`).join('')}</div></section>`;

    const stepsByGoal = {
      leads: ['Cuéntanos tu caso en el formulario', 'Te contactamos con una propuesta', 'Empezamos a trabajar juntos'],
      trial: ['Crea tu cuenta con tu correo', 'Configura lo básico en minutos', 'Ve resultados desde la primera semana'],
      sale: ['Elige tu opción', 'Pago seguro en un paso', 'Recíbelo con seguimiento'],
      booking: ['Elige fecha y hora', 'Recibe la confirmación', 'Conversamos sin compromiso'],
      app: ['Descarga la app', 'Crea tu perfil en un minuto', 'Empieza hoy mismo'],
      event: ['Aparta tu cupo', 'Recibe el acceso por correo', 'Conéctate el día del evento']
    }[brief.objetivo] || ['Da el primer paso', 'Configura', 'Disfruta el resultado'];
    H.steps = `<section id="steps" class="steps"><div class="wrap"><p class="eyebrow">Cómo funciona</p><h2>Tres pasos, sin letra pequeña</h2><ol class="s-list">${stepsByGoal.map((s, i) => `<li class="reveal" style="--i:${i}"><b>${i + 1}</b><span>${esc(S(s))}</span></li>`).join('')}</ol></div></section>`;

    const tNames = ['Laura M.', 'Andrés P.', 'Camila R.'];
    H.testimonials = `<section class="testimonials"><div class="wrap"><p class="eyebrow">Lo que dicen</p><div class="t-grid">${benefits.slice(0, 3).map((b, i) => `<figure class="reveal" style="--i:${i}"><blockquote>“${esc(S(`${noDot(b.title)}: eso fue lo que más notamos. ${['Lo recomendaría sin dudar.', 'Ojalá lo hubiéramos encontrado antes.', 'Cumple lo que promete.'][i]}`))}”</blockquote><figcaption>${tNames[i]} · ${esc(publico ? cap(publico.split(/\s+/).slice(0, 3).join(' ')) : 'Cliente')} <em>[testimonio de ejemplo]</em></figcaption></figure>`).join('')}</div></div></section>`;

    H.inoculation = `<section class="inoc"><div class="wrap"><p class="eyebrow">Antes de que lo pienses</p><h2>Las dudas que seguramente tienes</h2><div class="i-list">${(objections.length ? objections : [{ q: '¿Esto es para mí?', a: publico ? `Si formas parte de ${publico}, sí: lo diseñamos pensando en ti.` : 'Si te identificas con el problema, sí.' }, { q: '¿Y si no me funciona?', a: 'Puedes empezar en pequeño y decidir con resultados en la mano.' }]).map((o, i) => `<details class="reveal" ${i === 0 ? 'open' : ''}><summary>${esc(S(o.q))}</summary><p>${esc(S(o.a))}</p></details>`).join('')}</div></div></section>`;

    H.offer = `<section id="offer" class="offer"><div class="wrap"><div class="o-card reveal">
  <p class="eyebrow">${amb && biases.includes('Escasez') ? 'Disponibilidad limitada' : 'La oferta'}</p>
  <h2>${esc(oferta || S(cta))}</h2>
  <ul>${benefits.map(b => `<li>${icon(4, c.primaryInk)}<span>${esc(S(b.title))}</span></li>`).join('')}</ul>
  ${btn(cta)}<p class="reassure">${esc(reassure)}</p>
</div></div></section>`;

    H.faq = `<section id="faq" class="faq"><div class="wrap"><h2>Preguntas frecuentes</h2><div class="i-list">${objections.map(o => `<details><summary>${esc(S(o.q))}</summary><p>${esc(S(o.a))}</p></details>`).join('')}</div></div></section>`;

    H.form = `<section id="form" class="cta-final"><div class="wrap f-grid">
  <div><p class="eyebrow">Último paso</p><h2>${esc(S(human ? `Hablemos de ${low(noDot(tema))}` : `Empieza con ${marca}`))}</h2><p class="lead">${esc(S(reassure))}</p></div>
  <form class="f-card" novalidate>
    ${fields.map(f => { const d = fieldDefs[f]; return `<label>${d[1]}<input type="${d[0]}" name="${f}" autocomplete="${d[2]}" ${f === 'email' ? 'required' : ''}></label>`; }).join('')}
    <button class="btn" type="submit">${esc(S(cta))}<span aria-hidden="true">→</span></button>
    <p class="ok" role="status" hidden>¡Listo! Te escribimos muy pronto.</p>
  </form>
</div></section>`;

    const footer = sub
      ? `<footer class="foot"><div class="wrap"><span>© ${new Date().getFullYear()} ${esc(marca)}</span></div></footer>`
      : `<footer class="foot"><div class="wrap foot-row"><span class="logo">${esc(marca)}</span><span>${esc(cap(tema))}</span><span>© ${new Date().getFullYear()} · Aviso de privacidad</span></div></footer>`;

    /* 3 · Informe del agente crítico */
    if (T.has('subagents')) {
      const crit = O.subagents.critics || [];
      const it = +O.subagents.iterations || 1;
      note('Agente crítico · Iteración 1', `Revisión como ${crit.join(', ') || 'UX'}.`, 'info');
      if (fix.length) note('Agente crítico · Accesibilidad', `Contraste corregido en: ${fix.join(', ')} (objetivo WCAG AA).`, 'ok');
      else note('Agente crítico · Accesibilidad', `Contraste AA verificado (botón ${contrast(c.primary, c.onPrimary).toFixed(1)}:1, texto ${contrast(c.text, c.bg).toFixed(1)}:1).`, 'ok');
      note('Agente crítico · CRO', `Un único CTA primario («${S(cta)}») repetido ${1 + (navMode.startsWith('Sin') ? 0 : 1) + (sections.includes('offer') ? 1 : 0) + 1} veces con el mismo texto.`, 'ok');
      note('Agente crítico · UX', `Beneficio principal visible en el hero: «${noDot(benefits[0].title)}».`, 'ok');
      if (crit.includes('Accesibilidad WCAG')) note('Agente crítico · Accesibilidad', 'Etiquetas en todos los campos, foco visible, ornamentos con aria-hidden y animaciones bajo prefers-reduced-motion.', 'ok');
      if (crit.includes('Rendimiento y SEO')) note('Agente crítico · SEO', 'Meta description, un solo H1 y jerarquía H2 coherente.', 'ok');
      if (it > 1) note(`Agente crítico · Iteración ${it}`, 'Segunda pasada sin fricciones críticas pendientes. Se entrega la versión corregida.', 'ok');
      if (O.subagents.abtest) note('Agente CRO · Test A/B', `A: «${S(cta)}» en ${c.primary} · B: «${g.cta} ahora» en ${c.accent} · C: CTA fijo al pie en móvil.`, 'info');
    } else if (fix.length) {
      note('Ajuste automático', `Contraste mejorado en: ${fix.join(', ')}.`, 'info');
    }
    if (T.has('negative')) note('Restricciones negativas', removed.length ? `Se reemplazaron ${removed.length} término(s) prohibido(s): ${Array.from(new Set(removed.map(x => x.toLowerCase()))).join(', ')}.` : 'El copy no contiene ninguna palabra prohibida.', 'ok');
    if (human) note('Redacción humana', `Voz «${O.human.voice}»${O.human.storytelling ? ' con arco de storytelling' : ''}. Revisa manualmente titular, historia y testimonios antes de publicar.`, 'info');
    if (sections.includes('testimonials')) note('Pendiente', 'Los testimonios son de ejemplo: reemplázalos por testimonios reales antes de publicar.', 'warn');

    /* ---------- CSS ---------- */
    const border = th.border || 'none';
    const shadow = th.shadow || 'none';
    const css = `
:root{--bg:${c.bg};--surface:${c.surface};--text:${c.text};--muted:${c.muted};--primary:${c.primary};--on-primary:${c.onPrimary};--p-ink:${c.primaryInk};--accent:${c.accent};--a-ink:${c.accentInk};--accent2:${c.accent2};--line:${th.line};--radius:${th.radius};--btn-radius:${th.btnRadius};--border:${border};--shadow:${shadow};--fd:${th.fd};--fb:${th.fb}}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:var(--text);line-height:1.6;font-size:17px;-webkit-font-smoothing:antialiased;overflow-x:hidden}
svg{display:block;max-width:100%;height:auto}
a{color:inherit}
.wrap{width:min(1180px,100% - 40px);margin-inline:auto;position:relative;z-index:1}
h1,h2,h3{font-family:var(--fd);line-height:1.05;letter-spacing:${th.upper ? '.01em' : '-.02em'};font-weight:${themeId === 'didot' || themeId === 'fibonacci' || themeId === 'japanma' || themeId === 'artdeco' ? 500 : 700}}
${th.upper ? 'h1,h2,.eyebrow,.btn{text-transform:uppercase}' : ''}
${th.italic ? 'h1 em,h2{font-style:italic}' : ''}
h1{font-size:clamp(2.3rem,5.6vw,${th.hero === 'swiss' || th.hero === 'stack' ? '5.6rem' : '4.4rem'});margin:.25em 0 .35em}
h2{font-size:clamp(1.8rem,3.6vw,2.9rem);margin:.2em 0 .8em;max-width:22ch}
h3{font-size:1.25rem;margin:.6em 0 .3em}
.eyebrow{font-size:.78rem;letter-spacing:.16em;font-weight:600;color:var(--p-ink);text-transform:uppercase}
.lead{font-size:clamp(1.05rem,1.6vw,1.25rem);color:var(--muted);max-width:52ch}
section{padding:clamp(64px,10vw,128px) 0;position:relative}
:focus-visible{outline:3px solid var(--a-ink);outline-offset:3px}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 0}
.nav nav{display:flex;gap:26px;font-size:.92rem}
.nav nav a{text-decoration:none;color:var(--muted)} .nav nav a:hover{color:var(--text)}
.logo{font-family:var(--fd);font-weight:700;font-size:1.2rem;text-decoration:none;letter-spacing:${th.upper ? '.08em' : '-.01em'}}
.btn{display:inline-flex;align-items:center;gap:.6em;padding:1em 1.55em;border-radius:var(--btn-radius);background:var(--primary);color:var(--on-primary);font-weight:600;text-decoration:none;border:var(--border);box-shadow:var(--shadow);font-family:inherit;font-size:1rem;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;${th.gradient ? 'background:linear-gradient(135deg,var(--primary),var(--accent2));' : ''}}
.btn:hover{transform:translateY(-2px)} .btn span{transition:transform .2s} .btn:hover span{transform:translateX(3px)}
.btn.sm{padding:.6em 1.1em;font-size:.88rem}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line);box-shadow:none}
.actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
.reassure{font-size:.85rem;color:var(--muted);margin-top:14px}
.badge{display:inline-block;margin-top:18px;padding:.35em .8em;border:1px solid var(--p-ink);color:var(--p-ink);font-size:.8rem;border-radius:999px}
/* HERO */
.hero{min-height:min(92vh,900px);display:flex;align-items:center;overflow:hidden;padding-top:clamp(48px,8vw,96px)}
${th.gradient ? '.hero::before{content:"";position:absolute;inset:-20% -10% auto auto;width:70vw;height:70vw;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 35%,transparent),transparent 60%);z-index:0}' : ''}
.hero-grid{display:grid;gap:clamp(32px,5vw,72px);align-items:center;grid-template-columns:1.1fr .9fr}
.hero-art svg{width:100%}
.hero--asym .hero-grid{grid-template-columns:repeat(12,1fr);align-items:end}
.hero--asym .hero-copy{grid-column:5/13;grid-row:1}
.hero--asym .hero-art{grid-column:1/5;grid-row:1;align-self:start;max-width:320px;margin-top:-40px}
.hero--center .hero-grid{grid-template-columns:1fr;justify-items:center;text-align:center}
.hero--center .hero-art{order:-1;width:min(${rich ? 340 : 240}px,70%)}
.hero--center .lead{margin-inline:auto} .hero--center .actions{justify-content:center} .hero--center h1{max-width:20ch;margin-inline:auto;font-size:clamp(2.1rem,4.4vw,3.6rem)}
.hero--ma{min-height:100vh}
.hero--ma .hero-grid{grid-template-columns:repeat(12,1fr);align-items:end;min-height:70vh}
.hero--ma .hero-copy{grid-column:1/7;grid-row:1;align-self:end}
.hero--ma .hero-art{grid-column:9/13;grid-row:1;align-self:start;max-width:260px}
.hero--ma h1{font-size:clamp(2rem,4vw,3.3rem)}
.hero--swiss .hero-grid{grid-template-columns:repeat(12,1fr);border-top:6px solid var(--text);padding-top:28px;align-items:start}
.hero--swiss .hero-copy{grid-column:1/9} .hero--swiss .hero-art{grid-column:9/13;margin-top:10px}
.hero--swiss h1{letter-spacing:-.045em;line-height:.92}
.hero--stack .hero-grid{grid-template-columns:1fr;gap:28px}
.hero--stack .hero-copy{border:var(--border);box-shadow:var(--shadow);background:var(--surface);padding:clamp(24px,5vw,56px)}
.hero--stack .hero-art{max-width:420px;justify-self:end;margin-top:-90px}
.hero--editorial .hero-grid{grid-template-columns:1.4fr .6fr;align-items:start}
.hero--editorial h1{font-size:clamp(2.6rem,7vw,5.6rem);font-style:italic;font-weight:600}
.hero--editorial .lead{max-width:48ch;border-top:1px solid var(--line);padding-top:18px}
.hero--editorial .hero-art{margin-top:40px}
.hero--spiral .hero-grid{grid-template-columns:.62fr 1fr}
.hero--spiral .hero-art{order:-1;opacity:.95}
.hero--spiral h1{font-style:italic}
.hero--blueprint .hero-grid{grid-template-columns:1fr 1fr}
.hero--blueprint h1{font-size:clamp(2rem,4.6vw,3.8rem);letter-spacing:-.03em}
.gridbg{position:absolute;inset:0;background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:32px 32px;opacity:.55;z-index:0}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 3px,rgba(0,0,0,.18) 3px 4px);pointer-events:none;z-index:0}
canvas.motion{position:absolute;inset:0;width:100%;height:100%;z-index:0;opacity:.9}
/* PROOF */
.proof{padding:26px 0;border-block:1px solid var(--line);background:var(--surface)}
.proof-row{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:14px 28px;font-weight:600;font-size:.95rem;color:var(--muted);text-align:center}
.proof-row i{width:6px;height:6px;background:var(--p-ink);border-radius:${th.radius === '0px' ? '0' : '50%'}}
/* BENEFICIOS */
.b-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.b-item{padding:28px;background:var(--surface);border-radius:var(--radius);border:${th.border || '1px solid var(--line)'};box-shadow:var(--shadow)}
.b-item p{color:var(--muted)}
.b-mark{width:44px;height:44px;display:flex;align-items:center;justify-content:center;color:var(--p-ink);font-family:var(--fd);font-weight:700}
.b-mark svg{width:30px;height:30px}
.b--numbered .b-item{background:none;border:none;border-top:4px solid var(--text);border-radius:0;padding:20px 0 0}
.b--numbered .b-mark{font-size:3.4rem;width:auto;height:auto;justify-content:flex-start;color:var(--p-ink);letter-spacing:-.05em}
.b--columns .b-item{background:none;border:none;border-left:1px solid var(--line);border-radius:0;padding:0 24px}
.b--columns .b-mark{font-style:italic;font-size:2.4rem;width:auto;justify-content:flex-start;color:var(--p-ink)}
.b--editorial .b-item{background:none;border:none;border-top:1px solid var(--line);border-radius:0;padding:24px 0 0;text-align:center}
.b--editorial .b-mark{margin-inline:auto;font-style:italic;color:var(--a-ink)}
.b--minimal .b-list{grid-template-columns:1fr;gap:0;max-width:760px}
.b--minimal .b-item{background:none;border:none;border-top:1px solid var(--line);border-radius:0;display:grid;grid-template-columns:60px 1fr;column-gap:24px;padding:28px 0}
.b--minimal .b-item h3{margin-top:0} .b--minimal .b-item p{grid-column:2}
.b--figures .b-item{background:transparent;border:1px dashed var(--line)} .b--figures .b-mark{font-family:var(--fd);font-size:.8rem;width:auto;justify-content:flex-start;color:var(--a-ink)}
.b--terminal .b-item{background:var(--surface);border:1px solid var(--line);font-family:var(--fd)} .b--terminal .b-mark{width:auto;justify-content:flex-start}
.b--blocks .b-item:nth-child(3n+1){background:var(--primary);color:var(--on-primary)} .b--blocks .b-item:nth-child(3n+1) p,.b--blocks .b-item:nth-child(3n+1) .b-mark{color:inherit}
.b--blocks .b-item{border:3px solid var(--text)}
.b--stagger .b-item:nth-child(2){transform:translateY(40px)} .b--stagger .b-item:nth-child(3){transform:translateY(80px)} .b--stagger{padding-bottom:160px}
.b--framed .b-item{background:transparent;border:1px solid var(--line);outline:1px solid var(--line);outline-offset:6px;text-align:center} .b--framed .b-mark{margin-inline:auto}
/* HISTORIA */
.story{background:var(--surface)}
.story-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;margin-top:24px}
.story-steps span{font-family:var(--fd);font-size:1.6rem;color:var(--p-ink);display:block;margin-bottom:10px;${th.italic ? 'font-style:italic;' : ''}}
.story-steps p{font-size:1.08rem}
/* GALERÍA */
.v-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:20px}
.v-item{background:var(--surface);border-radius:var(--radius);padding:24px;border:${th.border || '1px solid var(--line)'};display:flex;flex-direction:column;justify-content:space-between;gap:12px}
.v-item figcaption{font-size:.8rem;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}
/* PASOS */
.s-list{list-style:none;display:grid;grid-template-columns:repeat(3,1fr);gap:24px;counter-reset:s}
.s-list li{display:flex;gap:16px;align-items:flex-start;padding-top:20px;border-top:2px solid var(--line)}
.s-list b{font-family:var(--fd);font-size:2.2rem;line-height:1;color:var(--p-ink)}
/* TESTIMONIOS */
.t-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-top:20px}
.t-grid figure{background:var(--surface);padding:28px;border-radius:var(--radius);border:${th.border || '1px solid var(--line)'}}
.t-grid blockquote{font-family:var(--fd);font-size:1.15rem;line-height:1.4;margin-bottom:16px;${th.italic ? 'font-style:italic;' : ''}}
.t-grid figcaption{font-size:.88rem;color:var(--muted)} .t-grid em{font-size:.75rem;opacity:.75}
/* INOCULACIÓN / FAQ */
.i-list{display:grid;gap:12px;max-width:820px}
details{background:var(--surface);border:${th.border || '1px solid var(--line)'};border-radius:var(--radius);padding:20px 24px}
summary{cursor:pointer;font-weight:600;font-size:1.08rem;list-style:none;display:flex;justify-content:space-between;gap:16px}
summary::after{content:"+";color:var(--p-ink);font-size:1.4rem;line-height:1} details[open] summary::after{content:"–"}
details p{margin-top:10px;color:var(--muted)}
/* OFERTA */
.o-card{max-width:640px;margin-inline:auto;text-align:center;padding:clamp(32px,6vw,64px);background:var(--surface);border-radius:var(--radius);border:${th.border || '1px solid var(--line)'};box-shadow:var(--shadow)}
.o-card h2{margin-inline:auto}
.o-card ul{list-style:none;display:grid;gap:10px;margin:0 auto 28px;text-align:left;max-width:380px}
.o-card li{display:flex;gap:10px;align-items:center} .o-card li svg{width:20px;height:20px;flex:none}
/* FORMULARIO */
.cta-final{background:${th.dark ? 'var(--surface)' : 'color-mix(in srgb,var(--primary) 7%,var(--bg))'}}
.f-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.f-card{display:grid;gap:14px;background:var(--bg);padding:32px;border-radius:var(--radius);border:${th.border || '1px solid var(--line)'};box-shadow:var(--shadow)}
.f-card label{display:grid;gap:6px;font-size:.88rem;font-weight:600}
.f-card input{font:inherit;padding:.85em 1em;border:1px solid ${c.muted};border-radius:calc(var(--radius) / 2);background:var(--surface);color:var(--text)}
.f-card .btn{justify-content:center;margin-top:6px}
.ok{color:var(--p-ink);font-weight:600}
/* PIE */
.foot{padding:32px 0;border-top:1px solid var(--line);font-size:.88rem;color:var(--muted)}
.foot-row{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
/* ANIMACIÓN */
.reveal{opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease;transition-delay:calc(var(--i,0) * 90ms)}
.reveal.in{opacity:1;transform:none}
.b--stagger .b-item.reveal.in:nth-child(2){transform:translateY(40px)} .b--stagger .b-item.reveal.in:nth-child(3){transform:translateY(80px)}
@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}canvas.motion{display:none}}
@media (max-width:860px){
  .hero-grid,.hero--asym .hero-grid,.hero--ma .hero-grid,.hero--swiss .hero-grid,.hero--editorial .hero-grid,.hero--spiral .hero-grid,.hero--blueprint .hero-grid{grid-template-columns:1fr}
  .hero--asym .hero-copy,.hero--asym .hero-art,.hero--ma .hero-copy,.hero--ma .hero-art,.hero--swiss .hero-copy,.hero--swiss .hero-art{grid-column:1;grid-row:auto}
  .hero-art{max-width:300px;margin-top:0!important} .hero--stack .hero-art{margin-top:0;justify-self:start}
  .nav nav{display:none} .story-steps,.s-list,.v-grid,.f-grid{grid-template-columns:1fr}
  .b--stagger .b-item,.b--stagger .b-item.reveal.in{transform:none!important} .b--stagger{padding-bottom:64px}
  .b--columns .b-item{border-left:none;border-top:1px solid var(--line);padding:20px 0 0}
}`;

    /* ---------- scripts ---------- */
    const motionJs = motion ? `
(function(){var cv=document.querySelector('canvas.motion');if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var x=cv.getContext('2d'),W,H,dpr=Math.min(2,window.devicePixelRatio||1),cols=${JSON.stringify([c.primary, c.accent, c.accent2])},shape=${JSON.stringify(themeId)},P=[];
function rs(){W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}
rs();addEventListener('resize',rs);
for(var i=0;i<26;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:6+Math.random()*34,vx:(Math.random()-.5)*.25,vy:-.08-Math.random()*.22,a:Math.random()*6.28,va:(Math.random()-.5)*.004,c:cols[i%3],o:.08+Math.random()*.16});
function draw(p){x.save();x.translate(p.x,p.y);x.rotate(p.a);x.globalAlpha=p.o;x.fillStyle=p.c;x.strokeStyle=p.c;x.lineWidth=1.5;x.beginPath();
if(shape==='bauhaus'||shape==='memphis'){if(p.r%3<1)x.rect(-p.r/2,-p.r/2,p.r,p.r);else if(p.r%3<2)x.arc(0,0,p.r/2,0,6.28);else{x.moveTo(0,-p.r/2);x.lineTo(p.r/2,p.r/2);x.lineTo(-p.r/2,p.r/2);x.closePath()}x.fill()}
else if(shape==='patent50'||shape==='phosphor'||shape==='swiss'){x.arc(0,0,p.r,0,6.28);x.stroke();x.beginPath();x.moveTo(-p.r*1.3,0);x.lineTo(p.r*1.3,0);x.stroke()}
else if(shape==='artdeco'||shape==='didot'){x.moveTo(0,-p.r);x.lineTo(p.r*.6,0);x.lineTo(0,p.r);x.lineTo(-p.r*.6,0);x.closePath();x.stroke()}
else{x.moveTo(0,-p.r);x.lineTo(p.r*.8,-p.r*.2);x.lineTo(p.r*.5,p.r*.8);x.lineTo(-p.r*.5,p.r*.8);x.lineTo(-p.r*.8,-p.r*.2);x.closePath();x.fill()}
x.restore()}
(function loop(){x.clearRect(0,0,W,H);P.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.a+=p.va;if(p.y<-60){p.y=H+60;p.x=Math.random()*W}if(p.x<-60)p.x=W+60;if(p.x>W+60)p.x=-60;draw(p)});requestAnimationFrame(loop)})()})();` : '';
    const js = `
(function(){var els=document.querySelectorAll('.reveal');if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});els.forEach(function(e){io.observe(e)})})();
document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(ev){ev.preventDefault();var em=f.querySelector('[type=email]');if(em&&!/^\\S+@\\S+\\.\\S+$/.test(em.value)){em.focus();em.setAttribute('aria-invalid','true');return}f.querySelector('.ok').hidden=false;f.querySelector('button').disabled=true})});
${motionJs}`;

    const annex = [];
    annex.push(`Generado con LandingForge IA · Motor local · ${new Date().toLocaleString('es')}`);
    annex.push(`Técnicas: ${Array.from(T).map(id => 'T' + D.tech(id).num + ' ' + D.tech(id).name).join(' | ') || 'ninguna'}`);
    annex.push(`Tema visual: ${th.name}`);
    if (imgPrompts.length) { annex.push(''); annex.push('PROMPTS DE IMAGEN:'); imgPrompts.forEach(p => annex.push(`- ${p.use}: ${p.text}`)); }
    if (vidPrompt) { annex.push(''); annex.push('PROMPT DE VÍDEO:'); annex.push(vidPrompt); }
    if (report.length) { annex.push(''); annex.push('INFORME:'); report.forEach(r => annex.push(`- [${r.agent}] ${r.msg}`)); }

    const html = `<!DOCTYPE html>
<html lang="${({ 'Inglés': 'en', 'Portugués': 'pt', 'Francés': 'fr' })[brief.idioma] || 'es'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(marca)} · ${esc(S(cap(tema)))}</title>
<meta name="description" content="${esc(S(clean(brief.propuesta) || tema))}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${th.fonts}&display=swap" rel="stylesheet">
<!--
${annex.join('\n').replace(/--/g, '—')}
-->
<style>${css}</style>
</head>
<body>
${navHtml}
<main>
${sections.map(s => H[s]).join('\n')}
</main>
${footer}
<script>${js}</script>
</body>
</html>`;

    return { html, report, theme: th.name, imagePrompts: imgPrompts, videoPrompt: vidPrompt, sections };
  }

  return { build, THEMES, contrast };
})();
