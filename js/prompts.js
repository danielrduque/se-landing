/* ==========================================================================
   LandingForge IA · Generador de prompts
   - single(techId, brief, opts): un prompt por técnica        (requisito 2)
   - combined(ids, brief, optsMap): prompt fusionado de 2+     (requisito 3)
   - parse(text): recupera brief + técnicas desde un prompt (para ejecutarlo)
   ========================================================================== */
window.LF = window.LF || {};

LF.prompts = (function () {
  const D = LF.data;

  /* ---------- utilidades ---------- */
  const lines = s => String(s || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  const clean = s => String(s || '').trim();
  const splitPair = (s, re) => { const m = String(s).split(re); return [clean(m[0]), clean(m.slice(1).join(' '))]; };
  const benefitTitles = b => lines(b.beneficios).map(l => splitPair(l, /:|\s[-–—]\s/)[0]);
  const objectionList = b => lines(b.objeciones).map(l => splitPair(l, /\s*\|\s*|\s*->\s*/));
  const joinHuman = arr => arr.length <= 1 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  const brand = b => clean(b.marca) || 'la marca';
  const topic = b => clean(b.tema) || 'el producto';
  const seedName = id => (D.seeds.find(s => s.id === id) || {}).name || id;
  const seedTraits = id => (D.seeds.find(s => s.id === id) || {}).traits || '';
  const goal = b => D.goals[b.objetivo] || D.goals.leads;

  function paletteText(b) {
    return b.colorAuto ? 'libre: propón una paleta coherente con la estética elegida'
      : `${b.color1} (primario) y ${b.color2} (acento)`;
  }
  function paletteEn(b) {
    return b.colorAuto ? 'restrained brand-consistent' : `${b.color1} and ${b.color2} brand`;
  }

  /* ---------- bloque de contexto (también se parsea de vuelta) ---------- */
  const FIELDS = [
    ['tema', 'Tema'], ['marca', 'Marca'], ['industria', 'Sector'], ['publico', 'Público objetivo'],
    ['problema', 'Problema que resuelve'], ['propuesta', 'Propuesta de valor'], ['objetivo', 'Objetivo de conversión'],
    ['cta', 'CTA principal'], ['beneficios', 'Beneficios clave'], ['objeciones', 'Objeciones frecuentes'],
    ['prueba', 'Prueba social'], ['oferta', 'Oferta / precio'], ['tono', 'Tono de voz'], ['paleta', 'Paleta de marca'], ['idioma', 'Idioma']
  ];

  function context(b) {
    const out = ['# CONTEXTO DEL PROYECTO'];
    FIELDS.forEach(([k, label]) => {
      let v;
      if (k === 'objetivo') v = goal(b).label;
      else if (k === 'cta') v = clean(b.cta) || goal(b).cta;
      else if (k === 'beneficios') v = lines(b.beneficios).join(' ; ');
      else if (k === 'objeciones') v = lines(b.objeciones).join(' ; ');
      else if (k === 'paleta') v = paletteText(b);
      else v = clean(b[k]);
      if (v) out.push(`- ${label}: ${v}`);
    });
    return out.join('\n');
  }

  function deliverableFormat(b) {
    const f = b.formato || 'html';
    const lang = b.idioma || 'Español';
    const common = `Todo el texto visible en ${lang.toLowerCase()}. Mobile-first, responsive, accesible (WCAG 2.2 AA: contraste, etiquetas, foco visible, prefers-reduced-motion) y con HTML semántico.`;
    if (f === 'tailwind') return `Devuelve un único archivo HTML completo que use Tailwind CSS por CDN y JavaScript mínimo embebido. ${common} Sin imágenes externas: usa SVG inline o CSS.`;
    if (f === 'wire') return `Devuelve un wireframe textual bloque por bloque (objetivo, copy final, elemento visual, CTA) listo para maquetar. ${common}`;
    return `Devuelve un único documento HTML completo (<!DOCTYPE html>) con CSS y JS embebidos, sin dependencias externas salvo Google Fonts. ${common} Sin imágenes externas: usa SVG inline, patrones CSS o composiciones que anticipen los activos finales.`;
  }

  /* ---------- prompts auxiliares de imagen y vídeo (en inglés, como en el tratado) ---------- */
  function imagePrompts(b, o, seedIds) {
    o = Object.assign(D.defaultOpts('image'), o || {});
    const style = D.imageStyles[o.style] || D.imageStyles['Texturas abstractas'];
    const seedHint = (seedIds || []).length ? `, visual language inspired by ${seedIds.map(seedName).join(' and ')}` : '';
    const neg = o._negative ? ' --no oversaturated colors, perfect skin, plastic textures, generic office, stock photo look' : '';
    const mj = /midjourney/i.test(o.tool);
    const ar = mj ? ` --ar ${o.ratio} --v 6.0 --style raw` : ` (aspect ratio ${o.ratio})`;
    const subj = topic(b);
    const light = o.light ? `, ${o.light}` : ', soft studio lighting';
    const list = [
      { use: 'Hero principal', text: `Conceptual hero image representing "${subj}" for ${clean(b.publico) || 'the target audience'}, ${style}${seedHint}, ${paletteEn(b)} color palette${light}, generous negative space for headline, no text, ultra-detailed${ar}${neg}` },
      { use: 'Fondo de la sección de beneficios', text: `Subtle seamless background texture evoking "${subj}", ${style}, ${paletteEn(b)} palette, low contrast so text stays readable${light}, no text${mj ? ' --ar 21:9 --v 6.0 --tile' : ''}${neg}` },
      { use: 'Serie de iconos', text: `Set of 3 consistent icons for: ${benefitTitles(b).slice(0, 3).join(', ') || 'focus, collaboration, analytics'}, ${style}, identical lighting and camera angle, ${paletteEn(b)} palette, isolated on plain background${mj ? ' --ar 1:1 --v 6.0' : ''}${neg}` },
      { use: 'Imagen de prueba social', text: `Documentary-style photo of a real ${clean(b.publico) || 'customer'} using ${subj}, natural imperfect light, film grain, candid, not looking at camera${mj ? ' --ar 4:5 --v 6.0 --style raw' : ''}${neg}` },
      { use: 'Detalle de producto', text: `Close-up detail shot of ${subj}, ${style}, shallow depth of field${light}, ${paletteEn(b)} palette${mj ? ' --ar 4:5 --v 6.0' : ''}${neg}` },
      { use: 'Imagen para redes (Open Graph)', text: `Minimal composition for "${brand(b)}" social share card, ${style}${seedHint}, ${paletteEn(b)} palette, centered focal point, no text${mj ? ' --ar 1.91:1 --v 6.0' : ''}${neg}` }
    ];
    return list.slice(0, Math.max(1, Math.min(6, +o.count || 3)));
  }

  function videoPrompt(b, o) {
    o = Object.assign(D.defaultOpts('video'), o || {});
    const cam = {
      'Drone lento': 'slow-motion cinematic drone shot gliding through',
      'Dolly in suave': 'smooth dolly-in shot moving toward',
      'Órbita alrededor del objeto': 'slow orbital shot circling around',
      'Plano fijo con parallax': 'locked-off shot with gentle parallax layers of',
      'Macro deslizante': 'sliding macro shot across'
    }[o.camera] || 'slow cinematic shot through';
    const subject = {
      'Fondo cinemático para el hero': `a conceptual landscape that evokes "${topic(b)}"`,
      'Demo de producto animada': `a floating interface of ${brand(b)} showing data transitions smoothly`,
      'Loop abstracto de marca': `abstract shapes in a ${paletteEn(b)} palette, seamlessly looping`,
      'Escena de uso real': `a real ${clean(b.publico) || 'person'} naturally using ${topic(b)}`
    }[o.type] || `a scene about "${topic(b)}"`;
    const clean_ = o.clean ? ' No text, no people.' : '';
    return `${o.tool}: A ${o.duration}-second ${cam} ${subject}. Lighting consistent with the brand palette (${paletteEn(b)}). Movement is smooth and stabilized, guiding the eye toward the center-left where the call to action sits.${clean_} Purpose: background video for the ${brand(b)} landing page.`;
  }

  /* ---------- bloques por técnica ---------- */
  function block(id, b, o, ctx) {
    ctx = ctx || {};
    o = Object.assign(D.defaultOpts(id), o || {});
    const t = D.tech(id);
    const r = { id, num: t.num, name: t.name, phase: t.phase, role: '', instructions: [], constraints: [], deliverables: [] };

    if (id === 'seed') {
      const s = (o.seeds && o.seeds.length ? o.seeds : ['bauhaus']);
      r.role = 'Lead Designer especializado en vanguardia digital y dirección de arte';
      r.instructions.push(`Usa como Seed String (fuente única de verdad estética) la fusión de: ${s.map(x => `«${seedName(x)}»`).join(' + ')}${clean(o.mix) ? ` mezclado con «${clean(o.mix)}»` : ''}. Ancla la retícula, la tipografía, el color, la iconografía y el ritmo del scroll a esa semilla antes de diseñar nada.`);
      s.forEach(x => r.instructions.push(`De «${seedName(x)}» toma: ${seedTraits(x)}.`));
      r.instructions.push('Estructura el Hero evitando el layout estándar: propón una retícula asimétrica donde el espacio negativo sea protagonista.');
      r.instructions.push('Traduce la semilla a un mini sistema de diseño: 2 tipografías (display + texto), una paleta de 4–5 colores con HEX y un patrón gráfico recurrente que aparezca en al menos tres secciones.');
      (o.avoid || []).forEach(a => r.constraints.push(`Prohibido: ${a.toLowerCase()}.`));
      r.deliverables.push('Resumen del sistema de diseño derivado de la semilla (tipografías, HEX, patrón), como comentario al inicio del código.');
    }

    if (id === 'ambitious') {
      const lvl = D.awareness.find(a => String(a.n) === String(o.awareness)) || D.awareness[2];
      r.role = 'estratega de conversión experto en psicología del consumidor';
      r.instructions.push(`Sofisticación del mercado (niveles de consciencia de Eugene Schwartz): nivel ${lvl.n}, «${lvl.name}». Por eso, ${lvl.hint}.`);
      r.instructions.push(`Estructura el copy con el marco ${o.framework} (${D.frameworks[o.framework] || ''}).`);
      if ((o.biases || []).length) r.instructions.push('Activa estos sesgos cognitivos de forma ética: ' + o.biases.map(x => `${x} (${D.biases[x]})`).join('; ') + '.');
      if (clean(o.emotion)) r.instructions.push(`Respuesta emocional exacta buscada al terminar el scroll: ${clean(o.emotion)}.`);
      r.instructions.push(`Divide la página en ${o.blocks} bloques. Para cada uno define: objetivo psicológico, copy principal, elemento visual de apoyo y CTA específico basado en micro-conversiones.`);
      const obs = objectionList(b);
      if (obs.length || (o.biases || []).includes('Inoculación')) {
        r.instructions.push('Aplica la Técnica de Inoculación: presenta las objeciones antes de que el usuario las piense y desmóntalas con datos concretos' + (obs.length ? ': ' + obs.map(([q, a]) => `«${q}»${a ? ` → ${a.replace(/[.\s]+$/, '')}` : ''}`).join('; ') : '') + '.');
      }
      r.instructions.push('Describe la micro-copia de cada sección y qué fricción elimina; habla de funciones solo después de haber mostrado el beneficio.');
      r.deliverables.push(`Mapa de los ${o.blocks} bloques (objetivo psicológico · copy · visual · CTA) como comentario antes del código.`);
    }

    if (id === 'subagents') {
      const n = +o.iterations || 1;
      r.role = 'sistema de dos agentes: un Agente Creador y un Agente Crítico';
      r.instructions.push('Agente Creador: produce una primera versión completa de la landing.');
      r.instructions.push(`Agente Crítico: audítala como experto en ${joinHuman(o.critics && o.critics.length ? o.critics : ['UX'])}. Señala 5 puntos de fricción donde el usuario podría abandonar y cómo reestructurar la jerarquía visual.`);
      r.instructions.push(`Criterio de aceptación: el usuario entiende el beneficio principal en menos de ${o.seconds} segundos; contraste AA en todo el texto; un único CTA primario coherente.`);
      r.instructions.push(`Repite el ciclo crear → criticar → corregir ${n} ${n === 1 ? 'vez' : 'veces'}. No aceptes la primera respuesta.`);
      if (o.abtest) r.instructions.push('Como especialista CRO, reescribe los encabezados con la técnica «Beneficio sobre Característica» y propone un test A/B del CTA principal con variaciones de color, copy y ubicación física.');
      r.deliverables.push('Informe del Agente Crítico (hallazgo → corrección) como comentario al inicio; entrega solo la versión final corregida.');
      if (o.abtest) r.deliverables.push('Variantes A/B del CTA principal documentadas en un comentario.');
    }

    if (id === 'image') {
      const io = Object.assign({}, o, { _negative: !!ctx.negative });
      const ex = imagePrompts(b, io, ctx.seeds);
      r.role = 'director de arte especializado en generación de imágenes con IA';
      r.instructions.push(`Diseña ${o.count} activo(s) visual(es) propio(s) para ${o.tool} — nada de stock. Estilo: ${o.style.toLowerCase()}; relación de aspecto del hero ${o.ratio}; iluminación: ${clean(o.light) || 'coherente'}; paleta ${paletteText(b)}.`);
      r.instructions.push('Mantén consistencia absoluta de iluminación, ángulo de cámara y paleta entre todos los activos: deben sentirse integrados en la interfaz, no pegados encima.');
      r.instructions.push('Escribe cada prompt de imagen en inglés, listo para pegar en la herramienta (con sus parámetros), e indica en qué sección va.');
      r.instructions.push('En la landing, reserva el espacio de cada activo con una composición SVG/CSS que anticipe la imagen final.');
      // En bloque de texto: algunos modelos (p. ej. Gemini) intentan dibujar la imagen si el prompt va suelto
      r.instructions.push('Punto de partida sugerido para el hero (solo texto para copiar en un comentario; no generes la imagen):\n```text\n' + ex[0].text + '\n```');
      r.deliverables.push(`Lista de ${ex.length} prompt(s) de imagen (uso → prompt) como comentario al final del código.`);
    }

    if (id === 'video') {
      r.role = 'motion designer especializado en vídeo generativo';
      r.instructions.push(`Crea una capa de motion design: ${o.type.toLowerCase()} de ${o.duration} s para ${o.tool}, con movimiento de cámara «${o.camera.toLowerCase()}».`);
      r.instructions.push('El movimiento debe ser lento, estable y dirigir la mirada hacia el CTA; nunca competir con el titular.');
      if (o.clean) r.constraints.push('En el vídeo: sin texto y sin personas.');
      r.constraints.push('Sin autoplay con sonido; el hero debe cargar y ser legible aunque el vídeo no cargue.');
      r.instructions.push('En la landing, implementa un fondo animado ligero (CSS o Canvas) que simule el vídeo, con fallback estático y respeto a prefers-reduced-motion.');
      r.instructions.push('Prompt de vídeo sugerido (solo texto para copiar en un comentario; no generes el vídeo):\n```text\n' + videoPrompt(b, o) + '\n```');
      r.deliverables.push('Prompt final de vídeo (en inglés) como comentario en el código.');
    }

    if (id === 'subtractive') {
      r.role = 'diseñador minimalista obsesionado con la pureza funcional';
      r.instructions.push(`Audita cada elemento con la pregunta «¿esto ayuda a la conversión o es ruido?» y elimina el ${o.pct}% de componentes puramente decorativos.`);
      r.instructions.push(`Navegación: ${o.nav.toLowerCase()}. Formulario: máximo ${o.fields} campo(s). Peso visual concentrado en: ${o.focus.toLowerCase()}.`);
      r.instructions.push('Un solo camino hacia el éxito: un único CTA primario (repetido, siempre con el mismo texto) y ningún enlace que saque al usuario de la página.');
      r.instructions.push('Reduce la carga cognitiva: agrupa la información visualmente y elimina etiquetas de texto redundantes.');
      r.deliverables.push('Lista de elementos eliminados y el motivo, como comentario al inicio del código.');
    }

    if (id === 'negative') {
      const banned = String(o.banned || '').split(',').map(clean).filter(Boolean);
      r.role = 'editor especializado en eliminar la huella de la IA';
      if (banned.length) r.constraints.push(`Restricción crítica de redacción — no utilices: ${banned.map(w => `«${w}»`).join(', ')}.`);
      r.instructions.push(`Usa un lenguaje directo, humano y ligeramente autocrítico para generar empatía. Tono de referencia: ${clean(o.toneRef) || 'un experto hablando con un colega'}.`);
      if ((o.visual || []).length) r.constraints.push(`Negativas visuales: no ${o.visual.map(v => v.toLowerCase()).join(', no ')}.`);
      r.instructions.push('Prefiere una estética documental: grano de película, iluminación natural imperfecta y entornos reales.');
      r.constraints.push('Evita los tics visuales de la IA: degradados púrpuras por defecto, blobs difusos sin sentido, iconos genéricos de cohete o bombilla.');
    }

    if (id === 'human') {
      const vdesc = D.voices[o.voice] || '';
      r.role = 'copywriter senior responsable de la voz de marca';
      r.instructions.push(`Usa la IA solo para la arquitectura de la información; escribe el texto final con voz «${o.voice}» (${vdesc})${clean(o.locale) ? `, en ${clean(o.locale)}` : ''}.`);
      if (o.storytelling) r.instructions.push(`Antes de mencionar características, narra el problema${clean(b.problema) ? ` («${clean(b.problema)}»)` : ''} desde la frustración del usuario hasta el alivio final. Crea conexión emocional antes del botón de compra.`);
      if (o.microcopy) r.instructions.push(`Sustituye textos genéricos («Enviar», «Saber más», «Registrarse») por micro-copy que prometa un beneficio inmediato o reduzca la ansiedad (ej. «${goal(b).micro}»).`);
      r.instructions.push('Varía la longitud de las frases para dar ritmo; evita las tríadas de adjetivos y los cierres grandilocuentes.');
      r.deliverables.push('Checklist de reescritura manual: 3–5 frases que una persona debe revisar antes de publicar.');
    }
    return r;
  }

  /* ---------- sinergias entre técnicas (prompt combinado) ---------- */
  function synergies(ids, optsMap) {
    const has = x => ids.includes(x);
    const s = [];
    const seeds = ((optsMap.seed || {}).seeds || []).map(seedName);
    if (has('seed') && has('image')) s.push(`Todos los activos visuales derivan de la semilla${seeds.length ? ` (${seeds.join(' + ')})` : ''}: misma paleta, misma geometría.`);
    if (has('seed') && has('video')) s.push('El movimiento del vídeo respeta la retícula y las formas de la semilla.');
    if (has('image') && has('video')) s.push('Imagen y vídeo comparten iluminación, paleta y ángulo de cámara para que la transición sea invisible.');
    if (has('ambitious') && has('subtractive')) s.push('Conserva la profundidad psicológica pero fusiona bloques: cada sección debe cumplir un objetivo psicológico o desaparece.');
    if (has('ambitious') && has('human')) s.push('Los sesgos cognitivos se expresan con la voz de marca, nunca con frases de manual de marketing.');
    if (has('negative') && has('human')) s.push('La lista de palabras prohibidas aplica también a la reescritura humana y al micro-copy.');
    if (has('negative') && has('image')) s.push('Añade las negativas visuales a cada prompt de imagen (parámetro --no o equivalente).');
    if (has('subtractive') && has('video')) s.push('El vídeo solo vive en el hero; ninguna otra sección lleva movimiento de fondo.');
    if (has('subtractive') && has('image')) s.push('Solo sobreviven los activos que explican el producto; los puramente decorativos se eliminan.');
    if (has('subagents')) s.push('El Agente Crítico verifica además que se cumpla cada técnica combinada (' + ids.filter(i => i !== 'subagents').map(i => D.tech(i).name).join(', ') + ').');
    if (has('seed') && has('negative')) s.push('La semilla sustituye la estética por defecto; las restricciones negativas vigilan que no regrese.');
    return s;
  }

  const ROLE_ORDER = ['seed', 'ambitious', 'subagents', 'subtractive', 'image', 'video', 'negative', 'human'];

  /* ---------- API pública ---------- */
  function single(id, b, o) {
    const t = D.tech(id);
    const r = block(id, b, o, { seeds: [], negative: false });
    const g = goal(b);
    const txt = [
      '# ROL',
      `Actúa como ${r.role}.`,
      '',
      '# OBJETIVO',
      `Diseñar y construir la landing page de «${brand(b)}» (${topic(b)}) aplicando la técnica ${t.num} del tratado de diseño de landing pages con IA, para que el visitante complete esta acción: ${g.label.toLowerCase()}.`,
      '',
      context(b),
      '',
      `# [T${t.num}] ${t.name.toUpperCase()} — Fase ${D.phases[t.phase].label}`,
      `Por qué: ${t.theory}`,
      ...r.instructions.map(i => `- ${i}`),
      '',
      '# RESTRICCIONES',
      ...(r.constraints.length ? r.constraints : []).map(c => `- ${c}`),
      '- No inventes datos, cifras ni testimonios que no estén en el contexto; si faltan, deja marcadores claros [dato por confirmar].',
      '',
      '# ENTREGABLE',
      `- ${deliverableFormat(b)}`,
      ...r.deliverables.map(d => `- ${d}`)
    ].join('\n');
    return {
      kind: 'single', techniques: [id], title: `T${t.num} · ${t.name}`,
      text: txt, brief: JSON.parse(JSON.stringify(b)), opts: { [id]: Object.assign(D.defaultOpts(id), o || {}) }
    };
  }

  function combined(ids, b, optsMap) {
    ids = ROLE_ORDER.filter(x => ids.includes(x));
    optsMap = optsMap || {};
    const ctx = { seeds: ids.includes('seed') ? ((optsMap.seed || {}).seeds || D.defaultOpts('seed').seeds) : [], negative: ids.includes('negative') };
    const blocks = ids.map(id => block(id, b, optsMap[id], ctx));
    const g = goal(b);
    const out = [];
    out.push('# ROL');
    out.push('Actúa como un equipo creativo integrado por: ' + blocks.map(x => x.role).join('; ') + '. Trabajad de forma coordinada y entregad un único resultado coherente.');
    out.push('');
    out.push('# OBJETIVO');
    out.push(`Diseñar y construir la landing page de «${brand(b)}» (${topic(b)}) combinando ${ids.length} técnicas avanzadas para romper el «promedio estadístico» de la IA, con una meta de conversión clara: ${g.label.toLowerCase()}.`);
    out.push('');
    out.push(context(b));
    out.push('');
    out.push('# ESTRATEGIA COMBINADA');
    let n = 0;
    ['descubrir', 'definir', 'entregar'].forEach(ph => {
      const bs = blocks.filter(x => x.phase === ph);
      if (!bs.length) return;
      n++;
      out.push('');
      out.push(`## FASE ${n} · ${D.phases[ph].label.toUpperCase()} — ${D.phases[ph].desc}`);
      bs.forEach(x => {
        out.push(`### [T${x.num}] ${x.name}`);
        x.instructions.forEach(i => out.push(`- ${i}`));
      });
    });
    const syn = synergies(ids, optsMap);
    if (syn.length) {
      out.push('');
      out.push('# SINERGIAS ENTRE TÉCNICAS');
      syn.forEach(s => out.push(`- ${s}`));
    }
    out.push('');
    out.push('# ORDEN DE EJECUCIÓN');
    const steps = [];
    if (ids.some(i => D.tech(i).phase === 'descubrir')) steps.push('Descubrir: fija la semilla estética y el perfil psicológico antes de escribir o maquetar.');
    if (ids.some(i => D.tech(i).phase === 'definir')) steps.push('Definir: ordena la jerarquía de la información y recorta todo lo que no convierte.');
    steps.push('Entregar: produce copy, activos y código final.');
    if (ids.includes('subagents')) steps.push(`Bucle crítico: el Agente Crítico revisa el resultado ${(optsMap.subagents || {}).iterations || 2} veces y solo se entrega la versión corregida.`);
    steps.forEach((s, i) => out.push(`${i + 1}. ${s}`));
    out.push('');
    out.push('# RESTRICCIONES CONSOLIDADAS');
    const cons = [];
    blocks.forEach(x => x.constraints.forEach(c => { if (!cons.includes(c)) cons.push(c); }));
    cons.push('No inventes datos, cifras ni testimonios que no estén en el contexto; si faltan, deja marcadores claros [dato por confirmar].');
    cons.forEach(c => out.push(`- ${c}`));
    out.push('');
    out.push('# ENTREGABLES');
    out.push(`- ${deliverableFormat(b)}`);
    blocks.forEach(x => x.deliverables.forEach(d => out.push(`- [T${x.num}] ${d}`)));
    out.push('');
    out.push('# CHECKLIST DE CALIDAD (verifícalo antes de responder)');
    out.push(`- ¿Se entiende qué es ${brand(b)} y para quién en menos de 5 segundos?`);
    out.push(`- ¿Hay un único CTA primario («${clean(b.cta) || g.cta}» o su versión mejorada) visible sin hacer scroll?`);
    blocks.forEach(x => out.push(`- ¿Se nota la técnica «${x.name}» en el resultado final?`));
    return {
      kind: 'combined', techniques: ids, title: 'Combinado · ' + ids.map(i => 'T' + D.tech(i).num).join(' + '),
      text: out.join('\n'), brief: JSON.parse(JSON.stringify(b)),
      opts: ids.reduce((acc, id) => (acc[id] = Object.assign(D.defaultOpts(id), optsMap[id] || {}), acc), {})
    };
  }

  /* Recupera brief y técnicas a partir del texto (sirve si el usuario editó el prompt) */
  function parse(text) {
    const b = Object.assign({}, D.emptyBrief);
    const t = String(text || '');
    FIELDS.forEach(([k, label]) => {
      const re = new RegExp('^-\\s*' + label.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + ':\\s*(.+)$', 'mi');
      const m = t.match(re);
      if (!m) return;
      const v = m[1].trim();
      if (k === 'beneficios' || k === 'objeciones') b[k] = v.split(/\s;\s/).join('\n');
      else if (k === 'objetivo') { const key = Object.keys(D.goals).find(g => D.goals[g].label.toLowerCase() === v.toLowerCase()); if (key) b.objetivo = key; }
      else if (k === 'paleta') { const hex = v.match(/#[0-9a-f]{6}/gi); if (hex && hex.length >= 2) { b.colorAuto = false; b.color1 = hex[0]; b.color2 = hex[1]; } }
      else b[k] = v;
    });
    if (!b.tema) { const first = t.split('\n').find(l => l.trim() && !l.startsWith('#')); b.tema = first ? first.replace(/^[-*\s]+/, '').slice(0, 80) : 'Nuevo proyecto'; }
    const nums = Array.from(new Set((t.match(/\[T([1-8])\]/g) || []).map(x => +x.replace(/\D/g, ''))));
    const ids = nums.map(nm => D.techniques.find(x => x.num === nm).id);
    return { brief: b, techniques: ids };
  }

  /* Puntuación orientativa de la fuerza del prompt */
  function score(b, ids) {
    const tips = [];
    let s = 0;
    const w = { tema: 12, marca: 6, publico: 12, problema: 8, propuesta: 12, beneficios: 10, objeciones: 5, prueba: 5 };
    Object.keys(w).forEach(k => { if (clean(b[k])) s += w[k]; });
    if (!clean(b.publico)) tips.push('Describe el público objetivo: es lo que más cambia el copy.');
    if (!clean(b.propuesta)) tips.push('Añade una propuesta de valor en una frase.');
    if (!clean(b.problema)) tips.push('Cuenta qué problema resuelves: alimenta el storytelling.');
    if (lines(b.beneficios).length < 3) tips.push('Incluye al menos 3 beneficios (uno por línea).');
    if (!clean(b.prueba)) tips.push('Agrega prueba social real (cifras, clientes, prensa).');
    ids = ids || [];
    s += Math.min(ids.length, 4) * 5;
    const ph = new Set(ids.map(i => D.tech(i).phase));
    s += ph.size * 10 / 3;
    if (ids.length && !ph.has('descubrir')) tips.push('Suma una técnica de la fase Descubrir (semilla o prompt ambicioso).');
    if (ids.length > 1 && !ids.includes('subagents')) tips.push('El bucle con subagentes eleva la calidad de cualquier combinación.');
    return { value: Math.max(0, Math.min(100, Math.round(s))), tips };
  }

  return { single, combined, parse, score, context, imagePrompts, videoPrompt, lines, benefitTitles, objectionList };
})();
