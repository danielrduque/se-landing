/* ==========================================================================
   LandingForge IA · Generador de semillas (ADN de diseño)
   Como la semilla de un mundo de Minecraft: el mismo número o la misma palabra
   produce SIEMPRE el mismo diseño, y cualquier cambio produce uno distinto.
   Una semilla decide: estilos (+ variante), paleta, tipografías, retícula del
   hero, sistema de beneficios, tarjetas, fondos, bordes, titular, navegación,
   botones, decoración, movimiento, imagen y nivel de locura.
   El usuario puede fijar colores, variante y tipografías; el resto lo decide la semilla.
   ========================================================================== */
window.LF = window.LF || {};

LF.seed = (function () {
  const styles = LF.seedStyles;
  const fonts = LF.fontPairs;
  const twists = LF.seedTwists;
  const lib = LF.fontLib;
  const named = LF.namedPalettes;
  const byId = id => styles.find(s => s.id === id);

  /* ---------- aleatoriedad determinista ---------- */
  function hash(str) {                                   // xfnv1a: texto → entero de 32 bits
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
    return h >>> 0;
  }
  function rng(seed) {                                   // mulberry32
    let a = hash(String(seed));
    const next = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    next.pick = arr => arr[Math.floor(next() * arr.length)];
    next.range = (lo, hi) => lo + next() * (hi - lo);
    next.int = (lo, hi) => Math.floor(next.range(lo, hi + 1));
    next.chance = p => next() < p;
    return next;
  }
  const norm = s => String(s == null ? '' : s).trim();
  function randomSeed() { return String(Math.floor(Math.random() * 999999999) + 1); }

  /* ---------- color ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s = clamp(s, 0, 100) / 100; l = clamp(l, 0, 100) / 100;
    const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  }
  const rgb = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
  const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  function pull(color, bg, min) {                        // oscurece/aclara el color hasta tener contraste mínimo con el fondo
    if (contrast(color, bg) >= min) return color;
    const target = lum(bg) > 0.4 ? '#000000' : '#ffffff';
    for (let t = 0.08; t <= 1.001; t += 0.08) { const c = mix(color, target, t); if (contrast(c, bg) >= min) return c; }
    return target;
  }
  const isPurple = h => { const [r, g, b] = rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.1) return false; let hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = (hh * 60 + 360) % 360; return hh >= 255 && hh <= 300; };
  const isHex = v => /^#[0-9a-f]{6}$/i.test(String(v || ''));

  /* Completa una paleta a partir de fondo/texto/primario/acento/acento 2 (superficie, tono apagado y línea se derivan) */
  function finish(p, source) {
    const bg = p.bg, dark = lum(bg) < 0.25;
    const text = pull(p.text, bg, 7);
    return {
      source, dark, bg, surface: dark ? mix(bg, '#ffffff', .07) : mix(bg, '#ffffff', .65), text, muted: mix(text, bg, .38),
      primary: pull(p.primary, bg, 3), accent: pull(p.accent, bg, 3), accent2: pull(p.accent2, bg, 3), line: mix(text, bg, dark ? .78 : .82)
    };
  }
  function namedPalette(np) { return finish({ bg: np[1], text: np[2], primary: np[3], accent: np[4], accent2: np[5] }, `paleta «${np[0]}»`); }
  function applyColors(pal, colors) {
    const p = { bg: pal.bg, text: pal.text, primary: pal.primary, accent: pal.accent, accent2: pal.accent2 };
    let used = 0;
    ['bg', 'text', 'primary', 'accent', 'accent2'].forEach(k => { if (colors && isHex(colors[k])) { p[k] = colors[k].toLowerCase(); used++; } });
    return used ? finish(p, 'elegida por ti') : pal;
  }
  /* Versión clara/oscura de una paleta: intercambia fondo y texto */
  function invertColors(c) { return { bg: c.text, text: c.bg, primary: c.primary, accent: c.accent, accent2: c.accent2 }; }

  function makePalette(r, st, dark, tw) {
    const roll = r.chance(0.45);                          // siempre se consume, para que la semilla sea estable
    if (!tw && roll && st.canon && LF.engine && LF.engine.THEMES[st.engine]) {
      const t = LF.engine.THEMES[st.engine];
      return { source: 'clásica', dark: !!t.dark, bg: t.bg, surface: t.surface, text: t.text, muted: t.muted, primary: t.primary, accent: t.accent, accent2: t.accent2, line: t.line };
    }
    const S = Object.assign({}, st, tw ? { hues: tw.hues || st.hues, sat: tw.sat || st.sat } : {});
    const h0 = r.pick(S.hues) + r.range(-10, 10);
    if (tw && tw.contrast) {
      const bg = dark ? '#0a0a0a' : '#ffffff', text = dark ? '#ffffff' : '#0a0a0a';
      return finish({ bg, text, primary: hsl(h0, 95, dark ? 58 : 46), accent: hsl(h0 + 180, 90, 52), accent2: hsl(h0 + 40, 90, 55) }, 'alto contraste');
    }
    const harmony = tw && tw.harmony === 'mono' ? 'monocromática' : r.pick(['complementaria', 'triádica', 'análoga', 'complementaria dividida']);
    const off = { 'complementaria': [180, 160], 'triádica': [120, 240], 'análoga': [32, -32], 'complementaria dividida': [150, 210], 'monocromática': [8, -8] }[harmony];
    const [smin, smax] = S.sat;
    const s = r.range(smin, smax);
    const h1 = h0 + off[0], h2 = h0 + off[1];
    const bg = dark ? hsl(h0, r.range(12, 30) * (smax > 40 ? 1 : .5), r.range(6, 10)) : hsl(h0, r.range(12, 34) * (smax > 40 ? 1 : .6), r.range(93, 97));
    const text = dark ? hsl(h0, 14, r.range(90, 94)) : hsl(h0, r.range(25, 45), r.range(8, 13));
    let primary = hsl(h0, s, dark ? r.range(52, 64) : r.range(36, 50));
    let accent = hsl(h1, clamp(s * 0.95, 8, 100), dark ? r.range(54, 66) : r.range(42, 56));
    let accent2 = hsl(h2, clamp(s * 0.85, 8, 100), dark ? r.range(52, 64) : r.range(44, 58));
    [0, 1, 2].forEach(i => {                               // la semilla nunca produce el morado típico de IA
      const arr = [primary, accent, accent2];
      if (isPurple(arr[i])) arr[i] = hsl(S.hues[0] + 20 * (i + 1), s, dark ? 58 : 44);
      [primary, accent, accent2] = arr;
    });
    return finish({ bg, text, primary, accent, accent2 }, 'generada · ' + harmony);
  }

  /* ---------- vocabulario del diseño: id → { t: descripción, w: nivel mínimo de locura } ---------- */
  const HEROES = {
    asym: { w: 0, t: 'retícula asimétrica de 12 columnas: visual pequeño arriba a la izquierda y titular desplazado a la derecha' },
    center: { w: 0, t: 'composición centrada y simétrica: el visual sobre el titular y el CTA en el eje' },
    ma: { w: 0, t: 'mucho vacío (Ma): titular abajo a la izquierda y un único elemento flotando arriba a la derecha' },
    swiss: { w: 0, t: 'banda superior gruesa, titular enorme a todo el ancho y visual en columna lateral' },
    editorial: { w: 0, t: 'titular enorme en cursiva tipo portada de revista, con columna lateral estrecha' },
    spiral: { w: 0, t: 'visual a la izquierda con proporción áurea (1:1.618) y el titular a la derecha' },
    stage: { w: 0, t: 'escenario: titular centrado arriba y el visual grande debajo, como un escaparate' },
    cards: { w: 0, t: 'titular arriba y una fila de tres tarjetas de visual a todo el ancho debajo' },
    stack: { w: 1, t: 'bloque apilado: tarjeta con el titular y el visual solapado encima' },
    blueprint: { w: 1, t: 'fondo de plano técnico con cotas, retícula fina y figuras numeradas' },
    giant: { w: 1, t: 'titular GIGANTE a todo el ancho (hasta 10 rem) y el visual pequeño apoyado en una esquina' },
    diagonal: { w: 1, t: 'bloque de color con el borde inferior cortado en diagonal y el contenido encima' },
    half: { w: 1, t: 'pantalla partida al 50 %: mitad fondo neutro, mitad bloque de color con el visual' },
    poster: { w: 1, t: 'cartel: todo dentro de un recuadro de borde grueso, titular centrado en mayúsculas' },
    tag: { w: 1, t: 'la etiqueta superior es una pegatina inclinada de color; el resto en dos columnas' },
    circle: { w: 1, t: 'el visual se apoya sobre un gran círculo de color translúcido' },
    frame: { w: 1, t: 'marco doble de borde grueso rodeando todo el hero' },
    stripe: { w: 1, t: 'fondo de franjas verticales de dos tonos detrás del contenido' },
    collage: { w: 2, t: 'collage: visuales rotados y solapados como recortes pegados junto al titular' },
    overlap: { w: 2, t: 'el visual invade la columna del titular y lo solapa parcialmente' }
  };
  const BENEFITS = {
    cards: { w: 0, t: 'tarjetas con icono' }, numbered: { w: 0, t: 'lista con números enormes y regla superior' }, columns: { w: 0, t: 'columnas de revista con filete vertical' },
    minimal: { w: 0, t: 'lista vertical con filetes finos, sin cajas' }, editorial: { w: 0, t: 'secciones centradas con numeración en cursiva' }, ledger: { w: 0, t: 'libro de cuentas: filas con número, título y descripción en tres columnas' },
    bigtext: { w: 0, t: 'una frase por beneficio en tipografía grande, sin cajas' }, timeline: { w: 0, t: 'línea de tiempo vertical con puntos de color' },
    blocks: { w: 1, t: 'bloques de color sólidos alternados' }, figures: { w: 1, t: 'figuras numeradas estilo «FIG. 1»' }, bordered: { w: 1, t: 'cajas de borde grueso con sombra dura' },
    framed: { w: 1, t: 'marcos dobles simétricos' }, terminal: { w: 1, t: 'bloques de consola con prefijo «>»' }, pills: { w: 1, t: 'cápsulas redondeadas a todo el ancho' },
    stamp: { w: 1, t: 'cada beneficio lleva un sello circular inclinado' }, strip: { w: 1, t: 'carrusel horizontal de tarjetas con desplazamiento' },
    stagger: { w: 2, t: 'tarjetas escalonadas en cascada' }, zigzag: { w: 2, t: 'tarjetas alternadas izquierda/derecha en zigzag' }, overlapc: { w: 2, t: 'tarjetas solapadas con sombras profundas' }
  };
  const PATTERNS = {
    none: { w: 0, t: 'sin patrón de fondo' }, dots: { w: 0, t: 'puntos' }, grid: { w: 0, t: 'cuadrícula fina' }, vlines: { w: 0, t: 'líneas verticales' }, graph: { w: 0, t: 'papel milimetrado' }, noise: { w: 0, t: 'grano fino' },
    stripes: { w: 1, t: 'rayas diagonales' }, waves: { w: 1, t: 'ondas' }, plaid: { w: 1, t: 'tartán suave' }, diamonds: { w: 1, t: 'rombos' }, crosses: { w: 1, t: 'cruces pequeñas' }, hex: { w: 1, t: 'panal hexagonal' },
    checker: { w: 2, t: 'damero' }, triangles: { w: 2, t: 'triángulos' }, scales: { w: 2, t: 'escamas' }, zigzagp: { w: 2, t: 'zigzag repetido' }, confetti: { w: 3, t: 'confeti disperso' }
  };
  const EDGES = {
    straight: { w: 0, t: 'bordes rectos entre secciones' }, wave: { w: 1, t: 'bordes en ola' }, zigzag: { w: 1, t: 'bordes en zigzag' }, diagonal: { w: 1, t: 'bordes en diagonal' },
    arch: { w: 1, t: 'bordes en arco suave' }, slant2: { w: 1, t: 'bordes en diagonal inversa' }, torn: { w: 2, t: 'bordes rasgados como papel' }, scallop: { w: 2, t: 'bordes festoneados (semicírculos)' },
    steps: { w: 2, t: 'bordes en escalera' }, sawtooth: { w: 2, t: 'bordes en dientes de sierra' }, dwave: { w: 3, t: 'bordes en ola doble y rápida' }
  };
  const CARDS = {
    flat: { w: 0, t: 'tarjetas planas' }, offset: { w: 0, t: 'tarjetas con borde y contorno desplazado' }, paper: { w: 0, t: 'tarjetas apiladas como hojas de papel' }, dotted: { w: 0, t: 'tarjetas de borde punteado grueso' },
    tab: { w: 0, t: 'tarjetas con pestaña de color arriba' }, pillc: { w: 0, t: 'tarjetas muy redondeadas' }, corners: { w: 0, t: 'tarjetas con esquinas de plano técnico' },
    sticker: { w: 1, t: 'tarjetas tipo sticker (rotadas, con sombra dura)' }, ticket: { w: 1, t: 'tarjetas tipo ticket (borde punteado)' }, ribbon: { w: 1, t: 'tarjetas con lazo de color en una esquina' },
    notch: { w: 1, t: 'tarjetas con esquinas cortadas' }, polaroid: { w: 2, t: 'tarjetas tipo polaroid (marco blanco, ligera rotación)' }, tape: { w: 2, t: 'tarjetas pegadas con cinta adhesiva' }
  };
  const HEADLINES = {
    normal: { w: 0, t: 'titular normal' }, spaced: { w: 0, t: 'titular H1 en mayúsculas con mucho espaciado de letras' }, tight: { w: 0, t: 'titular H1 en mayúsculas muy apretado (interlineado .85)' },
    smallcaps: { w: 0, t: 'titular H1 en versalitas' }, marker: { w: 1, t: 'titular H1 subrayado con marcador fosforito' }, shadow: { w: 1, t: 'titular H1 con sombra dura desplazada del color de acento' },
    wavy: { w: 1, t: 'titular H1 con subrayado ondulado de acento' }, outline: { w: 1, t: 'titular H1 en contorno (solo trazo, sin relleno)' }, tilt: { w: 1, t: 'titular H1 inclinado -2°' },
    block: { w: 2, t: 'titular H1 con fondo de bloque de acento, como rotulado' }, giant: { w: 2, t: 'titular H1 gigante' }, stacked: { w: 2, t: 'titular H1 apilado palabra por palabra en mayúsculas' }
  };
  const NAVS = {
    bar: { w: 0, t: 'barra clásica a todo el ancho' }, centered: { w: 0, t: 'logo centrado con el menú debajo' }, minimal: { w: 0, t: 'solo logo y botón' }, thick: { w: 0, t: 'barra con línea inferior gruesa y menú en mayúsculas' },
    boxed: { w: 1, t: 'barra enmarcada en una caja con borde' }, tabs: { w: 1, t: 'menú en forma de pestañas con borde' }, pill: { w: 1, t: 'píldora flotante con borde' }, inverted: { w: 2, t: 'barra con colores invertidos (fondo de texto, letras de fondo)' }
  };
  const BUTTONS = {
    solid: { w: 0, t: 'rectangular sólido' }, pill: { w: 0, t: 'píldora sólida' }, outline: { w: 0, t: 'contorno sin relleno' }, underline: { w: 0, t: 'texto con subrayado grueso y flecha' },
    shadow: { w: 1, t: 'sombra dura desplazada' }, double: { w: 1, t: 'doble borde' }, block: { w: 1, t: 'bloque ancho en mayúsculas espaciadas' }, tilt: { w: 2, t: 'ligeramente inclinado, con rebote al pasar el ratón' }
  };
  const DECOR = ['circle', 'square', 'triangle', 'star', 'squiggle', 'cross', 'ring', 'diamond', 'semicircle', 'arc', 'dots', 'bolt', 'flower', 'spiral', 'blob'];
  const DECOR_ES = { circle: 'círculos', square: 'cuadrados', triangle: 'triángulos', star: 'estrellas', squiggle: 'garabatos', cross: 'cruces', ring: 'anillos', diamond: 'rombos', semicircle: 'semicírculos', arc: 'arcos', dots: 'cuadrículas de puntos', bolt: 'rayos', flower: 'flores', spiral: 'espirales', blob: 'manchas' };
  const SHAPES = [
    { name: 'esquinas rectas', radius: '0px', btn: '0px' }, { name: 'esquinas casi rectas', radius: '2px', btn: '2px' }, { name: 'esquinas suaves', radius: '10px', btn: '8px' },
    { name: 'esquinas redondeadas', radius: '20px', btn: '14px' }, { name: 'tarjetas redondeadas y botón píldora', radius: '24px', btn: '999px' }, { name: 'rectas con botón píldora', radius: '0px', btn: '999px' },
    { name: 'esquinas muy redondas', radius: '36px', btn: '999px' }, { name: 'solo arriba-izquierda y abajo-derecha redondeadas', radius: '28px 0 28px 0', btn: '0px' },
    { name: 'pestaña (redondeo solo arriba)', radius: '18px 18px 0 0', btn: '6px' }, { name: 'esquinas mixtas', radius: '0 24px 0 24px', btn: '999px' },
    { name: 'casi cuadradas con botón suave', radius: '4px', btn: '10px' }, { name: 'cápsulas', radius: '999px', btn: '999px' }
  ];
  const TEXTURES = ['grano de película sutil', 'papel con fibra', 'tramado de puntos (halftone)', 'líneas de cuadrícula finas', 'ruido muy sutil', 'superficies limpias, sin textura', 'curvas de nivel topográficas', 'costuras y puntadas como filetes', 'sombras de recorte de papel', 'tinta con ligero desalineado de impresión', 'tela de lino', 'cartón corrugado', 'cristal esmerilado muy discreto', 'polvo y rayones de fotocopia', 'acuarela en los bordes', 'metal cepillado', 'madera clara', 'hormigón visto'];
  const MOTIONS = ['aparición suave al hacer scroll', 'marquesina lenta con la prueba social', 'sombra dura que se desplaza en hover', 'parallax ligero en el visual del hero', 'revelado de imágenes con máscara', 'sin animación salvo el CTA', 'elementos que rebotan al entrar', 'subrayados que se dibujan al pasar el ratón', 'números que cuentan hacia arriba', 'tarjetas que se inclinan en hover', 'texto que se escribe letra a letra en el titular', 'desplazamiento horizontal del visual con el scroll'];
  const IMGTREAT = ['duotono con los dos colores de marca', 'blanco y negro con un único acento', 'color natural con grano de película', 'recortes sin fondo sobre bloques de color', 'marcos de borde grueso con esquina asimétrica', 'viñeta suave y luz cálida', 'halftone de un solo color', 'colores lavados tipo película vencida', 'bordes irregulares como recortadas con tijera', 'formas recortadas (círculo, arco, pastilla)', 'contraste alto con sombras profundas', 'pasteles aireados con mucho espacio'];
  const DENSITY = ['aireada, con mucho espacio negativo', 'equilibrada', 'densa, tipo catálogo', 'muy compacta, tipo periódico', 'generosa, una idea por pantalla', 'asimétrica: zonas vacías y zonas muy cargadas'];
  const DIVIDERS = ['filete fino', 'franja de color', 'ondas suaves', 'hilera de puntos', 'ninguno: solo espacio', 'doble filete', 'línea discontinua', 'asteriscos centrados'];
  const TYPESCALE = ['titulares gigantes (hasta 7 rem)', 'titulares medios y texto generoso', 'titulares contenidos con mucho contraste de peso', 'escala modular muy marcada', 'todo en el mismo tamaño salvo el titular', 'texto grande tipo periódico, titulares moderados', 'titulares minúsculos y cuerpo grande', 'jerarquía solo por peso y color, no por tamaño'];
  const WILD = ['sobrio', 'atrevido', 'loco', 'caos total'];

  const pickLv = (map, w, r, not) => r.pick(Object.keys(map).filter(k => map[k].w <= w && k !== not));
  const texts = map => Object.keys(map).reduce((o, k) => (o[k] = map[k].t, o), {});

  /* ---------- generación ---------- */
  /* opts: { wild: 0-3|'' , twist: id|'none'|'' , colors: {bg,text,primary,accent,accent2}, fonts: {display,body}, styles: n } */
  function generate(seedInput, opts) {
    const seed = norm(seedInput);
    if (!seed) return null;
    opts = opts || {};
    const r = rng('lf:' + seed);
    const count = opts.styles || (r.chance(0.65) ? 2 : 1);
    const pool = styles.slice();
    const picked = [];
    while (picked.length < count && pool.length) picked.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    const A = picked[0], B = picked[1];

    const twRoll = r.chance(.55), twPick = r.pick(twists);
    const tw = opts.twist === 'none' ? null : opts.twist ? (twists.find(t => t.id === opts.twist) || null) : (twRoll ? twPick : null);
    const darkRoll = r.chance(.5);
    const dark = tw && tw.mode ? tw.mode === 'dark' : tw && tw.contrast ? darkRoll : (A.mode === 'dark' ? true : A.mode === 'light' ? false : darkRoll);

    const palRoll = r.chance(.28), palPick = named[r.int(0, named.length - 1)];
    let palette = (!tw && palRoll) ? namedPalette(palPick) : makePalette(r, A, dark, tw);
    if (opts.colors) palette = applyColors(palette, opts.colors);

    // tipografías: a mano, de la lista curada del estilo o combinadas al azar de la librería
    const fontRoll = r.chance(.4), curated = fonts[r.pick(A.fonts)];
    const dRoll = r.chance(.55), dAny = r.pick(lib.displays), bAny = r.pick(lib.bodies), bRoll = r.chance(.7);
    const accPick = r.pick(lib.displays.filter(d => ['script', 'display', 'mono', 'condensed', 'slab', 'serif'].includes(d[3])));
    let fp;
    if (opts.fonts && (opts.fonts.display || opts.fonts.body)) {
      fp = lib.make(lib.byName(lib.displays, opts.fonts.display) || dAny, lib.byName(lib.bodies, opts.fonts.body) || bAny);
    } else if (fontRoll) {
      fp = curated;
    } else {
      const base = lib.byName(lib.displays, curated.display), cat = base ? base[3] : 'sans';
      const sameCat = lib.displays.filter(d => d[3] === cat);
      const d = dRoll && sameCat.length ? sameCat[hash('d' + seed) % sameCat.length] : dAny;
      const sansBodies = lib.bodies.filter(b => b[2] === 'sans');
      const b = bRoll ? sansBodies[hash('b' + seed) % sansBodies.length] : bAny;
      fp = lib.make(d, b);
    }
    const accMade = lib.make(accPick, lib.bodies[0]);

    const w0 = r.pick([0, 0, 1, 1, 1, 2, 2, 2, 3]);
    const wv = opts.wild, hasWild = wv !== undefined && wv !== null && wv !== '' && !isNaN(+wv);
    const w = hasWild ? clamp(Math.round(+wv), 0, 3) : w0;

    const heroPrefs = A.hero && A.hero.length ? A.hero : null;
    const heroK = heroPrefs && !r.chance([.1, .3, .5, .7][w]) ? r.pick(heroPrefs) : pickLv(HEROES, w, r);
    const benPrefs = (B || A).benefits && (B || A).benefits.length ? (B || A).benefits : null;
    const benK = benPrefs && !r.chance([.1, .25, .4, .55][w]) ? r.pick(benPrefs) : pickLv(BENEFITS, w, r);
    const shape = r.pick(SHAPES);
    const upper = r.chance(['brutalism', 'artdeco', 'swiss', 'bauhaus', 'didot', 'streetwear', 'sportswear', 'constructivism'].includes(A.id) ? .7 : .12);
    const italic = r.chance(['editorial70', 'didot', 'fibonacci', 'highfashion', 'quietluxury', 'letterpress'].includes(A.id) ? .7 : .1);
    const patternK = r.chance([.3, .5, .65, .8][w]) ? pickLv(PATTERNS, w, r, 'none') : 'none';
    const edgeK = w === 0 ? 'straight' : (r.chance(.35 + w * .2) ? pickLv(EDGES, w, r, 'straight') : 'straight');
    const cardK = r.chance(.3 + w * .18) ? pickLv(CARDS, w, r, 'flat') : 'flat';
    const headK = r.chance(.25 + w * .2) ? pickLv(HEADLINES, w, r, 'normal') : 'normal';
    const navK = r.chance(.3 + w * .15) ? pickLv(NAVS, w, r, 'bar') : 'bar';
    const btnK = pickLv(BUTTONS, w, r);
    const tint = r.chance(.3 + w * .2);
    const marquee = w >= 1 && r.chance(.25 + w * .2);
    const decorN = [0, 3, 8, 14][w];
    const decorKinds = [r.pick(DECOR), r.pick(DECOR), r.pick(DECOR)].filter((x, i, a) => a.indexOf(x) === i);
    const shuffle = w >= 2 && r.chance(.6);
    const tex = r.pick(TEXTURES), mot = r.pick(MOTIONS), img = r.pick(IMGTREAT), den = r.pick(DENSITY), div = r.pick(DIVIDERS), ts = r.pick(TYPESCALE);

    const dna = {
      seed, world: 'Mundo ' + seed,
      styles: picked.map(s => s.id), styleNames: picked.map(s => s.name), traits: picked.map(s => s.traits),
      twist: tw ? tw.id : 'none', twistName: tw ? tw.name : '', twistTraits: tw ? tw.traits : '',
      palette, dark: palette.dark,
      fonts: { display: fp.display, body: fp.body, url: fp.url, fd: fp.fd, fb: fp.fb, accent: accPick[0], accentUrl: accMade.durl, fa: `'${accPick[0]}', ${accMade.dfall}` },
      hero: heroK, heroText: HEROES[heroK].t, benefits: benK, benefitsText: BENEFITS[benK].t,
      shape: shape.name, radius: shape.radius, btnRadius: shape.btn, upper, italic,
      texture: tex, motion: mot, imageTreatment: img, density: den, divider: div, typeScale: ts,
      button: BUTTONS[btnK].t, buttonK: btnK,
      wild: w, wildName: WILD[w],
      pattern: patternK, patternText: PATTERNS[patternK].t, edge: edgeK, edgeText: EDGES[edgeK].t,
      card: cardK, cardText: CARDS[cardK].t, headline: headK, headlineText: HEADLINES[headK].t,
      nav: navK, navText: NAVS[navK].t, tint, marquee, decorN, decorKinds, shuffle
    };
    dna.title = dna.styleNames.join(' × ') + (tw ? ' · ' + tw.name : '');
    return dna;
  }

  const words = ['ALBA', 'BRISA', 'CEDRO', 'DUNA', 'ECO', 'FARO', 'GRANA', 'HIEDRA', 'IRIS', 'JADE', 'KIWI', 'LIMA', 'MAREA', 'NIEBLA', 'OCRE', 'PALMA', 'QUARZO', 'RIBERA', 'SAL', 'TINTA', 'UMBRAL', 'VELA', 'YESO', 'ZAFIRO'];
  function friendlySeed() { return words[Math.floor(Math.random() * words.length)] + '-' + (Math.floor(Math.random() * 9000) + 1000); }

  /* Nombre aproximado de un color en inglés (para prompts de imagen, que entienden mejor «warm terracotta» que «#c8553d») */
  function colorName(h) {
    const [r, g, b] = rgb(h).map(v => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
    const sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (l < 0.14) return 'near-black';
    if (l > 0.92) return 'off-white';
    if (sat < 0.12) return l < 0.4 ? 'charcoal grey' : l > 0.7 ? 'light warm grey' : 'stone grey';
    let hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = (hh * 60 + 360) % 360;
    const base = hh < 15 || hh >= 345 ? 'red' : hh < 40 ? 'orange' : hh < 65 ? 'yellow' : hh < 100 ? 'olive green' : hh < 160 ? 'green' : hh < 195 ? 'teal' : hh < 255 ? 'blue' : hh < 300 ? 'violet' : 'pink';
    const tone = l < 0.3 ? 'deep ' : l > 0.72 ? 'pale ' : sat < 0.3 ? 'muted ' : '';
    return tone + base;
  }

  /* Baraja los bloques que pueden moverse de forma determinista (locura >= 2) */
  function shuffleMiddle(arr, dna, isMovable) {
    if (!dna || !dna.shuffle) return arr.slice();
    const out = arr.slice(), slots = [];
    out.forEach((x, i) => { if (isMovable(x)) slots.push(i); });
    const vals = slots.map(i => out[i]), r = rng('order:' + dna.seed);
    for (let i = vals.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]]; }
    slots.forEach((i, k) => { out[i] = vals[k]; });
    return out;
  }

  /* Formas decorativas sueltas (posición, tamaño y giro salen de la semilla) */
  function decorShapes(dna) {
    if (!dna || !dna.decorN) return [];
    const r = rng('decor:' + dna.seed), p = dna.palette, cols = [p.primary, p.accent, p.accent2];
    const out = [];
    for (let i = 0; i < dna.decorN; i++) out.push({ kind: r.pick(dna.decorKinds), x: r.range(2, 94), y: r.range(3, 92), size: r.range(22, 34 + dna.wild * 22), rot: r.range(-40, 40), color: cols[i % 3], op: r.range(.35, .9) });
    return out;
  }
  function decorSvg(sh) {
    const c = sh.color, k = sh.kind;
    const body = {
      circle: `<circle cx="50" cy="50" r="44" fill="${c}"/>`, ring: `<circle cx="50" cy="50" r="38" fill="none" stroke="${c}" stroke-width="12"/>`,
      square: `<rect x="8" y="8" width="84" height="84" fill="${c}"/>`, triangle: `<polygon points="50,6 94,90 6,90" fill="${c}"/>`,
      star: `<polygon points="50,4 61,36 96,36 67,57 78,92 50,71 22,92 33,57 4,36 39,36" fill="${c}"/>`,
      cross: `<path d="M38 6h24v32h32v24H62v32H38V62H6V38h32z" fill="${c}"/>`,
      squiggle: `<path d="M6 60 q11 -34 22 0 t22 0 t22 0 t22 0" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`,
      diamond: `<polygon points="50,4 96,50 50,96 4,50" fill="${c}"/>`, semicircle: `<path d="M6 70 a44 44 0 0 1 88 0z" fill="${c}"/>`,
      arc: `<path d="M10 80 a40 40 0 0 1 80 0" fill="none" stroke="${c}" stroke-width="14" stroke-linecap="round"/>`,
      dots: `<g fill="${c}">${[0, 1, 2, 3].map(i => [0, 1, 2, 3].map(j => `<circle cx="${14 + i * 24}" cy="${14 + j * 24}" r="6"/>`).join('')).join('')}</g>`,
      bolt: `<polygon points="58,4 18,56 46,56 38,96 82,40 52,40" fill="${c}"/>`,
      flower: `<g fill="${c}">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="50" cy="26" rx="14" ry="22" transform="rotate(${a} 50 50)"/>`).join('')}<circle cx="50" cy="50" r="10" fill="#fff" opacity=".8"/></g>`,
      spiral: `<path d="M50 50 a6 6 0 0 1 12 0 a14 14 0 0 1 -28 0 a24 24 0 0 1 48 0 a34 34 0 0 1 -68 0" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
      blob: `<path d="M50 6 C76 4 96 26 92 52 C88 80 66 96 44 92 C20 88 4 68 10 44 C14 22 30 8 50 6Z" fill="${c}"/>`
    }[k];
    return `<svg class="decor-s" viewBox="0 0 100 100" aria-hidden="true" style="left:${sh.x.toFixed(1)}%;top:${sh.y.toFixed(1)}%;width:${Math.round(sh.size)}px;transform:rotate(${Math.round(sh.rot)}deg);opacity:${(sh.op * .7).toFixed(2)}">${body}</svg>`;
  }
  /* Polígono para el borde superior de las secciones */
  function edgePolygon(dna) {
    if (!dna || dna.edge === 'straight') return '';
    const r = rng('edge:' + dna.seed), n = 28, pts = [];
    if (dna.edge === 'diagonal') return 'polygon(0 var(--edge),100% 0,100% 100%,0 100%)';
    if (dna.edge === 'slant2') return 'polygon(0 0,100% var(--edge),100% 100%,0 100%)';
    const P = (x, y) => pts.push(`${(x * 100).toFixed(1)}% calc(var(--edge) * ${y.toFixed(2)})`);
    const close = () => `polygon(${pts.join(',')},100% 100%,0 100%)`;
    if (dna.edge === 'scallop') { const k = 10; for (let i = 0; i < k; i++) for (let j = 0; j <= 6; j++) P((i + j / 6) / k, 1 - Math.sin(Math.PI * j / 6)); return close(); }
    if (dna.edge === 'steps') { const k = 12; for (let i = 0; i < k; i++) { const y = (i % 4) / 3; P(i / k, y); P((i + 1) / k, y); } return close(); }
    if (dna.edge === 'sawtooth') { const k = 14; for (let i = 0; i < k; i++) { P(i / k, 1); P((i + 1) / k, 0); } P(1, 1); return close(); }
    for (let i = 0; i <= n; i++) {
      const x = i / n;
      let y;
      if (dna.edge === 'wave') y = (Math.sin(x * Math.PI * 6) + 1) / 2;
      else if (dna.edge === 'dwave') y = (Math.sin(x * Math.PI * 14) + 1) / 2;
      else if (dna.edge === 'zigzag') y = i % 2;
      else if (dna.edge === 'arch') y = 1 - Math.sin(Math.PI * x);
      else y = r();
      P(x, y);
    }
    return close();
  }

  /* Convierte el ADN en sobrescrituras para el motor local */
  function toTheme(dna) {
    const p = dna.palette;
    return {
      name: dna.title, fonts: dna.fonts.url + '&family=' + dna.fonts.accentUrl, fd: dna.fonts.fd, fb: dna.fonts.fb,
      bg: p.bg, surface: p.surface, text: p.text, muted: p.muted, primary: p.primary, accent: p.accent, accent2: p.accent2, line: p.line,
      dark: dna.dark, hero: dna.hero, benefits: dna.benefits, radius: dna.radius, btnRadius: dna.btnRadius,
      upper: dna.upper, italic: dna.italic, gradient: false
    };
  }

  /* Texto del bloque «ADN DE DISEÑO» para los prompts */
  function promptLines(dna) {
    const p = dna.palette;
    const L = [];
    L.push(`Semilla: «${dna.seed}» → ${dna.title}. Es determinista: estas decisiones ya están tomadas, no las cambies ni las «mejores».`);
    dna.styleNames.forEach((n, i) => L.push(`- Estilo ${i === 0 ? 'base' : 'secundario'}: ${n} — ${dna.traits[i]}.`));
    if (dna.twistName) L.push(`- Variante «${dna.twistName}»: ${dna.twistTraits}.`);
    L.push(`- Paleta (${p.source}): fondo ${p.bg} · superficie ${p.surface} · texto ${p.text} · primario ${p.primary} · acento ${p.accent} · acento 2 ${p.accent2}. ${dna.dark ? 'Tema oscuro.' : 'Tema claro.'}`);
    L.push(`- Tipografías (Google Fonts): titulares «${dna.fonts.display}», texto «${dna.fonts.body}». ${dna.upper ? 'Titulares en mayúsculas. ' : ''}${dna.italic ? 'Cursiva en titulares. ' : ''}Escala: ${dna.typeScale}.`);
    L.push(`- Hero: ${dna.heroText}.`);
    L.push(`- Beneficios: ${dna.benefitsText}.`);
    L.push(`- Forma: ${dna.shape} (radio ${dna.radius}, botones ${dna.btnRadius}). Botón: ${dna.button}.`);
    L.push(`- Textura: ${dna.texture}. ${dna.edge === 'straight' ? 'Separadores: ' + dna.divider + '. ' : ''}Densidad: ${dna.density}.`);
    L.push(`- Movimiento: ${dna.motion}. Tratamiento de imagen: ${dna.imageTreatment}.`);
    L.push(`- Nivel de locura: ${dna.wild}/3 «${dna.wildName}». ${dna.wild >= 2 ? 'Rompe las convenciones: composiciones inesperadas, rotaciones, solapes y contraste fuerte, sin perder legibilidad ni contraste AA.' : dna.wild === 1 ? 'Un par de decisiones atrevidas, el resto ordenado.' : 'Composición limpia y contenida.'}`);
    L.push(`- Tipografía de acento (solo etiquetas, precios y cinta): «${dna.fonts.accent}». Patrón de fondo: ${dna.patternText}. Bordes entre secciones: ${dna.edgeText}${dna.tint ? '; secciones alternas con fondo teñido' : ''}.`);
    L.push(`- Tarjetas: ${dna.cardText}. Titular: ${dna.headlineText}. Navegación: ${dna.navText}.`);
    if (dna.marquee) L.push('- Incluye una cinta marquesina con texto grande en bucle (marca y beneficios) justo debajo del hero; respeta prefers-reduced-motion.');
    if (dna.decorN) L.push(`- Decoración: ${dna.decorN} formas sueltas (${dna.decorKinds.map(k => DECOR_ES[k]).join(', ')}) en colores de la paleta, repartidas por el hero con posiciones y giros irregulares (aria-hidden).`);
    if (dna.shuffle) L.push('- Orden de los bloques intermedios: es intencionalmente no convencional (ver «ARQUITECTURA DE LA PÁGINA»); respétalo.');
    return L;
  }

  /* Opciones del usuario (panel de semilla) + colores de marca del brief si los fijó a mano */
  function optsFrom(o, b) {
    o = o || {};
    const out = { wild: o.wild, twist: o.twist, fonts: o.fonts, colors: o.colors };
    if ((!out.colors || !Object.keys(out.colors).length) && b && b.colorAuto === false && isHex(b.color1)) out.colors = { primary: b.color1, accent: isHex(b.color2) ? b.color2 : undefined };
    return out;
  }

  /* Cuántas opciones hay en cada tipo (para mostrar en la interfaz y en el README) */
  function catalog() {
    const n = o => Object.keys(o).length;
    return {
      estilos: styles.length * (twists.length + 1), estilosBase: styles.length, variantes: twists.length, paletasConNombre: named.length,
      tipografias: lib.count + Object.keys(fonts).length, heros: n(HEROES), beneficios: n(BENEFITS), patrones: n(PATTERNS), bordes: n(EDGES),
      tarjetas: n(CARDS), titulares: n(HEADLINES), navegaciones: n(NAVS), botones: n(BUTTONS), decoraciones: DECOR.length, formas: SHAPES.length,
      texturas: TEXTURES.length, movimientos: MOTIONS.length, imagenes: IMGTREAT.length, densidades: DENSITY.length, escalas: TYPESCALE.length
    };
  }

  return {
    optsFrom, WILD, TWISTS: twists, NAMED: named, LIB: lib, catalog, shuffleMiddle, decorShapes, decorSvg, edgePolygon, colorName, hash, rng, generate, randomSeed, friendlySeed,
    toTheme, promptLines, byId, HEROES: texts(HEROES), BENEFITS: texts(BENEFITS), contrast, styles, invertColors, isHex, namedPalette, mix, lum
  };
})();
