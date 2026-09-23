/* ==========================================================================
   LandingForge IA · Datos base
   Catálogos de técnicas (según el "Tratado práctico: 8 técnicas avanzadas de
   diseño de landing pages con IA"), semillas de estilo, opciones del brief y
   proyectos de ejemplo.
   ========================================================================== */
window.LF = window.LF || {};

LF.data = (function () {
  const phases = {
    descubrir: { label: 'Descubrir', desc: 'Investigar el nicho y salir de la estética genérica.' },
    definir: { label: 'Definir', desc: 'Estructurar la oferta y validar la lógica del diseño.' },
    entregar: { label: 'Entregar', desc: 'Producir activos de alta fidelidad y pulir el resultado.' }
  };

  /* ---------- Semillas de estilo (técnica 1) ---------- */
  const seeds = [
    { id: 'bauhaus', name: 'Minimalismo funcional Bauhaus', traits: 'formas geométricas puras, colores primarios, retícula asimétrica' },
    { id: 'patent50', name: 'Diagramas de patentes de los años 50', traits: 'líneas técnicas, cotas, etiquetas "FIG.", fondo tipo blueprint' },
    { id: 'swiss', name: 'Estilo tipográfico suizo', traits: 'retícula estricta, tipografía grotesca enorme, rojo puro como acento' },
    { id: 'brutalism', name: 'Brutalismo web', traits: 'bordes gruesos, sombras duras, tipografía mono, crudeza honesta' },
    { id: 'editorial70', name: 'Revista editorial de los 70', traits: 'serif expresiva, columnas de revista, tonos tierra cálidos' },
    { id: 'artdeco', name: 'Art Déco', traits: 'simetría, abanicos y rayos dorados, contraste negro y oro' },
    { id: 'japanma', name: 'Ma japonés (espacio negativo)', traits: 'vacío intencional, un solo acento bermellón, calma' },
    { id: 'fibonacci', name: 'Proporción áurea / espiral de Fibonacci', traits: 'proporción 1:1.618, flujo orgánico, espiral como guía del scroll' },
    { id: 'memphis', name: 'Grupo Memphis (años 80)', traits: 'formas lúdicas, patrones, colores saturados, humor visual' },
    { id: 'phosphor', name: 'Terminal de fósforo verde', traits: 'monocromo oscuro, acento verde fósforo, estética de consola' },
    { id: 'didot', name: 'Lujo editorial Didot', traits: 'serif de alto contraste, blanco roto, bronce, silencio visual' }
  ];

  const avoidList = [
    'Degradados púrpuras',
    'Bento grids',
    'Hero con texto a la izquierda e imagen a la derecha',
    'Glassmorphism genérico',
    'Ilustraciones 3D de personajes sonrientes',
    'Fotos de stock'
  ];

  const frameworks = {
    AIDA: 'Atención → Interés → Deseo → Acción',
    PAS: 'Problema → Agitación → Solución',
    BAB: 'Antes → Después → Puente',
    '4P': 'Promesa → Imagen → Prueba → Propuesta',
    StoryBrand: 'Personaje → Problema → Guía → Plan → Llamado a la acción → Éxito'
  };

  const awareness = [
    { n: 1, name: 'Inconsciente del problema', hint: 'abre con una historia o una pregunta que haga visible el problema; no vendas todavía' },
    { n: 2, name: 'Consciente del problema', hint: 'nombra el dolor con precisión y agítalo antes de presentar la solución' },
    { n: 3, name: 'Consciente de la solución', hint: 'explica por qué tu mecanismo es distinto a las alternativas' },
    { n: 4, name: 'Consciente del producto', hint: 'refuerza pruebas, garantías y comparativas para vencer dudas' },
    { n: 5, name: 'Muy consciente', hint: 've directo a la oferta, el precio y la urgencia' }
  ];

  const biases = {
    'Prueba social': 'muestra quién ya lo usa (cifras, menciones en prensa, reseñas) sin invadir',
    'Escasez': 'comunica límites reales de cupos, unidades o tiempo',
    'Autoridad': 'apóyate en credenciales, expertos o certificaciones verificables',
    'Anclaje': 'presenta primero una referencia de valor para que el precio se perciba justo',
    'Reciprocidad': 'regala algo útil antes de pedir la conversión',
    'Aversión a la pérdida': 'enmarca lo que el usuario pierde si no actúa',
    'Inoculación': 'anticipa las objeciones antes de que aparezcan y desmóntalas con datos',
    'Efecto de exclusividad': 'haz sentir que el acceso es selectivo y cuidado'
  };

  const critics = ['UX', 'Psicología del comportamiento', 'CRO (conversión)', 'Accesibilidad WCAG', 'Copy y voz de marca', 'Rendimiento y SEO'];

  const imageTools = ['Midjourney v6', 'DALL·E 3', 'Stable Diffusion XL', 'Flux', 'Ideogram'];
  const imageStyles = {
    'Fotografía macro': 'macro photography, selective depth of field, tactile materials',
    '3D glassmorphism': '3D frosted glass objects, subtle light refraction, soft shadows',
    'Ilustración editorial': 'editorial illustration, flat shapes, grain texture, limited palette',
    'Isométrico técnico': 'isometric technical illustration, clean lines, blueprint details',
    'Texturas abstractas': 'abstract organic textures, fluid shapes, translucent materials',
    'Fotografía documental': 'documentary photography, film grain, natural imperfect light, real environments'
  };
  const videoTools = ['Runway', 'Luma Dream Machine', 'Sora', 'Kling', 'Pika'];
  const videoTypes = ['Fondo cinemático para el hero', 'Demo de producto animada', 'Loop abstracto de marca', 'Escena de uso real'];
  const cameras = ['Drone lento', 'Dolly in suave', 'Órbita alrededor del objeto', 'Plano fijo con parallax', 'Macro deslizante'];

  const navModes = ['Sin menú (solo logo)', 'Mínima: logo + CTA', 'Anclas a 3 secciones'];
  const focusModes = ['Hero + formulario de contacto', 'Hero + prueba social', 'Checkout de una sola página'];

  const bannedWords = ['revolucionario', 'potenciar', 'ecosistema', 'innovador', 'soluciones integrales', 'sinergia', 'de vanguardia', 'desbloquear', 'sumérgete', 'transformar tu vida', 'llevar al siguiente nivel'];
  const visualNegatives = ['Colores sobresaturados', 'Piel perfecta', 'Mirando a cámara', 'Texturas plásticas', 'Oficina genérica de fondo', 'Sonrisas forzadas'];

  const voices = {
    'Directa y cercana': 'como un experto hablando con un colega en un café',
    'Sofisticada y reservada': 'con frases cortas, sin exclamaciones y con seguridad tranquila',
    'Irreverente con humor': 'con ingenio, sin perder claridad ni respeto',
    'Técnica con calidez': 'precisa en los datos pero humana en el trato',
    'Inspiradora y serena': 'pausada, con imágenes sensoriales y sin prisa'
  };

  /* ---------- Las 8 técnicas ---------- */
  const techniques = [
    {
      id: 'seed', num: 1, phase: 'descubrir',
      name: 'Cadenas semilla (SSoT)',
      tagline: 'Ancla la IA a una estética concreta para escapar del diseño promedio.',
      objective: 'Salir de la estética estándar de la industria.',
      risk: 'Convergencia visual genérica.',
      theory: 'Sin una "semilla" de estilo, la IA recurre a lo más probable de su entrenamiento: degradados púrpuras, texto a la izquierda y gráfico a la derecha. Forzar referencias de industrias adyacentes o estilos históricos desvía ese sesgo hacia direcciones nuevas.',
      options: [
        { key: 'seeds', type: 'chips', label: 'Semillas de estilo (elige 1 o 2)', choices: seeds.map(s => ({ value: s.id, label: s.name })), max: 2, default: ['bauhaus'] },
        { key: 'mix', type: 'text', label: 'Referencia adicional (opcional)', placeholder: 'p. ej. carteles de cine polaco', default: '' },
        { key: 'avoid', type: 'chips', label: 'Evitar explícitamente', choices: avoidList.map(a => ({ value: a, label: a })), default: ['Degradados púrpuras', 'Bento grids', 'Hero con texto a la izquierda e imagen a la derecha'] }
      ]
    },
    {
      id: 'ambitious', num: 2, phase: 'descubrir',
      name: 'Prompts ambiciosos',
      tagline: 'Define psicología, nivel de mercado, sesgos y micro-copia, no solo estética.',
      objective: 'Capturar la psicología profunda del cliente.',
      risk: 'Superficialidad en la propuesta.',
      theory: 'Un prompt anémico pide "una landing para X". Uno ambicioso describe la psicología del usuario, la sofisticación del mercado, los sesgos a activar y la respuesta emocional de cada sección.',
      options: [
        { key: 'framework', type: 'select', label: 'Marco de copy', choices: Object.keys(frameworks).map(k => ({ value: k, label: `${k} · ${frameworks[k]}` })), default: 'AIDA' },
        { key: 'awareness', type: 'select', label: 'Nivel de consciencia del mercado', choices: awareness.map(a => ({ value: String(a.n), label: `${a.n}. ${a.name}` })), default: '3' },
        { key: 'biases', type: 'chips', label: 'Sesgos cognitivos (uso ético)', choices: Object.keys(biases).map(k => ({ value: k, label: k })), default: ['Prueba social', 'Inoculación'] },
        { key: 'blocks', type: 'range', label: 'Número de bloques de la página', min: 4, max: 9, default: 7 },
        { key: 'emotion', type: 'text', label: 'Emoción que debe sentir el usuario', placeholder: 'p. ej. alivio y control', default: 'confianza y alivio' }
      ]
    },
    {
      id: 'subagents', num: 3, phase: 'definir',
      name: 'Bucles con subagentes',
      tagline: 'Un agente crea, otro audita. Se itera hasta que solo queda la sustancia.',
      objective: 'Validar la usabilidad, la lógica del diseño y la conversión final (CRO).',
      risk: 'Errores de UX, alucinaciones y diseño estético pero ineficaz.',
      theory: 'No aceptar la primera respuesta: un "agente creador" propone y un "agente crítico" revisa con criterios de UX, accesibilidad y persuasión. El bucle elimina alucinaciones y fricciones.',
      options: [
        { key: 'critics', type: 'chips', label: 'Perfiles del agente crítico', choices: critics.map(c => ({ value: c, label: c })), default: ['UX', 'CRO (conversión)', 'Accesibilidad WCAG'] },
        { key: 'iterations', type: 'range', label: 'Iteraciones crear → criticar → corregir', min: 1, max: 3, default: 2 },
        { key: 'seconds', type: 'range', label: 'Segundos para entender el beneficio', min: 2, max: 8, default: 3 },
        { key: 'abtest', type: 'toggle', label: 'Proponer test A/B del CTA (color, copy, ubicación)', default: true }
      ]
    },
    {
      id: 'image', num: 4, phase: 'entregar',
      name: 'Generación de imágenes',
      tagline: 'Activos propios y coherentes con la marca en lugar de fotos de stock.',
      objective: 'Crear activos únicos de alta fidelidad.',
      risk: 'Uso de stock impersonal.',
      theory: 'Las imágenes de stock delatan una landing mediocre. Generar texturas, ilustraciones y hero-images coherentes con la tipografía y el color transmite profesionalismo y confianza.',
      options: [
        { key: 'tool', type: 'select', label: 'Herramienta', choices: imageTools.map(t => ({ value: t, label: t })), default: 'Midjourney v6' },
        { key: 'style', type: 'select', label: 'Estilo visual', choices: Object.keys(imageStyles).map(k => ({ value: k, label: k })), default: 'Texturas abstractas' },
        { key: 'ratio', type: 'select', label: 'Relación de aspecto del hero', choices: ['16:9', '21:9', '4:5', '1:1'].map(r => ({ value: r, label: r })), default: '16:9' },
        { key: 'count', type: 'range', label: 'Número de activos', min: 1, max: 6, default: 3 },
        { key: 'light', type: 'text', label: 'Iluminación', placeholder: 'p. ej. luz de estudio suave', default: 'luz de estudio suave' }
      ]
    },
    {
      id: 'video', num: 5, phase: 'entregar',
      name: 'Generación de vídeo',
      tagline: 'Una capa de motion design que guía la mirada hacia la conversión.',
      objective: 'Dar gratificación visual inmediata y reducir el rebote.',
      risk: 'Hero estático que no retiene.',
      theory: 'Herramientas como Runway o Luma permiten fondos dinámicos o demos cinemáticas. Un vídeo sutil en el hero guía el ojo hacia el CTA y reduce la tasa de rebote.',
      options: [
        { key: 'tool', type: 'select', label: 'Herramienta', choices: videoTools.map(t => ({ value: t, label: t })), default: 'Runway' },
        { key: 'type', type: 'select', label: 'Tipo de pieza', choices: videoTypes.map(t => ({ value: t, label: t })), default: 'Fondo cinemático para el hero' },
        { key: 'camera', type: 'select', label: 'Movimiento de cámara', choices: cameras.map(c => ({ value: c, label: c })), default: 'Drone lento' },
        { key: 'duration', type: 'range', label: 'Duración (segundos)', min: 3, max: 10, default: 5 },
        { key: 'clean', type: 'toggle', label: 'Sin texto ni personas en el vídeo', default: true }
      ]
    },
    {
      id: 'subtractive', num: 6, phase: 'definir',
      name: 'Diseño sustractivo',
      tagline: 'Elimina todo lo que no ayuda a convertir. Pureza funcional.',
      objective: 'Maximizar la claridad y el enfoque.',
      risk: 'Sobrecarga cognitiva del usuario.',
      theory: 'La IA sufre de horror vacui y rellena el espacio. El diseño sustractivo audita cada elemento: ¿ayuda a la conversión o es ruido? Menos campos, menos menú, un solo camino.',
      options: [
        { key: 'pct', type: 'range', label: '% de elementos decorativos a eliminar', min: 10, max: 50, step: 5, default: 30 },
        { key: 'fields', type: 'range', label: 'Máximo de campos en el formulario', min: 1, max: 5, default: 2 },
        { key: 'nav', type: 'select', label: 'Navegación', choices: navModes.map(n => ({ value: n, label: n })), default: 'Mínima: logo + CTA' },
        { key: 'focus', type: 'select', label: 'Dónde concentrar el peso visual', choices: focusModes.map(f => ({ value: f, label: f })), default: 'Hero + formulario de contacto' }
      ]
    },
    {
      id: 'negative', num: 7, phase: 'entregar',
      name: 'Restricciones negativas',
      tagline: 'Suprime los "tics" que delatan a la IA en el texto y en la imagen.',
      objective: 'Eliminar la "huella digital" de la IA.',
      risk: 'Percepción de falta de autenticidad.',
      theory: 'Las redes neuronales repiten palabras y texturas reconocibles. Prohibirlas explícitamente "des-automatiza" el resultado y gana la confianza de un usuario que detecta el contenido artificial.',
      options: [
        { key: 'banned', type: 'textarea', label: 'Palabras prohibidas (separadas por coma)', default: bannedWords.join(', ') },
        { key: 'visual', type: 'chips', label: 'Negativas visuales', choices: visualNegatives.map(v => ({ value: v, label: v })), default: ['Colores sobresaturados', 'Piel perfecta', 'Texturas plásticas', 'Oficina genérica de fondo'] },
        { key: 'toneRef', type: 'text', label: 'Referencia de tono', default: 'un experto hablando con un colega en un café' }
      ]
    },
    {
      id: 'human', num: 8, phase: 'entregar',
      name: 'Redacción humana',
      tagline: 'La IA arma el esqueleto; la voz, el ritmo y los matices son humanos.',
      objective: 'Conectar emocionalmente con el usuario.',
      risk: 'Tono robótico y predecible.',
      theory: 'La IA estructura bien la información, pero falla en el "alma" del mensaje. Se usa para la arquitectura y el primer borrador; la reescritura (manual o muy dirigida) aporta voz, ritmo y cultura.',
      options: [
        { key: 'voice', type: 'select', label: 'Voz de marca', choices: Object.keys(voices).map(v => ({ value: v, label: v })), default: 'Directa y cercana' },
        { key: 'storytelling', type: 'toggle', label: 'Narrativa de storytelling (problema → alivio)', default: true },
        { key: 'microcopy', type: 'toggle', label: 'Micro-copy persuasivo en botones y etiquetas', default: true },
        { key: 'locale', type: 'text', label: 'Matiz cultural / variante del idioma', placeholder: 'p. ej. español de Colombia', default: '' }
      ]
    }
  ];

  const presets = [
    { id: 'conversion', name: 'Máxima conversión', ids: ['ambitious', 'subagents', 'subtractive', 'human'], desc: 'Psicología + crítica + foco + voz humana' },
    { id: 'disruptive', name: 'Disruptivo visual', ids: ['seed', 'image', 'video', 'negative'], desc: 'Estética única con activos propios' },
    { id: 'authentic', name: 'Auténtico anti-IA', ids: ['seed', 'negative', 'human'], desc: 'Que no parezca hecho por una IA' },
    { id: 'all', name: 'Tratado completo', ids: ['seed', 'ambitious', 'subagents', 'image', 'video', 'subtractive', 'negative', 'human'], desc: 'Las 8 técnicas en un solo prompt' }
  ];

  /* ---------- Opciones del brief ---------- */
  const industries = ['SaaS / Software', 'E-commerce', 'Educación / Cursos', 'Salud y bienestar', 'Fintech / Finanzas', 'Ciberseguridad', 'Consultoría / Servicios B2B', 'Restaurante / Gastronomía', 'Inmobiliaria', 'Turismo / Viajes', 'Biotecnología / Ciencia', 'Moda y lujo', 'Agencia creativa', 'ONG / Causa social', 'Eventos', 'App móvil', 'Otro'];

  const goals = {
    leads: { label: 'Captar clientes potenciales (leads)', cta: 'Solicitar información', micro: 'Recibe tu propuesta en 24 horas', reassure: 'Sin compromiso · Respondemos en menos de 24 h', fields: ['nombre', 'email', 'telefono', 'empresa'] },
    trial: { label: 'Registro / prueba gratis', cta: 'Registrarse', micro: 'Empieza gratis en 30 segundos', reassure: 'Sin tarjeta de crédito · Cancela cuando quieras', fields: ['email', 'nombre', 'empresa'] },
    sale: { label: 'Vender un producto', cta: 'Comprar', micro: 'Quiero el mío', reassure: 'Pago seguro · Envío con seguimiento', fields: ['email', 'nombre', 'telefono'] },
    booking: { label: 'Reservar cita o demo', cta: 'Reservar', micro: 'Elige tu horario en 1 minuto', reassure: 'Confirmación inmediata · Puedes reprogramar', fields: ['nombre', 'email', 'fecha', 'telefono'] },
    app: { label: 'Descargar una app', cta: 'Descargar', micro: 'Descárgala gratis', reassure: 'Disponible para iOS y Android', fields: ['email'] },
    event: { label: 'Inscripción a evento o curso', cta: 'Inscribirse', micro: 'Aparta tu cupo ahora', reassure: 'Recibes el acceso por correo al instante', fields: ['nombre', 'email', 'telefono'] }
  };

  const tones = ['Profesional y confiable', 'Cercano y amigable', 'Sofisticado y exclusivo', 'Enérgico y joven', 'Técnico y preciso', 'Cálido y humano', 'Minimalista y sereno'];
  const languages = ['Español', 'Inglés', 'Portugués', 'Francés'];
  const formats = {
    html: 'HTML autocontenido (CSS y JS embebidos)',
    tailwind: 'HTML + Tailwind CSS (CDN)',
    wire: 'Wireframe + copy (texto estructurado)'
  };

  const emptyBrief = {
    tema: '', marca: '', industria: 'SaaS / Software', publico: '', problema: '', propuesta: '',
    objetivo: 'leads', cta: '', beneficios: '', objeciones: '', prueba: '', oferta: '',
    tono: 'Profesional y confiable', idioma: 'Español', formato: 'html',
    colorAuto: true, color1: '#E4572E', color2: '#1F7A6D'
  };

  /* ---------- Proyectos de ejemplo (también alimentan el banco inicial) ---------- */
  const examples = [
    {
      id: 'ex-quantum',
      label: 'Ciberseguridad cuántica',
      brief: {
        tema: 'Plataforma de ciberseguridad post-cuántica para bancos', marca: 'Qubit Shield', industria: 'Ciberseguridad',
        publico: 'CISOs y equipos de seguridad de bancos medianos', problema: 'los datos cifrados hoy podrán descifrarse mañana con computación cuántica',
        propuesta: 'Cifrado post-cuántico que se instala sin reescribir tu infraestructura',
        objetivo: 'booking', cta: 'Agendar una auditoría', beneficios: 'Migración sin downtime: se integra como proxy en menos de una semana\nInventario criptográfico automático: detecta cada algoritmo vulnerable\nCumplimiento listo: reportes alineados con NIST PQC',
        objeciones: '¿Esto no es un problema de dentro de 10 años? | Los atacantes ya almacenan tráfico cifrado para descifrarlo después.\n¿Tendremos que cambiar todo nuestro stack? | No. Funciona como capa intermedia y convive con tu PKI actual.',
        prueba: '14 bancos protegidos · 0 incidentes en 2025 · Auditado por terceros', oferta: '',
        tono: 'Técnico y preciso', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#39FF88', color2: '#0A0C0B'
      },
      techniques: ['seed', 'negative', 'subtractive'],
      opts: { seed: { seeds: ['phosphor', 'patent50'] } },
      rating: 5
    },
    {
      id: 'ex-watch',
      label: 'Relojería de lujo',
      brief: {
        tema: 'Edición limitada de relojes artesanales', marca: 'Aurum Atelier', industria: 'Moda y lujo',
        publico: 'coleccionistas de relojería mecánica', problema: 'las piezas de verdad únicas son casi imposibles de conseguir',
        propuesta: 'Cuarenta y ocho piezas. Ensambladas a mano. Ninguna igual a otra.',
        objetivo: 'booking', cta: 'Solicitar visita privada', beneficios: 'Calibre manufactura: 212 componentes pulidos a mano\nEsfera de esmalte grand feu: cocida seis veces a 800 °C\nCertificado numerado: firmado por el maestro relojero',
        objeciones: '', prueba: 'Reseñado en Hodinkee · Monochrome · WatchTime', oferta: 'Desde 18.500 €',
        tono: 'Sofisticado y exclusivo', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#9C7A3C', color2: '#121212'
      },
      techniques: ['seed', 'ambitious', 'image', 'human'],
      opts: { seed: { seeds: ['didot'] }, ambitious: { awareness: '4', biases: ['Escasez', 'Efecto de exclusividad', 'Prueba social'] }, human: { voice: 'Sofisticada y reservada' }, image: { style: 'Fotografía macro' } },
      rating: 5
    },
    {
      id: 'ex-calm',
      label: 'App de meditación',
      brief: {
        tema: 'App de meditación de lujo', marca: 'Sereno', industria: 'Salud y bienestar',
        publico: 'profesionales con agendas saturadas', problema: 'la mente no se apaga ni cuando por fin hay silencio',
        propuesta: 'Diez minutos al día para volver a escucharte',
        objetivo: 'app', cta: 'Descargar', beneficios: 'Sesiones de 10 minutos: diseñadas para encajar entre reuniones\nPaisajes sonoros binaurales: grabados en bosques reales\nProgreso sin culpa: sin rachas ni notificaciones insistentes',
        objeciones: 'Ya probé otras apps y las abandoné | Sereno no premia rachas: te acompaña cuando vuelves, sin reproches.', prueba: '4,9 en App Store · 120.000 sesiones al mes', oferta: '7 días gratis',
        tono: 'Minimalista y sereno', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#2F5D50', color2: '#C9A66B'
      },
      techniques: ['seed', 'video', 'human'],
      opts: { seed: { seeds: ['fibonacci'] }, human: { voice: 'Inspiradora y serena' }, video: { type: 'Loop abstracto de marca', camera: 'Plano fijo con parallax' } },
      rating: 4
    },
    {
      id: 'ex-credit',
      label: 'Fintech de micro-créditos',
      brief: {
        tema: 'App de micro-créditos para emprendedores', marca: 'Brío', industria: 'Fintech / Finanzas',
        publico: 'dueños de pequeños negocios sin historial bancario', problema: 'los bancos piden garantías que un negocio pequeño no tiene',
        propuesta: 'Crédito para tu negocio en 24 horas, sin fiador',
        objetivo: 'trial', cta: 'Solicitar crédito', beneficios: 'Respuesta en 24 horas: evaluamos tus ventas, no tu apellido\nCuotas que siguen tus ventas: pagas menos en meses flojos\nSin letra pequeña: la tasa que ves es la que pagas',
        objeciones: '¿Y si mis ventas bajan? | La cuota se ajusta automáticamente a tus ingresos del mes.\n¿Es seguro compartir mis datos? | Cifrado bancario y supervisión de la autoridad financiera.\n¿Cuánto cuesta realmente? | Tasa fija, visible antes de firmar. Sin comisiones ocultas.',
        prueba: '32.000 negocios financiados · 4,8/5 en reseñas', oferta: 'Desde 1,9 % mensual',
        tono: 'Cercano y amigable', idioma: 'Español', formato: 'html', colorAuto: false, color1: '#E4572E', color2: '#1F2A44'
      },
      techniques: ['ambitious', 'subagents', 'subtractive', 'human'],
      opts: { ambitious: { framework: 'PAS', awareness: '2', biases: ['Inoculación', 'Prueba social', 'Aversión a la pérdida'] } },
      rating: 5
    },
    {
      id: 'ex-consult',
      label: 'Consultoría humana',
      brief: {
        tema: 'Consultoría de procesos para pymes', marca: 'Norte & Compañía', industria: 'Consultoría / Servicios B2B',
        publico: 'gerentes de pymes familiares', problema: 'la empresa creció pero los procesos siguen viviendo en la cabeza del dueño',
        propuesta: 'Ordenamos tu operación para que la empresa funcione sin ti en el día a día',
        objetivo: 'leads', cta: 'Pedir diagnóstico', beneficios: 'Diagnóstico en dos semanas: sabrás exactamente dónde se pierde el tiempo\nManuales que la gente usa: escritos con tu equipo, no para archivarlos\nAcompañamiento real: seguimos a tu lado tres meses después',
        objeciones: 'Ya contratamos consultores y solo dejaron un PDF | Por eso trabajamos dentro de tu operación, no desde una sala de juntas.', prueba: '120 pymes acompañadas desde 2014', oferta: '',
        tono: 'Cálido y humano', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#C8553D', color2: '#3E6259'
      },
      techniques: ['seed', 'negative', 'human'],
      opts: { seed: { seeds: ['editorial70'] }, human: { voice: 'Directa y cercana', locale: 'español latinoamericano' } },
      rating: 4
    },
    {
      id: 'ex-bio',
      label: 'Biotecnología',
      brief: {
        tema: 'Laboratorio de proteínas sintéticas para la industria alimentaria', marca: 'Brote Labs', industria: 'Biotecnología / Ciencia',
        publico: 'directores de I+D de empresas de alimentos', problema: 'desarrollar una proteína alternativa tarda años y consume presupuestos enormes',
        propuesta: 'Diseñamos la proteína que tu producto necesita en semanas, no en años',
        objetivo: 'leads', cta: 'Hablar con un científico', beneficios: 'Modelado computacional: miles de variantes evaluadas antes del laboratorio\nEscalado piloto: de gramos a toneladas con el mismo proceso\nRegulación acompañada: dossier listo para EFSA y FDA',
        objeciones: '', prueba: 'Publicaciones en Nature Food · 9 patentes concedidas', oferta: '',
        tono: 'Técnico y preciso', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#1F6FB2', color2: '#E8F1FA'
      },
      techniques: ['seed', 'image', 'subagents', 'ambitious'],
      opts: { seed: { seeds: ['swiss'] }, image: { style: 'Texturas abstractas', tool: 'Midjourney v6' }, ambitious: { framework: '4P', awareness: '3', biases: ['Autoridad', 'Prueba social'] } },
      rating: 4
    }
  ];

  function defaultOpts(techId) {
    const t = techniques.find(x => x.id === techId);
    const o = {};
    if (!t) return o;
    t.options.forEach(op => { o[op.key] = Array.isArray(op.default) ? op.default.slice() : op.default; });
    return o;
  }

  return {
    phases, seeds, avoidList, frameworks, awareness, biases, critics, imageTools, imageStyles,
    videoTools, videoTypes, cameras, navModes, focusModes, bannedWords, visualNegatives, voices,
    techniques, presets, industries, goals, tones, languages, formats, emptyBrief, examples, defaultOpts,
    tech: id => techniques.find(t => t.id === id)
  };
})();
