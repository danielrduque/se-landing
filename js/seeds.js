/* ==========================================================================
   LandingForge IA · Catálogo de semillas de estilo y tipografías
   47 familias visuales (T1 · Cadenas semilla). Cada una indica su modo
   (claro/oscuro), los tonos en los que suele vivir, qué tan saturada es,
   qué pares tipográficos le van y con qué tema del motor local se dibuja.
   El generador (dna.js) usa esto para convertir un número o una palabra en
   un diseño completo, igual que la «semilla» de un mundo de Minecraft.
   ========================================================================== */
window.LF = window.LF || {};

LF.fontPairs = (function () {
  const fam = (n, w) => n.replace(/ /g, '+') + (w ? ':wght@' + w : '');
  const pair = (d, dw, b, bw, dFall, bFall) => ({
    display: d, body: b, durl: fam(d, dw), dfall: dFall || 'Georgia, serif',
    url: fam(d, dw) + (b === d ? '' : '&family=' + fam(b, bw)),
    fd: `'${d}', ${dFall || 'Georgia, serif'}`,
    fb: `'${b}', ${bFall || 'system-ui, sans-serif'}`
  });
  const S = 'system-ui, sans-serif', G = 'Georgia, serif', M = 'ui-monospace, monospace';
  return {
    'josefin-work': pair('Josefin Sans', '400;600;700', 'Work Sans', '400;500;600', S),
    'plex-mono': pair('IBM Plex Mono', '400;600', 'IBM Plex Sans', '400;500;600', M),
    'inter-tight': pair('Inter Tight', '400;500;700;800', 'Inter', '400;500', S),
    'archivo-space': pair('Archivo Black', null, 'Space Mono', '400;700', 'Impact, sans-serif', M),
    'fraunces-franklin': pair('Fraunces', '400;600;700', 'Libre Franklin', '400;500;600', G),
    'marcellus-josefin': pair('Marcellus', null, 'Josefin Sans', '300;400;600', G),
    'shippori-zen': pair('Shippori Mincho', '500;700', 'Zen Kaku Gothic New', '400;500', G),
    'cormorant-manrope': pair('Cormorant Garamond', '500;600', 'Manrope', '400;500;600', G),
    'rubik': pair('Rubik', '400;500;700;900', 'Rubik', '400;500;700;900', S),
    'jetbrains-inter': pair('JetBrains Mono', '400;600;800', 'Inter', '400;500', M),
    'bodoni-jost': pair('Bodoni Moda', '400;600', 'Jost', '300;400;500', G),
    'playfair-dm': pair('Playfair Display', '500;700;900', 'DM Sans', '400;500;700', G),
    'syne-inter': pair('Syne', '500;700;800', 'Inter', '400;500', S),
    'space-grotesk': pair('Space Grotesk', '400;500;700', 'Space Grotesk', '400;500;700', S),
    'unbounded-work': pair('Unbounded', '500;700;900', 'Work Sans', '400;500;600', S),
    'dmserif-dmsans': pair('DM Serif Display', null, 'DM Sans', '400;500;700', G),
    'bebas-inter': pair('Bebas Neue', null, 'Inter', '400;500;600', 'Impact, sans-serif'),
    'anton-manrope': pair('Anton', null, 'Manrope', '400;500;600', 'Impact, sans-serif'),
    'oswald-lora': pair('Oswald', '500;700', 'Lora', '400;500', 'Impact, sans-serif', G),
    'cinzel-raleway': pair('Cinzel', '500;700', 'Raleway', '400;500;600', G),
    'abril-poppins': pair('Abril Fatface', null, 'Poppins', '400;500;600', G),
    'italiana-tenor': pair('Italiana', null, 'Tenor Sans', null, G),
    'instrument-inter': pair('Instrument Serif', null, 'Inter', '400;500', G),
    'young-dm': pair('Young Serif', null, 'DM Sans', '400;500;700', G),
    'bricolage-inter': pair('Bricolage Grotesque', '500;700;800', 'Inter', '400;500', S),
    'lora-source': pair('Lora', '500;700', 'Source Sans 3', '400;600', G),
    'baskerville-inter': pair('Libre Baskerville', '400;700', 'Inter', '400;500', G),
    'poppins-mont': pair('Poppins', '600;700', 'Montserrat', '400;500', S),
    'sora-dm': pair('Sora', '500;700', 'DM Sans', '400;500;700', S),
    'outfit': pair('Outfit', '400;600;700', 'Outfit', '400;600;700', S),
    'manrope': pair('Manrope', '500;700;800', 'Manrope', '400;500;600', S),
    'caveat-nunito': pair('Caveat', '600;700', 'Nunito', '400;600', 'cursive'),
    'chivo-mono': pair('Chivo', '400;800;900', 'Chivo Mono', '400;500', S, M),
    'yeseva-jost': pair('Yeseva One', null, 'Jost', '300;400;500', G),
    'fraktur': pair('UnifrakturCook', '700', 'Libre Franklin', '400;500;600', G),
    'righteous-nunito': pair('Righteous', null, 'Nunito', '400;600', S),
    'marker-work': pair('Permanent Marker', null, 'Work Sans', '400;500;600', 'cursive'),
    'elite-plex': pair('Special Elite', null, 'IBM Plex Sans', '400;500;600', M)
  };
})();

/* mode: light | dark | any · hues: tonos (0-360) habituales · sat: [mín, máx] en % · fonts: pares de LF.fontPairs
   engine: tema del motor local con el que se dibuja · canon: usa también la paleta clásica del tema
   hero/benefits: preferencias de maquetación (si no, las decide la semilla) · tags: para buscar/filtrar */
LF.seedStyles = [
  { id: 'bauhaus', name: 'Minimalismo funcional Bauhaus', traits: 'formas geométricas puras, colores primarios, retícula asimétrica', engine: 'bauhaus', canon: true, mode: 'light', hues: [2, 215, 45], sat: [70, 90], fonts: ['josefin-work', 'inter-tight'], hero: ['asym', 'swiss'], benefits: ['blocks', 'numbered'], tags: ['geométrico', 'primarios'] },
  { id: 'patent50', name: 'Diagramas de patentes de los años 50', traits: 'líneas técnicas, cotas, etiquetas "FIG.", fondo tipo blueprint', engine: 'patent50', canon: true, mode: 'dark', hues: [210, 195], sat: [45, 65], fonts: ['plex-mono', 'jetbrains-inter'], hero: ['blueprint', 'asym'], benefits: ['figures'], tags: ['técnico', 'retro'] },
  { id: 'swiss', name: 'Estilo tipográfico suizo', traits: 'retícula estricta, tipografía grotesca enorme, rojo puro como acento', engine: 'swiss', canon: true, mode: 'light', hues: [355, 215], sat: [75, 95], fonts: ['inter-tight', 'space-grotesk'], hero: ['swiss'], benefits: ['numbered'], tags: ['tipográfico', 'rejilla'] },
  { id: 'brutalism', name: 'Brutalismo web', traits: 'bordes gruesos, sombras duras, tipografía mono, crudeza honesta', engine: 'brutalism', canon: true, mode: 'light', hues: [15, 225, 55], sat: [80, 100], fonts: ['archivo-space', 'chivo-mono'], hero: ['stack'], benefits: ['bordered'], tags: ['crudo', 'bordes'] },
  { id: 'editorial70', name: 'Revista editorial de los 70', traits: 'serif expresiva, columnas de revista, tonos tierra cálidos', engine: 'editorial70', canon: true, mode: 'light', hues: [12, 35, 160], sat: [35, 60], fonts: ['fraunces-franklin', 'young-dm'], hero: ['editorial'], benefits: ['columns'], tags: ['revista', 'cálido'] },
  { id: 'artdeco', name: 'Art Déco', traits: 'simetría, abanicos y rayos dorados, contraste negro y oro', engine: 'artdeco', canon: true, mode: 'dark', hues: [45, 165], sat: [50, 70], fonts: ['marcellus-josefin', 'cinzel-raleway'], hero: ['center'], benefits: ['framed'], tags: ['lujo', 'simetría'] },
  { id: 'japanma', name: 'Ma japonés (espacio negativo)', traits: 'vacío intencional, un solo acento bermellón, calma', engine: 'japanma', canon: true, mode: 'light', hues: [355, 30], sat: [10, 70], fonts: ['shippori-zen', 'cormorant-manrope'], hero: ['ma'], benefits: ['minimal'], tags: ['calma', 'vacío'] },
  { id: 'fibonacci', name: 'Proporción áurea / espiral de Fibonacci', traits: 'proporción 1:1.618, flujo orgánico, espiral como guía del scroll', engine: 'fibonacci', canon: true, mode: 'light', hues: [160, 40], sat: [25, 45], fonts: ['cormorant-manrope', 'instrument-inter'], hero: ['spiral'], benefits: ['stagger'], tags: ['orgánico', 'proporción'] },
  { id: 'memphis', name: 'Grupo Memphis (años 80)', traits: 'formas lúdicas, patrones, colores saturados, humor visual', engine: 'memphis', canon: true, mode: 'light', hues: [345, 175, 48], sat: [70, 95], fonts: ['rubik', 'bricolage-inter'], hero: ['stack', 'asym'], benefits: ['cards', 'bordered'], tags: ['lúdico', '80s'] },
  { id: 'phosphor', name: 'Terminal de fósforo verde', traits: 'monocromo oscuro, acento verde fósforo, estética de consola', engine: 'phosphor', canon: true, mode: 'dark', hues: [140, 40], sat: [80, 100], fonts: ['jetbrains-inter', 'plex-mono'], hero: ['asym'], benefits: ['terminal'], tags: ['consola', 'tech'] },
  { id: 'didot', name: 'Lujo editorial Didot', traits: 'serif de alto contraste, blanco roto, bronce, silencio visual', engine: 'didot', canon: true, mode: 'light', hues: [38, 0], sat: [15, 40], fonts: ['bodoni-jost', 'italiana-tenor'], hero: ['center'], benefits: ['editorial'], tags: ['lujo', 'moda'] },

  { id: 'wabisabi', name: 'Wabi-sabi (belleza de lo imperfecto)', traits: 'texturas de barro y lino, asimetría suave, bordes irregulares, tonos tierra apagados', engine: 'japanma', mode: 'light', hues: [28, 38, 80], sat: [10, 28], fonts: ['cormorant-manrope', 'instrument-inter', 'young-dm'], hero: ['ma', 'asym'], benefits: ['minimal', 'stagger'], tags: ['artesanal', 'calma', 'moda'] },
  { id: 'y2k', name: 'Y2K cromado', traits: 'cromo líquido, burbujas translúcidas, tipografía redondeada, azul hielo y plata', engine: 'memphis', mode: 'light', hues: [195, 210, 180], sat: [40, 70], fonts: ['outfit', 'unbounded-work', 'sora-dm'], hero: ['center', 'stack'], benefits: ['cards'], tags: ['2000s', 'moda', 'joven'] },
  { id: 'constructivism', name: 'Constructivismo ruso', traits: 'diagonales agresivas, rojo y negro, bloques tipográficos, fotomontaje', engine: 'brutalism', mode: 'light', hues: [5, 0], sat: [70, 90], fonts: ['anton-manrope', 'bebas-inter', 'oswald-lora'], hero: ['asym', 'stack'], benefits: ['blocks'], tags: ['cartel', 'rojo'] },
  { id: 'destijl', name: 'De Stijl (Mondrian)', traits: 'rejilla ortogonal, líneas negras gruesas, rectángulos de rojo, azul y amarillo', engine: 'bauhaus', mode: 'light', hues: [2, 220, 48], sat: [75, 95], fonts: ['josefin-work', 'inter-tight'], hero: ['asym', 'swiss'], benefits: ['blocks', 'bordered'], tags: ['geométrico', 'primarios'] },
  { id: 'risograph', name: 'Risograph', traits: 'dos tintas superpuestas, grano, desalineado de impresión, rosa fluorescente y azul', engine: 'memphis', mode: 'light', hues: [345, 205], sat: [60, 85], fonts: ['bricolage-inter', 'rubik', 'dmserif-dmsans'], hero: ['stack', 'editorial'], benefits: ['cards', 'columns'], tags: ['impreso', 'joven'] },
  { id: 'polishposter', name: 'Cartel de cine polaco', traits: 'composición surrealista, ilustración gouache, tipografía dibujada, pocos colores', engine: 'editorial70', mode: 'light', hues: [12, 45, 200], sat: [45, 70], fonts: ['fraunces-franklin', 'abril-poppins', 'dmserif-dmsans'], hero: ['editorial', 'asym'], benefits: ['columns'], tags: ['cartel', 'arte'] },
  { id: 'midcentury', name: 'Mid-century moderno', traits: 'formas orgánicas tipo boomerang, naranja quemado, teal y nogal', engine: 'editorial70', mode: 'light', hues: [22, 175, 40], sat: [45, 70], fonts: ['dmserif-dmsans', 'young-dm', 'poppins-mont'], hero: ['asym', 'editorial'], benefits: ['cards', 'columns'], tags: ['hogar', 'retro'] },
  { id: 'scandi', name: 'Nórdico / Scandinavian', traits: 'claridad, madera clara, blancos cálidos, funcionalidad amable', engine: 'fibonacci', mode: 'light', hues: [35, 200, 140], sat: [8, 25], fonts: ['outfit', 'manrope', 'sora-dm'], hero: ['ma', 'center'], benefits: ['minimal', 'cards'], tags: ['hogar', 'calma', 'moda'] },
  { id: 'streetwear', name: 'Streetwear / graffiti', traits: 'tipografía gigante comprimida, stickers, contraste ácido, bordes crudos', engine: 'brutalism', mode: 'dark', hues: [75, 15, 190], sat: [80, 100], fonts: ['anton-manrope', 'marker-work', 'bebas-inter'], hero: ['stack', 'swiss'], benefits: ['bordered', 'blocks'], tags: ['moda', 'joven', 'urbano'] },
  { id: 'artnouveau', name: 'Art Nouveau', traits: 'líneas curvas florales, marcos ornamentales, verdes y dorados suaves', engine: 'fibonacci', mode: 'light', hues: [95, 40, 160], sat: [20, 40], fonts: ['yeseva-jost', 'cinzel-raleway', 'playfair-dm'], hero: ['center', 'spiral'], benefits: ['framed', 'editorial'], tags: ['ornamento', 'lujo'] },
  { id: 'artscrafts', name: 'Arts & Crafts (William Morris)', traits: 'patrones repetidos de hojas, rojos y verdes profundos, artesanía visible', engine: 'editorial70', mode: 'light', hues: [8, 100, 35], sat: [30, 55], fonts: ['lora-source', 'baskerville-inter', 'fraunces-franklin'], hero: ['editorial', 'center'], benefits: ['columns', 'framed'], tags: ['artesanal', 'hogar'] },
  { id: 'popart', name: 'Pop art', traits: 'puntos de trama Ben-Day, contornos negros, colores primarios saturados, bocadillos', engine: 'memphis', mode: 'light', hues: [0, 50, 210], sat: [85, 100], fonts: ['bebas-inter', 'rubik', 'marker-work'], hero: ['stack', 'asym'], benefits: ['bordered', 'cards'], tags: ['lúdico', 'joven'] },
  { id: 'cyberpunk', name: 'Cyberpunk neón', traits: 'noche lluviosa, neón cian y magenta, tipografía angulosa, HUD', engine: 'phosphor', mode: 'dark', hues: [185, 330], sat: [90, 100], fonts: ['space-grotesk', 'jetbrains-inter', 'unbounded-work'], hero: ['asym', 'blueprint'], benefits: ['terminal', 'figures'], tags: ['tech', 'neón', 'urbano'] },
  { id: 'botanical', name: 'Acuarela botánica', traits: 'manchas de acuarela, hojas dibujadas, verdes salvia y rosas empolvados', engine: 'fibonacci', mode: 'light', hues: [130, 350, 90], sat: [18, 38], fonts: ['cormorant-manrope', 'instrument-inter', 'lora-source'], hero: ['spiral', 'ma'], benefits: ['stagger', 'minimal'], tags: ['natural', 'belleza', 'calma'] },
  { id: 'tropical50', name: 'Tropical años 50', traits: 'palmeras, tipografía de letrero, turquesa y coral, sol de tarde', engine: 'memphis', mode: 'light', hues: [175, 12, 45], sat: [55, 80], fonts: ['righteous-nunito', 'abril-poppins', 'poppins-mont'], hero: ['center', 'stack'], benefits: ['cards', 'bordered'], tags: ['viajes', 'verano', 'retro'] },
  { id: 'highfashion', name: 'Lookbook de alta moda', traits: 'fotografía a sangre, serif fina muy espaciada, blanco y negro con un único acento', engine: 'didot', mode: 'light', hues: [0, 30, 350], sat: [0, 18], fonts: ['bodoni-jost', 'italiana-tenor', 'playfair-dm'], hero: ['center', 'editorial'], benefits: ['editorial', 'minimal'], tags: ['moda', 'lujo'] },
  { id: 'kraft', name: 'Papel kraft artesanal', traits: 'cartón y papel reciclado, sellos y etiquetas, tinta negra, cordel', engine: 'editorial70', mode: 'light', hues: [30, 25], sat: [25, 40], fonts: ['elite-plex', 'young-dm', 'lora-source'], hero: ['stack', 'editorial'], benefits: ['bordered', 'cards'], tags: ['artesanal', 'natural', 'comida'] },
  { id: 'mediterranean', name: 'Mediterráneo encalado', traits: 'paredes blancas, azul cobalto, terracota, sombras duras de sol', engine: 'fibonacci', mode: 'light', hues: [215, 18, 45], sat: [45, 75], fonts: ['playfair-dm', 'dmserif-dmsans', 'cormorant-manrope'], hero: ['center', 'spiral'], benefits: ['cards', 'stagger'], tags: ['viajes', 'comida', 'verano'] },
  { id: 'ukiyoe', name: 'Ukiyo-e (grabado japonés)', traits: 'líneas de xilografía, olas estilizadas, índigo y crema, sellos rojos', engine: 'japanma', mode: 'light', hues: [220, 5], sat: [35, 60], fonts: ['shippori-zen', 'cormorant-manrope'], hero: ['ma', 'editorial'], benefits: ['minimal', 'framed'], tags: ['arte', 'calma'] },
  { id: 'isotype', name: 'Isotype / infografía de Neurath', traits: 'pictogramas repetidos, datos como iconos, colores planos limitados', engine: 'swiss', mode: 'light', hues: [8, 205, 45], sat: [60, 85], fonts: ['inter-tight', 'josefin-work'], hero: ['swiss', 'asym'], benefits: ['numbered', 'figures'], tags: ['datos', 'educación'] },
  { id: 'tropicalia', name: 'Tropicália brasileña', traits: 'color vibrante, patrones modernistas, naturaleza geométrica, alegría cálida', engine: 'memphis', mode: 'light', hues: [140, 25, 48], sat: [60, 85], fonts: ['rubik', 'unbounded-work', 'poppins-mont'], hero: ['stack', 'center'], benefits: ['cards', 'stagger'], tags: ['viajes', 'moda', 'verano'] },
  { id: 'letterpress', name: 'Letterpress / imprenta clásica', traits: 'tipografía de plomo, tinta sobre papel grueso, reglas dobles, ornamentos', engine: 'editorial70', mode: 'light', hues: [215, 10, 35], sat: [20, 45], fonts: ['baskerville-inter', 'playfair-dm', 'lora-source'], hero: ['center', 'editorial'], benefits: ['columns', 'editorial'], tags: ['clásico', 'papel'] },
  { id: 'airline', name: 'Señalética aeronáutica', traits: 'pictogramas claros, amarillo de aviso, negro, flechas y códigos de puerta', engine: 'swiss', mode: 'any', hues: [48, 200], sat: [70, 95], fonts: ['inter-tight', 'space-grotesk', 'chivo-mono'], hero: ['swiss', 'blueprint'], benefits: ['numbered', 'figures'], tags: ['viajes', 'tipográfico'] },
  { id: 'zine', name: 'Collage punk / zine', traits: 'recortes pegados, cinta adhesiva, fotocopia, tipografías mezcladas de revista', engine: 'brutalism', mode: 'light', hues: [0, 55], sat: [70, 95], fonts: ['elite-plex', 'marker-work', 'bebas-inter'], hero: ['stack', 'asym'], benefits: ['bordered'], tags: ['moda', 'joven', 'urbano'] },
  { id: 'softbrutal', name: 'Neo-brutalismo suave', traits: 'bordes gruesos pero colores pastel, sombras sólidas, esquinas redondeadas', engine: 'brutalism', mode: 'light', hues: [150, 35, 200], sat: [55, 75], fonts: ['bricolage-inter', 'space-grotesk', 'rubik'], hero: ['stack', 'asym'], benefits: ['bordered', 'cards'], tags: ['joven', 'app'] },
  { id: 'gothic', name: 'Gótico victoriano', traits: 'ornamento recargado, negro y burdeos, tipografía fraktur, viñetas', engine: 'artdeco', mode: 'dark', hues: [350, 30], sat: [40, 65], fonts: ['fraktur', 'cinzel-raleway'], hero: ['center'], benefits: ['framed'], tags: ['oscuro', 'moda'] },
  { id: 'naif', name: 'Naïf / dibujo infantil', traits: 'trazos de lápiz de color, formas imperfectas, optimismo', engine: 'memphis', mode: 'light', hues: [45, 190, 350], sat: [55, 80], fonts: ['caveat-nunito', 'rubik'], hero: ['stack', 'spiral'], benefits: ['cards', 'stagger'], tags: ['infantil', 'lúdico'] },
  { id: 'southwest', name: 'Desierto / tierra del suroeste', traits: 'arcillas, atardecer, patrones geométricos de tejido, cactus', engine: 'editorial70', mode: 'light', hues: [18, 35, 170], sat: [35, 60], fonts: ['young-dm', 'fraunces-franklin', 'dmserif-dmsans'], hero: ['editorial', 'center'], benefits: ['columns', 'cards'], tags: ['artesanal', 'viajes', 'moda'] },
  { id: 'technoir', name: 'Tech-noir', traits: 'negro profundo, una sola luz de acento, viñeta cinematográfica, tipografía fina', engine: 'phosphor', mode: 'dark', hues: [200, 25, 0], sat: [40, 80], fonts: ['space-grotesk', 'instrument-inter', 'syne-inter'], hero: ['ma', 'asym'], benefits: ['minimal', 'terminal'], tags: ['tech', 'oscuro', 'lujo'] },
  { id: 'retro60', name: 'Sci-fi retro años 60', traits: 'naves y órbitas, tipografía redondeada futurista, naranja y crema', engine: 'memphis', mode: 'light', hues: [22, 190, 48], sat: [55, 80], fonts: ['righteous-nunito', 'unbounded-work'], hero: ['spiral', 'center'], benefits: ['cards', 'figures'], tags: ['retro', 'tech'] },
  { id: 'herbarium', name: 'Herbario científico', traits: 'láminas botánicas numeradas, anotaciones en cursiva, papel envejecido', engine: 'editorial70', mode: 'light', hues: [95, 30], sat: [15, 35], fonts: ['cormorant-manrope', 'lora-source', 'baskerville-inter'], hero: ['editorial', 'blueprint'], benefits: ['figures', 'columns'], tags: ['natural', 'ciencia', 'belleza'] },
  { id: 'quietluxury', name: 'Lujo silencioso', traits: 'neutros cálidos, cachemira, tipografía discreta, cero ornamento', engine: 'didot', mode: 'light', hues: [32, 25, 0], sat: [5, 15], fonts: ['bodoni-jost', 'instrument-inter', 'italiana-tenor'], hero: ['ma', 'center'], benefits: ['minimal', 'editorial'], tags: ['moda', 'lujo', 'calma'] },
  { id: 'sportswear', name: 'Deporte técnico', traits: 'cortes diagonales, tipografía itálica comprimida, colores de equipo, sensación de velocidad', engine: 'brutalism', mode: 'any', hues: [205, 18, 80], sat: [80, 100], fonts: ['anton-manrope', 'oswald-lora', 'unbounded-work'], hero: ['asym', 'swiss'], benefits: ['blocks', 'numbered'], tags: ['deporte', 'moda', 'joven'] },
  { id: 'workwear', name: 'Workwear / denim', traits: 'costuras vistas, etiquetas cosidas, índigo y crudo, estampado de almacén', engine: 'editorial70', mode: 'light', hues: [215, 30], sat: [30, 55], fonts: ['chivo-mono', 'elite-plex', 'young-dm'], hero: ['stack', 'editorial'], benefits: ['bordered', 'columns'], tags: ['moda', 'artesanal', 'urbano'] },
  { id: 'japandi', name: 'Japandi', traits: 'fusión japonesa y nórdica, madera y piedra, calma cálida', engine: 'japanma', mode: 'light', hues: [30, 90], sat: [8, 22], fonts: ['shippori-zen', 'cormorant-manrope', 'manrope'], hero: ['ma', 'center'], benefits: ['minimal'], tags: ['hogar', 'calma', 'moda'] },
  { id: 'mailorder', name: 'Catálogo vintage por correo', traits: 'viñetas de producto numeradas, precios en rojo, tramas de impresión, cupones recortables', engine: 'editorial70', mode: 'light', hues: [5, 45, 200], sat: [50, 75], fonts: ['abril-poppins', 'young-dm', 'elite-plex'], hero: ['editorial', 'stack'], benefits: ['numbered', 'bordered'], tags: ['tienda', 'retro', 'moda'] }
];
