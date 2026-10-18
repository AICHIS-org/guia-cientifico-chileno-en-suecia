/* ============================================================================
   app.js — cerebro del sitio (sin framework, sin build)
   - Enrutador por hash: #/  = inicio ; #/<ruta.md> = una sección
   - Descarga el Markdown de guia/ y lo pinta con marked.js
   - Convierte las citas ⚠️/💡/🔧 en "callouts", arregla los enlaces internos,
     arma barra lateral, buscador, migas, anterior/siguiente y "editar página".
   ========================================================================== */
(function () {
  "use strict";

  var M = window.GUIDE_MANIFEST;
  var REPO = M.meta.repoUrl;
  var BRANCH = "main";

  /* ---- índice plano de secciones, en orden, para prev/next --------------- */
  var FLAT = [];
  M.parts.forEach(function (part) {
    part.items.forEach(function (it) {
      FLAT.push({ part: part, item: it });
    });
  });
  function flatIndex(id) {
    for (var i = 0; i < FLAT.length; i++) if (FLAT[i].item.id === id) return i;
    return -1;
  }
  function lookup(id) {
    for (var i = 0; i < FLAT.length; i++) if (FLAT[i].item.id === id) return FLAT[i];
    return null;
  }

  /* ---- utilidades -------------------------------------------------------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  // resuelve una ruta relativa (href de un .md) contra la carpeta del archivo actual
  function resolvePath(fromFile, href) {
    var base = fromFile.split("/").slice(0, -1); // carpeta del archivo actual
    var parts = href.split("/");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === "" || p === ".") continue;
      if (p === "..") base.pop();
      else base.push(p);
    }
    return base.join("/");
  }

  /* ---- barra lateral ----------------------------------------------------- */
  function buildSidebar() {
    var nav = document.getElementById("nav");
    nav.innerHTML = "";
    M.parts.forEach(function (part) {
      var wrap = el("div", { class: "nav-part", "data-part": part.n });
      var head = el("div", { class: "part-head" });
      head.appendChild(el("span", { class: "part-num" }, String(part.n)));
      head.appendChild(el("span", {}, esc(part.title)));
      wrap.appendChild(head);

      var ul = el("ul", { class: "nav-list" });
      part.items.forEach(function (it) {
        var li = el("li");
        var a = el("a", { href: "#/" + it.id, "data-id": it.id, "data-search": (it.n + " " + it.title).toLowerCase() });
        a.appendChild(el("span", { class: "n" }, it.n));
        a.appendChild(el("span", { class: "t" }, esc(it.title)));
        a.appendChild(el("span", { class: "dot " + it.status, title: it.status === "ready" ? "Con borrador" : "Por escribir" }));
        li.appendChild(a);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      nav.appendChild(wrap);
    });
  }

  function setActive(id) {
    var links = document.querySelectorAll("#nav a");
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-id") === id);
    });
  }

  /* ---- buscador ---------------------------------------------------------- */
  function wireSearch() {
    var input = document.getElementById("search");
    if (!input) return;
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      document.querySelectorAll(".nav-part").forEach(function (part) {
        var any = false;
        part.querySelectorAll(".nav-list li").forEach(function (li) {
          var a = li.querySelector("a");
          var hit = !q || a.getAttribute("data-search").indexOf(q) !== -1;
          li.style.display = hit ? "" : "none";
          if (hit) any = true;
        });
        part.style.display = any ? "" : "none";
      });
    });
  }

  /* ---- post-proceso del HTML renderizado --------------------------------- */
  function decorate(container, currentFile) {
    // 1) callouts a partir de citas (blockquote)
    container.querySelectorAll("blockquote").forEach(function (bq) {
      var txt = bq.textContent || "";
      if (/(^|\s)Estado:/.test(txt) && /Última revisión|Volver al índice|Borrador/.test(txt)) {
        bq.classList.add("meta");
      } else if (txt.indexOf("⚠️") !== -1) {
        bq.classList.add("callout", "warn");
      } else if (txt.indexOf("💡") !== -1) {
        bq.classList.add("callout", "tip");
      } else if (txt.indexOf("🔧") !== -1) {
        bq.classList.add("callout", "todo");
      }
    });

    // 2) marcar texto pendiente 🔧 en línea (fuera de callouts)
    container.querySelectorAll("li, p").forEach(function (node) {
      if (node.closest("blockquote")) return;
      if ((node.textContent || "").indexOf("🔧") === -1) return;
      node.querySelectorAll("em").forEach(function (em) {
        if ((em.textContent || "").length && em.previousSibling &&
            /🔧\s*$/.test((em.previousSibling.textContent || ""))) {
          em.classList.add("pending");
        }
      });
    });

    // 3) tablas con scroll horizontal en móvil
    container.querySelectorAll("table").forEach(function (t) {
      if (t.parentElement.classList.contains("table-scroll")) return;
      var wrap = el("div", { class: "table-scroll" });
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });

    // 4) enlaces: internos → rutas por hash ; externos → nueva pestaña
    container.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href) return;
      if (/^https?:|^mailto:|^tel:/.test(href)) {
        a.target = "_blank"; a.rel = "noopener noreferrer";
        return;
      }
      if (href.charAt(0) === "#") return; // ancla en la misma página
      var clean = href.split("#")[0].split("?")[0];
      if (!/\.md$/i.test(clean)) return;
      var abs = resolvePath(currentFile, clean);
      if (/(^|\/)README\.md$/i.test(abs)) a.setAttribute("href", "#/");
      else a.setAttribute("href", "#/" + abs);
    });
  }

  /* ---- render de una sección Markdown ------------------------------------ */
  function renderDoc(id) {
    var content = document.getElementById("content");
    var hit = lookup(id);
    content.innerHTML = "";
    var page = el("div", { class: "page" });
    content.appendChild(page);

    // migas
    var bc = el("div", { class: "breadcrumb" });
    bc.innerHTML = '<a href="#/">Inicio</a><span class="sep">›</span>' +
      (hit ? '<span>' + esc(hit.part.n + ". " + hit.part.title) + '</span><span class="sep">›</span><span>' + esc(hit.item.n) + '</span>' : '<span>Documento</span>');
    page.appendChild(bc);

    var art = el("article", { class: "md" });
    art.appendChild(el("div", { class: "loader" }, '<span class="spinner"></span> Cargando sección…'));
    page.appendChild(art);

    fetch(id, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (md) {
        art.innerHTML = window.marked.parse(md);
        decorate(art, id);

        // pie "editar esta página"
        var foot = el("div", { class: "article-foot" });
        foot.innerHTML =
          '<div class="ico">✍️</div><div><h4>¿Viviste esto? Mejora esta sección</h4>' +
          '<p>Puedes editarla desde tu navegador, sin instalar nada. ' +
          '<a href="' + REPO + '/edit/' + BRANCH + '/' + id + '" target="_blank" rel="noopener">Editar en GitHub ✏️</a> · ' +
          '<a href="#/CONTRIBUTING.md">Cómo contribuir</a></p></div>';
        art.appendChild(foot);

        // anterior / siguiente
        var idx = flatIndex(id);
        if (idx !== -1) {
          var prev = FLAT[idx - 1], next = FLAT[idx + 1];
          var pager = el("div", { class: "pager" });
          pager.innerHTML =
            (prev ? '<a href="#/' + prev.item.id + '"><span class="dir">← Anterior</span><span class="ttl">' + esc(prev.item.n + " " + prev.item.title) + '</span></a>' : '<span class="empty"></span>') +
            (next ? '<a class="next" href="#/' + next.item.id + '"><span class="dir">Siguiente →</span><span class="ttl">' + esc(next.item.n + " " + next.item.title) + '</span></a>' : '<span class="empty"></span>');
          page.appendChild(pager);
        }
        window.scrollTo(0, 0);
      })
      .catch(function (err) {
        art.innerHTML = '<div class="errbox"><strong>No se pudo cargar la sección.</strong><br>' +
          esc(err.message) + '<br><br>Si estás abriendo el archivo directamente (file://), ábrelo con un servidor local. ' +
          '<a href="#/">Volver al inicio</a>.</div>';
      });

    setActive(id);
  }

  /* ---- diagrama del recorrido (SVG en línea) ----------------------------- */
  function journeySVG() {
    var steps = M.parts.map(function (p) { return { n: p.n, t: p.title, dir: p.items[0].id }; });
    var W = 1040, H = 150, pad = 10, gap = 18;
    var n = steps.length;
    var bw = (W - pad * 2 - gap * (n - 1)) / n, bh = 74, by = 44;
    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="El recorrido en cinco etapas">'];
    svg.push('<defs><linearGradient id="jg" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#006AA7"/><stop offset="1" stop-color="#0a6fb0"/></linearGradient></defs>');
    svg.push('<text x="' + pad + '" y="24" font-family="Sora,sans-serif" font-size="13" font-weight="700" fill="currentColor" opacity=".55">EL RECORRIDO</text>');
    for (var i = 0; i < n; i++) {
      var x = pad + i * (bw + gap);
      if (i < n - 1) {
        var ax = x + bw + 2, ay = by + bh / 2;
        svg.push('<line x1="' + ax + '" y1="' + ay + '" x2="' + (ax + gap - 4) + '" y2="' + ay + '" stroke="currentColor" stroke-opacity=".3" stroke-width="2"/>');
        svg.push('<path d="M' + (ax + gap - 7) + ' ' + (ay - 4) + ' l5 4 -5 4" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');
      }
      svg.push('<a href="#/' + steps[i].dir + '">');
      svg.push('<rect x="' + x + '" y="' + by + '" rx="12" width="' + bw + '" height="' + bh + '" fill="var(--panel)" stroke="var(--border-str)"/>');
      svg.push('<circle cx="' + (x + 20) + '" cy="' + (by + 20) + '" r="12" fill="url(#jg)"/>');
      svg.push('<text x="' + (x + 20) + '" y="' + (by + 24) + '" text-anchor="middle" font-family="Sora,sans-serif" font-size="13" font-weight="700" fill="#fff">' + steps[i].n + '</text>');
      // título (puede ir en dos líneas)
      var words = steps[i].t.split(" "), line1 = words.shift(), line2 = words.join(" ");
      svg.push('<text x="' + (x + 14) + '" y="' + (by + 50) + '" font-family="Sora,sans-serif" font-size="14" font-weight="600" fill="currentColor">' + esc(line1) + '</text>');
      if (line2) svg.push('<text x="' + (x + 14) + '" y="' + (by + 66) + '" font-family="Sora,sans-serif" font-size="14" font-weight="600" fill="currentColor">' + esc(line2) + '</text>');
      svg.push('</a>');
    }
    svg.push('</svg>');
    return svg.join("");
  }

  /* ---- ilustración de respaldo (si no carga hero.svg) -------------------- */
  function heroFallbackSVG() {
    return '<svg viewBox="0 0 520 360" role="img" aria-label="De Chile a Suecia">' +
      '<rect width="520" height="360" rx="16" fill="#0B2545"/>' +
      '<circle cx="410" cy="90" r="46" fill="#FECC00"/>' +
      '<path d="M0 250 L120 170 L200 215 L300 150 L400 205 L520 150 L520 360 L0 360 Z" fill="#00507e"/>' +
      '<path d="M0 300 L90 255 L170 290 L260 250 L360 292 L520 240 L520 360 L0 360 Z" fill="#006AA7"/>' +
      '<g fill="#F7F9FC"><polygon points="150,330 168,286 186,330"/><polygon points="150,314 166,278 182,314"/>' +
      '<polygon points="360,332 376,292 392,332"/></g>' +
      '<rect x="235" y="286" width="56" height="48" rx="4" fill="#D52B1E"/><rect x="250" y="300" width="12" height="34" fill="#F7F9FC"/>' +
      '<path d="M70 120 q130 -70 300 0" fill="none" stroke="#FECC00" stroke-width="2.5" stroke-dasharray="6 8" stroke-linecap="round"/>' +
      '<circle cx="70" cy="120" r="6" fill="#D52B1E"/><circle cx="370" cy="120" r="6" fill="#FECC00"/>' +
      '<g transform="translate(300,96) rotate(18)"><rect width="40" height="30" rx="4" fill="#F7F9FC"/><rect x="6" y="-7" width="28" height="9" rx="3" fill="#F7F9FC"/></g>' +
      '</svg>';
  }

  /* ---- página de inicio -------------------------------------------------- */
  function renderHome() {
    setActive(null);
    var content = document.getElementById("content");
    content.innerHTML = "";
    var page = el("div", { class: "page" });

    // hero
    var hero = el("section", { class: "hero" });
    hero.innerHTML =
      '<div class="hero-grid"><div class="hero-text">' +
      '<span class="eyebrow">🇨🇱 → 🇸🇪 · Guía de AiCHIS</span>' +
      '<h1>Instalarte en Suecia como científica o científico chileno</h1>' +
      '<p>Permisos de residencia, personnummer, salud, impuestos, banco y vida cotidiana. ' +
      'Una guía hecha por y para investigadoras e investigadores que llegan desde Chile.</p>' +
      '<div class="hero-cta"><a class="btn btn-primary" href="#/' + FLAT[0].item.id + '">Empezar por el principio</a>' +
      '<a class="btn btn-ghost" href="' + REPO + '" target="_blank" rel="noopener">Colaborar en GitHub</a></div>' +
      '</div><div class="hero-art" id="hero-art"></div></div>';
    page.appendChild(hero);

    // ilustración: intenta hero.svg, si no, usa el respaldo
    var art = hero.querySelector("#hero-art");
    var img = new Image();
    img.alt = "Ilustración: de Chile a Suecia";
    img.onload = function () { art.innerHTML = ""; art.appendChild(img); };
    img.onerror = function () { art.innerHTML = heroFallbackSVG(); };
    img.src = "assets/img/hero.svg";
    art.innerHTML = heroFallbackSVG(); // respaldo inmediato mientras carga

    // recorrido
    var jSec = el("section", { class: "home-section" });
    jSec.innerHTML = '<h2>El recorrido en cinco etapas</h2>' +
      '<p class="lead">Desde que decides venir hasta que (quizás) vuelves a Chile. Toca una etapa para ir a su primera sección.</p>' +
      '<div class="journey">' + journeySVG() + '</div>';
    page.appendChild(jSec);

    // tarjetas por parte
    var cards = el("section", { class: "home-section" });
    var inner = '<h2>Explora la guía</h2><p class="lead">Cinco partes, ' + FLAT.length + ' secciones. El punto verde marca las que ya tienen borrador; el naranja, las que estamos escribiendo.</p><div class="part-cards">';
    M.parts.forEach(function (p) {
      var ready = p.items.filter(function (i) { return i.status === "ready"; }).length;
      inner += '<a class="part-card" href="#/' + p.items[0].id + '">' +
        '<div class="pc-head"><span class="pc-num">' + p.n + '</span><h3>' + esc(p.title) + '</h3></div>' +
        '<p>' + esc(p.blurb) + '</p>' +
        '<div class="pc-items"><span class="pc-count">' + ready + ' de ' + p.items.length + ' con borrador</span></div></a>';
    });
    inner += '</div>';
    cards.innerHTML = inner;
    page.appendChild(cards);

    // bloques de ayuda / colaboración
    var help = el("section", { class: "home-section" });
    help.innerHTML = '<div class="home-foot-cards">' +
      '<div class="ff"><h3>🙏 Inspirada en ACES</h3><p>La estructura sigue la guía de la Asociación de Científicos Españoles en Suecia. Lo adaptamos a quienes llegan desde Chile, fuera de la UE.</p><a href="' + M.meta.acesUrl + '" target="_blank" rel="noopener">Ver la guía de ACES →</a></div>' +
      '<div class="ff"><h3>✍️ Hecha entre todos</h3><p>Si ya pasaste por estos trámites, tu experiencia vale mucho. Cuéntanosla y mejora cualquier sección.</p><a href="#/CONTRIBUTING.md">Cómo contribuir →</a></div>' +
      '<div class="ff"><h3>🔧 Lo que falta</h3><p>Hay secciones por escribir y datos por confirmar. Mira la lista de pendientes y suma lo que sepas.</p><a href="#/PENDIENTES.md">Ver pendientes →</a></div>' +
      '</div>';
    page.appendChild(help);

    // aviso
    var dis = el("div", { class: "disclaimer" });
    dis.innerHTML = '<h3>⚠️ Importante</h3><ul>' +
      '<li>Esta guía <strong>no reemplaza a las autoridades</strong>. Las reglas cambian seguido; confirma siempre en las páginas oficiales de cada sección.</li>' +
      '<li>No es asesoría legal ni tributaria.</li>' +
      '<li>Marcamos con ⚠️ lo que viene de guías de terceros y con 🔧 lo que falta confirmar.</li></ul>';
    page.appendChild(dis);

    content.innerHTML = "";
    content.appendChild(page);
    window.scrollTo(0, 0);
  }

  /* ---- enrutador --------------------------------------------------------- */
  function route() {
    closeNav();
    var h = location.hash.replace(/^#\/?/, "");
    if (!h || h === "/") { renderHome(); return; }
    h = h.split("#")[0].split("?")[0];
    if (/\.md$/i.test(h)) renderDoc(h);
    else renderHome();
  }

  /* ---- navegación móvil + tema ------------------------------------------- */
  function openNav() { document.body.classList.add("nav-open"); }
  function closeNav() { document.body.classList.remove("nav-open"); }
  function wireChrome() {
    var mb = document.getElementById("menu-btn");
    if (mb) mb.addEventListener("click", openNav);
    var bd = document.getElementById("backdrop");
    if (bd) bd.addEventListener("click", closeNav);

    var tb = document.getElementById("theme-btn");
    if (tb) tb.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = (cur === "dark" || (!cur && sysDark)) ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("guia-theme", next); } catch (e) {}
    });
  }

  /* ---- arranque ---------------------------------------------------------- */
  function init() {
    try {
      var saved = localStorage.getItem("guia-theme");
      if (saved) document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {}
    buildSidebar();
    wireSearch();
    wireChrome();
    window.addEventListener("hashchange", route);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
