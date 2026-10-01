/* ==========================================================================
   LandingForge IA · Packs de sector
   Hasta ahora todas las landings recibían la misma maqueta (dashboard con KPIs
   y barras). Para una tienda de ropa eso no tiene sentido. Cada pack define:
     - qué debe verse (componentes propios del negocio)
     - qué está prohibido (p. ej. dashboards en una tienda)
     - la arquitectura de la página (secciones con objetivo y contenido)
     - los prompts de imagen propios del sector (en inglés)
     - siluetas de producto dibujadas en SVG (funcionan sin internet)
   ========================================================================== */
window.LF = window.LF || {};

/* ---------- siluetas de producto en SVG ---------- */
LF.shapes = (function () {
  const rgb = h => { h = String(h || '#888').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (c, t) => { const [r, g, b] = rgb(c); return t < 0 ? hex(r * (1 + t), g * (1 + t), b * (1 + t)) : hex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t); };

  // Cada forma devuelve el contenido del SVG (viewBox 0 0 200 240) usando: f = relleno, d = trazo/sombra, l = luz
  const S = {
    tee: (f, d, l) => `<path d="M62 30 L86 20 Q100 38 114 20 L138 30 L176 64 L152 88 L140 76 L140 212 L60 212 L60 76 L48 88 L24 64 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M86 20 Q100 38 114 20 Q100 52 86 20Z" fill="${d}" opacity=".35"/><path d="M60 76 L60 212 L80 212 L80 90 Z" fill="${l}" opacity=".25"/><path d="M140 76 L140 212 L122 212 L122 100Z" fill="${d}" opacity=".12"/>`,
    hoodie: (f, d, l) => `<path d="M58 52 L84 38 Q100 58 116 38 L142 52 L180 134 L154 146 L140 112 L140 216 L60 216 L60 112 L46 146 L20 134 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M84 38 Q100 8 116 38 Q100 66 84 38Z" fill="${d}" opacity=".3" stroke="${d}" stroke-width="2"/><path d="M92 62 L90 96 M108 62 L110 96" stroke="${l}" stroke-width="3" stroke-linecap="round"/><path d="M76 152 h48 l10 34 h-68 z" fill="${d}" opacity=".18" stroke="${d}" stroke-width="1.5"/><rect x="60" y="204" width="80" height="12" fill="${d}" opacity=".2"/>`,
    dress: (f, d, l) => `<path d="M78 22 L92 22 Q100 42 108 22 L122 22 L130 92 L164 218 L36 218 L70 92 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M70 92 Q100 104 130 92" fill="none" stroke="${d}" stroke-width="2"/><rect x="68" y="88" width="64" height="8" rx="2" fill="${d}" opacity=".3"/><path d="M76 218 L88 120 M124 218 L112 120 M100 218 L100 112" stroke="${d}" stroke-width="1.4" opacity=".4"/><path d="M36 218 L164 218" stroke="${l}" stroke-width="3" opacity=".5"/>`,
    pants: (f, d, l) => `<path d="M60 22 L140 22 L148 218 L108 218 L100 92 L92 218 L52 218 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><rect x="60" y="22" width="80" height="14" fill="${d}" opacity=".3"/><path d="M100 36 L100 92" stroke="${d}" stroke-width="2"/><path d="M66 40 Q78 50 88 40 M134 40 Q122 50 112 40" fill="none" stroke="${l}" stroke-width="2" stroke-dasharray="3 3"/><path d="M52 218 L92 218 M108 218 L148 218" stroke="${l}" stroke-width="3" opacity=".5"/>`,
    jacket: (f, d, l) => `<path d="M56 34 L86 22 L100 42 L114 22 L144 34 L182 152 L158 160 L142 102 L142 216 L58 216 L58 102 L42 160 L18 152 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M86 22 L100 60 L114 22 L100 42Z" fill="${d}" opacity=".35"/><path d="M100 60 L100 216" stroke="${d}" stroke-width="2"/><path d="M68 140 h22 v28 h-22z M110 140 h22 v28 h-22z" fill="none" stroke="${d}" stroke-width="1.6"/><circle cx="96" cy="100" r="2.4" fill="${l}"/><circle cx="96" cy="130" r="2.4" fill="${l}"/><circle cx="96" cy="160" r="2.4" fill="${l}"/>`,
    sneaker: (f, d, l) => `<g transform="translate(0 18)"><path d="M14 150 Q18 96 66 98 L98 122 Q132 134 172 138 Q192 142 192 162 L192 176 L14 176 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M14 162 L192 162 L192 180 Q192 188 184 188 L22 188 Q14 188 14 180 Z" fill="${l}" stroke="${d}" stroke-width="2"/><path d="M66 98 Q84 94 98 122 L66 120 Z" fill="${d}" opacity=".25"/><path d="M84 118 l16 -6 M92 128 l16 -6 M100 136 l16 -6" stroke="${l}" stroke-width="3" stroke-linecap="round"/><path d="M14 150 Q60 146 98 150" stroke="${d}" stroke-width="1.6" fill="none" opacity=".5"/></g>`,
    bottle: (f, d, l) => `<rect x="86" y="18" width="28" height="24" rx="4" fill="${d}" opacity=".85"/><path d="M90 42 h20 v18 q26 10 26 44 v100 q0 14 -14 14 h-44 q-14 0 -14 -14 v-100 q0 -34 26 -44 z" fill="${f}" stroke="${d}" stroke-width="2"/><rect x="74" y="110" width="52" height="64" rx="4" fill="${l}" opacity=".75"/><path d="M82 128 h36 M82 142 h26 M82 156 h32" stroke="${d}" stroke-width="2" opacity=".5"/>`,
    jar: (f, d, l) => `<rect x="52" y="60" width="96" height="34" rx="6" fill="${d}" opacity=".9"/><rect x="46" y="94" width="108" height="100" rx="12" fill="${f}" stroke="${d}" stroke-width="2"/><rect x="62" y="118" width="76" height="44" rx="4" fill="${l}" opacity=".75"/><path d="M70 134 h60 M70 146 h40" stroke="${d}" stroke-width="2" opacity=".5"/>`,
    mug: (f, d, l) => `<path d="M46 72 h92 v96 q0 26 -26 26 h-40 q-26 0 -26 -26 z" fill="${f}" stroke="${d}" stroke-width="2"/><path d="M138 94 h14 q22 0 22 26 t-22 26 h-14" fill="none" stroke="${d}" stroke-width="10" stroke-linecap="round"/><ellipse cx="92" cy="72" rx="46" ry="8" fill="${d}" opacity=".35"/><path d="M60 100 v60" stroke="${l}" stroke-width="6" opacity=".45" stroke-linecap="round"/>`,
    lamp: (f, d, l) => `<path d="M62 40 h76 l22 74 h-120 z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M80 40 L72 114 M120 40 L128 114" stroke="${l}" stroke-width="2" opacity=".5"/><rect x="96" y="114" width="8" height="82" fill="${d}"/><ellipse cx="100" cy="204" rx="38" ry="10" fill="${d}"/>`,
    vase: (f, d, l) => `<path d="M84 26 h32 q-6 26 14 52 q30 40 10 92 q-4 26 -40 26 t-40 -26 q-20 -52 10 -92 q20 -26 14 -52z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M76 120 Q100 136 124 120" fill="none" stroke="${l}" stroke-width="3" opacity=".6"/><path d="M100 26 q-6 -18 -24 -22 M100 26 q8 -20 28 -20" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    bag: (f, d, l) => `<path d="M72 78 Q72 30 100 30 t28 48" fill="none" stroke="${d}" stroke-width="6" stroke-linecap="round"/><path d="M40 78 h120 l12 130 h-144 z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><rect x="74" y="120" width="52" height="34" rx="3" fill="${l}" opacity=".6"/><path d="M40 78 L172 208" stroke="${d}" stroke-width="0"/>`,
    glove: (f, d, l) => `<path d="M58 118 Q46 56 100 46 Q154 44 156 102 L156 152 Q156 186 122 192 L84 192 Q58 188 58 150 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M142 112 Q178 106 176 138 Q172 164 142 154 Z" fill="${f}" stroke="${d}" stroke-width="2.4"/><rect x="66" y="192" width="80" height="32" rx="5" fill="${l}" stroke="${d}" stroke-width="2.4"/><path d="M74 208 h64" stroke="${d}" stroke-width="2" opacity=".5"/><path d="M78 88 Q104 70 130 88" fill="none" stroke="${l}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`,
    bagpunch: (f, d, l) => `<path d="M100 14 V40 M100 40 L76 66 M100 40 L124 66" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="66" y="62" width="68" height="148" rx="16" fill="${f}" stroke="${d}" stroke-width="2.4"/><rect x="66" y="92" width="68" height="14" fill="${d}" opacity=".35"/><rect x="66" y="166" width="68" height="14" fill="${d}" opacity=".35"/><path d="M80 74 v124" stroke="${l}" stroke-width="5" opacity=".5" stroke-linecap="round"/>`,
    dumbbell: (f, d, l) => `<rect x="44" y="114" width="112" height="12" rx="4" fill="${d}"/><rect x="22" y="80" width="22" height="80" rx="6" fill="${f}" stroke="${d}" stroke-width="2.4"/><rect x="44" y="92" width="14" height="56" rx="4" fill="${l}" stroke="${d}" stroke-width="2.4"/><rect x="156" y="80" width="22" height="80" rx="6" fill="${f}" stroke="${d}" stroke-width="2.4"/><rect x="142" y="92" width="14" height="56" rx="4" fill="${l}" stroke="${d}" stroke-width="2.4"/>`,
    cup: (f, d, l) => `<path d="M46 92 h96 v58 q0 38 -40 38 h-16 q-40 0 -40 -38 z" fill="${f}" stroke="${d}" stroke-width="2.4"/><path d="M142 104 h10 q22 0 22 24 t-22 24 h-12" fill="none" stroke="${d}" stroke-width="9" stroke-linecap="round"/><ellipse cx="94" cy="92" rx="48" ry="9" fill="${d}" opacity=".4"/><ellipse cx="96" cy="214" rx="72" ry="9" fill="${l}" stroke="${d}" stroke-width="2"/><path d="M76 70 q-10 -14 0 -28 M100 72 q-10 -14 0 -28 M122 70 q-10 -14 0 -28" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`,
    dish: (f, d, l) => `<circle cx="100" cy="124" r="82" fill="${l}" stroke="${d}" stroke-width="2.4"/><circle cx="100" cy="124" r="58" fill="${f}" stroke="${d}" stroke-width="2.4"/><path d="M74 112 q14 -16 28 0 t26 6" fill="none" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".7"/><circle cx="90" cy="138" r="8" fill="${d}" opacity=".3"/><circle cx="116" cy="140" r="6" fill="${d}" opacity=".3"/>`,
    house: (f, d, l) => `<path d="M24 112 L100 44 L176 112 V204 H24 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 116 L100 38 L184 116" fill="none" stroke="${d}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="82" y="142" width="36" height="62" rx="3" fill="${d}" opacity=".6"/><rect x="40" y="124" width="28" height="28" fill="${l}" stroke="${d}" stroke-width="2"/><rect x="132" y="124" width="28" height="28" fill="${l}" stroke="${d}" stroke-width="2"/>`,
    key: (f, d, l) => `<circle cx="62" cy="96" r="44" fill="${f}" stroke="${d}" stroke-width="2.4"/><circle cx="62" cy="96" r="16" fill="${l}" stroke="${d}" stroke-width="2.4"/><rect x="100" y="88" width="84" height="16" rx="5" fill="${f}" stroke="${d}" stroke-width="2.4"/><path d="M150 104 v26 M170 104 v18" stroke="${d}" stroke-width="10" stroke-linecap="round"/>`,
    plane: (f, d, l) => `<path d="M18 120 L182 40 L138 196 L98 140 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M98 140 L182 40 M98 140 L104 184 L132 160" fill="none" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M98 140 L138 196 L104 184 Z" fill="${l}" opacity=".6"/>`,
    mountain: (f, d, l) => `<path d="M10 200 L78 66 L124 150 L150 106 L192 200 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M78 66 L58 108 L72 100 L84 114 L96 98 Z" fill="${l}"/><circle cx="160" cy="52" r="18" fill="${l}" stroke="${d}" stroke-width="2"/>`,
    book: (f, d, l) => `<path d="M100 66 Q60 44 20 58 V176 Q60 162 100 184 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M100 66 Q140 44 180 58 V176 Q140 162 100 184 Z" fill="${l}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M36 84 Q64 76 88 90 M36 106 Q64 98 88 112 M112 90 Q136 76 164 84 M112 112 Q136 98 164 106" fill="none" stroke="${d}" stroke-width="2" opacity=".5"/>`,
    laptop: (f, d, l) => `<rect x="34" y="62" width="132" height="92" rx="8" fill="${f}" stroke="${d}" stroke-width="2.4"/><rect x="44" y="72" width="112" height="72" rx="3" fill="${l}" stroke="${d}" stroke-width="1.6"/><path d="M54 92 h46 M54 108 h64 M54 124 h34" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".6"/><path d="M14 162 h172 l-14 18 H28 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/>`,
    heart: (f, d, l) => `<path d="M100 188 C30 140 18 98 40 74 C60 54 88 62 100 86 C112 62 140 54 160 74 C182 98 170 140 100 188 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M52 88 Q60 76 76 78" fill="none" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
    tree: (f, d, l) => `<rect x="90" y="132" width="20" height="82" rx="4" fill="${d}" opacity=".8"/><circle cx="100" cy="86" r="56" fill="${f}" stroke="${d}" stroke-width="2.4"/><circle cx="66" cy="110" r="30" fill="${f}" stroke="${d}" stroke-width="2.4"/><circle cx="136" cy="108" r="32" fill="${f}" stroke="${d}" stroke-width="2.4"/><path d="M80 70 q10 -14 24 -6" fill="none" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`,
    tooth: (f, d, l) => `<path d="M56 56 C56 38 88 34 100 46 C112 34 144 38 144 56 C144 94 130 102 128 142 C126 192 112 210 104 162 C102 148 98 148 96 162 C88 210 74 192 72 142 C70 102 56 94 56 56 Z" fill="${l}" stroke="${d}" stroke-width="2.6" stroke-linejoin="round"/><path d="M72 62 Q80 52 92 58" fill="none" stroke="${f}" stroke-width="6" stroke-linecap="round" opacity=".8"/>`,
    cross: (f, d, l) => `<rect x="30" y="50" width="140" height="140" rx="26" fill="${f}" stroke="${d}" stroke-width="2.4"/><path d="M88 76h24v34h34v24h-34v34H88v-34H54v-24h34z" fill="${l}" stroke="${d}" stroke-width="1.6" stroke-linejoin="round"/>`,
    trophy: (f, d, l) => `<path d="M62 40 h76 v52 q0 40 -38 46 q-38 -6 -38 -46 z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M62 54 q-28 0 -28 26 q0 22 30 26 M138 54 q28 0 28 26 q0 22 -30 26" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round"/><rect x="92" y="138" width="16" height="36" fill="${d}" opacity=".8"/><rect x="66" y="174" width="68" height="18" rx="4" fill="${l}" stroke="${d}" stroke-width="2.4"/><path d="M78 56 v34" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`,
    clock: (f, d, l) => `<circle cx="100" cy="120" r="76" fill="${l}" stroke="${d}" stroke-width="3"/><circle cx="100" cy="120" r="64" fill="${f}" opacity=".35"/><path d="M100 120 V72 M100 120 L132 138" stroke="${d}" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="120" r="6" fill="${d}"/><path d="M100 52 v6 M100 182 v6 M32 120 h6 M162 120 h6" stroke="${d}" stroke-width="4" stroke-linecap="round"/>`,
    phone: (f, d, l) => `<rect x="58" y="22" width="84" height="196" rx="16" fill="${f}" stroke="${d}" stroke-width="2.6"/><rect x="66" y="44" width="68" height="148" rx="4" fill="${l}" stroke="${d}" stroke-width="1.6"/><circle cx="100" cy="206" r="6" fill="${d}" opacity=".6"/><path d="M76 66 h48 M76 84 h34 M76 102 h42" stroke="${d}" stroke-width="3" stroke-linecap="round" opacity=".5"/>`,
    camera: (f, d, l) => `<path d="M28 76 h34 l10 -16 h56 l10 16 h34 v110 H28 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="100" cy="128" r="36" fill="${l}" stroke="${d}" stroke-width="2.6"/><circle cx="100" cy="128" r="20" fill="${d}" opacity=".7"/><circle cx="162" cy="92" r="5" fill="${l}"/>`,
    paw: (f, d, l) => `<ellipse cx="100" cy="150" rx="44" ry="36" fill="${f}" stroke="${d}" stroke-width="2.4"/><ellipse cx="44" cy="108" rx="16" ry="22" fill="${f}" stroke="${d}" stroke-width="2.4" transform="rotate(-20 44 108)"/><ellipse cx="80" cy="74" rx="16" ry="23" fill="${f}" stroke="${d}" stroke-width="2.4" transform="rotate(-6 80 74)"/><ellipse cx="120" cy="74" rx="16" ry="23" fill="${f}" stroke="${d}" stroke-width="2.4" transform="rotate(6 120 74)"/><ellipse cx="156" cy="108" rx="16" ry="22" fill="${f}" stroke="${d}" stroke-width="2.4" transform="rotate(20 156 108)"/>`,
    wrench: (f, d, l) => `<path d="M150 30 a36 36 0 0 0 -44 46 L34 148 a16 16 0 0 0 22 22 L128 98 a36 36 0 0 0 46 -44 l-26 26 l-22 -6 l-6 -22 z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="46" cy="160" r="5" fill="${l}"/>`,
    globe: (f, d, l) => `<circle cx="100" cy="120" r="78" fill="${f}" stroke="${d}" stroke-width="2.6"/><ellipse cx="100" cy="120" rx="34" ry="78" fill="none" stroke="${d}" stroke-width="2.2" opacity=".6"/><path d="M22 120 h156 M34 82 h132 M34 158 h132" fill="none" stroke="${d}" stroke-width="2.2" opacity=".6"/><path d="M60 70 q20 10 30 -6 q14 18 -4 30 q-22 -2 -26 -24z" fill="${l}" opacity=".7"/>`,
    star: (f, d, l) => `<path d="M100 28 L122 88 L186 92 L136 132 L154 194 L100 158 L46 194 L64 132 L14 92 L78 88 Z" fill="${f}" stroke="${d}" stroke-width="2.6" stroke-linejoin="round"/><path d="M100 52 L112 92" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".6"/>`,
    cart: (f, d, l) => `<path d="M18 40 h30 l24 100 h92 l16 -70 H58" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M58 70 H170 l-16 70 H72 Z" fill="${f}" opacity=".9"/><circle cx="84" cy="172" r="14" fill="${l}" stroke="${d}" stroke-width="4"/><circle cx="148" cy="172" r="14" fill="${l}" stroke="${d}" stroke-width="4"/>`,
    music: (f, d, l) => `<path d="M76 158 V52 L158 34 V140" fill="none" stroke="${d}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/><path d="M76 70 L158 52" stroke="${d}" stroke-width="10"/><ellipse cx="58" cy="164" rx="26" ry="20" fill="${f}" stroke="${d}" stroke-width="2.6"/><ellipse cx="140" cy="146" rx="26" ry="20" fill="${f}" stroke="${d}" stroke-width="2.6"/>`,
    scissors: (f, d, l) => `<path d="M60 20 L138 160 M140 20 L62 160" stroke="${d}" stroke-width="9" stroke-linecap="round"/><circle cx="56" cy="184" r="22" fill="none" stroke="${f}" stroke-width="10"/><circle cx="144" cy="184" r="22" fill="none" stroke="${f}" stroke-width="10"/><circle cx="100" cy="90" r="7" fill="${l}" stroke="${d}" stroke-width="2"/>`,
    car: (f, d, l) => `<path d="M14 150 l16 -46 q6 -16 24 -16 h92 q18 0 26 16 l18 46 v30 H14 Z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M48 102 h104 l12 38 H34 z" fill="${l}" opacity=".7"/><circle cx="58" cy="182" r="18" fill="${d}"/><circle cx="142" cy="182" r="18" fill="${d}"/><circle cx="58" cy="182" r="7" fill="${l}"/><circle cx="142" cy="182" r="7" fill="${l}"/>`,
    bell: (f, d, l) => `<path d="M100 28 a14 14 0 0 1 14 14 q46 12 46 70 l14 40 H26 l14 -40 q0 -58 46 -70 a14 14 0 0 1 14 -14z" fill="${f}" stroke="${d}" stroke-width="2.4" stroke-linejoin="round"/><path d="M84 168 a16 16 0 0 0 32 0" fill="${d}"/><path d="M68 84 q6 -16 22 -20" fill="none" stroke="${l}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`,
    ball: (f, d, l) => `<circle cx="100" cy="120" r="78" fill="${l}" stroke="${d}" stroke-width="2.6"/><path d="M100 86 L132 110 L120 148 H80 L68 110 Z" fill="${d}"/><path d="M100 86 V42 M132 110 L172 96 M120 148 L146 184 M80 148 L54 184 M68 110 L28 96" stroke="${d}" stroke-width="2.6" fill="none"/><path d="M100 42 L70 52 M100 42 L130 52 M172 96 L174 130 M146 184 L112 196 M54 184 L88 196 M28 96 L26 130" stroke="${f}" stroke-width="3" fill="none" opacity=".8"/>`,
    flower: (f, d, l) => `<path d="M100 122 V214" stroke="${d}" stroke-width="6" stroke-linecap="round"/><path d="M100 176 q-36 -6 -38 -40 q34 4 38 40 M100 190 q34 -4 40 -34 q-34 2 -40 34" fill="${l}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round"/><g fill="${f}" stroke="${d}" stroke-width="2.2">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="100" cy="68" rx="18" ry="30" transform="rotate(${a} 100 100)"/>`).join('')}</g><circle cx="100" cy="100" r="16" fill="${l}" stroke="${d}" stroke-width="2.4"/>`,
    box: (f, d, l) => `<path d="M100 40 L170 70 L170 160 L100 192 L30 160 L30 70 Z" fill="${f}" stroke="${d}" stroke-width="2" stroke-linejoin="round"/><path d="M100 40 L100 192 M30 70 L100 100 L170 70" fill="none" stroke="${d}" stroke-width="2"/><path d="M100 100 L170 70 L170 160 L100 192Z" fill="${d}" opacity=".18"/><path d="M78 48 L148 78" stroke="${l}" stroke-width="6" opacity=".6"/>`
  };
  const LABEL = { tee: 'Camiseta', hoodie: 'Sudadera', dress: 'Vestido', pants: 'Pantalón', jacket: 'Chaqueta', sneaker: 'Zapatilla', bottle: 'Frasco', jar: 'Crema', mug: 'Taza', lamp: 'Lámpara', vase: 'Jarrón', bag: 'Bolso', box: 'Caja', trophy: 'Trofeo', ball: 'Balón', flower: 'Flor', clock: 'Reloj', phone: 'Móvil', camera: 'Cámara', paw: 'Mascotas', wrench: 'Taller', globe: 'Mundo', star: 'Estrella', cart: 'Carrito', music: 'Música', scissors: 'Tijeras', car: 'Coche', bell: 'Aviso', glove: 'Guantes', bagpunch: 'Saco', dumbbell: 'Pesas', cup: 'Café', dish: 'Plato', house: 'Casa', key: 'Llaves', plane: 'Vuelo', mountain: 'Montaña', book: 'Libro', laptop: 'Portátil', heart: 'Cuidado', tree: 'Árbol', tooth: 'Diente', cross: 'Salud' };

  // Nombres alternativos que la IA suele inventar → forma real (nunca se sustituye por una camiseta)
  const ALIAS = { shirt: 'tee', tshirt: 'tee', 't-shirt': 'tee', polo: 'tee', camiseta: 'tee', camisa: 'tee', jersey: 'hoodie', sweater: 'hoodie', skirt: 'dress', jeans: 'pants', trousers: 'pants', coat: 'jacket', shoe: 'sneaker', shoes: 'sneaker', boxing_glove: 'glove', boxingglove: 'glove', gloves: 'glove', guante: 'glove', bag_punch: 'bagpunch', punchingbag: 'bagpunch', sandbag: 'bagpunch', weights: 'dumbbell', weight: 'dumbbell', barbell: 'dumbbell', coffee: 'cup', mug_hot: 'cup', plate: 'dish', food: 'dish', meal: 'dish', home: 'house', building: 'house', apartment: 'house', keys: 'key', airplane: 'plane', flight: 'plane', mountains: 'mountain', hike: 'mountain', books: 'book', education: 'book', computer: 'laptop', code: 'laptop', love: 'heart', health: 'heart', plant: 'tree', leaf: 'tree', forest: 'tree', medal: 'trophy', soccer: 'ball', soccer_ball: 'ball', football: 'ball', basketball: 'ball', sport: 'ball', flowers: 'flower', rose: 'flower', bouquet: 'flower', award: 'trophy', cup_trophy: 'trophy', time: 'clock', mobile: 'phone', smartphone: 'phone', photo: 'camera', dog: 'paw', cat: 'paw', pet: 'paw', tools: 'wrench', tool: 'wrench', world: 'globe', earth: 'globe', favorite: 'star', shopping: 'cart', basket: 'cart', guitar: 'music', note: 'music', hair: 'scissors', haircut: 'scissors', vehicle: 'car', auto: 'car', notification: 'bell' };
  const norm = t => String(t || '').toLowerCase().replace(/[^a-z_\-]/g, '');

  function render(type, color, o) {
    o = o || {};
    const key = S[norm(type)] ? norm(type) : (ALIAS[norm(type)] || null);
    const f = color || '#c9a66b', d = shade(f, -0.42), l = shade(f, 0.45);
    if (!key) {   // tipo desconocido: un recuadro neutro con su nombre, NUNCA una prenda de otro sector
      const name = (o.label || String(type || 'Imagen')).replace(/[<>&"]/g, '').slice(0, 18);
      return `<svg class="lf-shape" viewBox="0 0 200 240" role="img" aria-label="${name}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto"><rect x="24" y="44" width="152" height="152" rx="22" fill="${l}" stroke="${d}" stroke-width="2.4" stroke-dasharray="8 7"/><path d="M100 80 l14 30 32 4 -24 22 7 32 -29 -17 -29 17 7 -32 -24 -22 32 -4z" fill="${f}" stroke="${d}" stroke-width="2.2" stroke-linejoin="round" opacity=".9"/><text x="100" y="214" text-anchor="middle" font-size="14" font-family="system-ui,sans-serif" fill="${d}">${name}</text></svg>`;
    }
    const label = o.label || LABEL[key] || 'Producto';
    return `<svg class="lf-shape" viewBox="0 0 200 240" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto">${S[key](f, d, l)}</svg>`;
  }
  return { render, list: Object.keys(S), label: t => LABEL[t] || t, shade };
})();

LF.verticals = (function () {
  const clean = s => String(s || '').trim();
  const pick = (b, re) => re.test([b.tema, b.marca, b.propuesta, b.beneficios, b.publico].join(' '));

  /* Cada imageSlot: use (dónde va), section, w/h (px), en (sujeto en inglés; los parámetros los añade prompts.js) */
  const PACKS = [
    {
      id: 'fashion', label: 'Tienda de ropa y moda', kind: 'catalog',
      industries: ['Tienda de ropa / Moda', 'Moda y lujo', 'Calzado y accesorios'],
      re: /\b(ropa|prendas?|camisetas?|camisas?|vestidos?|jeans?|pantalon(?:es)?|sudaderas?|chaquetas?|abrigos?|outfits?|boutiques?|moda|zapatillas?|calzado|sneakers?|faldas?|blusas?|streetwear|lencer[ií]a|colecci[oó]n de temporada|atuendos?)\b/i,
      what: 'prendas y accesorios de moda',
      show: [
        'Prendas reales y reconocibles: siluetas o fotografías claras de camisetas, sudaderas, vestidos, jeans, chaquetas y calzado; nunca formas geométricas abstractas.',
        'Rejilla de productos con foto de la prenda, nombre, precio, colores disponibles (puntos de color) y una etiqueta (Nuevo, Más vendido…).',
        'Selector de tallas (XS · S · M · L · XL) y botón «Añadir a la bolsa» en la ficha de producto destacada.',
        'Hero de campaña tipo lookbook: la prenda o el modelo vistiéndola es la protagonista.',
        'Bolsa de compra con contador en la cabecera y barra de anuncios (envío, cambios).',
        'Detalles de tejido y confección (composición, cuidados, costuras) y una guía de tallas.'
      ],
      never: ['dashboards, KPIs, métricas «en vivo» o gráficos de barras', 'ventanas de software o mockups de app', 'iconos de cohete, rayos o bombilla', 'círculos y cuadros abstractos como sustituto de las fotos de producto'],
      sections: [
        { id: 'anuncio', name: 'Cabecera con barra de anuncios', purpose: 'orientar y dar confianza desde el primer píxel', content: 'mensaje de envío y cambios, logo, menú (Mujer · Hombre · Novedades · Ofertas) y bolsa con contador', visual: 'barra fina de color de acento', core: true },
        { id: 'hero', name: 'Hero de campaña (lookbook)', purpose: 'enamorar con la prenda y llevar a la colección', content: 'titular corto de temporada, una línea de apoyo y CTA «Ver colección»', visual: 'foto de editorial con modelo vistiendo la prenda, o silueta grande de la prenda protagonista', core: true },
        { id: 'categorias', name: 'Categorías', purpose: 'dejar elegir en un clic', content: '3 tarjetas grandes (Mujer, Hombre, Accesorios o Calzado) con nombre y flecha', visual: 'una foto o silueta distinta por categoría' },
        { id: 'productos', name: 'Lo más vendido / Nueva colección', purpose: 'mostrar producto y activar la compra', content: '6 a 8 productos: nombre, precio, colores disponibles, etiqueta y botón «Añadir»', visual: 'fotos o siluetas de prendas distintas (camiseta, sudadera, vestido, jean, chaqueta, calzado)', core: true },
        { id: 'ficha', name: 'Producto destacado', purpose: 'resolver dudas de compra sin salir de la página', content: 'nombre, precio, selector de colores, selector de tallas, composición y cuidados, guía de tallas y botón «Añadir a la bolsa»', visual: 'prenda grande con miniaturas de detalle', core: true },
        { id: 'tejido', name: 'Materiales y confección', purpose: 'justificar precio y calidad', content: '3 puntos: tejido, costuras/hechura y origen o cuidado, con datos concretos', visual: 'macro del tejido y del acabado' },
        { id: 'lookbook', name: 'Lookbook / comunidad', purpose: 'inspirar combinaciones y dar prueba social', content: 'rejilla de 6 estilismos con la prenda vestida', visual: 'fotos tipo red social con proporciones variadas' },
        { id: 'resenas', name: 'Reseñas de compradores', purpose: 'reducir el miedo a la talla', content: 'estrellas, comentario corto, talla comprada y cómo le quedó', visual: 'tarjetas con la talla como dato destacado' },
        { id: 'logistica', name: 'Envíos, cambios y pago', purpose: 'eliminar objeciones logísticas', content: '4 iconos: envío, cambios y devoluciones, pago seguro, guía de tallas', visual: 'iconos lineales simples' },
        { id: 'newsletter', name: 'Newsletter con código de bienvenida', purpose: 'capturar el contacto', content: 'una línea de beneficio y un único campo de correo', visual: 'bloque de color sólido', core: true },
        { id: 'pie', name: 'Pie de página', purpose: 'cerrar con navegación y confianza', content: 'categorías, atención al cliente, redes y métodos de pago', visual: 'discreto', core: true }
      ],
      shapes: ['tee', 'hoodie', 'dress', 'pants', 'jacket', 'sneaker'],
      shapeKeys: { tee: /camiset|camisa|polo|top\b/i, hoodie: /sudader|hoodie|buzo/i, dress: /vestid|falda/i, pants: /jean|pantal|denim/i, jacket: /chaquet|abrig|cazadora|blazer/i, sneaker: /zapat|tenis|sneaker|calzado/i },
      productNames: { tee: 'Camiseta oversize', hoodie: 'Sudadera con capucha', dress: 'Vestido midi', pants: 'Jean recto', jacket: 'Chaqueta ligera', sneaker: 'Zapatillas urbanas' },
      swatches: true, sizes: ['XS', 'S', 'M', 'L', 'XL'],
      steps: ['Elige tu prenda y tu talla', 'Paga seguro en un solo paso', 'Recíbela y cámbiala si no te queda'],
      tiles: [['Mujer', 'dress'], ['Hombre', 'jacket'], ['Calzado', 'sneaker']],
      facts: [['Envío', 'Gratis desde el monto que definas'], ['Cambios', 'Sin preguntas en el plazo que definas'], ['Tallas', 'Guía con medidas reales']],
      imageSlots: (b, c) => [
        { use: 'Hero de campaña (lookbook)', section: 'hero', w: 832, h: 1040, en: `Editorial fashion lookbook photograph for a clothing brand (${c.topic}), a model wearing a relaxed-fit outfit in ${c.palette} tones, full-body, soft natural window light, plain muted backdrop, visible fabric texture, 85mm lens, no text, no logos` },
        { use: 'Flat-lay de la colección', section: 'productos', w: 832, h: 1040, en: `Top-down flat-lay product photograph of neatly folded garments (t-shirt, knit sweater, jeans) on a plain warm-toned surface, soft shadows, e-commerce catalog style, ${c.palette} colour story, no text` },
        { use: 'Detalle de tejido y costuras', section: 'tejido', w: 1024, h: 768, en: `Macro close-up of garment fabric and stitching (woven cotton, seam detail, button), shallow depth of field, natural side light, tactile texture, no text` },
        { use: 'Categoría Mujer', section: 'categorias', w: 768, h: 960, en: `Fashion photograph of a woman wearing a midi dress and light jacket, street background softly blurred, natural light, editorial crop, no text` },
        { use: 'Categoría Hombre', section: 'categorias', w: 768, h: 960, en: `Fashion photograph of a man wearing a heavyweight t-shirt, straight jeans and sneakers, plain wall background, natural light, editorial crop, no text` },
        { use: 'Calzado y accesorios', section: 'categorias', w: 768, h: 960, en: `Product photograph of a pair of sneakers and a tote bag on a stone plinth, soft studio light, ${c.palette} background, e-commerce style, no text` },
        { use: 'Estilismo / comunidad', section: 'lookbook', w: 768, h: 960, en: `Candid street-style photograph of a person wearing the brand's clothes walking in the city, film grain, natural imperfect light, not looking at camera` }
      ]
    },
    {
      id: 'beauty', label: 'Belleza y cosmética', kind: 'catalog', industries: ['Belleza y cosmética'],
      re: /\b(cosm[eé]tic[oa]s?|maquillaje|skincare|cuidado de la piel|sérum|serum|perfumes?|cremas?|belleza|labiales?|esmaltes?)\b/i,
      what: 'productos de belleza y cuidado personal',
      show: ['Frascos, cremas y envases reconocibles con etiqueta de marca; nunca formas abstractas.', 'Ficha con ingredientes clave, modo de uso y tipo de piel.', 'Rejilla de productos con precio, formato (ml) y botón «Añadir».', 'Rutina en pasos (limpiar · tratar · hidratar).', 'Reseñas con tipo de piel y resultado en semanas.'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software', 'promesas médicas o resultados garantizados'],
      sections: [
        { id: 'anuncio', name: 'Cabecera', purpose: 'confianza y navegación', content: 'logo, menú (Rostro · Cuerpo · Rutinas) y bolsa', visual: 'discreta', core: true },
        { id: 'hero', name: 'Hero del producto estrella', purpose: 'mostrar el envase y su promesa', content: 'titular sensorial, una línea de beneficio y CTA', visual: 'foto o silueta grande del envase sobre textura de producto', core: true },
        { id: 'productos', name: 'Colección', purpose: 'mostrar la gama', content: '4 a 6 productos con nombre, formato, precio y botón', visual: 'envases distintos y coherentes', core: true },
        { id: 'ingredientes', name: 'Ingredientes y activos', purpose: 'justificar el producto', content: '3 activos con su función en una frase', visual: 'macro de textura y materia prima' },
        { id: 'rutina', name: 'Rutina paso a paso', purpose: 'enseñar el uso', content: '3 pasos numerados con el producto de cada uno', visual: 'envases en secuencia', core: true },
        { id: 'resenas', name: 'Reseñas', purpose: 'prueba social honesta', content: 'comentario, tipo de piel y tiempo de uso', visual: 'tarjetas con estrellas' },
        { id: 'newsletter', name: 'Suscripción', purpose: 'capturar contacto', content: 'un campo de correo y regalo de bienvenida', visual: 'bloque de color', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'enlaces, envíos, contacto', visual: 'discreto', core: true }
      ],
      shapes: ['bottle', 'jar', 'bottle', 'jar'], shapeKeys: {}, productNames: { bottle: 'Sérum concentrado', jar: 'Crema hidratante' }, swatches: false, sizes: [],
      steps: ['Limpia tu piel', 'Aplica el tratamiento', 'Hidrata y protege'], tiles: [['Rostro', 'bottle'], ['Cuerpo', 'jar'], ['Rutinas', 'bottle']],
      facts: [['Piel', 'Testado en todo tipo de piel'], ['Formato', 'Ml y pH claros'], ['Envío', 'Seguimiento incluido']],
      imageSlots: (b, c) => [
        { use: 'Hero del producto', section: 'hero', w: 832, h: 1040, en: `Luxury skincare bottle and jar on a stone surface with a soft shadow, ${c.palette} tones, water droplets, studio product photography, no text, no logo` },
        { use: 'Textura del producto', section: 'ingredientes', w: 1024, h: 768, en: `Macro photograph of a cream swatch and a serum droplet, glossy texture, soft light, ${c.palette} background, no text` },
        { use: 'Rutina', section: 'rutina', w: 1024, h: 576, en: `Three skincare products lined up on a marble tray with a folded towel, morning light, editorial still life, no text` }
      ]
    },
    {
      id: 'home', label: 'Hogar y decoración', kind: 'catalog', industries: ['Hogar y decoración'],
      re: /\b(decoraci[oó]n|muebles?|hogar|l[aá]mparas?|jarrones?|cer[aá]mica|vajilla|interiorismo|sof[aá]s?|textiles? para el hogar)\b/i,
      what: 'objetos y muebles para el hogar',
      show: ['Productos reconocibles (lámparas, jarrones, tazas, textiles) con nombre, medidas, material y precio.', 'Escenas de ambiente: una habitación con el producto en uso.', 'Ficha con dimensiones, materiales y cuidados.', 'Colecciones por estancia (Sala · Cocina · Dormitorio).'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software', 'formas abstractas sin producto'],
      sections: [
        { id: 'anuncio', name: 'Cabecera', purpose: 'navegación y envíos', content: 'logo, menú por estancia y bolsa', visual: 'discreta', core: true },
        { id: 'hero', name: 'Hero de ambiente', purpose: 'vender el estilo de vida', content: 'titular, línea de apoyo y CTA «Ver colección»', visual: 'foto de habitación con el producto protagonista', core: true },
        { id: 'categorias', name: 'Por estancia', purpose: 'orientar la búsqueda', content: '3 tarjetas: Sala, Cocina, Dormitorio', visual: 'una escena por tarjeta' },
        { id: 'productos', name: 'Selección', purpose: 'mostrar el producto', content: '6 productos con nombre, material, medidas y precio', visual: 'objetos sobre fondo limpio', core: true },
        { id: 'materiales', name: 'Materiales y oficio', purpose: 'justificar el precio', content: 'origen, material y cuidados', visual: 'macro del material' },
        { id: 'resenas', name: 'Reseñas', purpose: 'confianza', content: 'comentarios con foto en casa del cliente', visual: 'tarjetas' },
        { id: 'newsletter', name: 'Suscripción', purpose: 'contacto', content: 'un campo de correo', visual: 'bloque de color', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'envíos, devoluciones, contacto', visual: 'discreto', core: true }
      ],
      shapes: ['lamp', 'vase', 'mug', 'bag'], shapeKeys: { lamp: /l[aá]mpar/i, vase: /jarr[oó]n|florero/i, mug: /taza|vajilla|cer[aá]mica/i }, productNames: { lamp: 'Lámpara de mesa', vase: 'Jarrón de cerámica', mug: 'Taza artesanal', bag: 'Cesta de fibra' }, swatches: true, sizes: [],
      steps: ['Elige tu pieza', 'Pago seguro', 'Recíbela embalada con cuidado'], tiles: [['Sala', 'lamp'], ['Cocina', 'mug'], ['Dormitorio', 'vase']],
      facts: [['Material', 'Origen y acabado claros'], ['Medidas', 'Dimensiones reales'], ['Envío', 'Embalaje protegido']],
      imageSlots: (b, c) => [
        { use: 'Hero de ambiente', section: 'hero', w: 1024, h: 768, en: `Warm interior photograph of a living room corner with a ceramic vase, a table lamp and linen textiles, ${c.palette} tones, soft daylight, lifestyle editorial, no text` },
        { use: 'Producto sobre fondo limpio', section: 'productos', w: 832, h: 1040, en: `Product photograph of a handmade ceramic vase on a plain plaster background, soft shadow, ${c.palette} palette, catalog style, no text` },
        { use: 'Material', section: 'materiales', w: 1024, h: 768, en: `Macro photograph of glazed ceramic and linen weave texture, natural side light, no text` }
      ]
    },
    {
      id: 'ecommerce', label: 'Tienda online (producto físico)', kind: 'catalog', industries: ['E-commerce'],
      re: /\b(tienda online|e-?commerce|cat[aá]logo de productos|env[ií]os a domicilio)\b/i,
      what: 'productos físicos vendidos en línea',
      show: ['Productos reconocibles con foto o silueta real del artículo, nombre, precio y botón de compra.', 'Ficha destacada con opciones (color, tamaño) y garantías.', 'Información de envíos, devoluciones y pago seguro.'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software', 'formas abstractas como sustituto del producto'],
      sections: [
        { id: 'anuncio', name: 'Cabecera con anuncio', purpose: 'confianza', content: 'mensaje de envío, logo, menú y carrito', visual: 'barra fina', core: true },
        { id: 'hero', name: 'Hero del producto', purpose: 'mostrar qué se vende', content: 'titular, beneficio principal y CTA', visual: 'producto protagonista en grande', core: true },
        { id: 'productos', name: 'Catálogo destacado', purpose: 'activar la compra', content: '6 productos con nombre, precio y botón', visual: 'un producto reconocible por tarjeta', core: true },
        { id: 'ficha', name: 'Producto destacado', purpose: 'resolver dudas', content: 'opciones, características y garantía', visual: 'producto grande con detalles', core: true },
        { id: 'resenas', name: 'Reseñas', purpose: 'prueba social', content: 'estrellas y comentario', visual: 'tarjetas' },
        { id: 'logistica', name: 'Envíos y devoluciones', purpose: 'quitar objeciones', content: '4 garantías', visual: 'iconos' },
        { id: 'newsletter', name: 'Suscripción', purpose: 'contacto', content: 'un campo de correo', visual: 'bloque de color', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'enlaces y pagos', visual: 'discreto', core: true }
      ],
      shapes: ['bag', 'mug', 'box', 'bottle'], shapeKeys: { bag: /bolso|mochila/i, mug: /taza/i, bottle: /botella|frasco/i, box: /caja|kit/i }, productNames: { bag: 'Bolso de mano', mug: 'Taza de diseño', box: 'Kit de regalo', bottle: 'Botella reutilizable' }, swatches: true, sizes: [],
      steps: ['Elige tu producto', 'Paga seguro', 'Recíbelo con seguimiento'], tiles: [['Novedades', 'bag'], ['Regalos', 'box'], ['Básicos', 'mug']],
      facts: [['Envío', 'Con seguimiento'], ['Devoluciones', 'Plazo claro'], ['Pago', 'Seguro']],
      imageSlots: (b, c) => [
        { use: 'Hero del producto', section: 'hero', w: 832, h: 1040, en: `Clean product photograph of the brand's main product (${c.topic}) on a plain coloured backdrop, soft studio light, ${c.palette} palette, no text` },
        { use: 'Producto en uso', section: 'productos', w: 832, h: 1040, en: `Lifestyle photograph of a person using ${c.topic}, natural light, candid, not looking at camera, no text` }
      ]
    },
    {
      id: 'food', label: 'Restaurante y gastronomía', kind: 'scene', industries: ['Restaurante / Gastronomía'],
      re: /\b(restaurante|men[uú]|platos?|gastronom[ií]a|cafeter[ií]a|panader[ií]a|cocina de autor|bar de tapas|pizzer[ií]a|reserva de mesa)\b/i,
      what: 'comida, carta y reservas',
      show: ['Platos reconocibles con nombre, descripción corta y precio.', 'Carta por secciones (entradas · principales · postres).', 'Horarios, dirección y botón de reserva siempre visibles.', 'Ambiente del local y del equipo.'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software', 'fotos de stock genéricas de comida'],
      sections: [
        { id: 'hero', name: 'Hero con plato protagonista', purpose: 'abrir el apetito', content: 'titular, una línea de concepto y CTA «Reservar mesa»', visual: 'foto del plato estrella', core: true },
        { id: 'carta', name: 'La carta', purpose: 'mostrar qué se come', content: '6 a 8 platos con nombre, descripción y precio', visual: 'lista elegante con un plato destacado', core: true },
        { id: 'concepto', name: 'La historia del lugar', purpose: 'conectar', content: 'quién cocina y de dónde vienen los ingredientes', visual: 'foto del equipo o de los ingredientes' },
        { id: 'ambiente', name: 'El ambiente', purpose: 'vender la experiencia', content: 'tres fotos del local', visual: 'rejilla de fotos' },
        { id: 'resenas', name: 'Lo que dicen', purpose: 'prueba social', content: 'reseñas reales', visual: 'citas' },
        { id: 'reserva', name: 'Reserva y ubicación', purpose: 'convertir', content: 'formulario corto, horarios y dirección', visual: 'formulario + mapa estilizado', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto y redes', visual: 'discreto', core: true }
      ],
      steps: ['Elige fecha y hora', 'Confirmamos tu mesa', 'Ven con hambre'],
      imageSlots: (b, c) => [
        { use: 'Plato protagonista', section: 'hero', w: 1024, h: 768, en: `Overhead food photograph of the signature dish of a restaurant (${c.topic}), rustic table, natural window light, ${c.palette} tones, steam, appetizing, no text` },
        { use: 'Ingredientes', section: 'concepto', w: 832, h: 1040, en: `Hands holding fresh ingredients at a market, natural light, film grain, candid, no text` },
        { use: 'Ambiente del local', section: 'ambiente', w: 1024, h: 768, en: `Interior of a cosy restaurant at dusk, warm pendant lights, empty tables set for dinner, no people, no text` }
      ]
    },
    {
      id: 'travel', label: 'Turismo y viajes', kind: 'scene', industries: ['Turismo / Viajes'],
      re: /\b(viajes?|turismo|tours?|excursi[oó]n|hotel(?:es)?|hospedaje|agencia de viajes|destinos?|escapadas?)\b/i,
      what: 'destinos, experiencias y reservas',
      show: ['Destinos o experiencias concretas con duración, qué incluye y precio desde.', 'Itinerario día a día.', 'Galería del destino.', 'Reserva con fechas.'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software', 'postales de stock genéricas'],
      sections: [
        { id: 'hero', name: 'Hero del destino', purpose: 'provocar el deseo de viajar', content: 'titular evocador y CTA «Ver fechas»', visual: 'fotografía a sangre del paisaje', core: true },
        { id: 'experiencias', name: 'Experiencias', purpose: 'mostrar la oferta', content: '3 a 4 viajes con duración, qué incluye y precio desde', visual: 'tarjeta con foto por experiencia', core: true },
        { id: 'itinerario', name: 'Itinerario', purpose: 'dar certeza', content: 'día 1, 2, 3… en una línea cada uno', visual: 'línea de tiempo' },
        { id: 'galeria', name: 'Galería', purpose: 'inspirar', content: '6 fotos', visual: 'mosaico' },
        { id: 'resenas', name: 'Viajeros', purpose: 'prueba social', content: 'reseñas con destino y fecha', visual: 'citas' },
        { id: 'reserva', name: 'Reserva', purpose: 'convertir', content: 'formulario corto y garantías de cancelación', visual: 'formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto y políticas', visual: 'discreto', core: true }
      ],
      steps: ['Elige tu destino y fechas', 'Reserva con un depósito', 'Viaja sin preocupaciones'],
      imageSlots: (b, c) => [
        { use: 'Hero del destino', section: 'hero', w: 1024, h: 576, en: `Wide cinematic landscape photograph of the destination (${c.topic}) at golden hour, ${c.palette} tones, no people, no text` },
        { use: 'Experiencia', section: 'experiencias', w: 832, h: 1040, en: `Travellers enjoying a local experience (${c.topic}), candid documentary photograph, natural light, no text` }
      ]
    },
    {
      id: 'realestate', label: 'Inmobiliaria', kind: 'scene', industries: ['Inmobiliaria'],
      re: /\b(inmobiliaria|propiedades|apartamentos?|departamentos?|viviendas?|casas en venta|arriendo|alquiler|bienes ra[ií]ces|proyecto residencial)\b/i,
      what: 'inmuebles en venta o alquiler',
      show: ['Tarjetas de inmueble con foto, precio, habitaciones, baños, m² y ubicación.', 'Filtros simples (tipo, zona, precio).', 'Recorrido o galería y plano.', 'Formulario para agendar visita.'],
      never: ['dashboards, KPIs o gráficos de barras', 'ventanas de software'],
      sections: [
        { id: 'hero', name: 'Hero con buscador', purpose: 'empezar la búsqueda', content: 'titular y filtros simples (tipo, zona, precio)', visual: 'fotografía de fachada o interior', core: true },
        { id: 'propiedades', name: 'Propiedades destacadas', purpose: 'mostrar la oferta', content: '3 a 6 inmuebles con precio, habitaciones, baños y m²', visual: 'tarjetas con foto', core: true },
        { id: 'proyecto', name: 'Por qué esta zona', purpose: 'justificar el valor', content: 'servicios cercanos y movilidad', visual: 'mapa estilizado' },
        { id: 'proceso', name: 'Cómo comprar', purpose: 'reducir miedo', content: '3 a 4 pasos', visual: 'pasos numerados' },
        { id: 'resenas', name: 'Clientes', purpose: 'prueba social', content: 'testimonios', visual: 'citas' },
        { id: 'visita', name: 'Agenda una visita', purpose: 'convertir', content: 'formulario corto', visual: 'formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto y avisos legales', visual: 'discreto', core: true }
      ],
      steps: ['Elige el inmueble', 'Agenda tu visita', 'Firma con acompañamiento'],
      imageSlots: (b, c) => [
        { use: 'Fachada o interior', section: 'hero', w: 1024, h: 768, en: `Bright modern apartment living room photograph with large windows, ${c.palette} accents, real-estate listing style, wide angle, no people, no text` },
        { use: 'Propiedad', section: 'propiedades', w: 1024, h: 768, en: `Exterior photograph of a contemporary residential building at golden hour, real-estate style, no text` }
      ]
    },
    {
      id: 'education', label: 'Educación y cursos', kind: 'scene', industries: ['Educación / Cursos'],
      re: /\b(cursos?|clases?|ingl[eé]s|idiomas|matem[aá]ticas|bootcamp|formaci[oó]n|capacitaci[oó]n|talleres?|diplomado|certificaci[oó]n|mentor[ií]a)\b/i,
      what: 'cursos, programas y formación',
      show: ['Temario por módulos con duración y qué se logra en cada uno.', 'Quién enseña (perfil real) y cómo es una clase.', 'Resultados de alumnos y certificación.', 'Fechas, precio y botón de inscripción.'],
      never: ['dashboards de software sin relación con el curso', 'gráficos de barras inventados'],
      sections: [
        { id: 'hero', name: 'Hero con promesa de aprendizaje', purpose: 'decir qué se logra', content: 'titular con resultado y CTA «Inscribirme»', visual: 'persona aprendiendo o material del curso', core: true },
        { id: 'temario', name: 'Temario', purpose: 'dar certeza', content: 'módulos con duración y resultado', visual: 'lista de módulos numerados', core: true },
        { id: 'docente', name: 'Quién enseña', purpose: 'autoridad', content: 'perfil, experiencia y por qué', visual: 'retrato documental' },
        { id: 'metodo', name: 'Cómo se aprende', purpose: 'mostrar la experiencia', content: 'formato, horarios y acompañamiento', visual: 'captura de una clase' },
        { id: 'resultados', name: 'Resultados de alumnos', purpose: 'prueba social', content: 'testimonios y proyectos', visual: 'citas' },
        { id: 'inscripcion', name: 'Inscripción', purpose: 'convertir', content: 'precio, fechas y formulario', visual: 'tarjeta de oferta + formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto y políticas', visual: 'discreto', core: true }
      ],
      steps: ['Reserva tu cupo', 'Recibe el acceso', 'Empieza la primera clase'],
      imageSlots: (b, c) => [
        { use: 'Clase en acción', section: 'hero', w: 1024, h: 768, en: `Documentary photograph of a small group learning in a bright workshop (${c.topic}), natural light, candid, film grain, no text` },
        { use: 'Docente', section: 'docente', w: 768, h: 960, en: `Environmental portrait of a teacher in their workspace, natural light, not posed, no text` }
      ]
    },
    {
      id: 'health', label: 'Salud, bienestar y deporte', kind: 'scene', industries: ['Salud y bienestar', 'Deporte y fitness'],
      re: /\b(f[uú]tbol|baloncesto|veterin[a-z]*|mascotas?|canin[oa]s?|gimnasio|fitness|yoga|pilates|entrenamiento|nutrici[oó]n|cl[ií]nica|terapia|bienestar|fisioterapia|meditaci[oó]n|crossfit|box(?:eo)?|muay thai|artes marciales|kickboxing)\b/i,
      what: 'servicios de salud, bienestar o entrenamiento',
      show: ['Servicios o planes concretos con qué incluyen y precio desde.', 'Horarios o clases.', 'Profesionales con credenciales.', 'Reserva de una primera sesión.'],
      never: ['dashboards de software sin relación', 'promesas médicas o de resultados garantizados'],
      sections: [
        { id: 'hero', name: 'Hero de bienestar', purpose: 'inspirar y dirigir', content: 'titular de beneficio y CTA de primera sesión', visual: 'persona en movimiento, luz natural', core: true },
        { id: 'servicios', name: 'Servicios o planes', purpose: 'mostrar la oferta', content: '3 planes con qué incluyen y precio desde', visual: 'tarjetas con un icono o ilustración del propio deporte o servicio (nunca prendas de ropa ni productos de tienda)', core: true },
        { id: 'equipo', name: 'Profesionales', purpose: 'autoridad', content: 'nombre, credencial y enfoque', visual: 'retratos' },
        { id: 'horarios', name: 'Horarios', purpose: 'reducir fricción', content: 'tabla simple de clases o turnos', visual: 'tabla' },
        { id: 'resenas', name: 'Personas como tú', purpose: 'prueba social', content: 'testimonios sin promesas médicas', visual: 'citas' },
        { id: 'reserva', name: 'Primera sesión', purpose: 'convertir', content: 'formulario corto', visual: 'formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto', visual: 'discreto', core: true }
      ],
      steps: ['Reserva tu primera sesión', 'Conoce a tu profesional', 'Empieza tu plan'],
      imageSlots: (b, c) => [
        { use: 'Persona en movimiento', section: 'hero', w: 1024, h: 768, en: `Documentary photograph of a person stretching in a bright studio (${c.topic}), natural window light, calm, film grain, no text` }
      ]
    },
    {
      id: 'saas', label: 'Software, app y tecnología', kind: 'ui', industries: ['SaaS / Software', 'Fintech / Finanzas', 'Ciberseguridad', 'App móvil', 'Biotecnología / Ciencia'],
      re: /\b(software|saas|app|plataforma|aplicaci[oó]n|app m[oó]vil|factur[a-z]*|crm|erp|gesti[oó]n de|anal[ií]tica|cloud|nube|chatbot|automatiz[a-z]*|herramienta digital|sistema de|dashboard|api|ciberseguridad|automatizaci[oó]n|inteligencia artificial)\b/i,
      what: 'un producto digital',
      show: ['Maquetas de interfaz realistas en HTML y CSS (ventana de app, dashboard, flujo de pasos) con datos creíbles del negocio.', 'Métricas y gráficos solo si tienen sentido para este producto.', 'Prueba social con logos o cifras reales del brief.'],
      never: ['círculos o cuadros abstractos vacíos como maqueta', 'fotos de stock'],
      sections: [
        { id: 'hero', name: 'Hero con el producto en acción', purpose: 'mostrar qué hace', content: 'titular de beneficio, subtítulo y CTA', visual: 'mockup de interfaz', core: true },
        { id: 'prueba', name: 'Prueba social', purpose: 'confianza inmediata', content: 'cifras y logos reales', visual: 'fila discreta' },
        { id: 'beneficios', name: 'Beneficios', purpose: 'explicar el valor', content: '3 beneficios con título y frase', visual: 'componentes de interfaz', core: true },
        { id: 'como', name: 'Cómo funciona', purpose: 'reducir miedo', content: '3 pasos', visual: 'flujo numerado' },
        { id: 'objeciones', name: 'Objeciones resueltas', purpose: 'inoculación', content: 'dudas y respuestas con datos', visual: 'acordeón' },
        { id: 'oferta', name: 'Oferta', purpose: 'empujar la decisión', content: 'precio o prueba gratis', visual: 'tarjeta' },
        { id: 'cta', name: 'Formulario final', purpose: 'convertir', content: 'campos mínimos', visual: 'tarjeta de formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'enlaces legales', visual: 'discreto', core: true }
      ],
      steps: ['Crea tu cuenta', 'Configura lo básico', 'Ve resultados'],
      imageSlots: null
    },
    {
      id: 'service', label: 'Servicios y organizaciones', kind: 'scene', industries: ['Consultoría / Servicios B2B', 'Agencia creativa', 'ONG / Causa social', 'Eventos', 'Otro'],
      re: null,
      what: 'un servicio profesional u organización',
      show: ['Servicios o programas concretos con qué incluyen.', 'Casos o proyectos reales del brief.', 'Personas reales del equipo.', 'Un camino claro para contactar.'],
      never: ['dashboards o KPIs inventados', 'ventanas de software sin relación con el servicio', 'círculos o cuadros abstractos vacíos'],
      sections: [
        { id: 'hero', name: 'Hero con la promesa', purpose: 'decir qué haces y para quién', content: 'titular, subtítulo y CTA', visual: 'foto documental o ilustración propia', core: true },
        { id: 'servicios', name: 'Qué hacemos', purpose: 'mostrar la oferta', content: '3 servicios con resultado', visual: 'bloques', core: true },
        { id: 'casos', name: 'Casos o proyectos', purpose: 'prueba', content: '2 a 3 casos con problema y resultado', visual: 'tarjetas' },
        { id: 'proceso', name: 'Cómo trabajamos', purpose: 'dar certeza', content: '3 a 4 pasos', visual: 'pasos numerados' },
        { id: 'equipo', name: 'Quiénes somos', purpose: 'humanizar', content: 'personas y por qué', visual: 'retratos' },
        { id: 'contacto', name: 'Contacto', purpose: 'convertir', content: 'formulario corto', visual: 'formulario', core: true },
        { id: 'pie', name: 'Pie', purpose: 'cierre', content: 'contacto y redes', visual: 'discreto', core: true }
      ],
      steps: ['Cuéntanos tu caso', 'Te proponemos un plan', 'Empezamos a trabajar'],
      imageSlots: (b, c) => [
        { use: 'Imagen principal', section: 'hero', w: 1024, h: 768, en: `Documentary photograph related to ${c.topic}, natural imperfect light, real environment, film grain, no text` }
      ]
    }
  ];

  /* Motivos visuales propios de cada sector (siluetas disponibles + descripción). El primero que coincida con el brief manda. */
  const MOTIFS = {
    health: [
      { re: /veterin|mascot|perr[oa]s?|gat[oa]s?|canin/i, shapes: ['paw', 'heart', 'cross'], text: 'huellas, mascotas, correas, juguetes y cuidados veterinarios' },
      { re: /f[uú]tbol|baloncesto|b[aá]squet|voley|tenis|p[aá]del|nataci[oó]n|rugby|b[eé]isbol|escuela deportiva|club deportivo/i, shapes: ['ball', 'trophy', 'clock'], text: 'balones, trofeos, petos, conos, canchas y cronómetros' },
      { re: /box|muay|artes marciales|kickbox|pelea|sparring/i, shapes: ['glove', 'bagpunch', 'dumbbell'], text: 'guantes de boxeo, saco de golpeo, vendas, cuerdas de ring, pesas' },
      { re: /yoga|pilates|medit|relaj|bienestar|spa/i, shapes: ['tree', 'heart', 'cup'], text: 'esterillas, hojas, velas, tazas de infusión, postura de yoga' },
      { re: /dent|odont|sonris|ortodon/i, shapes: ['tooth', 'cross', 'heart'], text: 'dientes, sonrisas, instrumental dental, cruz médica' },
      { re: /cl[ií]nic|m[eé]dic|salud|terap|fisio|psic|nutri|doctor|consulta/i, shapes: ['cross', 'heart', 'tree'], text: 'cruz médica, corazón, hojas, consulta, material clínico (nada de pesas ni material deportivo)' },
      { re: /gimnas|fitness|crossfit|entrena|muscul|deport/i, shapes: ['dumbbell', 'heart', 'tree'], text: 'pesas, esterillas, material de entrenamiento' },
      { re: /.*/, shapes: ['heart', 'tree', 'cup'], text: 'elementos de cuidado y bienestar propios del negocio' }
    ],
    food: [{ re: /.*/, shapes: ['dish', 'cup', 'tree'], text: 'platos, tazas, cubiertos, ingredientes y utensilios de cocina' }],
    travel: [{ re: /.*/, shapes: ['mountain', 'plane', 'tree'], text: 'paisajes, mochilas, mapas, avión, senderos y alojamientos del destino' }],
    realestate: [{ re: /.*/, shapes: ['house', 'key', 'tree'], text: 'fachadas, llaves, planos, habitaciones y balcones' }],
    education: [{ re: /.*/, shapes: ['book', 'laptop', 'heart'], text: 'libros, cuadernos, portátiles, pizarras y el material del curso' }],
    service: [
      { re: /mascot|veterin|perr|gat[oa]s?\b|animal/i, shapes: ['paw', 'heart', 'bell'], text: 'huellas, mascotas, correas, juguetes y cuidados veterinarios' },
      { re: /mec[aá]nic|taller|autom[oó]vil|coche|veh[ií]culo|repar/i, shapes: ['car', 'wrench', 'clock'], text: 'coches, llaves inglesas, herramientas, piezas, cronometraje de la reparación' },
      { re: /peluquer|barber|est[eé]tic|u[ñn]as|belleza/i, shapes: ['scissors', 'star', 'heart'], text: 'tijeras, peines, espejos, productos de cuidado' },
      { re: /m[uú]sic|concierto|banda|estudio de grabaci|dj\b|podcast/i, shapes: ['music', 'star', 'bell'], text: 'notas, instrumentos, altavoces, escenarios' },
      { re: /fot[oó]graf|video|v[ií]deo|audiovisual|film/i, shapes: ['camera', 'star', 'clock'], text: 'cámaras, objetivos, carretes, sesiones y sets' },
      { re: /evento|boda|fiesta|congreso|festival/i, shapes: ['star', 'bell', 'clock'], text: 'escenarios, invitaciones, mesas, luces y el programa del evento' },
      { re: /flor|florer[ií]a|jard[ií]n|vivero|plantas/i, shapes: ['flower', 'tree', 'heart'], text: 'flores, ramos, macetas, hojas y herramientas de jardinería' },
      { re: /reforest|[aá]rbol|ambient|ecolog|natural|conserv/i, shapes: ['tree', 'heart', 'mountain'], text: 'árboles, hojas, comunidades locales, herramientas de campo' },
      { re: /consult|proceso|empresa|estrategia|agencia|dise[nñ]o/i, shapes: ['book', 'laptop', 'key'], text: 'documentos, pizarras, portátiles y herramientas del oficio' },
      { re: /.*/, shapes: ['star', 'globe', 'clock'], text: 'iconos sencillos y neutros del servicio (nada de productos de tienda)' }
    ]
  };
  function motifs(pack, b) {
    const list = MOTIFS[pack.id];
    if (!list) return null;
    const text = [b.tema, b.propuesta, b.beneficios, b.marca, b.publico].join(' ');
    return list.find(m => m.re.test(text));
  }

  const GENERIC_INDUSTRIES = ['', 'SaaS / Software', 'Otro', 'E-commerce'];

  /* Elige el pack: el sector elegido manda; si sigue en el valor por defecto, manda lo que diga el tema */
  function detect(b) {
    b = b || {};
    const ind = clean(b.industria);
    const byIndustry = PACKS.find(p => p.industries.includes(ind));
    if (byIndustry && !GENERIC_INDUSTRIES.includes(ind)) return byIndustry;   // el sector elegido manda
    // Sector por defecto/genérico: decide lo que dice el brief. Se puntúa cada pack: el tema y la marca pesan más que el resto.
    const count = (re, t) => (String(t || '').match(new RegExp(re.source, 'gi')) || []).length;
    let best = null, bestScore = 0;
    PACKS.forEach(p => {
      if (!p.re) return;
      const sc = (p.id === 'saas' ? 1.5 : 1) * (4 * count(p.re, b.tema) + 2 * count(p.re, b.marca) + 2 * count(p.re, b.propuesta) + count(p.re, b.beneficios) + count(p.re, b.publico));
      if (sc > bestScore) { best = p; bestScore = sc; }
    });
    if (best) return best;
    if (ind === 'E-commerce') return byIndustry;                 // tienda online sin más pistas
    return PACKS[PACKS.length - 1];                              // sin pistas claras: servicios (neutro), nunca maquetas de software por defecto
  }
  const get = id => PACKS.find(p => p.id === id);

  /* Productos de muestra para catálogos (el motor local y el prompt los usan) */
  function products(pack, b, n) {
    n = n || 6;
    if (pack.kind !== 'catalog') return [];
    const text = [b.tema, b.propuesta, b.beneficios, b.marca].join(' ');
    const mentioned = pack.shapes.filter((s, i, a) => a.indexOf(s) === i && pack.shapeKeys[s] && pack.shapeKeys[s].test(text));
    const order = mentioned.concat(pack.shapes.filter(s => !mentioned.includes(s)));
    const list = [];
    for (let i = 0; i < n; i++) { const s = order[i % order.length]; list.push({ shape: s, name: pack.productNames[s] || LF.shapes.label(s) }); }
    return list;
  }

  function ctx(b, palette) {
    return { topic: clean(b.tema) || 'the product', palette: palette || 'brand-consistent' };
  }
  const slots = (pack, b, palette) => pack.imageSlots ? pack.imageSlots(b, ctx(b, palette)) : [];

  /* Texto del bloque «SECTOR Y VOCABULARIO VISUAL» del prompt */
  function promptLines(pack, b, opts) {
    opts = opts || {};
    const L = [];
    L.push(`Este negocio vende ${pack.what}. La landing debe sentirse propia del sector «${pack.label}», no una plantilla genérica de software.`);
    L.push('Debe verse (obligatorio):');
    pack.show.forEach(s => L.push(`- ${s}`));
    L.push('Prohibido en esta landing:');
    pack.never.forEach(s => L.push(`- ${s}`));
    const mo = motifs(pack, b);
    if (mo) L.push(`Motivos visuales propios de este negocio (úsalos como iconos, ilustraciones y adornos): ${mo.text}.`);
    L.push(`Coherencia: todo lo que se muestre (productos, iconos, ilustraciones, fotos, ejemplos de planes o precios) debe pertenecer a ${b.marca ? '«' + clean(b.marca) + '»' : 'este negocio'} y a su tema. Está prohibido mostrar productos o elementos de otro sector${pack.id === 'fashion' ? '' : ' (por ejemplo prendas de ropa, camisetas o dashboards de software)'}.`);
    if (pack.kind === 'catalog') {
      const pr = products(pack, b, 6).map(p => p.name);
      L.push(`Productos de muestra para la rejilla (ajústalos al negocio; no inventes precios: usa [precio por confirmar]): ${pr.join(' · ')}.`);
    }
    return L;
  }

  /* Protocolo de marcadores que la app resuelve después (siluetas e imágenes) */
  function assetProtocol(pack, realImages, b) {
    const L = [];
    const mo = b ? motifs(pack, b) : null;
    const allowed = pack.kind === 'catalog' ? pack.shapes.filter((x, i, arr) => arr.indexOf(x) === i) : (mo ? mo.shapes : []);
    if (!allowed.length && pack.kind !== 'ui') {
      L.push('No hay siluetas predefinidas para este negocio: si necesitas iconos o ilustraciones, dibuja tú SVG inline sencillos de los objetos propios del negocio (nunca prendas de ropa ni objetos de otro sector).');
    }
    if (allowed.length) {
      L.push(`Siluetas vectoriales: donde quieras un icono o ilustración sin foto, escribe exactamente <span class="lf-product" data-lf-shape="TIPO" data-color="#HEX"></span> usando SOLO estos tipos, que son los de este negocio: ${allowed.join(', ')}. No existen otros tipos: no inventes ninguno. Si necesitas un objeto que no está en la lista, dibuja tú un SVG inline sencillo de ESE objeto del negocio; jamás uses una prenda u objeto de otro sector como sustituto. La app lo convierte en una silueta con ese color. Dale al contenedor una proporción fija (aspect-ratio) y un fondo liso de color suave; la silueta va centrada y a opacidad completa, sin degradados ni capas encima.`);
    }
    L.push('Todo lo visual va dibujado en código: SVG inline, CSS y las siluetas de este protocolo. No uses fotos, <img> con URL, Unsplash ni imágenes externas; para fondos y texturas usa gradientes CSS y patrones SVG.');
    return L;
  }

  return { PACKS, detect, get, products, slots, promptLines, assetProtocol, ctx, motifs };
})();
