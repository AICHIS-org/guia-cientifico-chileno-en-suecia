/* ============================================================================
   manifest.js — Índice de la guía
   ----------------------------------------------------------------------------
   Esta es la ÚNICA lista que hay que tocar cuando se agrega, renombra o
   reordena una sección. La interfaz (barra lateral, buscador, navegación
   anterior/siguiente y página de inicio) se construye sola a partir de aquí.

   Cada "parte" tiene:
     n       número de la parte (1..5)
     title   título visible
     dir     carpeta dentro de guia/
     blurb   descripción corta para la página de inicio
     items[] subsecciones, cada una con:
         id      ruta del archivo .md relativa a la raíz (y ancla de la URL)
         n       número visible, p. ej. "1.1"
         title   título visible
         status  "ready"  → tiene borrador publicable
                 "todo"   → por escribir / pendiente
   El estado debe reflejar el encabezado "Estado:" del propio archivo .md.
   ========================================================================== */
window.GUIDE_MANIFEST = {
  meta: {
    title: "Guía del científico chileno en Suecia",
    shortTitle: "Guía Chile → Suecia",
    version: "Borrador v0.2 · octubre de 2026",
    org: "AiCHIS — Asociación de Investigadores Chilenos en Suecia",
    orgUrl: "https://aichis-org.github.io/",
    repoUrl: "https://github.com/AICHIS-org/guia-cientifico-chileno-en-suecia",
    acesUrl: "https://aces-sffs.com/guia-para-la-instalacion-del-cientifico-en-suecia/"
  },
  parts: [
    {
      n: 1,
      title: "Antes de venir",
      dir: "guia/01-antes-de-venir",
      blurb: "Lo que necesitas saber mientras aún estás en Chile: documentos, permisos de residencia, salud e impuestos.",
      items: [
        { n: "1.1", title: "Documentación y trámites", id: "guia/01-antes-de-venir/1.1-documentacion-y-tramites.md", status: "ready" },
        { n: "1.2", title: "Permisos de residencia para investigadores y doctorandos", id: "guia/01-antes-de-venir/1.2-permisos-de-residencia.md", status: "ready" },
        { n: "1.3", title: "Cobertura sanitaria", id: "guia/01-antes-de-venir/1.3-cobertura-sanitaria.md", status: "ready" },
        { n: "1.4", title: "Contratos, becas y situaciones laborales", id: "guia/01-antes-de-venir/1.4-contratos-becas-y-situacion-laboral.md", status: "todo" },
        { n: "1.5", title: "Impuestos en Suecia y en Chile", id: "guia/01-antes-de-venir/1.5-impuestos.md", status: "ready" },
        { n: "1.6", title: "Embajada de Suecia en Santiago", id: "guia/01-antes-de-venir/1.6-embajada-de-suecia-en-santiago.md", status: "todo" }
      ]
    },
    {
      n: 2,
      title: "Antes de viajar",
      dir: "guia/02-antes-de-viajar",
      blurb: "Los preparativos concretos: dónde vivir, gestiones en tu institución, tu familia y la mudanza.",
      items: [
        { n: "2.1", title: "Alojamiento", id: "guia/02-antes-de-viajar/2.1-alojamiento.md", status: "ready" },
        { n: "2.2", title: "Gestiones administrativas en tu institución", id: "guia/02-antes-de-viajar/2.2-gestiones-en-tu-institucion.md", status: "todo" },
        { n: "2.3", title: "Tu pareja y tu familia en Suecia", id: "guia/02-antes-de-viajar/2.3-pareja-y-familia.md", status: "todo" },
        { n: "2.4", title: "Mudanza, aduana y mascotas", id: "guia/02-antes-de-viajar/2.4-mudanza-aduana-y-mascotas.md", status: "todo" }
      ]
    },
    {
      n: 3,
      title: "Al llegar",
      dir: "guia/03-al-llegar",
      blurb: "Los primeros trámites en suelo sueco, en orden: personnummer, seguro social, trabajo, consulado y banco.",
      items: [
        { n: "3.1", title: "Personnummer: registro en Skatteverket", id: "guia/03-al-llegar/3.1-personnummer.md", status: "ready" },
        { n: "3.2", title: "Försäkringskassan: seguro social", id: "guia/03-al-llegar/3.2-forsakringskassan.md", status: "ready" },
        { n: "3.3", title: "Documentación en tu centro de trabajo", id: "guia/03-al-llegar/3.3-documentacion-en-el-centro-de-trabajo.md", status: "todo" },
        { n: "3.4", title: "Inscripción en el consulado de Chile", id: "guia/03-al-llegar/3.4-inscripcion-en-el-consulado.md", status: "todo" },
        { n: "3.5", title: "Cuenta bancaria, BankID y tarjeta de identidad", id: "guia/03-al-llegar/3.5-cuenta-bancaria-bankid-y-tarjeta-de-identidad.md", status: "ready" }
      ]
    },
    {
      n: 4,
      title: "Complementos",
      dir: "guia/04-complementos",
      blurb: "Temas transversales: documentos chilenos, contactos oficiales, seguridad, sueco y vida cotidiana.",
      items: [
        { n: "4.1", title: "Documentos chilenos en Suecia (apostilla, títulos)", id: "guia/04-complementos/4.1-documentos-chilenos-en-suecia.md", status: "todo" },
        { n: "4.2", title: "Contacto con la Embajada y el Consulado de Chile", id: "guia/04-complementos/4.2-contacto-embajada-y-consulado.md", status: "todo" },
        { n: "4.3", title: "Seguridad", id: "guia/04-complementos/4.3-seguridad.md", status: "todo" },
        { n: "4.4", title: "Cursos de sueco", id: "guia/04-complementos/4.4-cursos-de-sueco.md", status: "ready" },
        { n: "4.5", title: "Normas de convivencia", id: "guia/04-complementos/4.5-normas-de-convivencia.md", status: "todo" },
        { n: "4.6", title: "Sobre AiCHIS", id: "guia/04-complementos/4.6-sobre-aichis.md", status: "todo" }
      ]
    },
    {
      n: 5,
      title: "Volver a Chile",
      dir: "guia/05-volver-a-chile",
      blurb: "Cuando termina la etapa sueca: experiencias de quienes volvieron y los trámites de cierre y regreso.",
      items: [
        { n: "5.1", title: "Experiencias de quienes regresaron", id: "guia/05-volver-a-chile/5.1-experiencias-de-quienes-volvieron.md", status: "todo" },
        { n: "5.2", title: "Antes de volver: qué hacer en Suecia", id: "guia/05-volver-a-chile/5.2-antes-de-volver.md", status: "todo" },
        { n: "5.3", title: "Al volver: qué hacer en Chile", id: "guia/05-volver-a-chile/5.3-al-volver.md", status: "todo" }
      ]
    }
  ]
};
