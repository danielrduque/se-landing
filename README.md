# LandingForge IA

**Aplicación web para generar automáticamente prompts de landing pages, combinarlos, ejecutarlos y guardar las mejores landings junto al prompt que las creó.**

La app convierte las **8 técnicas avanzadas de diseño de landing pages con IA** del tratado de la clase en prompts completos, listos para usar:

| Fase | Técnica | Qué aporta al prompt |
|---|---|---|
| Descubrir | **T1 · Cadenas semilla (SSoT)** | Ancla la estética a 1 o 2 estilos (Bauhaus, suizo, brutalismo, Art Déco, Ma japonés, Fibonacci…) y prohíbe los clichés. |
| Descubrir | **T2 · Prompts ambiciosos** | Marco de copy (AIDA, PAS, BAB, 4P, StoryBrand), nivel de consciencia del mercado, sesgos cognitivos, inoculación de objeciones. |
| Definir | **T3 · Bucles con subagentes** | Agente creador + agente crítico (UX, CRO, accesibilidad…), iteraciones y test A/B del CTA. |
| Definir | **T6 · Diseño sustractivo** | % de elementos a eliminar, navegación mínima, máximo de campos del formulario. |
| Entregar | **T4 · Generación de imágenes** | Prompts de imagen en inglés para Midjourney / DALL·E / Flux, coherentes con la marca. |
| Entregar | **T5 · Generación de vídeo** | Prompt de vídeo (Runway, Luma, Sora…) con cámara, duración y propósito. |
| Entregar | **T7 · Restricciones negativas** | Palabras prohibidas y negativas visuales para quitar la «huella» de la IA. |
| Entregar | **T8 · Redacción humana** | Voz de marca, storytelling problema → alivio, micro-copy persuasivo. |

---

## Novedades: semillas, sectores e imágenes

### Semilla del diseño (como en Minecraft)
En el paso 2 hay un panel **🌱 Semilla del diseño**: escribe un número o una palabra (o pulsa 🎲) y se genera un **ADN de diseño determinista**: el mismo valor da siempre el mismo diseño y cualquier cambio da otro. Decide 1–2 estilos de un catálogo de **47** (Bauhaus, Wabi-sabi, Streetwear, Workwear/denim, Lookbook de alta moda, Risograph…), una paleta generada (nunca morado de IA, con contraste AA), el par tipográfico, la retícula del hero, el sistema de beneficios, la forma de las esquinas, textura, movimiento, tratamiento de imagen, densidad y estilo de botón. Además hay un **nivel de locura** (sobrio · atrevido · loco · caos total; lo decide la semilla o lo fijas tú) que activa rasgos extremos: fondos con patrón, bordes de sección en ola/zigzag/rasgado/diagonal, tarjetas tipo sticker/polaroid/ticket/cinta, titulares en contorno, inclinados, con marcador o gigantes, navegación en píldora o centrada, cinta marquesina, formas decorativas sueltas, orden de bloques barajado (solo los que pueden moverse), una tercera tipografía de acento y heros nuevos (gigante, diagonal, collage). La galería «8 mundos» permite elegir visualmente.

**Catálogo de la semilla:** 517 estilos (47 base × 10 variantes: nocturna, pastel, neón, monocroma, tierra, océano, solar, bosque, ceniza y alto contraste), 62 paletas con nombre más infinitas generadas, más de 3.500 pares de tipografías (≈100 para titulares × 34 para texto, más una tercera de acento), 20 heros, 19 sistemas de beneficios, 13 estilos de tarjeta, 17 fondos con patrón, 11 bordes entre secciones, 12 titulares, 8 navegaciones, 8 botones y 15 formas decorativas. Combinados salen cientos de millones de diseños.

**Elige tú lo que quieras:** en «🎨 Personalizar» puedes fijar la **variante**, las **tipografías** (titulares y texto), los **5 colores** (fondo, texto, primario, acento y acento 2, con selector de color), una de las 62 paletas con nombre o invertir claro/oscuro. Lo que no fijes lo sigue decidiendo la semilla. Si en el paso 1 desmarcas «que la IA proponga la paleta», tus colores de marca también mandan sobre la semilla. Ese ADN entra en el prompt (sección `# ADN DE DISEÑO`) y en el motor local. Tocar un estilo a mano desactiva la semilla.

### Packs de sector
Antes todas las landings recibían la misma maqueta (dashboard con KPIs), lo que no tenía sentido para una tienda. Ahora cada sector (`js/verticals.js`) define qué debe verse, qué está **prohibido**, la **arquitectura de la página** (bloques con objetivo, contenido y visual) y sus prompts de imagen. Hay packs de ropa/moda, belleza, hogar, e-commerce, restaurante, viajes, inmobiliaria, educación, salud/deporte, software y servicios. Cada pack trae además sus **motivos visuales propios** (guantes, saco y pesas para boxeo; platos y tazas para restaurante; casas y llaves para inmobiliaria; dientes y cruz médica para una clínica…) y una regla de **coherencia**: nada de otro sector puede aparecer (ni camisetas en un gimnasio ni dashboards en una tienda). Se elige por el sector del brief o, si sigue en «SaaS», por las palabras del tema (p. ej. «tienda de ropa»). El motor local dibuja **siluetas de prendas y productos** en SVG (camiseta, sudadera, vestido, jean, chaqueta, zapatilla, frasco, taza, lámpara…) con colores, tallas y botón de compra.

### Prompt estructurado
Orden fijo: Rol → Objetivo → Contexto → **ADN de diseño** → **Sector y vocabulario visual** → **Arquitectura de la página** → Técnicas → **Imágenes de esta landing** → **Protocolo de activos** → Restricciones → Entregables → Checklist (con comprobaciones propias del sector).

### Todo dibujado en código (sin fotos)
La técnica 4 ahora es **«Generación de imágenes (dibujadas en código)»**: la IA dibuja las ilustraciones directamente en **SVG y CSS**, propias del tema y con la paleta y el estilo de la semilla. No hay fotos, ni servicios de imágenes, ni claves extra. Opciones: estilo de ilustración (plano geométrico, línea fina, isométrico, collage, blueprint, risografía, pixel art, acuarela vectorial), nivel de detalle y micro-animaciones CSS. El prompt incluye una lista «ILUSTRACIONES DE ESTA LANDING» con qué dibujar en cada sección (productos de la tienda, guantes y saco para boxeo, taza y plato para un café…) y un protocolo con 43 siluetas listas (`data-lf-shape`). Si el objeto no está en la librería, la IA dibuja su propio SVG.

## Cómo abrirla

No necesita instalación ni internet para funcionar (solo para las fuentes tipográficas y el modo «IA real»).

1. Abre la carpeta `LandingForge`.
2. Haz doble clic en **`index.html`** (Chrome, Edge o Firefox actualizados).

### Con IA real y la clave en `.env` (recomendado)

1. Copia `.env.example` como `.env` y pega tu clave en `AI_API_KEYS` (puedes poner varias separadas por comas: si una falla se usa la siguiente). Gemini gratis: https://aistudio.google.com/apikey.
2. Dentro de la carpeta `LandingForge`, ejecuta `python server.py` (no hay que instalar nada).
3. Entra a `http://localhost:8765`. En el Estudio, «IA real» queda seleccionada con la clave del servidor: no hay que pegar nada.

- El servidor lee la clave del `.env` y llama a la IA por su cuenta: **la clave nunca llega al navegador** y el servidor no deja descargar el `.env`.
- Si el modelo principal (`AI_MODEL`) está saturado o sin cuota, prueba en orden los de `AI_FALLBACK_MODELS`.
- La cuota gratuita de Gemini es de unas 20 peticiones al día por modelo.
- **No entregues ni compartas el archivo `.env`**; entrega `.env.example`.

---

## Cómo se usa (4 pasos)

### 1 · Proyecto
Escribe el **tema** (único campo obligatorio) y los datos básicos: marca, sector, objetivo de conversión, público, problema, propuesta de valor, beneficios, objeciones, prueba social, oferta, tono, idioma, colores y formato de salida.
- **Cargar un ejemplo** rellena un proyecto completo (17 ejemplos) y sugiere técnicas.
- El medidor **Fuerza del brief** indica qué falta para que el prompt sea más preciso.
- Todo se guarda automáticamente en el navegador.

### 2 · Técnicas y prompts
- Marca una o varias técnicas. Cada tarjeta tiene **opciones propias** (semillas, marco de copy, perfiles del crítico, herramienta de imagen, etc.) y un botón **«¿Por qué funciona?»**.
- **Generar solo esta** → un prompt de esa técnica.
- **✨ Redactar con IA** (activo cuando hay IA configurada): la IA escribe el prompt a partir de tu proyecto, las técnicas elegidas y su fundamento del tratado; se ve redactándose en vivo y lleva la etiqueta «✨ IA». Sin IA, los prompts se arman al instante con plantillas.
- **Un prompt por técnica** → genera un prompt independiente por cada técnica marcada.
- **Prompt combinado** (2 o más técnicas) → un único prompt que ordena las técnicas por fases (Descubrir → Definir → Entregar), añade **sinergias entre técnicas**, **restricciones consolidadas**, **entregables** y un **checklist de calidad**.
- Combinaciones rápidas: *Máxima conversión*, *Disruptivo visual*, *Auténtico anti-IA* y *Tratado completo*.
- Cada prompt se puede **editar**, **copiar**, **descargar en .md** o **ejecutar**. El historial guarda los últimos 60.

### 3 · Estudio (ejecutar el prompt)
Elige el prompt y el motor:
- **Motor local** (instantáneo, sin conexión): construye una landing page real aplicando las técnicas del prompt. Cada técnica cambia el resultado de forma visible (ver tabla abajo).
- **IA real**: envía el prompt a **Claude** (API de Anthropic, modelos Opus 5, Sonnet 5 o Haiku 4.5) o a cualquier proveedor compatible con `/chat/completions` (OpenAI, Gemini, Groq, OpenRouter, Ollama local). La landing se va dibujando en vivo mientras se genera.

Con IA real, la pestaña **En vivo** muestra la construcción paso a paso: los pasos que va completando la IA (estilos, encabezado, cada sección con su título, formulario, pie…), la página a medio construir y el código apareciendo en tiempo real.

La vista previa tiene modos **escritorio / tableta / móvil**, pestañas **Vista / Código / Informe**, y botones para **abrir en otra pestaña**, **descargar el HTML** y **guardar en el banco**.

### 4 · Banco de landings
- Cada landing aparece con su **miniatura en vivo y, al lado, el prompt que la creó**.
- **Ver landing + prompt** abre la vista dividida: la web a la izquierda y el prompt completo a la derecha.
- Valoración con **estrellas**, marca de **destacada**, **búsqueda**, **filtro por técnica** y orden por **mejor valoradas**.
- **Re-ejecutar** un prompt del banco, **descargar**, **eliminar**, **exportar/importar** el banco en JSON y **restaurar ejemplos**.
- Viene precargado con 17 landings de ejemplo de distintos sectores (ropa, streetwear, zapatillas, cosmética, hogar, café, viajes, inmobiliaria, curso, boxeo, ONG, software…), cada una con su semilla y nivel de locura. Los ejemplos nuevos se suman solos al banco una vez; los que borres no vuelven.
- Con `server.py`, el banco se guarda en la carpeta **`bank/`** del proyecto (un archivo JSON por landing, con su HTML y su prompt): no se pierde al borrar el navegador y viaja con el repositorio. Sin servidor, se guarda solo en el navegador.

---

## Cumplimiento de los requisitos de la actividad

| Requisito | Dónde se cumple |
|---|---|
| 1. Colocar el tema y los datos básicos | Paso 1 «Proyecto» (formulario guiado, ejemplos, medidor de calidad). |
| 2. Crear un prompt por cada técnica o la que se escoja | Paso 2: «Generar solo esta» en cada tarjeta y «Un prompt por técnica». |
| 3. Seleccionar dos o más técnicas y generar otro prompt | Paso 2: «Prompt combinado» (activo desde 2 técnicas) + combinaciones rápidas. |
| 4. Banco de landing pages con el prompt al lado | Paso 4: tarjetas y vista detallada con la web y su prompt lado a lado, valoración y destacadas. |
| 5. Ejecutar el prompt dentro de la app y construir la landing | Paso 3 «Estudio»: motor local sin conexión o IA real con streaming. |
| Nota: intuitiva y fácil de manejar | Flujo de 4 pasos numerados, ejemplos, textos de ayuda, guía integrada, modo claro/oscuro, diseño adaptable a móvil, atajo Ctrl+Enter. |

---

## Qué hace cada técnica en el motor local

| Técnica | Efecto en la landing construida |
|---|---|
| T1 Semilla | Cambia tipografías, paleta, retícula del hero, ornamentos SVG y estilo de tarjetas (11 estilos; con 2 semillas los fusiona). Sin semilla la landing cae a propósito en la estética «promedio» de IA para mostrar la diferencia. |
| T2 Ambicioso | Reordena las secciones según el marco de copy, adapta el titular al nivel de consciencia y añade inoculación de objeciones, escasez o prueba social. |
| T3 Subagentes | Agente crítico que corrige contraste (WCAG AA), titulares largos, CTA y formulario, y deja un informe con propuesta de test A/B. |
| T4 Imágenes | Ilustraciones SVG generativas coherentes con la semilla + galería + prompts de imagen incluidos en el código. |
| T5 Vídeo | Fondo animado en canvas que simula el vídeo (respeta «reducir movimiento») + prompt de vídeo. |
| T6 Sustractivo | Elimina secciones decorativas según el %, reduce menú, beneficios y campos del formulario. |
| T7 Negativas | Sustituye las palabras prohibidas y quita degradados y púrpuras típicos de IA. |
| T8 Humana | Historia «antes → giro → después», micro-copy en botones y voz de marca. |

La pestaña **Informe** del Estudio explica qué hizo cada técnica en cada construcción.

---

## Estructura del proyecto

```
LandingForge/
├── server.py         Servidor local: sirve la app y llama a la IA con la clave del .env
├── .env.example      Plantilla de configuración (copiar como .env)
├── index.html        Interfaz (4 pasos + guía)
├── css/styles.css    Estilos (modo claro/oscuro, responsive)
└── js/
    ├── seeds.js      47 estilos de semilla y pares tipográficos curados
    ├── seeds2.js     10 variantes, 62 paletas con nombre y librería de tipografías
    ├── dna.js        Generador de semillas (ADN de diseño determinista)
    ├── verticals.js  Packs de sector y siluetas de producto SVG
    ├── assets.js     Convierte marcadores de la IA en siluetas y fotos
    ├── data.js       Catálogo de técnicas, opciones y ejemplos
    ├── prompts.js    Generador de prompts: individual, combinado, lectura y puntuación
    ├── engine.js     Motor local que construye la landing HTML
    ├── ai.js         Conexión con Claude u otros proveedores (streaming)
    ├── store.js      Guardado local (brief, historial, banco, configuración)
    └── app.js        Lógica de la interfaz
```

Tecnologías: HTML5, CSS3 y JavaScript sin frameworks ni dependencias (funciona con doble clic, sin servidor).

## Privacidad y seguridad
- El brief y el historial se guardan en el `localStorage` de tu navegador; el banco, además, en la carpeta `bank/` cuando usas `server.py`. Nada sale de tu computador salvo lo que se envía al proveedor de IA en el modo «IA real».
- La clave de API se guarda solo durante la sesión, salvo que marques «Recordar».
- Las landings se muestran dentro de un `iframe` aislado (`sandbox`), para que el código generado no pueda acceder a la app.
- Los testimonios del motor local son de ejemplo y están marcados como tales: reemplázalos por testimonios reales antes de publicar.
