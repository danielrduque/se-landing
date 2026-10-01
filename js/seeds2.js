/* ==========================================================================
   LandingForge IA · Catálogo ampliado (x10)
   - 10 variantes de estilo que se combinan con los 47 estilos base (517 estilos)
   - 60 paletas con nombre
   - Librería de tipografías: ~100 para titulares × 34 para texto (más de 3 000 pares)
   ========================================================================== */
window.LF = window.LF || {};

/* Cada variante se aplica sobre cualquier estilo base: cambia modo, tonos y saturación */
LF.seedTwists = [
  { id: 'nocturna', name: 'Nocturna', traits: 'versión oscura, fondo casi negro y acentos que brillan', mode: 'dark' },
  { id: 'pastel', name: 'Pastel', traits: 'tonos suaves, aire de papelería y mucha luz', mode: 'light', sat: [14, 34] },
  { id: 'neon', name: 'Neón', traits: 'colores eléctricos sobre fondo oscuro', mode: 'dark', sat: [90, 100] },
  { id: 'mono', name: 'Monocroma', traits: 'un solo tono en varias intensidades', harmony: 'mono' },
  { id: 'tierra', name: 'Tierra', traits: 'arcillas, ocres y verdes apagados', hues: [18, 30, 45, 90, 150], sat: [25, 50], mode: 'light' },
  { id: 'oceano', name: 'Océano', traits: 'azules, turquesas y espuma', hues: [185, 200, 215, 170] },
  { id: 'solar', name: 'Solar', traits: 'amarillos, naranjas y rojos cálidos', hues: [40, 28, 12, 50], mode: 'light' },
  { id: 'bosque', name: 'Bosque', traits: 'verdes profundos y musgo', hues: [120, 140, 100, 160] },
  { id: 'ceniza', name: 'Ceniza', traits: 'casi sin color, grises cálidos y un detalle', sat: [3, 12] },
  { id: 'contraste', name: 'Alto contraste', traits: 'blanco y negro puros con un único color vivo', contrast: true }
];

/* Paletas con nombre: [nombre, fondo, texto, primario, acento, acento 2] */
LF.namedPalettes = [
  ['Lino y terracota', '#f4ede4', '#2b211a', '#b5502c', '#2f5d50', '#d9a441'], ['Sal y océano', '#f3f7f8', '#0f2b3a', '#0f6e8c', '#e07a3f', '#1b9aaa'],
  ['Algodón y menta', '#f6f8f4', '#1d2b22', '#2f8f6b', '#f0a04b', '#6bb5a0'], ['Mostaza y tinta', '#faf6ea', '#161616', '#e0a800', '#1f3a5f', '#c8553d'],
  ['Rosa empolvado', '#f9efee', '#3a2526', '#c46a6a', '#6b7f6b', '#e3b7a0'], ['Cielo y coral', '#f2f7fb', '#14263c', '#2b6cb0', '#f26b5b', '#f5c16c'],
  ['Arena y oliva', '#f5f0e3', '#27271c', '#6b7a2e', '#c78a3b', '#8b5a3c'], ['Papel y rojo', '#f7f4ee', '#141414', '#d0312d', '#141414', '#e9b949'],
  ['Salvia y crema', '#f3f4ec', '#233027', '#6a8d73', '#c9a66b', '#3d5a4a'], ['Durazno y vino', '#fdf1e8', '#3b1f24', '#e07b5a', '#7b2d3f', '#f2b880'],
  ['Hielo y acero', '#eff3f6', '#101b26', '#3b5b7a', '#e04f5f', '#86a7c3'], ['Limón y grafito', '#fbfbf0', '#1a1a1a', '#c6d816', '#2e2e2e', '#ff6b35'],
  ['Té matcha', '#eef2e6', '#1f2a1a', '#5b8a3c', '#d4a24c', '#2f4a2a'], ['Coral y turquesa', '#fff5f0', '#1e2b33', '#ff6f59', '#1fa2a2', '#ffc857'],
  ['Tinta y papel', '#f4f1ea', '#0d1b2a', '#1b263b', '#e0a458', '#778da9'], ['Cereza', '#fbf1f1', '#2a1215', '#b3203a', '#f2a65a', '#5d2a42'],
  ['Bosque claro', '#f1f5ee', '#122016', '#2d6a4f', '#d9a441', '#95b8a3'], ['Girasol', '#fffaeb', '#2b2100', '#f2b705', '#2a6f97', '#e4572e'],
  ['Océano pálido', '#eef6f6', '#0b2a2f', '#0a7e8c', '#ff8552', '#7fc8c8'], ['Barro', '#f2e9df', '#2e211a', '#9c5b3a', '#4d6a5c', '#d8b58a'],
  ['Vainilla y cobalto', '#fff8e7', '#0e1a3a', '#1d4ed8', '#f59e0b', '#ef4444'], ['Brisa', '#eef5fb', '#12263a', '#3a86c8', '#f4a259', '#5bc0be'],
  ['Humo', '#f1f1ef', '#222222', '#555f66', '#d1495b', '#edae49'], ['Melocotón y menta', '#fff3ec', '#2b2a2a', '#ff8a65', '#4db6ac', '#ffd54f'],
  ['Jade', '#eef7f3', '#0f2a22', '#00a676', '#f4a261', '#264653'], ['Miel', '#fdf3dc', '#2e1f0a', '#d98e04', '#6b4226', '#a3b18a'],
  ['Tomate', '#fff4ee', '#2a1410', '#e4572e', '#2e7d32', '#f2c14e'], ['Niebla', '#f3f5f7', '#1a2733', '#5d7a94', '#e9a23b', '#a6b8c6'],
  ['Bayas', '#fdf1f3', '#2e1420', '#c2185b', '#2f7f6f', '#f2b134'], ['Oliva', '#f4f3e7', '#242611', '#7d8f1f', '#b5651d', '#3f5b3a'],
  ['Acero y limón', '#f0f2f3', '#12181d', '#2f3e4a', '#d7ef2b', '#ff7043'], ['Sandía', '#fff2f1', '#2a1518', '#ef476f', '#06d6a0', '#ffd166'],
  ['Alpino', '#f2f7f5', '#0c2a33', '#1e7f74', '#2d6cdf', '#f2c14e'], ['Lino azul', '#f3f1ea', '#1b2a3a', '#355c7d', '#c06c84', '#f8b195'],
  ['Atardecer', '#fff1e6', '#2b1a14', '#f25c54', '#f7b267', '#1d3557'], ['Naranja y crema', '#fdf6ec', '#2a1a0e', '#f07f13', '#2a7f62', '#e4c590'],
  ['Azulejo', '#f5f8fa', '#0d2236', '#1565c0', '#f9a825', '#00838f'], ['Canela', '#f8efe6', '#33190f', '#a8532b', '#7a8b5c', '#e8b96a'],
  ['Noche y neón cian', '#0b0f14', '#e8f1f5', '#19e3ff', '#ff3d81', '#ffd166'], ['Carbón y lima', '#111311', '#eef3e6', '#b6ff3b', '#ff6b35', '#5ad1a6'],
  ['Medianoche y oro', '#0d1321', '#f0ebd8', '#e0b24b', '#3e92cc', '#c8553d'], ['Vino oscuro', '#1a0f14', '#f5e9e4', '#d1495b', '#edae49', '#66a182'],
  ['Bosque profundo', '#0f1a14', '#e7efe6', '#5cc48a', '#e5b94e', '#2f6f55'], ['Grafito y naranja', '#151515', '#f2f2f2', '#ff7a1a', '#2ec4b6', '#f4d35e'],
  ['Azul tinta', '#0a1628', '#e6eef7', '#4ea8de', '#f7b267', '#ef476f'], ['Cacao', '#1c1411', '#f3e6d8', '#d08c4a', '#8fae7e', '#c05a3c'],
  ['Petróleo', '#0b1e22', '#e3f1f0', '#22c1b3', '#f26a4b', '#f2c14e'], ['Ceniza rosa', '#1b1819', '#f1e6e6', '#e58fa0', '#9bc1bc', '#f2c57c'],
  ['Verde terminal', '#0a0c0b', '#d9f7e4', '#39ff88', '#1f8f4e', '#e5c07b'], ['Rojo cine', '#140b0b', '#f4e9e4', '#e63946', '#f1c453', '#457b9d'],
  ['Azul eléctrico', '#0b0d1a', '#eaeefc', '#3a6bff', '#ffd23f', '#ff5d73'], ['Musgo', '#141a12', '#e9eedd', '#8fbf4c', '#d9b44a', '#4d7c59'],
  ['Cobre', '#181210', '#f3e7dd', '#c96f3b', '#6fb1a0', '#e6b566'], ['Aurora', '#0c1420', '#e7f3f5', '#2ed8a7', '#4e8cff', '#ffb74d'],
  ['Brasa', '#170e0a', '#f7e7dc', '#ff5a1f', '#ffb84d', '#3fa7a3'], ['Tinta china', '#0d0d0f', '#f0f0f0', '#ffffff', '#e63946', '#ffd166'],
  ['Lago', '#0a1a1f', '#e0f0f2', '#3ac7d9', '#f6a04d', '#8fd694'], ['Granate', '#190b10', '#f6e6ea', '#c2304f', '#ffb347', '#5fa8a0'],
  ['Arcade', '#10121f', '#f2f4ff', '#ff4d6d', '#ffd60a', '#20c997'], ['Ámbar', '#16100a', '#f7ead9', '#ffb000', '#e5533d', '#6abf9e'],
  ['Esmeralda', '#07140f', '#e4f3ea', '#10b981', '#f5c542', '#3b82f6'], ['Plomo', '#121416', '#e9edf0', '#8ab4d6', '#e8a87c', '#c38d9e']
];

/* Librería de tipografías de Google Fonts. Titulares: [nombre, pesos|null, respaldo, categoría]; texto: [nombre, pesos, respaldo] */
LF.fontLib = (function () {
  const fall = { serif: 'Georgia, serif', sans: 'system-ui, sans-serif', mono: 'ui-monospace, monospace', impact: 'Impact, sans-serif', cursive: 'cursive' };
  const W = '400;700';
  const displays = [
    ['Playfair Display', W, 'serif', 'serif'], ['Cormorant Garamond', W, 'serif', 'serif'], ['DM Serif Display', null, 'serif', 'serif'], ['Abril Fatface', null, 'serif', 'serif'],
    ['Bodoni Moda', W, 'serif', 'serif'], ['Fraunces', W, 'serif', 'serif'], ['Young Serif', null, 'serif', 'serif'], ['Instrument Serif', null, 'serif', 'serif'],
    ['Gloock', null, 'serif', 'serif'], ['Italiana', null, 'serif', 'serif'], ['Marcellus', null, 'serif', 'serif'], ['Cinzel', W, 'serif', 'serif'],
    ['Yeseva One', null, 'serif', 'serif'], ['Rozha One', null, 'serif', 'serif'], ['Prata', null, 'serif', 'serif'], ['Rufina', W, 'serif', 'serif'],
    ['Spectral', W, 'serif', 'serif'], ['Lora', W, 'serif', 'serif'], ['Libre Baskerville', W, 'serif', 'serif'], ['Noto Serif Display', W, 'serif', 'serif'],
    ['Newsreader', W, 'serif', 'serif'], ['Vollkorn', W, 'serif', 'serif'], ['EB Garamond', W, 'serif', 'serif'], ['Crimson Pro', W, 'serif', 'serif'],
    ['Old Standard TT', W, 'serif', 'serif'], ['Merriweather', W, 'serif', 'serif'], ['Libre Caslon Display', null, 'serif', 'serif'], ['Chonburi', null, 'serif', 'serif'],
    ['Bitter', W, 'serif', 'slab'], ['Zilla Slab', W, 'serif', 'slab'], ['Roboto Slab', W, 'serif', 'slab'], ['Arvo', W, 'serif', 'slab'],
    ['Alfa Slab One', null, 'serif', 'slab'], ['Ultra', null, 'serif', 'slab'], ['Bree Serif', null, 'serif', 'slab'], ['Rokkitt', W, 'serif', 'slab'],
    ['Anton', null, 'impact', 'condensed'], ['Bebas Neue', null, 'impact', 'condensed'], ['Oswald', W, 'impact', 'condensed'], ['Barlow Condensed', W, 'impact', 'condensed'],
    ['Big Shoulders Display', W, 'impact', 'condensed'], ['Teko', W, 'impact', 'condensed'], ['Staatliches', null, 'impact', 'condensed'], ['Passion One', W, 'impact', 'condensed'],
    ['Archivo Black', null, 'impact', 'display'], ['Bowlby One', null, 'impact', 'display'], ['Dela Gothic One', null, 'impact', 'display'], ['Rammetto One', null, 'impact', 'display'],
    ['Titan One', null, 'impact', 'display'], ['Lilita One', null, 'impact', 'display'], ['Russo One', null, 'sans', 'display'], ['Bungee', null, 'impact', 'display'],
    ['Righteous', null, 'sans', 'display'], ['Tilt Warp', null, 'sans', 'display'], ['Krona One', null, 'sans', 'display'], ['Syncopate', W, 'sans', 'display'],
    ['Unbounded', W, 'sans', 'display'], ['Syne', W, 'sans', 'display'], ['Michroma', null, 'sans', 'display'], ['Audiowide', null, 'sans', 'display'],
    ['Space Grotesk', W, 'sans', 'sans'], ['Outfit', W, 'sans', 'sans'], ['Sora', W, 'sans', 'sans'], ['Lexend', W, 'sans', 'sans'],
    ['Urbanist', W, 'sans', 'sans'], ['Plus Jakarta Sans', W, 'sans', 'sans'], ['Manrope', W, 'sans', 'sans'], ['Poppins', W, 'sans', 'sans'],
    ['Montserrat', W, 'sans', 'sans'], ['Raleway', W, 'sans', 'sans'], ['Rubik', W, 'sans', 'sans'], ['Work Sans', W, 'sans', 'sans'],
    ['Bricolage Grotesque', W, 'sans', 'sans'], ['Familjen Grotesk', W, 'sans', 'sans'], ['Red Hat Display', W, 'sans', 'sans'], ['Epilogue', W, 'sans', 'sans'],
    ['Darker Grotesque', W, 'sans', 'sans'], ['Fredoka', W, 'sans', 'sans'], ['Baloo 2', W, 'sans', 'sans'], ['Archivo', W, 'sans', 'sans'],
    ['Josefin Sans', W, 'sans', 'sans'], ['Inter Tight', W, 'sans', 'sans'],
    ['IBM Plex Mono', W, 'mono', 'mono'], ['JetBrains Mono', W, 'mono', 'mono'], ['Space Mono', W, 'mono', 'mono'], ['DM Mono', '400;500', 'mono', 'mono'],
    ['Courier Prime', W, 'mono', 'mono'], ['Major Mono Display', null, 'mono', 'mono'], ['Special Elite', null, 'mono', 'mono'],
    ['Press Start 2P', null, 'mono', 'pixel'], ['VT323', null, 'mono', 'pixel'], ['Orbitron', W, 'sans', 'pixel'], ['Monoton', null, 'sans', 'pixel'], ['Rubik Mono One', null, 'sans', 'pixel'],
    ['Permanent Marker', null, 'cursive', 'script'], ['Caveat', W, 'cursive', 'script'], ['Pacifico', null, 'cursive', 'script'], ['Lobster', null, 'cursive', 'script'],
    ['Amatic SC', W, 'cursive', 'script'], ['Shadows Into Light', null, 'cursive', 'script'], ['Kalam', W, 'cursive', 'script'], ['Gloria Hallelujah', null, 'cursive', 'script']
  ];
  const bodies = [
    ['Inter', W, 'sans'], ['DM Sans', W, 'sans'], ['Work Sans', W, 'sans'], ['Manrope', W, 'sans'], ['Source Sans 3', W, 'sans'], ['Nunito', W, 'sans'], ['Nunito Sans', W, 'sans'],
    ['Karla', W, 'sans'], ['Libre Franklin', W, 'sans'], ['Public Sans', W, 'sans'], ['IBM Plex Sans', W, 'sans'], ['Mulish', W, 'sans'], ['Figtree', W, 'sans'], ['Lato', W, 'sans'],
    ['Open Sans', W, 'sans'], ['Roboto', W, 'sans'], ['Barlow', W, 'sans'], ['Jost', W, 'sans'], ['Cabin', W, 'sans'], ['Quicksand', W, 'sans'], ['Rubik', W, 'sans'], ['Outfit', W, 'sans'],
    ['Hind', W, 'sans'], ['Albert Sans', W, 'sans'], ['Lora', W, 'serif'], ['Source Serif 4', W, 'serif'], ['PT Serif', W, 'serif'], ['Merriweather', W, 'serif'],
    ['Newsreader', W, 'serif'], ['Crimson Pro', W, 'serif'], ['Libre Baskerville', W, 'serif'], ['Spectral', W, 'serif'], ['DM Mono', '400;500', 'mono'], ['IBM Plex Mono', W, 'mono']
  ];
  const fam = (n, w) => n.replace(/ /g, '+') + (w ? ':wght@' + w : '');
  function make(d, b) {
    return {
      display: d[0], body: b[0], durl: fam(d[0], d[1]), dfall: fall[d[2]], cat: d[3],
      url: fam(d[0], d[1]) + (b[0] === d[0] ? '' : '&family=' + fam(b[0], b[1])),
      fd: `'${d[0]}', ${fall[d[2]]}`, fb: `'${b[0]}', ${fall[b[2]]}`
    };
  }
  const byName = (list, n) => list.find(x => x[0] === n);
  return { displays, bodies, make, byName, count: displays.length * bodies.length };
})();
