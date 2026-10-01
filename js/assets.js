/* ==========================================================================
   LandingForge IA · Resolución de activos
   La IA puede escribir marcadores y la app los convierte en dibujos vectoriales:
     <span data-lf-shape="glove" data-color="#c9a66b"></span> → silueta SVG del objeto
   Todo se dibuja en código: no hay fotos ni servicios externos.
   ========================================================================== */
window.LF = window.LF || {};

LF.assets = (function () {
  function resolveShapes(html) {
    return String(html).replace(/<(span|div)\b([^>]*?\bdata-lf-shape="([^"]+)"[^>]*)>\s*<\/\1>/gi, (all, tag, attrs, type) => {
      const color = (attrs.match(/\bdata-color="([^"]+)"/i) || [])[1];
      const label = (attrs.match(/\baria-label="([^"]+)"/i) || [])[1];
      return `<${tag} ${attrs}>${LF.shapes.render(type, color, { label })}</${tag}>`;
    });
  }
  return { resolveShapes, pending: () => [] };
})();
