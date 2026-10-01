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
  const seeds = LF.seedStyles;   // 47 estilos (js/seeds.js); la «semilla» numérica los combina (js/dna.js)

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

  /* Estilos de ilustración dibujada en código (SVG + CSS). El texto es la instrucción que recibe la IA. */
  const imageStyles = {
    'Automático según la semilla': '',
    'Plano geométrico': 'ilustración plana con formas geométricas simples, sin contornos y con colores sólidos de la paleta',
    'Línea fina (line art)': 'dibujo de línea continua fina (trazo uniforme de 2 px), sin relleno salvo un único acento de color',
    'Isométrico': 'ilustración isométrica con cada volumen en tres tonos de la paleta (cara superior, izquierda y derecha)',
    'Collage de recortes': 'formas recortadas y superpuestas con bordes irregulares y sombras de papel',
    'Plano técnico (blueprint)': 'dibujo técnico con cotas, líneas de eje y etiquetas «FIG. n»',
    'Risografía de 2 tintas': 'dos tintas superpuestas con trama de puntos (halftone) y ligero desalineado de impresión',
    'Pixel art': 'ilustración en cuadrícula de píxeles con la paleta reducida',
    'Acuarela vectorial': 'manchas translúcidas de bordes suaves con detalles lineales encima'
  };
  const imageDetail = {
    'Sencillo': 'unos 8 elementos por ilustración, formas muy claras',
    'Detallado': 'al menos 15 elementos por ilustración: capas de fondo, forma principal, sombras, detalles y brillos',
    'Muy detallado': 'más de 30 elementos por ilustración: texturas con patrones SVG, sombras suaves, detalles pequeños, reflejos y profundidad por capas'
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
        { key: 'seed', type: 'hidden', label: 'Semilla del diseño', default: '' },
        { key: 'wild', type: 'hidden', label: 'Nivel de locura', default: '' },
        { key: 'twist', type: 'hidden', label: 'Variante de estilo', default: '' },
        { key: 'colors', type: 'hidden', label: 'Colores', default: null },
        { key: 'fonts', type: 'hidden', label: 'Tipografías', default: null },
        { key: 'seeds', type: 'chips', label: 'Estilos (elige 1 o 2; una semilla los decide por ti)', choices: seeds.map(s => ({ value: s.id, label: s.name })), max: 2, default: ['bauhaus'] },
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
      name: 'Generación de imágenes (dibujadas en código)',
      tagline: 'Ilustraciones propias hechas con SVG y CSS, coherentes con la marca y con el tema.',
      objective: 'Crear activos únicos sin depender de fotos ni de servicios externos.',
      risk: 'Uso de stock impersonal o de formas abstractas vacías.',
      theory: 'Las imágenes de stock delatan una landing mediocre. Dibujar las ilustraciones directamente en código (SVG + CSS) con la paleta y la retícula de la semilla garantiza coherencia, peso mínimo, nitidez en cualquier pantalla y cero dependencias. La calidad depende de la descripción: qué objeto, qué estilo y cuánto detalle.',
      options: [
        { key: 'style', type: 'select', label: 'Estilo de ilustración', choices: Object.keys(imageStyles).map(k => ({ value: k, label: k })), default: 'Automático según la semilla' },
        { key: 'detail', type: 'select', label: 'Nivel de detalle', choices: Object.keys(imageDetail).map(k => ({ value: k, label: k })), default: 'Detallado' },
        { key: 'count', type: 'range', label: 'Número de ilustraciones', min: 1, max: 8, default: 4 },
        { key: 'animate', type: 'toggle', label: 'Micro-animaciones CSS (flotar, dibujar el trazo)', default: true }
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
  const industries = ['SaaS / Software', 'E-commerce', 'Tienda de ropa / Moda', 'Calzado y accesorios', 'Belleza y cosmética', 'Hogar y decoración', 'Deporte y fitness', 'Educación / Cursos', 'Salud y bienestar', 'Fintech / Finanzas', 'Ciberseguridad', 'Consultoría / Servicios B2B', 'Restaurante / Gastronomía', 'Inmobiliaria', 'Turismo / Viajes', 'Biotecnología / Ciencia', 'Moda y lujo', 'Agencia creativa', 'ONG / Causa social', 'Eventos', 'App móvil', 'Otro'];

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
    tema: '', marca: '', industria: '', publico: '', problema: '', propuesta: '',
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
      opts: { seed: { seeds: ['didot'] }, ambitious: { awareness: '4', biases: ['Escasez', 'Efecto de exclusividad', 'Prueba social'] }, human: { voice: 'Sofisticada y reservada' }, image: { style: 'Línea fina (line art)' } },
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
      opts: { seed: { seeds: ['swiss'] }, image: { style: 'Plano técnico (blueprint)' }, ambitious: { framework: '4P', awareness: '3', biases: ['Autoridad', 'Prueba social'] } },
      rating: 4
    },
    {
      id: 'ex-ropa',
      label: 'Tienda de ropa',
      brief: {
        tema: 'Tienda online de ropa urbana unisex de algodón orgánico', marca: 'Urdimbre', industria: 'Tienda de ropa / Moda',
        publico: 'jóvenes de 20 a 35 años que quieren ropa cómoda, duradera y sin logos gigantes', problema: 'la ropa barata se deforma al segundo lavado y la buena cuesta demasiado',
        propuesta: 'Básicos de algodón orgánico que aguantan cientos de lavados',
        objetivo: 'sale', cta: 'Ver la colección', beneficios: 'Algodón orgánico de 280 g: no se deforma ni se transparenta\nTallas reales: guía con medidas y cambios gratis\nEdición corta: cada tanda se agota y no se repite',
        objeciones: '¿Y si no me queda bien? | Cambio de talla gratis en 30 días, sin preguntas.\n¿Se encoge al lavarla? | Viene prelavada: no cambia de tamaño.', prueba: '+4.000 pedidos entregados · 4,8/5 en reseñas · Envío con seguimiento', oferta: '10 % en tu primer pedido',
        tono: 'Enérgico y joven', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#E4572E', color2: '#1F7A6D'
      },
      techniques: ['seed', 'ambitious', 'image', 'human'],
      opts: { seed: { seed: '48213977' }, image: { detail: 'Detallado' }, ambitious: { framework: 'AIDA', awareness: '3', biases: ['Prueba social', 'Escasez', 'Inoculación'] }, human: { voice: 'Directa y cercana' } },
      rating: 5
    },
    {
      id: 'ex-bruma',
      label: 'Streetwear (caos total)',
      brief: {
        tema: 'Marca de ropa streetwear de ediciones limitadas', marca: 'Bruma Club', industria: 'Tienda de ropa / Moda',
        publico: 'jóvenes de 16 a 28 años que siguen la cultura urbana y odian vestirse igual que todos', problema: 'las marcas grandes sacan lo mismo para todo el mundo y en la calle te cruzas tres iguales',
        propuesta: 'Sudaderas y camisetas en tandas de 100 piezas. Cuando se agotan, no vuelven.',
        objetivo: 'sale', cta: 'Entrar al drop', beneficios: 'Tandas de 100 piezas: nadie más lleva la tuya\nAlgodón pesado de 380 g: cae bien y dura años\nEstampados de artistas locales: cada drop firma uno distinto',
        objeciones: '¿Y si se agota antes de que llegue? | Avisamos por correo 24 horas antes de cada drop.\n¿Las tallas son grandes? | Corte oversize: si dudas, pide tu talla habitual.', prueba: '12 drops agotados · +9.000 seguidores · Envíos a todo el país', oferta: 'Próximo drop el viernes',
        tono: 'Enérgico y joven', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#E4572E', color2: '#1F7A6D'
      },
      techniques: ['seed', 'negative', 'human', 'image'],
      opts: { seed: { seed: 'chaos-3', wild: 3 }, human: { voice: 'Irreverente con humor' }, image: { detail: 'Detallado' } },
      rating: 5
    },
    {
      id: 'ex-zapatos',
      label: 'Zapatillas artesanales',
      brief: {
        tema: 'Zapatillas de cuero hechas a mano por encargo', marca: 'Paso Norte', industria: 'Calzado y accesorios',
        publico: 'adultos de 28 a 50 años que valoran lo hecho a mano y quieren calzado que se pueda reparar', problema: 'las zapatillas de moda se despegan en un año y no tienen arreglo',
        propuesta: 'Zapatillas de cuero cosidas a mano que se resuelan en vez de tirarse',
        objetivo: 'sale', cta: 'Elegir mis zapatillas', beneficios: 'Cuero curtido al vegetal: se adapta a tu pie con el uso\nSuela cosida, no pegada: cualquier zapatero puede cambiarla\nHechas en tu talla: medimos tu pie por videollamada',
        objeciones: '¿Tardan mucho? | Cada par tarda tres semanas en el taller y te avisamos en cada etapa.\n¿Y si no me quedan? | Las ajustamos sin coste o te devolvemos el dinero.', prueba: '2.300 pares entregados · 4,9/5 en reseñas · Taller en funcionamiento desde 2016', oferta: 'Resuelado gratis el primer año',
        tono: 'Cálido y humano', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#8A4B2A', color2: '#2E4A3F'
      },
      techniques: ['seed', 'ambitious', 'image', 'human'],
      opts: { seed: { seed: 'suela-27', wild: 1 }, ambitious: { framework: 'BAB', awareness: '3', biases: ['Autoridad', 'Prueba social', 'Inoculación'] }, human: { voice: 'Directa y cercana' }, image: { detail: 'Detallado' } },
      rating: 4
    },
    {
      id: 'ex-skin',
      label: 'Cosmética (sobrio)',
      brief: {
        tema: 'Sérum facial de vitamina C estable para piel sensible', marca: 'Aurora Skin', industria: 'Belleza y cosmética',
        publico: 'mujeres y hombres de 25 a 45 años con piel sensible que han reaccionado mal a otros sérums', problema: 'los sérums de vitamina C suelen irritar o se oxidan a las pocas semanas',
        propuesta: 'Vitamina C que no irrita y se mantiene estable hasta el último día',
        objetivo: 'sale', cta: 'Probar el sérum', beneficios: 'Fórmula estable: envase opaco sin aire que evita la oxidación\nPensado para piel sensible: sin alcohol ni perfume añadido\nRutina de tres pasos: sin complicarte la mañana',
        objeciones: '¿Me irritará? | Por eso incluimos una prueba de 30 días con devolución.\n¿En cuánto se nota? | La piel suele verse más uniforme a partir de la cuarta semana de uso constante.', prueba: 'Dermatólogos revisaron la fórmula · 4,7/5 en reseñas verificadas', oferta: 'Envío gratis en tu primer pedido',
        tono: 'Minimalista y sereno', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#C9793A', color2: '#2F4F4A'
      },
      techniques: ['seed', 'human', 'negative', 'image'],
      opts: { seed: { seed: 'rocio-4', wild: 0 }, human: { voice: 'Sofisticada y reservada' }, image: { detail: 'Detallado' } },
      rating: 4
    },
    {
      id: 'ex-hogar',
      label: 'Cerámica y hogar',
      brief: {
        tema: 'Cerámica artesanal para la mesa y la casa', marca: 'Barro & Lino', industria: 'Hogar y decoración',
        publico: 'parejas jóvenes que amueblan su primer hogar y buscan piezas con carácter', problema: 'la decoración de cadena es igual en todas las casas y se nota fría',
        propuesta: 'Piezas de cerámica y lino hechas por un taller familiar, una a una',
        objetivo: 'sale', cta: 'Ver la colección', beneficios: 'Cada pieza es única: el esmalte nunca sale igual\nApta para el día a día: va al lavavajillas y al horno\nEmbalaje sin plástico: llega protegida en papel y lino',
        objeciones: '¿Se rompen al enviarlas? | Las embalamos a mano y si llega dañada la reponemos sin preguntas.\n¿Combinan entre sí? | Las colecciones comparten paleta: todo encaja.', prueba: 'Taller familiar desde 2009 · +6.500 piezas enviadas', oferta: '',
        tono: 'Cálido y humano', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#B5653B', color2: '#6B7F5E'
      },
      techniques: ['seed', 'image', 'human'],
      opts: { seed: { seed: 'arcilla-10', wild: 1 }, human: { voice: 'Inspiradora y serena' }, image: { detail: 'Detallado' } },
      rating: 4
    },
    {
      id: 'ex-cafe',
      label: 'Café de especialidad',
      brief: {
        tema: 'Cafetería y tostadora de café de especialidad', marca: 'Fuego Lento', industria: 'Restaurante / Gastronomía',
        publico: 'vecinos y trabajadores del barrio que quieren buen café sin ceremonias', problema: 'el buen café suele venir con precios de lujo y baristas que te hacen sentir que no sabes pedir',
        propuesta: 'Café tostado esta semana, servido sin pretensiones',
        objetivo: 'booking', cta: 'Reservar mesa', beneficios: 'Tostado cada martes: nunca bebes café viejo\nGranos de fincas que conocemos por su nombre\nPanadería del día: horneada en el local cada mañana',
        objeciones: '¿Es caro? | El espresso cuesta lo mismo que en cualquier cadena.\n¿Puedo trabajar con el portátil? | Sí, hay enchufes y wifi todo el día excepto el brunch del domingo.', prueba: '4,8 en Google con 1.200 reseñas · Tostadores locales desde 2018', oferta: 'Menú de desayuno 9 €',
        tono: 'Cercano y amigable', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#7A3E1D', color2: '#E0B050'
      },
      techniques: ['seed', 'ambitious', 'image', 'human'],
      opts: { seed: { seed: 'grano-4', wild: 2 }, ambitious: { framework: 'AIDA', awareness: '4', biases: ['Prueba social', 'Reciprocidad'] }, human: { voice: 'Directa y cercana' }, image: { detail: 'Detallado' } },
      rating: 4
    },
    {
      id: 'ex-ruta',
      label: 'Viajes a la Patagonia',
      brief: {
        tema: 'Viajes en grupo pequeño por la Patagonia', marca: 'Ruta Sur', industria: 'Turismo / Viajes',
        publico: 'viajeros de 30 a 55 años que quieren naturaleza sin multitudes ni tours masivos', problema: 'los tours populares van llenos y pasan por los miradores a toda prisa',
        propuesta: 'Nueve días por la Patagonia en grupos de máximo ocho personas',
        objetivo: 'booking', cta: 'Ver fechas', beneficios: 'Grupos de máximo 8: guía local que conoce cada sendero\nRuta a contramano de los tours masivos\nTodo incluido: alojamiento, traslados y comidas',
        objeciones: '¿Hace falta estar en forma? | Hay caminatas de nivel medio; la ruta se adapta al ritmo del grupo.\n¿Y si cancelo? | Devolvemos el depósito hasta 60 días antes de la salida.', prueba: '14 salidas realizadas · 4,9/5 de los viajeros · Guías certificados', oferta: 'Desde 2.450 € por persona',
        tono: 'Cálido y humano', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#1F6F8B', color2: '#E07A3F'
      },
      techniques: ['seed', 'ambitious', 'image', 'human'],
      opts: { seed: { seed: 'ruta-24', wild: 1 }, ambitious: { framework: 'StoryBrand', awareness: '2', biases: ['Escasez', 'Prueba social'] }, human: { voice: 'Inspiradora y serena' }, image: { detail: 'Detallado' } },
      rating: 4
    },
    {
      id: 'ex-casa',
      label: 'Inmobiliaria boutique',
      brief: {
        tema: 'Apartamentos nuevos en un barrio céntrico y tranquilo', marca: 'Casa Norte', industria: 'Inmobiliaria',
        publico: 'parejas y familias jóvenes que compran su primera vivienda', problema: 'comprar piso asusta: hay letra pequeña, gastos que no se ven y nadie explica el proceso',
        propuesta: 'Apartamentos listos para entrar, con el proceso de compra explicado paso a paso',
        objetivo: 'booking', cta: 'Agendar visita', beneficios: 'Precio cerrado: sin gastos ocultos al firmar\nEntrega con fecha garantizada y penalización si nos retrasamos\nAsesor que te acompaña hasta recibir las llaves',
        objeciones: '¿Y si no me dan hipoteca? | Te ayudamos a pre-aprobarla antes de reservar, sin coste.\n¿Puedo ver el piso antes de comprar? | Hay un apartamento piloto amueblado abierto de lunes a sábado.', prueba: '18 años construyendo · 640 familias ya viven en nuestros edificios', oferta: 'Desde 1.950 €/m²',
        tono: 'Profesional y confiable', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#2B4C7E', color2: '#C9A227'
      },
      techniques: ['seed', 'subagents', 'subtractive', 'human'],
      opts: { seed: { seed: 'cimiento-28', wild: 0 }, human: { voice: 'Técnica con calidez' } },
      rating: 4
    },
    {
      id: 'ex-curso',
      label: 'Curso de programación',
      brief: {
        tema: 'Curso intensivo de programación para adultos que cambian de carrera', marca: 'Taller Código', industria: 'Educación / Cursos',
        publico: 'adultos de 28 a 45 años que trabajan en otro sector y quieren pasarse a tecnología', problema: 'los cursos online se abandonan a la tercera semana y nadie te ayuda con lo que te atascas',
        propuesta: 'Aprende a programar en 12 semanas con un mentor que revisa tu código cada semana',
        objetivo: 'event', cta: 'Reservar mi cupo', beneficios: 'Mentor asignado: revisa tu código cada semana, no un foro\nClases por la tarde: compatible con tu trabajo actual\nProyecto final para tu portafolio: lo presentas ante empresas',
        objeciones: '¿Y si no tengo base? | El curso empieza desde cero y hay una semana de nivelación.\n¿Sirve para encontrar trabajo? | El 70 % de los últimos egresados recibió oferta en seis meses [dato por confirmar].', prueba: '420 egresados · 4,8/5 de los alumnos · Alianza con 35 empresas', oferta: 'Cupo limitado: 24 por cohorte',
        tono: 'Cercano y amigable', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#2F6BFF', color2: '#FFB020'
      },
      techniques: ['seed', 'ambitious', 'subagents', 'human'],
      opts: { seed: { seed: 'aula-11', wild: 2 }, ambitious: { framework: 'PAS', awareness: '2', biases: ['Escasez', 'Inoculación', 'Prueba social'] }, human: { voice: 'Directa y cercana' } },
      rating: 4
    },
    {
      id: 'ex-box',
      label: 'Gimnasio de boxeo (caos)',
      brief: {
        tema: 'Gimnasio de boxeo para principiantes en la ciudad', marca: 'Pulso Box', industria: 'Deporte y fitness',
        publico: 'adultos de 22 a 45 años que quieren ponerse en forma sin ir a un gimnasio frío y aburrido', problema: 'los gimnasios de máquinas aburren y la gente deja de ir al mes',
        propuesta: 'Boxeo en grupo de 45 minutos: sudas, te diviertes y vuelves mañana',
        objetivo: 'booking', cta: 'Reservar clase de prueba', beneficios: 'Primera clase sin nivel previo: te enseñamos desde cero\nGrupos de 12: el entrenador te corrige cada golpe\nSin permanencia: pagas mes a mes y cancelas cuando quieras',
        objeciones: '¿Tengo que pelear? | No: es entrenamiento con saco y técnica, sin contacto.\n¿Y si estoy fuera de forma? | Cada ejercicio tiene versión suave y el ritmo lo marcas tú.', prueba: '+600 socios activos · 4,9/5 en reseñas · Entrenadores con licencia', oferta: 'Primera clase gratis',
        tono: 'Enérgico y joven', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#E03A1E', color2: '#111111'
      },
      techniques: ['seed', 'negative', 'human'],
      opts: { seed: { seed: 'ring-33', wild: 3 }, human: { voice: 'Irreverente con humor' } },
      rating: 4
    },
    {
      id: 'ex-ong',
      label: 'ONG de reforestación',
      brief: {
        tema: 'Organización que reforesta bosque nativo con comunidades locales', marca: 'Raíces Vivas', industria: 'ONG / Causa social',
        publico: 'personas de 25 a 60 años que quieren ayudar al medio ambiente y no saben si sus donaciones llegan', problema: 'muchas campañas de plantar árboles no dicen cuántos sobreviven ni dónde están',
        propuesta: 'Cada árbol que financias tiene coordenadas, nombre de quien lo cuida y seguimiento anual',
        objetivo: 'leads', cta: 'Plantar mi primer árbol', beneficios: 'Seguimiento por coordenadas: ves tu árbol en el mapa\nEspecies nativas: no plantamos monocultivos\nComunidades locales contratadas: cada árbol da empleo',
        objeciones: '¿Cuánto llega de verdad al bosque? | El 82 % de cada donación va directo a plantación y cuidado [dato por confirmar].\n¿Cómo sé que sobreviven? | Medimos la supervivencia cada año y publicamos el informe.', prueba: '38.000 árboles plantados · 14 comunidades · Auditoría externa anual', oferta: 'Desde 8 € por árbol',
        tono: 'Cálido y humano', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#2F6B3B', color2: '#D98A2B'
      },
      techniques: ['seed', 'ambitious', 'human', 'negative'],
      opts: { seed: { seed: 'raiz-18', wild: 1 }, ambitious: { framework: 'BAB', awareness: '2', biases: ['Autoridad', 'Prueba social', 'Inoculación'] }, human: { voice: 'Inspiradora y serena' } },
      rating: 4
    },
    {
      id: 'ex-crm',
      label: 'Software para pymes',
      brief: {
        tema: 'Software de facturación y cobros para pequeños negocios', marca: 'Cobra', industria: 'SaaS / Software',
        publico: 'dueños de pequeños negocios y autónomos que facturan en hojas de cálculo', problema: 'perder horas persiguiendo facturas y cobros que se olvidan',
        propuesta: 'Factura en un minuto y deja que Cobra recuerde los pagos por ti',
        objetivo: 'trial', cta: 'Empezar gratis', beneficios: 'Facturas en un minuto: desde el móvil y con tu logo\nRecordatorios automáticos: Cobra insiste por ti con educación\nResumen del mes: sabes cuánto te deben sin abrir una hoja de cálculo',
        objeciones: '¿Es difícil cambiar de sistema? | Importas tus clientes desde Excel en cinco minutos.\n¿Y si necesito ayuda? | Hay soporte humano por chat en horario laboral.', prueba: '7.200 negocios activos · 1,3 M de facturas emitidas [dato por confirmar]', oferta: '30 días gratis',
        tono: 'Profesional y confiable', idioma: 'Español', formato: 'html', colorAuto: true, color1: '#0F766E', color2: '#F59E0B'
      },
      techniques: ['seed', 'ambitious', 'subagents', 'subtractive'],
      opts: { seed: { seed: 'balance-24', wild: 1 }, ambitious: { framework: 'PAS', awareness: '3', biases: ['Inoculación', 'Reciprocidad'] } },
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
    phases, seeds, avoidList, frameworks, awareness, biases, critics, imageStyles, imageDetail,
    videoTools, videoTypes, cameras, navModes, focusModes, bannedWords, visualNegatives, voices,
    techniques, presets, industries, goals, tones, languages, formats, emptyBrief, examples, defaultOpts,
    tech: id => techniques.find(t => t.id === id)
  };
})();
