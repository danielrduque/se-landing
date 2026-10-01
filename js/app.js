/* ==========================================================================
   LandingForge IA · Controlador de la interfaz
   ========================================================================== */
(function () {
  const D = LF.data, P = LF.prompts, E = LF.engine, A = LF.ai, S = LF.store;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = s => String(s || 'landing').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'landing';
  const fmtDate = t => new Date(t).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  const techLabel = id => { const t = D.tech(id); return t ? `T${t.num} ${t.name}` : id; };

  const state = {
    brief: S.getBrief(),
    selected: new Set(),
    opts: {},
    results: [],
    current: null,       // { text, spec, id, edited }
    build: null,         // { html, report, engine, promptText, spec }
    settings: S.getSettings(),
    abort: null,
    detailId: null
  };
  D.techniques.forEach(t => { state.opts[t.id] = D.defaultOpts(t.id); });

  /* ======================= utilidades de UI ======================= */
  function toast(msg, err) {
    const el = document.createElement('div');
    el.className = 'toast' + (err ? ' err' : '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, err ? 5200 : 2600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e2) { /* nada */ } ta.remove();
    }
    toast('Copiado al portapapeles');
  }
  function download(name, content, type) {
    const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function openInTab(html) {
    const payload = JSON.stringify(html).replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
    const wrapper = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vista previa · LandingForge</title><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%;display:block}</style></head><body><iframe sandbox="allow-scripts allow-forms" title="Landing"></iframe><script>document.querySelector('iframe').srcdoc=${payload};<\/script></body></html>`;
    const url = URL.createObjectURL(new Blob([wrapper], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) toast('El navegador bloqueó la ventana emergente. Usa «Descargar HTML».', true);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function starsHtml(n, cls) {
    return `<div class="stars ${cls || ''}" role="radiogroup" aria-label="Valoración">${[1, 2, 3, 4, 5].map(i => `<button type="button" class="${i <= n ? 'on' : ''}" data-star="${i}" role="radio" aria-checked="${i === n}" aria-label="${i} estrella${i > 1 ? 's' : ''}">★</button>`).join('')}</div>`;
  }

  /* ======================= navegación ======================= */
  const VIEWS = ['brief', 'techniques', 'studio', 'bank', 'guide'];
  function go(v, push) {
    if (!VIEWS.includes(v)) v = 'brief';
    $$('.view').forEach(el => { el.hidden = el.dataset.view !== v; });
    $$('.step').forEach(el => el.classList.toggle('on', el.dataset.go === v));
    if (push !== false && location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    if (v === 'bank') renderBank();
    if (v === 'studio') refreshStudioPick();
    if (v === 'techniques') updateSelection();
    window.scrollTo({ top: 0 });
  }
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); go(g.dataset.go); }
  });
  window.addEventListener('hashchange', () => go(location.hash.slice(1), false));

  /* ======================= tema claro/oscuro ======================= */
  function applyTheme() {
    const t = state.settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }
  $('#themeToggle').addEventListener('click', () => {
    const dark = state.settings.theme === 'dark' || (state.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    state.settings.theme = dark ? 'light' : 'dark';
    S.setSettings(state.settings); applyTheme();
  });

  /* ======================= 1 · BRIEF ======================= */
  const BRIEF = [
    { legend: 'Lo esencial', fields: [
      { k: 'tema', label: 'Tema de la landing', req: true, full: true, ph: 'p. ej. Plataforma de clases de yoga online', hint: '¿Qué vas a promocionar?' },
      { k: 'marca', label: 'Nombre de la marca', ph: 'p. ej. Prana Studio' },
      { k: 'industria', label: 'Sector', type: 'select', hint: 'Si lo dejas en «detectar», se deduce del tema', options: [['', 'Detectar del tema (recomendado)']].concat(D.industries.map(x => [x, x])) },
      { k: 'objetivo', label: 'Objetivo de conversión', type: 'select', options: Object.keys(D.goals).map(k => [k, D.goals[k].label]) },
      { k: 'cta', label: 'Texto del botón principal', ph: '', hint: 'Opcional' }
    ] },
    { legend: 'Audiencia y propuesta', fields: [
      { k: 'publico', label: 'Público objetivo', full: true, ph: 'p. ej. profesionales de 30 a 45 años con poco tiempo libre' },
      { k: 'problema', label: 'Problema que resuelves', full: true, ph: 'p. ej. quieren hacer ejercicio pero no encuentran horarios' },
      { k: 'propuesta', label: 'Propuesta de valor (una frase)', full: true, ph: 'p. ej. Yoga en vivo de 20 minutos, a la hora que tú elijas' }
    ] },
    { legend: 'Contenido', fields: [
      { k: 'beneficios', label: 'Beneficios clave', type: 'textarea', rows: 4, full: true, ph: 'Clases en vivo cada hora: siempre hay una que encaja\nProfesores certificados: corrigen tu postura en tiempo real\nSin permanencia: pausas cuando quieras', hint: 'Uno por línea · opcional «Título: descripción»' },
      { k: 'objeciones', label: 'Objeciones frecuentes', type: 'textarea', rows: 3, full: true, ph: 'Nunca he hecho yoga | Hay clases de iniciación todos los días', hint: 'Una por línea · opcional «Duda | Respuesta»' },
      { k: 'prueba', label: 'Prueba social', ph: '+2.000 alumnos · 4,9/5 en reseñas' },
      { k: 'oferta', label: 'Oferta o precio', ph: 'p. ej. Primera semana gratis' }
    ] },
    { legend: 'Estilo y formato de salida', fields: [
      { k: 'tono', label: 'Tono de voz', type: 'select', options: D.tones.map(x => [x, x]) },
      { k: 'idioma', label: 'Idioma de la landing', type: 'select', options: D.languages.map(x => [x, x]) },
      { k: 'formato', label: 'Formato que pedirá el prompt', type: 'segmented', full: true, options: Object.keys(D.formats).map(k => [k, D.formats[k]]) },
      { k: 'colors', label: 'Colores de marca', type: 'colors', full: true }
    ] }
  ];

  function renderBrief() {
    const b = state.brief;
    $('#briefFields').innerHTML = BRIEF.map((g, gi) => `<fieldset class="fs"><legend><i>${gi + 1}</i>${g.legend}</legend><div class="grid">${g.fields.map(f => {
      const id = 'f_' + f.k;
      const lab = `<span><label for="${id}">${f.label}${f.req ? ' <em>*</em>' : ''}</label>${f.hint ? `<small>${f.hint}</small>` : ''}</span>`;
      let ctl = '';
      if (f.type === 'select') ctl = `<select id="${id}" data-k="${f.k}">${f.options.map(([v, l]) => `<option value="${esc(v)}" ${b[f.k] === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      else if (f.type === 'textarea') ctl = `<textarea id="${id}" data-k="${f.k}" rows="${f.rows}" placeholder="${esc(f.ph)}">${esc(b[f.k])}</textarea>`;
      else if (f.type === 'segmented') return `<div class="field ${f.full ? 'full' : ''}"><span>${f.label}</span><div class="segmented" role="radiogroup">${f.options.map(([v, l]) => `<label><input type="radio" name="formato" value="${v}" ${b.formato === v ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></div>`;
      else if (f.type === 'colors') return `<div class="field full"><span>${f.label}</span><div class="colors">
          <label class="check"><input type="checkbox" id="colorAuto" ${b.colorAuto ? 'checked' : ''}> Que la IA proponga la paleta</label>
          <label>Primario <input type="color" id="color1" value="${esc(b.color1)}" ${b.colorAuto ? 'disabled' : ''}></label>
          <label>Acento <input type="color" id="color2" value="${esc(b.color2)}" ${b.colorAuto ? 'disabled' : ''}></label></div></div>`;
      else ctl = `<input type="text" id="${id}" data-k="${f.k}" value="${esc(b[f.k])}" placeholder="${esc(f.k === 'cta' ? 'p. ej. ' + (D.goals[b.objetivo] || D.goals.leads).cta : f.ph)}" ${f.req ? 'required' : ''}>`;
      return `<div class="field ${f.full ? 'full' : ''}">${lab}${ctl}</div>`;
    }).join('')}</div></fieldset>`).join('');
    updateMeter();
  }

  function saveBrief() { S.setBrief(state.brief); updateMeter(); }
  $('#briefForm').addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.k) state.brief[t.dataset.k] = t.value;
    else if (t.name === 'formato') state.brief.formato = t.value;
    else if (t.id === 'color1' || t.id === 'color2') state.brief[t.id] = t.value;
    else if (t.id === 'colorAuto') { state.brief.colorAuto = t.checked; $('#color1').disabled = $('#color2').disabled = t.checked; }
    if (t.dataset.k === 'objetivo') $('#f_cta').placeholder = 'p. ej. ' + D.goals[t.value].cta;
    saveBrief();
  });
  $('#briefForm').addEventListener('change', e => { if (e.target.dataset.k === 'objetivo') { state.brief.objetivo = e.target.value; saveBrief(); } });
  $('#briefForm').addEventListener('submit', e => e.preventDefault());

  function updateMeter() {
    const sc = P.score(state.brief, Array.from(state.selected));
    const briefOnly = P.score(state.brief, []);
    const v = Math.min(100, Math.round(briefOnly.value / 70 * 100));
    $('#briefMeter').style.width = v + '%';
    $('#briefScore').textContent = v;
    $('#briefLabel').textContent = v >= 85 ? '· excelente' : v >= 60 ? '· bien' : v >= 30 ? '· básico' : '· incompleto';
    const tips = sc.tips.filter(t => !/técnica|subagentes/.test(t)).slice(0, 4);
    $('#briefTips').innerHTML = tips.length ? tips.map(t => `<li>${esc(t)}</li>`).join('') : '<li class="good">Brief completo: tus prompts tendrán todo el contexto.</li>';
  }

  D.examples.forEach(ex => $('#exampleSelect').insertAdjacentHTML('beforeend', `<option value="${ex.id}">${esc(ex.label)} · ${esc(ex.brief.marca)}</option>`));
  $('#exampleSelect').addEventListener('change', e => {
    const ex = D.examples.find(x => x.id === e.target.value);
    if (!ex) return;
    state.brief = Object.assign({}, D.emptyBrief, JSON.parse(JSON.stringify(ex.brief)));
    saveBrief(); renderBrief();
    state.selected = new Set(ex.techniques);
    D.techniques.forEach(t => { state.opts[t.id] = Object.assign(D.defaultOpts(t.id), (ex.opts || {})[t.id] || {}); });
    renderTechniques(); renderSeedPanel();
    e.target.value = '';
    toast(`Ejemplo «${ex.brief.marca}» cargado con ${ex.techniques.length} técnicas sugeridas`);
  });
  $('#briefClear').addEventListener('click', () => {
    if (!confirm('¿Vaciar todos los campos del proyecto?')) return;
    state.brief = Object.assign({}, D.emptyBrief); saveBrief(); renderBrief();
  });
  $('#toTechniques').addEventListener('click', () => {
    if (!state.brief.tema.trim()) { toast('Escribe al menos el tema de la landing.', true); $('#f_tema').focus(); return; }
    go('techniques');
  });
  $('#introClose').addEventListener('click', () => { $('#intro').hidden = true; state.settings.intro = false; S.setSettings(state.settings); });

  /* ======================= 2 · TÉCNICAS ======================= */
  function optField(t, op) {
    if (op.type === 'hidden') return '';
    const v = state.opts[t.id][op.key];
    const id = `o_${t.id}_${op.key}`;
    const lab = `<span><label for="${id}">${op.label}</label>${op.key === 'seeds' ? '<button type="button" class="linkish" data-random-seed>Aleatoria</button>' : ''}</span>`;
    if (op.type === 'chips') return `<div class="field">${lab}<div class="chips" data-chips="${op.key}" data-max="${op.max || 99}" id="${id}">${op.choices.map(c => `<button type="button" class="chip ${v.includes(c.value) ? 'on' : ''}" data-v="${esc(c.value)}" aria-pressed="${v.includes(c.value)}">${esc(c.label)}</button>`).join('')}</div></div>`;
    if (op.type === 'select') return `<div class="field">${lab}<select id="${id}" data-o="${op.key}">${op.choices.map(c => `<option value="${esc(c.value)}" ${String(v) === String(c.value) ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></div>`;
    if (op.type === 'range') return `<div class="field">${lab}<div class="range-row"><input type="range" id="${id}" data-o="${op.key}" min="${op.min}" max="${op.max}" step="${op.step || 1}" value="${v}"><output>${v}${op.key === 'pct' ? '%' : ''}</output></div></div>`;
    if (op.type === 'toggle') return `<label class="check"><input type="checkbox" data-o="${op.key}" ${v ? 'checked' : ''}> ${op.label}</label>`;
    if (op.type === 'textarea') return `<div class="field">${lab}<textarea id="${id}" data-o="${op.key}" rows="3">${esc(v)}</textarea></div>`;
    return `<div class="field">${lab}<input type="text" id="${id}" data-o="${op.key}" value="${esc(v)}" placeholder="${esc(op.placeholder || '')}"></div>`;
  }

  function renderTechniques() {
    $('#presets').innerHTML = D.presets.map(p => `<button type="button" class="preset" data-preset="${p.id}"><strong>${esc(p.name)}</strong><small>${p.ids.map(i => 'T' + D.tech(i).num).join(' + ')} · ${esc(p.desc)}</small></button>`).join('');
    $('#techGroups').innerHTML = Object.keys(D.phases).map(ph => {
      const ts = D.techniques.filter(t => t.phase === ph);
      return `<div class="phase"><div class="phase-head"><h3 style="color:var(--${ph})">${D.phases[ph].label}</h3><p>${D.phases[ph].desc}</p></div><div class="tcards">${ts.map(t => `
        <article class="tcard ${state.selected.has(t.id) ? 'on' : ''}" data-t="${t.id}">
          <div class="tcard-top">
            <div class="tnum">${t.num}</div>
            <div><span class="pchip ${t.phase}">${D.phases[t.phase].label}</span><h4>${esc(t.name)}</h4></div>
            <label class="tsel"><input type="checkbox" ${state.selected.has(t.id) ? 'checked' : ''} aria-label="Seleccionar ${esc(t.name)}"></label>
          </div>
          <p>${esc(t.tagline)}</p>
          <p class="theory" hidden>${esc(t.theory)}</p>
          <details><summary>Opciones de la técnica</summary><div class="topts">${t.options.map(op => optField(t, op)).join('')}</div></details>
          <div class="tfoot"><button type="button" class="linkish" data-why>¿Por qué funciona?</button><button type="button" class="btn sm" data-gen>Generar solo esta</button></div>
        </article>`).join('')}</div></div>`;
    }).join('');
    updateSelection();
  }

  function updateSelection() {
    const n = state.selected.size;
    $('#selCount').textContent = n;
    $('#selNames').textContent = n ? '· ' + Array.from(state.selected).map(i => 'T' + D.tech(i).num).join(' + ') : '';
    $('#genSingles').disabled = n === 0;
    $('#genSingles').textContent = n > 1 ? `Un prompt por técnica (${n})` : 'Un prompt por técnica';
    $('#genCombined').disabled = n < 2;
    $('#genCombined').title = n < 2 ? 'Selecciona al menos 2 técnicas' : '';
    $$('.tcard').forEach(c => { const on = state.selected.has(c.dataset.t); c.classList.toggle('on', on); $('.tsel input', c).checked = on; });
  }


  /* ---------- semilla del diseño (estilo Minecraft) ---------- */
  const loadedFonts = new Set();
  function loadFont(url) {
    if (!url || loadedFonts.has(url)) return;
    loadedFonts.add(url);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + url + '&display=swap';
    document.head.appendChild(l);
  }
  function swatches(p) { return [p.bg, p.surface, p.text, p.primary, p.accent, p.accent2].map(c => `<i style="background:${c}" title="${c}"></i>`).join(''); }
  function paintSeedChips() {
    const box = $('[data-chips="seeds"]'); if (!box) return;
    $$('.chip', box).forEach(c => { const on = state.opts.seed.seeds.includes(c.dataset.v); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
  }
  const seedOpts = () => LF.seed.optsFrom(state.opts.seed, state.brief);
  function renderSeedPanel() {
    const v = state.opts.seed.seed;
    $('#seedInput').value = v || '';
    const box = $('#seedDna');
    const dna = v ? LF.seed.generate(v, seedOpts()) : null;
    $('#twistSel').value = state.opts.seed.twist || '';
    const fo = state.opts.seed.fonts || {};
    $('#fontD').value = fo.display || ''; $('#fontB').value = fo.body || '';
    $$('#wildSeg input').forEach(i => { i.checked = i.value === String(state.opts.seed.wild == null ? '' : state.opts.seed.wild); });
    if (!dna) { box.innerHTML = ''; return; }
    loadFont(dna.fonts.url); loadFont(dna.fonts.accentUrl);
    const p = dna.palette;
    syncColorInputs(p);
    box.innerHTML = `<div class="dna-card"><div class="dna-title">${esc(dna.world)} · ${esc(dna.title)}</div>
      <div class="dna-sw">${swatches(p)}</div>
      <div class="dna-specimen" style="font-family:${dna.fonts.fd};${dna.upper ? 'text-transform:uppercase;' : ''}${dna.italic ? 'font-style:italic;' : ''}">Así suena esta marca<small style="font-family:${dna.fonts.fb}">${esc(dna.fonts.display)} + ${esc(dna.fonts.body)} · ${esc(dna.typeScale)}</small></div>
      <ul class="dna-list">
        <li><b>Paleta:</b> ${esc(p.source)}, ${dna.dark ? 'oscuro' : 'claro'}</li><li><b>Variante:</b> ${esc(dna.twistName || 'ninguna')}</li><li><b>Hero:</b> ${esc(dna.heroText)}</li>
        <li><b>Beneficios:</b> ${esc(dna.benefitsText)}</li><li><b>Forma:</b> ${esc(dna.shape)}</li>
        <li><b>Textura:</b> ${esc(dna.texture)}</li><li><b>Movimiento:</b> ${esc(dna.motion)}</li>
        <li><b>Imagen:</b> ${esc(dna.imageTreatment)}</li><li><b>Densidad:</b> ${esc(dna.density)}</li>
        <li><b>Locura:</b> ${dna.wild}/3 · ${esc(dna.wildName)}</li><li><b>Fondo:</b> ${esc(dna.patternText)}</li><li><b>Bordes:</b> ${esc(dna.edgeText)}</li>
        <li><b>Tarjetas:</b> ${esc(dna.cardText)}</li><li><b>Titular:</b> ${esc(dna.headlineText)}</li><li><b>Navegación:</b> ${esc(dna.navText)}</li>
        <li><b>Extras:</b> ${[dna.marquee ? 'cinta marquesina' : '', dna.decorN ? dna.decorN + ' formas sueltas' : '', dna.shuffle ? 'orden de bloques barajado' : '', dna.tint ? 'secciones teñidas' : ''].filter(Boolean).join(' · ') || 'ninguno'}</li><li><b>Fuente de acento:</b> ${esc(dna.fonts.accent)}</li><li><b>Botón:</b> ${esc(dna.button)}</li>
      </ul></div>`;
  }
  function setSeed(v) {
    v = String(v || '').trim();
    state.opts.seed.seed = v;
    if (v) {
      const dna = LF.seed.generate(v, seedOpts());
      state.opts.seed.seeds = dna.styles.slice();
      state.selected.add('seed');
      updateSelection();
      toast('Semilla «' + v + '»: ' + dna.title);
    }
    paintSeedChips(); renderSeedPanel();
  }
  function renderSeedGrid(fresh) {
    const items = [];
    for (let i = 0; i < 8; i++) {
      const sd = LF.seed.randomSeed(), dna = LF.seed.generate(sd, { wild: state.opts.seed.wild, twist: state.opts.seed.twist });
      loadFont(dna.fonts.url);
      items.push(`<button type="button" class="seed-tile" data-seed="${sd}"><div class="dna-sw">${swatches(dna.palette)}</div><b style="font-family:${dna.fonts.fd}">${sd}</b><span>${esc(dna.title)}</span><span>${dna.wildName} · ${esc(dna.cardText.split(' (')[0])} · ${esc(dna.heroText.split(':')[0].split(' (')[0].slice(0, 28))}</span></button>`);
    }
    $('#seedGrid').innerHTML = items.join('');
  }
  /* ---------- personalizar: variante, tipografías y colores ---------- */
  const COLOR_KEYS = [['bg', 'Fondo'], ['text', 'Texto'], ['primary', 'Primario'], ['accent', 'Acento'], ['accent2', 'Acento 2']];
  const cat = LF.seed.catalog();
  $('#twistSel').innerHTML = '<option value="">Que decida la semilla</option><option value="none">Ninguna (estilo puro)</option>' + LF.seed.TWISTS.map(t => `<option value="${t.id}">${esc(t.name)} · ${esc(t.traits)}</option>`).join('');
  $('#fontD').innerHTML = '<option value="">Automática (la semilla)</option>' + LF.seed.LIB.displays.map(d => `<option value="${esc(d[0])}">${esc(d[0])}</option>`).join('');
  $('#fontB').innerHTML = '<option value="">Automática (la semilla)</option>' + LF.seed.LIB.bodies.map(d => `<option value="${esc(d[0])}">${esc(d[0])}</option>`).join('');
  $('#colorEdit').innerHTML = COLOR_KEYS.map(([k, l]) => `<label class="color-pick"><input type="color" data-color="${k}" value="#888888" aria-label="${l}"><span>${l}</span></label>`).join('');
  $('#palTitle').textContent = `Paletas con nombre (${cat.paletasConNombre})`;
  $('#palGrid').innerHTML = LF.seed.NAMED.map((p, i) => `<button type="button" class="pal" data-pal="${i}" title="${esc(p[0])}"><span class="pal-sw">${p.slice(1).map(c => `<i style="background:${c}"></i>`).join('')}</span><small>${esc(p[0])}</small></button>`).join('');
  $('#catalogInfo').textContent = `Catálogo: ${cat.estilos} estilos (${cat.estilosBase} base × ${cat.variantes + 1} variantes) · ${cat.paletasConNombre} paletas con nombre + infinitas generadas · ${cat.tipografias.toLocaleString('es')} pares de tipografías · ${cat.heros} heros · ${cat.beneficios} sistemas de beneficios · ${cat.tarjetas} tarjetas · ${cat.patrones} fondos · ${cat.bordes} bordes · ${cat.titulares} titulares · ${cat.navegaciones} navegaciones · ${cat.botones} botones · ${cat.decoraciones} decoraciones.`;
  function ensureSeed() { if (!state.opts.seed.seed) setSeed(LF.seed.randomSeed()); }
  function syncColorInputs(p) { $$('#colorEdit input').forEach(i => { i.value = p[i.dataset.color]; }); }
  $('#twistSel').addEventListener('change', e => { ensureSeed(); state.opts.seed.twist = e.target.value; state.opts.seed.colors = null; renderSeedPanel(); renderSeedGrid(); });
  function onFonts() { ensureSeed(); const d = $('#fontD').value, b = $('#fontB').value; state.opts.seed.fonts = (d || b) ? { display: d, body: b } : null; renderSeedPanel(); }
  $('#fontD').addEventListener('change', onFonts); $('#fontB').addEventListener('change', onFonts);
  $('#colorEdit').addEventListener('input', e => {
    const k = e.target.dataset.color; if (!k) return;
    ensureSeed();
    const cur = state.opts.seed.colors || {};
    if (!state.opts.seed.colors) { const dna = LF.seed.generate(state.opts.seed.seed, seedOpts()); COLOR_KEYS.forEach(([kk]) => { cur[kk] = dna.palette[kk]; }); }
    cur[k] = e.target.value; state.opts.seed.colors = cur;
    const dna = LF.seed.generate(state.opts.seed.seed, seedOpts());
    renderSeedPanelKeepPickers(dna);
  });
  function renderSeedPanelKeepPickers(dna) {   // al mover un selector de color no se redibujan los selectores (así no se pierde el foco)
    const keep = $$('#colorEdit input').map(i => i.value);
    renderSeedPanel();
    $$('#colorEdit input').forEach((i, n) => { i.value = keep[n]; });
  }
  $('#palGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-pal]'); if (!b) return;
    ensureSeed();
    const p = LF.seed.NAMED[+b.dataset.pal];
    state.opts.seed.colors = { bg: p[1], text: p[2], primary: p[3], accent: p[4], accent2: p[5] };
    renderSeedPanel(); toast('Paleta «' + p[0] + '» aplicada');
  });
  $('#colorInvert').addEventListener('click', () => {
    ensureSeed();
    const dna = LF.seed.generate(state.opts.seed.seed, seedOpts());
    state.opts.seed.colors = LF.seed.invertColors(dna.palette);
    renderSeedPanel(); toast(dna.dark ? 'Versión clara' : 'Versión oscura');
  });
  $('#colorReset').addEventListener('click', () => { state.opts.seed.colors = null; renderSeedPanel(); toast('Colores de la semilla'); });

  $('#seedInput').addEventListener('change', e => setSeed(e.target.value));
  $('#seedInput').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); setSeed(e.target.value); } });
  $('#wildSeg').addEventListener('change', e => { state.opts.seed.wild = e.target.value; renderSeedPanel(); renderSeedGrid(); if (state.opts.seed.seed) toast('Locura: ' + (e.target.value === '' ? 'la decide la semilla' : LF.seed.WILD[+e.target.value])); });
  $('#seedDice').addEventListener('click', () => setSeed(LF.seed.randomSeed()));
  $('#seedClear').addEventListener('click', () => { state.opts.seed.seed = ''; renderSeedPanel(); toast('Modo manual: elige los estilos en la técnica 1'); });
  $('#seedGrid').addEventListener('click', e => { const t = e.target.closest('[data-seed]'); if (t) setSeed(t.dataset.seed); });
  $('#seedMore').addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); renderSeedGrid(); });
  renderSeedGrid();

  $('#techGroups').addEventListener('click', e => {
    const card = e.target.closest('.tcard'); if (!card) return;
    const id = card.dataset.t;
    if (e.target.closest('.tsel') || (e.target.closest('.tcard-top') && !e.target.closest('input'))) {
      if (e.target.matches('.tsel input')) { e.target.checked ? state.selected.add(id) : state.selected.delete(id); }
      else if (!e.target.closest('.tsel')) { state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id); }
      updateSelection(); return;
    }
    const chip = e.target.closest('.chip');
    if (chip) {
      const box = chip.parentElement, key = box.dataset.chips, max = +box.dataset.max;
      let arr = state.opts[id][key];
      const v = chip.dataset.v;
      if (arr.includes(v)) arr = arr.filter(x => x !== v);
      else { arr = arr.concat(v); if (arr.length > max) arr = arr.slice(arr.length - max); }
      state.opts[id][key] = arr;
      if (id === 'seed' && key === 'seeds' && state.opts.seed.seed) { state.opts.seed.seed = ''; renderSeedPanel(); toast('Semilla desactivada: ahora eliges los estilos a mano'); }
      $$('.chip', box).forEach(c => { const on = arr.includes(c.dataset.v); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
      if (!state.selected.has(id)) { state.selected.add(id); updateSelection(); }
      return;
    }
    if (e.target.closest('[data-random-seed]')) { setSeed(LF.seed.randomSeed()); return; }
    if (e.target.closest('[data-why]')) { const th = $('.theory', card); th.hidden = !th.hidden; return; }
    if (e.target.closest('[data-gen]')) { if (!needTema()) return; produce([P.single(id, state.brief, state.opts[id])]); }
  });
  $('#techGroups').addEventListener('input', e => {
    const card = e.target.closest('.tcard'); if (!card || !e.target.dataset.o) return;
    const id = card.dataset.t, key = e.target.dataset.o;
    let v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (e.target.type === 'range') { v = +v; e.target.nextElementSibling.textContent = v + (key === 'pct' ? '%' : ''); }
    state.opts[id][key] = v;
  });
  $('#presets').addEventListener('click', e => {
    const b = e.target.closest('[data-preset]'); if (!b) return;
    const p = D.presets.find(x => x.id === b.dataset.preset);
    state.selected = new Set(p.ids); updateSelection();
    toast(`Combinación «${p.name}» seleccionada`);
  });
  $('#clearSel').addEventListener('click', () => { state.selected.clear(); updateSelection(); });
  function refreshAiSwitch() {
    const ok = aiReady();
    $('#aiPromptWrap').hidden = !ok;
    $('#aiPrompt').checked = ok && state.settings.aiPrompt !== false;
  }
  $('#aiPrompt').addEventListener('change', e => { state.settings.aiPrompt = e.target.checked; S.setSettings(state.settings); });
  const useAiPrompt = () => aiReady() && $('#aiPrompt').checked;

  function needTema() {
    if (state.brief.tema.trim()) return true;
    toast('Primero escribe el tema de la landing en el paso 1.', true);
    go('brief'); setTimeout(() => $('#f_tema') && $('#f_tema').focus(), 50);
    return false;
  }
  $('#genSingles').addEventListener('click', () => {
    if (!needTema()) return;
    const ids = D.techniques.map(t => t.id).filter(i => state.selected.has(i));
    if (useAiPrompt()) return produce(ids.map(id => P.single(id, state.brief, state.opts[id])));
    ids.slice().reverse().forEach(id => addResult(P.single(id, state.brief, state.opts[id]), true));
    toast(`${ids.length} prompt(s) generado(s), uno por técnica`);
  });
  $('#genCombined').addEventListener('click', () => {
    if (!needTema()) return;
    if (state.selected.size < 2) return toast('Selecciona al menos 2 técnicas para combinarlas.', true);
    produce([P.combined(Array.from(state.selected), state.brief, state.opts)]);
  });

  /* ---------- prompts redactados por la IA ---------- */
  const WRITER_SYSTEM = [
    'Eres un experto en prompt engineering para diseñar landing pages con IA, formado en el tratado «8 técnicas avanzadas de diseño de landing pages con IA».',
    'Tu tarea: escribir UN prompt final, en español, que otra IA usará para construir la landing page completa en un único archivo HTML.',
    'Recibirás el brief del proyecto, las técnicas elegidas (con su fundamento) y un borrador hecho con plantillas.',
    'Reglas:',
    '- Mejora el borrador: hazlo específico para este negocio y su público, con decisiones concretas (paleta con códigos HEX, tipografías, estructura de secciones con su titular y copy principal, micro-copy de los botones) en lugar de instrucciones genéricas.',
    '- Conserva TODOS los encabezados en markdown del borrador (# ROL, # OBJETIVO, # CONTEXTO DEL PROYECTO, # ADN DE DISEÑO, # SECTOR Y VOCABULARIO VISUAL, # ARQUITECTURA DE LA PÁGINA, # ILUSTRACIONES DE ESTA LANDING, # PROTOCOLO DE ACTIVOS, # RESTRICCIONES, # ENTREGABLE, # CHECKLIST, etc.), el ADN de la semilla con sus valores exactos (HEX, tipografías, layouts) y los marcadores <span data-lf-shape> / <img data-lf-image> del protocolo, las líneas del contexto con el formato «- Campo: valor» y las etiquetas de técnica tal cual ([T1], [T2]…): la app las usa para reconocer el prompt.',
    '- Aplica fielmente cada técnica elegida según el tratado y no añadas técnicas que no se eligieron.',
    '- No inventes datos, cifras, premios ni testimonios que no estén en el brief: usa [dato por confirmar].',
    '- Respeta el sector del borrador: si vende productos físicos (ropa, belleza, hogar) la página muestra productos reales y NUNCA dashboards, KPIs ni mockups de software; solo el sector software lleva maquetas de interfaz. Prohíbe círculos o cuadros abstractos vacíos.',
    '- Las imágenes se dibujan en código (SVG y CSS): no pidas fotos ni imágenes externas. Si hay un prompt de vídeo, escríbelo en inglés dentro de un bloque ```text.',
    '- Responde solo con el prompt final, sin introducción, sin explicación y sin envolverlo en un bloque de código.'
  ].join('\n');

  function writerMessage(p) {
    const techs = p.techniques.map(id => { const t = D.tech(id); return `- [T${t.num}] ${t.name}: ${t.tagline} ${t.theory}`; }).join('\n');
    return `Técnicas elegidas (${p.kind === 'combined' ? 'prompt combinado: intégralas en un solo prompt, ordenadas por fases Descubrir → Definir → Entregar' : 'prompt de una sola técnica'}):\n${techs}\n\n`
      + `Borrador generado por plantilla (contiene el brief completo; mejóralo siguiendo las reglas):\n<<<\n${p.text}\n>>>`;
  }

  // Genera los prompts: con plantilla al instante o, si «Redactar con IA» está activo, escritos por la IA uno tras otro
  async function produce(list) {
    if (!useAiPrompt()) { list.forEach(p => addResult(p)); return; }
    if (state.writing) return toast('La IA todavía está redactando el prompt anterior.', true);
    state.writing = true;
    ['genSingles', 'genCombined'].forEach(id => { $('#' + id).disabled = true; });
    let ok = 0;
    for (const p of list) { if (await writeWithAI(p)) ok++; }
    state.writing = false;
    updateSelection();
    if (list.length > 1) toast(`${ok} de ${list.length} prompt(s) redactados por la IA`);
  }

  async function writeWithAI(p) {
    const draft = p.text, t0 = Date.now();
    p.ai = true; p.writing = true; p.text = '';
    addResult(p, true);
    const card = () => $(`.pcard[data-pid="${p.id}"]`);
    const stat = msg => { const c = card(); if (c) $('.stat', c).textContent = msg; };
    let acc = '', last = 0;
    stat('✨ Conectando con la IA…');
    try {
      await A.run(aiCfg(), writerMessage(Object.assign({}, p, { text: draft })), chunk => {
        acc += chunk;
        const now = Date.now();
        if (now - last > 250) {
          last = now;
          const c = card(); if (!c) return;
          const ta = $('textarea', c); ta.value = acc; ta.scrollTop = ta.scrollHeight;
          stat(`✨ La IA está redactando… ${acc.length.toLocaleString('es')} car. · ${Math.round((now - t0) / 1000)} s`);
        }
      }, null, msg => stat('✨ ' + msg), { system: WRITER_SYSTEM, effort: 'low', extra: { reasoning_effort: 'low' } });
      const text = acc.trim().replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/i, '$1').trim();
      if (text.length < 200) throw new Error('la respuesta de la IA vino vacía o incompleta');
      p.text = text; p.writing = false;
      S.updateHistory(p.id, { text: p.text, ai: true });
      renderResults(); renderHistory();
      toast('Prompt redactado por la IA');
      return true;
    } catch (err) {
      p.text = draft; p.writing = false; p.ai = false;
      S.updateHistory(p.id, { text: p.text, ai: false });
      renderResults(); renderHistory();
      toast('La IA no pudo redactar el prompt, se dejó el de plantilla: ' + (err.message || err), true);
      return false;
    }
  }

  /* ---------- tarjetas de prompts ---------- */
  function addResult(p, quiet) {
    p.score = P.score(p.brief, p.techniques).value;
    S.addHistory(p);
    state.results.unshift(p);
    renderResults();
    renderHistory();
    if (!quiet) toast('Prompt generado');
    if (window.innerWidth < 1180) $('.out-panel').scrollIntoView({ behavior: 'smooth' });
  }
  function promptCard(p) {
    const words = p.text.split(/\s+/).length;
    return `<article class="pcard${p.writing ? ' writing' : ''}" data-pid="${p.id}">
      <div class="pcard-head"><div><h4>${esc(p.title)}${p.ai ? '<span class="ai-badge">✨ IA</span>' : ''}</h4><div class="sub">${p.kind === 'combined' ? 'Prompt combinado' : 'Prompt individual'} · ${esc(p.brief.marca || p.brief.tema)}</div></div>
        <div class="score" style="--v:${p.score}" title="Fuerza estimada del prompt"><span>${p.score}</span></div></div>
      <textarea spellcheck="false" aria-label="Texto del prompt" ${p.writing ? 'readonly' : ''}>${esc(p.text)}</textarea>
      <div class="pcard-foot">
        <button class="btn primary sm" data-act="run" ${p.writing ? 'disabled' : ''}>▶ Ejecutar</button>
        <button class="btn sm" data-act="copy">Copiar</button>
        <button class="btn ghost sm" data-act="md">.md</button>
        <button class="btn ghost sm" data-act="close" title="Quitar de la lista">✕</button>
        <span class="stat">${words} palabras · ${p.text.length} car.</span>
      </div></article>`;
  }
  function renderResults() {
    $('#outEmpty').hidden = state.results.length > 0;
    $('#outList').innerHTML = state.results.map(promptCard).join('');
    showOutTab('result');
  }
  $('#outList').addEventListener('input', e => {
    if (e.target.tagName !== 'TEXTAREA') return;
    const card = e.target.closest('.pcard');
    const p = state.results.find(x => x.id === card.dataset.pid);
    p.text = e.target.value; p.edited = true;
    S.updateHistory(p.id, { text: p.text, edited: true });
    $('.stat', card).textContent = `${p.text.split(/\s+/).length} palabras · ${p.text.length} car. · editado`;
  });
  $('#outList').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const card = b.closest('.pcard');
    const p = state.results.find(x => x.id === card.dataset.pid);
    if (b.dataset.act === 'copy') copy(p.text);
    if (b.dataset.act === 'md') download(`prompt-${slug(p.brief.marca || p.brief.tema)}-${slug(p.title)}.md`, `<!-- ${p.title} · generado con LandingForge IA -->\n\n${p.text}\n`, 'text/markdown;charset=utf-8');
    if (b.dataset.act === 'run') { loadIntoStudio(p); go('studio'); }
    if (b.dataset.act === 'close') { state.results = state.results.filter(x => x !== p); renderResults(); }
  });

  function showOutTab(which) {
    $$('[data-otab]').forEach(t => { const on = t.dataset.otab === which; t.classList.toggle('on', on); t.setAttribute('aria-selected', on); });
    $('#outResult').hidden = which !== 'result';
    $('#outHistory').hidden = which !== 'history';
  }
  $$('[data-otab]').forEach(t => t.addEventListener('click', () => { showOutTab(t.dataset.otab); if (t.dataset.otab === 'history') renderHistory(); }));

  function renderHistory() {
    const h = S.getHistory();
    $('#histCount').textContent = h.length;
    $('#outHistory').innerHTML = h.length
      ? `<div class="head-actions" style="justify-content:space-between;margin-bottom:8px"><span class="muted tiny">Últimos ${h.length} prompts generados en este navegador</span><button class="btn ghost sm" data-hclear>Borrar historial</button></div>` +
        h.map(p => `<div class="hitem" data-hid="${p.id}"><div><strong>${esc(p.title)}</strong><small>${esc(p.brief.marca || p.brief.tema)} · ${fmtDate(p.createdAt)}${p.edited ? ' · editado' : ''}</small></div>
          <button class="btn ghost sm" data-h="show">Ver</button><button class="btn sm" data-h="run">▶</button><button class="btn ghost sm" data-h="del" aria-label="Eliminar">✕</button></div>`).join('')
      : '<div class="empty"><p>El historial está vacío.</p></div>';
  }
  $('#outHistory').addEventListener('click', e => {
    if (e.target.closest('[data-hclear]')) { if (confirm('¿Borrar todo el historial de prompts?')) { S.clearHistory(); renderHistory(); } return; }
    const b = e.target.closest('[data-h]'); if (!b) return;
    const id = b.closest('.hitem').dataset.hid;
    const p = S.getHistory().find(x => x.id === id); if (!p) return;
    if (b.dataset.h === 'del') { S.removeHistory(id); renderHistory(); return; }
    if (b.dataset.h === 'run') { loadIntoStudio(p); go('studio'); return; }
    if (!state.results.find(x => x.id === id)) state.results.unshift(p);
    renderResults();
  });

  /* ======================= 3 · ESTUDIO ======================= */
  function refreshStudioPick() {
    const h = S.getHistory();
    const cur = state.current && state.current.id;
    $('#studioPick').innerHTML = '<option value="">— Escribe o pega un prompt —</option>' + h.map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(p.title)} · ${esc(p.brief.marca || p.brief.tema)} (${fmtDate(p.createdAt)})</option>`).join('');
  }
  function loadIntoStudio(p) {
    state.current = { id: p.id, text: p.text, spec: { brief: p.brief, techniques: p.techniques, opts: p.opts, text: p.text }, edited: false };
    $('#studioPrompt').value = p.text;
    $('#studioPromptInfo').textContent = `${p.title} · técnicas: ${p.techniques.map(techLabel).join(', ')}`;
    refreshStudioPick();
  }
  $('#studioPick').addEventListener('change', e => {
    const p = S.getHistory().find(x => x.id === e.target.value);
    if (p) loadIntoStudio(p); else { state.current = null; $('#studioPrompt').value = ''; $('#studioPromptInfo').textContent = ''; }
  });
  $('#studioPrompt').addEventListener('input', () => {
    if (state.current) state.current.edited = true;
    const parsed = P.parse($('#studioPrompt').value);
    $('#studioPromptInfo').textContent = parsed.techniques.length ? `Técnicas detectadas: ${parsed.techniques.map(techLabel).join(', ')}` : 'Prompt libre: el motor local usará un diseño base; la IA real lo interpretará completo.';
  });

  /* configuración de IA */
  function renderAiConfig() {
    const s = state.settings;
    $('#aiModel').innerHTML = A.CLAUDE_MODELS.map(m => `<option value="${m.id}" ${s.model === m.id ? 'selected' : ''}>${esc(m.label)}</option>`).join('');
    $('#aiEffort').value = s.effort;
    $('#aiProvider').value = s.provider;
    $('#compatPreset').innerHTML = Object.keys(A.COMPAT_PRESETS).map(k => `<option value="${k}" ${s.compat === k ? 'selected' : ''}>${esc(A.COMPAT_PRESETS[k].label)}</option>`).join('');
    $('#compatBase').value = s.base;
    $('#compatModel').value = s.compatModel;
    $('#aiKey').value = S.getKey();
    $('#aiRemember').checked = !!s.remember;
    toggleAiFields(s.provider);
  }
  function toggleAiFields(provider) {
    if ($('#aiPromptWrap')) setTimeout(refreshAiSwitch);
    $('#cfgClaude').hidden = provider !== 'claude';
    $('#cfgCompat').hidden = provider !== 'compat';
    $('#cfgServer').hidden = provider !== 'server';
    $('#cfgKey').hidden = provider === 'server';
  }
  function saveAi() {
    const s = state.settings;
    s.provider = $('#aiProvider').value; s.model = $('#aiModel').value; s.effort = $('#aiEffort').value;
    s.compat = $('#compatPreset').value; s.base = $('#compatBase').value.trim(); s.compatModel = $('#compatModel').value.trim();
    s.remember = $('#aiRemember').checked;
    S.setSettings(s); S.setKey($('#aiKey').value.trim(), s.remember);
    toggleAiFields(s.provider);
  }
  /* Si la app se abre con server.py y hay clave en .env, la IA real queda lista sin pegar nada */
  async function detectServer() {
    let cfg = null;
    try { const r = await fetch('api/config', { cache: 'no-store' }); if (r.ok) cfg = await r.json(); } catch (e) { /* abierta con doble clic: sin servidor */ }
    if (!cfg || !cfg.ready) { $('#aiProvider option[value=server]').remove(); if (state.settings.provider === 'server') { state.settings.provider = 'claude'; renderAiConfig(); } return; }
    state.server = cfg;
    $('#aiProvider option[value=server]').disabled = false;
    $('#cfgServer').textContent = `Se usa la clave guardada en el archivo .env del servidor · modelo ${cfg.model}. No hace falta pegar nada.`;
    state.settings.provider = 'server'; S.setSettings(state.settings);
    renderAiConfig();
  }
  $('#aiConfig').addEventListener('change', e => {
    if (e.target.id === 'compatPreset') { const pr = A.COMPAT_PRESETS[e.target.value]; if (pr.base) $('#compatBase').value = pr.base; if (pr.model) $('#compatModel').value = pr.model; }
    saveAi();
  });
  $('#aiConfig').addEventListener('input', saveAi);

  /* vista del escenario */
  function stageTab(which) {
    $$('[data-stab]').forEach(b => b.classList.toggle('on', b.dataset.stab === which));
    const has = !!state.build;
    $('#liveView').hidden = which !== 'live';
    $('#stageEmpty').hidden = has || which === 'live';
    $('#frameWrap').hidden = !has || which !== 'preview';
    $('#codeView').hidden = !has || which !== 'code';
    $('#reportView').hidden = !has || which !== 'report';
  }
  $$('[data-stab]').forEach(b => b.addEventListener('click', () => stageTab(b.dataset.stab)));
  $$('[data-dev]').forEach(b => b.addEventListener('click', () => {
    $$('[data-dev]').forEach(x => x.classList.toggle('on', x === b));
    $('#frameWrap').dataset.dev = b.dataset.dev;
  }));

  function status(msg, kind) { const el = $('#runStatus'); el.textContent = msg; el.className = 'status' + (kind ? ' ' + kind : ''); }
  function setBuild(b) {
    state.build = b;
    $('#frame').srcdoc = b.html;
    $('#codeView').textContent = b.html;
    renderReport(b.report || []);
    ['openTab', 'dlHtml', 'saveBank'].forEach(id => { $('#' + id).disabled = false; });
    stageTab($('[data-stab].on').dataset.stab);
    if (window.innerWidth < 1180) $('.studio-right').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderReport(rep) {
    $('#reportCount').textContent = rep.length;
    const ico = { ok: '✓', warn: '!', info: 'i' };
    $('#reportView').innerHTML = rep.length ? rep.map(r => `<div class="rep ${r.kind || 'info'}"><i>${ico[r.kind] || 'i'}</i><div><b>${esc(r.agent)}</b><p>${esc(r.msg)}</p>${r.pre ? `<pre>${esc(r.pre)}</pre>` : ''}</div></div>`).join('') : '<div class="empty"><p>Sin informe para esta construcción.</p></div>';
  }

  function specFromStudio() {
    const text = $('#studioPrompt').value;
    const cur = state.current;
    if (cur && !cur.edited) return Object.assign({}, cur.spec, { text });
    const parsed = P.parse(text);
    const base = cur ? cur.spec : { brief: {}, techniques: [], opts: {} };
    const brief = Object.assign({}, D.emptyBrief, base.brief);
    Object.keys(parsed.brief).forEach(k => { const v = parsed.brief[k]; if (v !== '' && v !== D.emptyBrief[k]) brief[k] = v; });
    if (!base.brief.tema && parsed.brief.tema) brief.tema = parsed.brief.tema;
    return { brief, techniques: parsed.techniques.length ? parsed.techniques : base.techniques, opts: base.opts || {}, text };
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* Configuración de la IA elegida (servidor con .env, Claude o proveedor compatible) */
  function aiCfg() {
    const s = state.settings;
    if (s.provider === 'server' && state.server) return { provider: 'compat', key: '', base: 'api', model: state.server.model };
    if (s.provider === 'claude') return { provider: 'claude', key: S.getKey(), model: s.model, effort: s.effort };
    return { provider: 'compat', key: S.getKey(), base: s.base, model: s.compatModel };
  }
  function aiReady() {
    const c = aiCfg();
    return c.provider === 'claude' ? !!c.key : !!(c.base && c.model);
  }

  /* ======================= construcción en vivo ======================= */
  /* Muestra, mientras la IA escribe: los pasos detectados en el código, la página a medio construir
     (con doble iframe para que no parpadee) y el código apareciendo en tiempo real. */
  const live = (function () {
    const codeEl = $('#liveCode'), stepsEl = $('#liveSteps'), stateEl = $('#liveState'), tab = $('#liveTab');
    const frames = $$('.live-preview iframe');
    const RULES = [
      { key: 'notes', re: /<!--/, label: 'Notas de diseño' },
      { key: 'head', re: /<head[\s>]/i, label: 'Cabecera del documento' },
      { key: 'fonts', re: /fonts\.googleapis\.com/i, label: 'Tipografías' },
      { key: 'css', re: /<style[\s>]/i, label: 'Estilos: colores, letras y retícula' },
      { key: 'body', re: /<body[\s>]/i, label: 'Empieza el contenido visible' },
      { key: 'header', re: /<(header|nav)[\s>]/i, label: 'Encabezado y menú' },
      { key: 'form', re: /<form[\s>]/i, label: 'Formulario' },
      { key: 'footer', re: /<footer[\s>]/i, label: 'Pie de página' },
      { key: 'js', re: /<script(?![^>]*\bsrc=)[\s>]/i, afterBody: true, label: 'Interactividad (JavaScript)' },
      { key: 'end', re: /<\/html>/i, label: 'Documento cerrado' }
    ];
    let acc = '', model = '', t0 = 0, firstAt = 0, seen = new Map(), steps = [], timer = null, queued = false;
    let lastPreview = 0, shownSteps = 0, finished = null, note = '';
    const WAITING = '<!DOCTYPE html><html><body style="margin:0;height:100vh;display:grid;place-items:center;background:#f4f2ed;color:#77736b;font:500 28px system-ui,sans-serif;text-align:center">'
      + '<div><div style="font-size:64px">⏳</div>La página aparecerá aquí<br>en cuanto la IA empiece a escribirla.</div></body></html>';
    const secs = () => Math.round((Date.now() - t0) / 1000);
    const plain = h => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const cut = (t, n) => t.length > n ? t.slice(0, n - 1) + '…' : t;

    function detect() {
      const found = [];
      const bodyAt = acc.search(/<body[\s>]/i);
      RULES.forEach(r => {
        const from = r.afterBody ? bodyAt : 0;
        if (from < 0) return;
        const i = acc.slice(from).search(r.re);
        if (i >= 0) found.push({ key: r.key, idx: from + i, label: r.label });
      });
      const re = /<section\b([^>]*)>/gi; let m, n = 0;
      while ((m = re.exec(acc))) {
        n++;
        const attrs = m[1];
        const name = (attrs.match(/\b(?:id|aria-label)\s*=\s*["']([^"']+)/i) || attrs.match(/\bclass\s*=\s*["']([^"'\s]+)/i) || [])[1];
        const h = acc.slice(m.index, m.index + 4000).match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
        const title = h ? plain(h[1]) : '';
        found.push({ key: 'sec' + n, idx: m.index, label: `Sección ${n}${name ? ' «' + cut(name, 22) + '»' : ''}${title ? ': “' + cut(title, 42) + '”' : ''}` });
      }
      found.sort((x, y) => x.idx - y.idx);
      found.forEach(f => { if (!seen.has(f.key)) seen.set(f.key, secs()); f.t = seen.get(f.key); });
      steps = found;
    }

    function renderState() {
      if (finished) stateEl.textContent = finished;
      else if (!firstAt) stateEl.textContent = `⏳ ${note || 'Conectando con ' + model + '…'} · ${secs()} s`;
      else stateEl.textContent = `✍️ Escribiendo la página · ${acc.length.toLocaleString('es')} caracteres · ${secs()} s`;
    }

    // Actualiza la lista sin redibujarla entera (así los pasos ya mostrados no parpadean)
    function renderSteps() {
      const items = stepsEl.children;
      steps.forEach((st, i) => {
        let li = items[i];
        if (!li) { li = document.createElement('li'); li.append(document.createElement('span'), ' ', document.createElement('time')); stepsEl.appendChild(li); }
        if (li.firstChild.textContent !== st.label) li.firstChild.textContent = st.label;
        li.lastChild.textContent = st.t + ' s';
        li.classList.toggle('now', !finished && i === steps.length - 1);
      });
      while (items.length > steps.length) stepsEl.lastChild.remove();
      stepsEl.scrollTop = stepsEl.scrollHeight;
    }

    // Dibuja la página al ancho real del dispositivo elegido y la escala para que quepa entera a lo ancho
    const DEVICE_W = { desktop: 1280, tablet: 800, mobile: 390 };
    function fit() {
      const box = frames[0].parentElement;
      const w = DEVICE_W[$('#frameWrap').dataset.dev || 'desktop'] || 1280;
      const k = Math.min(1, box.clientWidth / w);
      frames.forEach(f => { f.style.width = w + 'px'; f.style.height = Math.round(box.clientHeight / k) + 'px'; f.style.transform = `translateX(-50%) scale(${k})`; });
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(frames[0].parentElement);
    $$('[data-dev]').forEach(b => b.addEventListener('click', () => setTimeout(fit)));

    // Carga la versión nueva en el iframe oculto y lo muestra cuando termina de cargar: sin parpadeo
    function preview(html, scrollDown) {
      const back = frames.find(f => !f.classList.contains('on'));
      const script = '<script>addEventListener("load",function(){scrollTo(0,document.documentElement.scrollHeight)})<\/script>';
      back.onload = () => { frames.forEach(f => f.classList.toggle('on', f === back)); back.onload = null; };
      back.srcdoc = scrollDown ? (/<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + script) : script + html) : html;
      lastPreview = Date.now();
    }

    function tick() {
      queued = false;
      detect();
      renderState();
      const newStep = steps.length !== shownSteps;
      if (newStep) { renderSteps(); shownSteps = steps.length; }
      const due = Date.now() - lastPreview > (newStep ? 1200 : 2500);
      if (/<body[\s>]/i.test(acc) && due) preview(LF.assets.resolveShapes(A.extractHtml(acc)), true);
    }

    return {
      start(modelName) {
        acc = ''; model = modelName; t0 = Date.now(); firstAt = 0; seen = new Map(); steps = []; shownSteps = 0; lastPreview = 0; finished = null; note = '';
        codeEl.textContent = ''; codeEl.classList.add('typing'); stepsEl.innerHTML = '';
        frames.forEach(f => { f.onload = null; f.srcdoc = WAITING; });
        tab.hidden = false; tab.classList.add('busy');
        clearInterval(timer); timer = setInterval(renderState, 1000);
        renderState();
        stageTab('live');
        fit();
      },
      status(msg, realModel) { note = msg; if (realModel) model = realModel; renderState(); },
      push(chunk) {
        if (!firstAt) firstAt = Date.now();
        acc += chunk;
        const nearBottom = codeEl.scrollHeight - codeEl.scrollTop - codeEl.clientHeight < 80;
        codeEl.appendChild(document.createTextNode(chunk));
        if (nearBottom) codeEl.scrollTop = codeEl.scrollHeight;
        if (!queued) { queued = true; setTimeout(tick, 250); }
      },
      finish(ok, msg, html) {
        clearInterval(timer); tab.classList.remove('busy'); codeEl.classList.remove('typing');
        detect();
        finished = ok ? `✓ Página terminada en ${secs()} s · ${steps.length} pasos · mírala completa en «Vista»` : `✕ ${msg}`;
        renderState(); renderSteps();
        if (html) preview(html, false);
      }
    };
  })();
  async function run() {
    const text = $('#studioPrompt').value.trim();
    if (!text) { toast('No hay prompt que ejecutar. Genera uno en el paso 2 o pega el tuyo.', true); return; }
    const spec = specFromStudio();
    $('#runBtn').disabled = true;

    saveAi();
    const cfg = aiCfg();
    const modelName = cfg.model || 'el proveedor';
    const ctrl = new AbortController(); state.abort = ctrl;
    $('#stopBtn').hidden = false;
    let acc = '', last = 0, t0 = Date.now();
    state.build = null;
    ['openTab', 'dlHtml', 'saveBank'].forEach(id => { $('#' + id).disabled = true; });
    live.start(modelName);
    status('Conectando con ' + modelName + '…');
    try {
      // Los modelos gratuitos a veces cortan la respuesta a mitad: si no llegó </html>, se reintenta (hasta 3 veces)
      let res, attemptN = 0;
      while (true) {
        attemptN++;
        acc = '';
        if (attemptN > 1) live.start(modelName);
        res = await A.run(cfg, text, chunk => {
          acc += chunk;
          live.push(chunk);
          const now = Date.now();
          if (now - last > 900) {
            last = now;
            status(`Construyendo… ${acc.length.toLocaleString('es')} caracteres · ${Math.round((now - t0) / 1000)} s${attemptN > 1 ? ' · intento ' + attemptN : ''}`);
          }
        }, ctrl.signal, (msg, realModel) => { live.status(msg, realModel); status(msg); }, { onRestart: () => { acc = ''; live.start(modelName); } });
        if (/<\/html>/i.test(acc) || attemptN >= 3) break;
        status(`La IA se cortó a los ${acc.length.toLocaleString('es')} caracteres. Reintentando (${attemptN + 1}/3)…`);
      }
      let html = LF.assets.resolveShapes(A.extractHtml(acc));
      // Si la respuesta no llegó hasta </html>, la IA dejó de escribir a medias: se muestra lo que hay, pero se avisa
      const complete = /<\/html>/i.test(acc);
      const cutMsg = `La IA dejó de escribir antes de terminar (${acc.length.toLocaleString('es')} caracteres). Vuelve a intentarlo.`;
      live.finish(complete, cutMsg, html);
      const comments = (html.match(/<!--([\s\S]*?)-->/g) || []).map(c => c.slice(4, -3).trim()).filter(c => c.length > 20);
      const report = [{ agent: 'IA real', msg: `Modelo ${res.usage.model || cfg.model} · ${res.usage.output_tokens ? res.usage.output_tokens.toLocaleString('es') + ' tokens de salida · ' : ''}${Math.round((Date.now() - t0) / 1000)} s · fin: ${res.stop || 'sin señal'}`, kind: complete ? 'ok' : 'warn' }];
      if (!complete) report.push({ agent: 'Aviso', msg: cutMsg, kind: 'warn' });
      if (res.stop === 'max_tokens' || res.stop === 'length') report.push({ agent: 'Aviso', msg: 'La respuesta alcanzó el límite de longitud; el HTML puede estar incompleto.', kind: 'warn' });
      comments.forEach((c, i) => report.push({ agent: `Anotación del modelo ${i + 1}`, msg: 'Comentario incluido en el código:', kind: 'info', pre: c.slice(0, 3000) }));
      setBuild({ html, report, engine: res.usage.model || cfg.model || 'IA', promptText: text, spec });
      if (complete) status('Landing construida con IA real', 'ok');
      else { status(cutMsg, 'err'); toast(cutMsg, true); }
    } catch (err) {
      live.finish(false, err.name === 'AbortError' ? 'Generación detenida por ti.' : 'Se detuvo: ' + (err.message || err));
      if (err.name === 'AbortError') { status('Generación detenida.'); if (acc) setBuild({ html: A.extractHtml(acc), report: [{ agent: 'Aviso', msg: 'Generación detenida antes de terminar.', kind: 'warn' }], engine: 'IA (parcial)', promptText: text, spec }); }
      else {
        let msg = err.message || String(err);
        if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) msg = 'No se pudo conectar con el proveedor (sin internet, URL incorrecta o CORS). Prueba el motor local.';
        status('Error: ' + msg, 'err');
        toast(msg, true);
      }
    } finally {
      $('#runBtn').disabled = false; $('#stopBtn').hidden = true; state.abort = null;
    }
  }
  $('#runBtn').addEventListener('click', run);
  $('#stopBtn').addEventListener('click', () => state.abort && state.abort.abort());
  $('#openTab').addEventListener('click', () => state.build && openInTab(state.build.html));
  $('#dlHtml').addEventListener('click', () => state.build && download(slug(state.build.spec.brief.marca || state.build.spec.brief.tema) + '.html', state.build.html, 'text/html;charset=utf-8'));

  /* guardar en el banco */
  let saveRating = 4;
  function paintStars(box, n) { $$('button', box).forEach(b => { const on = +b.dataset.star <= n; b.classList.toggle('on', on); b.setAttribute('aria-checked', +b.dataset.star === n); }); }
  $('#saveBank').addEventListener('click', () => {
    if (!state.build) return;
    const b = state.build.spec.brief;
    $('#saveName').value = `${b.marca || b.tema || 'Landing'} · ${state.build.spec.techniques.length ? state.build.spec.techniques.map(i => 'T' + D.tech(i).num).join('+') : 'libre'}`;
    saveRating = 4;
    $('#saveStars').innerHTML = starsHtml(saveRating).replace(/^<div[^>]*>|<\/div>$/g, '');
    $('#saveFeat').checked = false;
    $('#saveModal').hidden = false;
    $('#saveName').focus(); $('#saveName').select();
  });
  $('#saveStars').addEventListener('click', e => { const s = e.target.closest('[data-star]'); if (s) { saveRating = +s.dataset.star; paintStars($('#saveStars'), saveRating); } });
  $('#saveForm').addEventListener('submit', e => {
    e.preventDefault();
    const b = state.build;
    const r = S.addBank({
      title: $('#saveName').value.trim() || 'Landing', html: b.html, prompt: b.promptText,
      techniques: b.spec.techniques || [], brief: { marca: b.spec.brief.marca, tema: b.spec.brief.tema, industria: b.spec.brief.industria },
      engine: b.engine, rating: saveRating, featured: $('#saveFeat').checked
    });
    $('#saveModal').hidden = true;
    toast(r.warn || 'Guardada en el banco de landings', !!r.warn);
  });
  $$('[data-close]').forEach(b => b.addEventListener('click', () => { b.closest('.modal').hidden = true; }));

  /* ======================= 4 · BANCO ======================= */
  /* Si la app corre con server.py, el banco vive en la carpeta bank/ del proyecto (y viaja con git).
     Las landings que solo estaban en este navegador se suben al servidor para no perderlas. */
  async function initBank() {
    let server = null;
    try { const r = await fetch('api/bank', { cache: 'no-store' }); if (r.ok) server = await r.json(); } catch (e) { /* sin servidor */ }
    try {
      if (Array.isArray(server)) {
        const onServer = new Set(server.map(x => x.id));
        const examples = new Set(server.map(x => x.exampleId).filter(Boolean));
        const upload = S.getBank().filter(x => !onServer.has(x.id) && !(x.exampleId && examples.has(x.exampleId)));
        S.useServerBank(server.concat(upload));
        upload.forEach(S.pushBank);
        if (!S.getBank().some(x => x.exampleId)) seedBank();
        else seedNewExamples();
        if (upload.length) toast(`${upload.length} landing(s) de este navegador guardadas en el banco del proyecto`);
      } else if (!S.isSeeded()) seedBank();
      else seedNewExamples();
    } catch (e) { console.error(e); }
    renderBank();
  }

  /* Ejemplos añadidos en versiones nuevas: se suman una sola vez al banco (los que borres no vuelven) */
  function seedNewExamples() {
    let seen;
    try { seen = JSON.parse(localStorage.getItem('lf.seenExamples') || 'null'); } catch (e) { seen = null; }
    const legacy = ['ex-quantum', 'ex-watch', 'ex-calm', 'ex-credit', 'ex-consult', 'ex-bio'];
    if (!Array.isArray(seen)) seen = legacy.slice();
    const fresh = D.examples.filter(ex => !seen.includes(ex.id));
    const have = new Set(S.getBank().map(x => x.exampleId).filter(Boolean));
    let added = 0;
    fresh.forEach(ex => {
      if (have.has(ex.id)) return;
      const opts = {};
      ex.techniques.forEach(t => { opts[t] = Object.assign(D.defaultOpts(t), (ex.opts || {})[t] || {}); });
      const brief = Object.assign({}, D.emptyBrief, ex.brief);
      const p = ex.techniques.length > 1 ? P.combined(ex.techniques, brief, opts) : P.single(ex.techniques[0], brief, opts[ex.techniques[0]]);
      const out = E.build({ brief, techniques: ex.techniques, opts });
      S.addBank({ exampleId: ex.id, title: `${ex.brief.marca} · ${ex.label}`, html: out.html, prompt: p.text, techniques: p.techniques, brief: { marca: brief.marca, tema: brief.tema, industria: brief.industria }, engine: 'Motor local', rating: ex.rating, featured: ex.rating >= 5, createdAt: Date.now() - (added + 1) * 3600e3 });
      added++;
    });
    try { localStorage.setItem('lf.seenExamples', JSON.stringify(D.examples.map(x => x.id))); } catch (e) { /* sin almacenamiento */ }
    if (added) toast(`${added} ejemplo(s) nuevo(s) añadidos al banco`);
  }

  function seedBank(force) {
    const bank = S.getBank();
    const have = new Set(bank.map(x => x.exampleId).filter(Boolean));
    let added = 0;
    D.examples.slice().reverse().forEach(ex => {
      if (have.has(ex.id)) return;
      const opts = {};
      ex.techniques.forEach(t => { opts[t] = Object.assign(D.defaultOpts(t), (ex.opts || {})[t] || {}); });
      const brief = Object.assign({}, D.emptyBrief, ex.brief);
      const p = ex.techniques.length > 1 ? P.combined(ex.techniques, brief, opts) : P.single(ex.techniques[0], brief, opts[ex.techniques[0]]);
      const out = E.build({ brief, techniques: ex.techniques, opts });
      S.addBank({ exampleId: ex.id, title: `${ex.brief.marca} · ${ex.label}`, html: out.html, prompt: p.text, techniques: p.techniques, brief: { marca: brief.marca, tema: brief.tema, industria: brief.industria }, engine: 'Motor local', rating: ex.rating, featured: ex.rating >= 5, createdAt: Date.now() - (added + 1) * 3600e3 });
      added++;
    });
    S.markSeeded();
    try { localStorage.setItem('lf.seenExamples', JSON.stringify(D.examples.map(x => x.id))); } catch (e) { /* sin almacenamiento */ }
    if (force) toast(added ? `${added} ejemplo(s) restaurado(s)` : 'Los ejemplos ya están en el banco');
  }

  let thumbIO = null;
  function renderBank() {
    const q = $('#bankSearch').value.trim().toLowerCase();
    const tf = $('#bankTech').value;
    const sort = $('#bankSort').value;
    const feat = $('#bankFeatured').checked;
    let items = S.getBank().filter(x =>
      (!q || [x.title, x.prompt, x.brief && x.brief.tema, x.brief && x.brief.marca].join(' ').toLowerCase().includes(q)) &&
      (!tf || (x.techniques || []).includes(tf)) && (!feat || x.featured));
    items.sort(sort === 'new' ? (a, b) => b.createdAt - a.createdAt : sort === 'az' ? (a, b) => a.title.localeCompare(b.title, 'es') : (a, b) => (b.featured - a.featured) || (b.rating - a.rating) || (b.createdAt - a.createdAt));
    $('#bankEmpty').hidden = items.length > 0;
    $('#bankGrid').innerHTML = items.map(x => `
      <article class="bcard" data-bid="${x.id}">
        <div class="bthumb" data-open title="Ver en grande">${x.featured ? '<span class="ribbon">★ Destacada</span>' : ''}<iframe tabindex="-1" aria-hidden="true" sandbox="allow-scripts" scrolling="no" loading="lazy"></iframe></div>
        <div class="binfo">
          <div><h3>${esc(x.title)}</h3><div class="sub">${esc((x.brief && x.brief.industria) || '')} · ${esc(x.engine || '')} · ${fmtDate(x.createdAt)}</div></div>
          ${starsHtml(x.rating || 0)}
          <div class="tchips">${(x.techniques || []).map(t => `<span class="tchip" title="${esc(techLabel(t))}">T${D.tech(t).num}</span>`).join('') || '<span class="tchip">Prompt libre</span>'}</div>
          <span class="bprompt-label">Prompt que la creó</span>
          <div class="bprompt">${esc(x.prompt)}</div>
          <div class="bactions"><button class="btn primary sm" data-open>Ver landing + prompt</button><button class="btn ghost sm" data-copy>Copiar prompt</button><button class="btn ghost sm" data-feat>${x.featured ? '★ Quitar destacada' : '☆ Destacar'}</button></div>
        </div>
      </article>`).join('');
    // Miniaturas en vivo, cargadas solo cuando se ven
    if (thumbIO) thumbIO.disconnect();
    const bank = S.getBank();
    thumbIO = 'IntersectionObserver' in window ? new IntersectionObserver(en => en.forEach(e => {
      if (!e.isIntersecting) return;
      const card = e.target.closest('.bcard'); const it = bank.find(x => x.id === card.dataset.bid);
      const fr = $('iframe', e.target); if (it && !fr.srcdoc) fr.srcdoc = it.html;
      thumbIO.unobserve(e.target);
    }), { rootMargin: '200px' }) : null;
    $$('.bthumb').forEach(t => { if (thumbIO) thumbIO.observe(t); else { const it = bank.find(x => x.id === t.closest('.bcard').dataset.bid); $('iframe', t).srcdoc = it.html; } });
    scaleThumbs();
  }
  function scaleThumbs() { $$('.bthumb').forEach(t => { $('iframe', t).style.transform = `scale(${t.clientWidth / 1280})`; }); }
  window.addEventListener('resize', scaleThumbs);

  $('#bankGrid').addEventListener('click', e => {
    const card = e.target.closest('.bcard'); if (!card) return;
    const id = card.dataset.bid;
    const it = S.getBank().find(x => x.id === id); if (!it) return;
    const st = e.target.closest('[data-star]');
    if (st) { S.updateBank(id, { rating: +st.dataset.star }); paintStars(st.parentElement, +st.dataset.star); toast('Valoración guardada'); return; }
    if (e.target.closest('[data-copy]')) return copy(it.prompt);
    if (e.target.closest('[data-feat]')) { S.updateBank(id, { featured: !it.featured }); renderBank(); return; }
    if (e.target.closest('[data-open]')) openDetail(id);
  });
  ['#bankSearch', '#bankTech', '#bankSort', '#bankFeatured'].forEach(s => $(s).addEventListener('input', renderBank));
  D.techniques.forEach(t => $('#bankTech').insertAdjacentHTML('beforeend', `<option value="${t.id}">T${t.num} · ${esc(t.name)}</option>`));

  $('#bankExport').addEventListener('click', () => {
    const data = { app: 'LandingForge IA', version: 1, exportedAt: new Date().toISOString(), items: S.getBank() };
    download(`banco-landings-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
  });
  $('#bankImport').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const items = (Array.isArray(data) ? data : data.items || []).filter(x => x && typeof x.html === 'string' && typeof x.prompt === 'string');
      if (!items.length) throw new Error('El archivo no contiene landings válidas.');
      const bank = S.getBank();
      items.forEach(x => bank.unshift({
        id: S.uid(), title: String(x.title || 'Landing importada').slice(0, 120), html: x.html, prompt: x.prompt,
        techniques: (x.techniques || []).filter(t => D.tech(t)), brief: x.brief || {}, engine: String(x.engine || 'Importada'),
        rating: Math.max(0, Math.min(5, +x.rating || 0)), featured: !!x.featured, createdAt: +x.createdAt || Date.now()
      }));
      S.replaceBank(bank); renderBank();
      toast(`${items.length} landing(s) importada(s)`);
    } catch (err) { toast('No se pudo importar: ' + err.message, true); }
    e.target.value = '';
  });
  $('#bankRestore').addEventListener('click', () => { seedBank(true); renderBank(); });

  /* detalle: la web a la izquierda y el prompt a la derecha */
  function openDetail(id) {
    const it = S.getBank().find(x => x.id === id); if (!it) return;
    state.detailId = id;
    $('#detailTitle').textContent = it.title;
    $('#detailMeta').textContent = `${(it.brief && it.brief.tema) || ''} · ${it.engine || ''} · ${fmtDate(it.createdAt)}`;
    $('#detailStars').innerHTML = starsHtml(it.rating || 0).replace(/^<div[^>]*>|<\/div>$/g, '');
    $('#detailFeat').textContent = it.featured ? '★ Destacada' : '☆ Destacar';
    $('#detailChips').innerHTML = (it.techniques || []).map(t => `<span class="chip static">${esc(techLabel(t))}</span>`).join('') || '<span class="chip static">Prompt libre</span>';
    $('#detailPrompt').textContent = it.prompt;
    $('#detailFrame').srcdoc = it.html;
    $('#detail').hidden = false;
    $('#detailClose').focus();
  }
  function closeDetail() { $('#detail').hidden = true; $('#detailFrame').srcdoc = ''; state.detailId = null; renderBank(); }
  $('#detailClose').addEventListener('click', closeDetail);
  $('#detail').addEventListener('click', e => { if (e.target.id === 'detail') closeDetail(); });
  $('#detailStars').addEventListener('click', e => { const s = e.target.closest('[data-star]'); if (!s) return; S.updateBank(state.detailId, { rating: +s.dataset.star }); paintStars($('#detailStars'), +s.dataset.star); });
  $('#detailFeat').addEventListener('click', () => { const it = S.getBank().find(x => x.id === state.detailId); const u = S.updateBank(state.detailId, { featured: !it.featured }); $('#detailFeat').textContent = u.featured ? '★ Destacada' : '☆ Destacar'; });
  $('#detailCopy').addEventListener('click', () => copy($('#detailPrompt').textContent));
  $('#detailDl').addEventListener('click', () => { const it = S.getBank().find(x => x.id === state.detailId); download(slug(it.title) + '.html', it.html, 'text/html;charset=utf-8'); });
  $('#detailOpen').addEventListener('click', () => { const it = S.getBank().find(x => x.id === state.detailId); openInTab(it.html); });
  $('#detailDel').addEventListener('click', () => {
    if (!confirm('¿Eliminar esta landing del banco? Esta acción no se puede deshacer.')) return;
    S.removeBank(state.detailId); closeDetail(); toast('Landing eliminada');
  });
  $('#detailRerun').addEventListener('click', () => {
    const it = S.getBank().find(x => x.id === state.detailId);
    const parsed = P.parse(it.prompt);
    const brief = Object.assign({}, D.emptyBrief, parsed.brief, it.brief || {});
    state.current = { id: null, text: it.prompt, spec: { brief, techniques: it.techniques && it.techniques.length ? it.techniques : parsed.techniques, opts: {}, text: it.prompt }, edited: false };
    const ex = D.examples.find(x => x.id === it.exampleId);
    if (ex) { state.current.spec.brief = Object.assign({}, D.emptyBrief, ex.brief); ex.techniques.forEach(t => { state.current.spec.opts[t] = Object.assign(D.defaultOpts(t), (ex.opts || {})[t] || {}); }); }
    $('#studioPrompt').value = it.prompt;
    $('#studioPromptInfo').textContent = `Desde el banco: ${it.title}`;
    closeDetail(); go('studio');
  });
  $$('[data-ddev]').forEach(b => b.addEventListener('click', () => {
    $$('[data-ddev]').forEach(x => x.classList.toggle('on', x === b));
    $('.detail-web .frame-wrap').dataset.dev = b.dataset.ddev;
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#detail').hidden) closeDetail(); if (!$('#saveModal').hidden) $('#saveModal').hidden = true; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!$('#view-studio').hidden) { e.preventDefault(); run(); }
      else if (!$('#view-techniques').hidden) { e.preventDefault(); (state.selected.size >= 2 ? $('#genCombined') : $('#genSingles')).click(); }
    }
  });

  /* ======================= GUÍA ======================= */
  function renderGuide() {
    $('#guide').innerHTML = `
      <div class="guide-hero">
        <p class="kicker">Guía rápida</p>
        <h2>Romper el «promedio estadístico» de la IA</h2>
        <p>Las herramientas de IA tienden a producir la misma landing: degradado púrpura, texto a la izquierda, imagen a la derecha y una cuadrícula de tarjetas. LandingForge convierte las 8 técnicas del tratado en prompts completos para salir de ese promedio, y los ejecuta para que veas el resultado.</p>
      </div>
      <div class="phases">${Object.keys(D.phases).map(ph => `<div style="border-top-color:var(--${ph})"><h3 style="color:var(--${ph})">${D.phases[ph].label}</h3><p class="muted">${D.phases[ph].desc}</p><div class="chips" style="margin-top:10px">${D.techniques.filter(t => t.phase === ph).map(t => `<span class="chip static">T${t.num} ${esc(t.name)}</span>`).join('')}</div></div>`).join('')}</div>
      <div><h3 style="margin-bottom:12px">Tabla resumen</h3>
      <div style="overflow-x:auto"><table class="gtable"><thead><tr><th>Fase</th><th>Técnica</th><th>Objetivo operativo</th><th>Riesgo que mitiga</th></tr></thead><tbody>
      ${D.techniques.map(t => `<tr><td><span class="pchip ${t.phase}">${D.phases[t.phase].label}</span></td><td><b>T${t.num}</b> ${esc(t.name)}</td><td>${esc(t.objective)}</td><td>${esc(t.risk)}</td></tr>`).join('')}
      </tbody></table></div></div>
      <div><h3 style="margin-bottom:12px">Las 8 técnicas y cómo las aplica la app</h3><div class="gcards">${D.techniques.map(t => `<div class="gcard"><h4><span>${String(t.num).padStart(2, '0')}</span>${esc(t.name)}</h4><p>${esc(t.theory)}</p><p><b style="color:var(--text)">En el motor local:</b> ${esc(ENGINE_NOTES[t.id])}</p></div>`).join('')}</div></div>
      <div><h3 style="margin-bottom:12px">Requisitos de la actividad</h3><ul class="req">
        <li><b>✓</b><span><b style="color:var(--text)">1. Tema y datos básicos</b> — paso 1 «Proyecto»: tema, marca, público, problema, propuesta, beneficios, objeciones, prueba social, tono, idioma, colores y formato. Incluye ejemplos cargables y un medidor de calidad.</span></li>
        <li><b>✓</b><span><b style="color:var(--text)">2. Un prompt por técnica</b> — cada tarjeta del paso 2 tiene «Generar solo esta», y el botón «Un prompt por técnica» genera uno por cada técnica marcada.</span></li>
        <li><b>✓</b><span><b style="color:var(--text)">3. Combinar dos o más técnicas</b> — «Prompt combinado» fusiona las técnicas por fases (Descubrir → Definir → Entregar), añade sinergias, restricciones consolidadas y checklist de calidad.</span></li>
        <li><b>✓</b><span><b style="color:var(--text)">4. Banco de landing pages</b> — paso 4: cada landing aparece junto al prompt que la creó, con valoración, destacadas, búsqueda, filtros, exportación e importación.</span></li>
        <li><b>✓</b><span><b style="color:var(--text)">5. Ejecutar el prompt dentro de la app</b> — paso 3 «Estudio»: el motor local construye la landing al instante y sin conexión; con una clave de API, Claude (u otro proveedor) la genera en vivo.</span></li>
      </ul></div>
      <div class="guide-hero"><h3>Consejos</h3><ul class="tips" style="margin-top:12px">
        <li>Rellena «Problema» y «Objeciones»: activan la narrativa (T8) y la técnica de inoculación (T2).</li>
        <li>Compara el mismo brief sin técnicas y con la semilla (T1): verás el salto desde la estética genérica.</li>
        <li>Puedes editar cualquier prompt antes de ejecutarlo; el motor local vuelve a leer el contexto y las técnicas del texto.</li>
        <li>Atajo: <b>Ctrl + Enter</b> genera prompts en el paso 2 y construye la landing en el paso 3.</li>
      </ul></div>`;
  }
  const ENGINE_NOTES = {
    seed: 'cambia la tipografía, la paleta, la retícula del hero, los ornamentos SVG y el estilo de las tarjetas según la semilla (11 estilos, combinables de dos en dos).',
    ambitious: 'reordena las secciones según el marco (AIDA, PAS, BAB, 4P, StoryBrand), adapta el titular al nivel de consciencia y añade inoculación, escasez o prueba social.',
    subagents: 'ejecuta un agente crítico que corrige contraste, titulares largos, CTA y formulario, y deja un informe con propuesta de test A/B.',
    image: 'dibuja ilustraciones SVG y CSS propias del tema y de la semilla (siluetas de producto, motivos del negocio), sin fotos ni servicios externos.',
    video: 'añade un fondo animado en canvas que simula el vídeo (respetando «reducir movimiento») e incluye el prompt de vídeo.',
    subtractive: 'elimina el porcentaje indicado de secciones decorativas, reduce el menú, los beneficios y los campos del formulario.',
    negative: 'sustituye las palabras prohibidas, elimina degradados y colores púrpura típicos de IA y lo reporta.',
    human: 'escribe una historia antes → giro → después, reemplaza botones genéricos por micro-copy y adapta la voz.'
  };

  /* ======================= arranque ======================= */
  applyTheme();
  if (!state.settings.intro) $('#intro').hidden = true;
  renderBrief();
  renderTechniques();
  renderHistory();
  renderAiConfig();
  detectServer();
  renderGuide();
  initBank();
  go(location.hash.slice(1) || 'brief', false);
})();
