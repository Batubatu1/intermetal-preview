/* Intermetal — main.js
   Nav, mobiel menu, scroll-reveals, contactformulier. */
(function () {
  "use strict";

  /* ---------- nav: scrolled-state ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobiel menu ---------- */
  var burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".menu-overlay a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.body.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll-reveals ---------- */
  var revealEls = document.querySelectorAll(".rv, [data-stagger]");
  if (/allin/.test(location.search)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- contactformulier → e-mail ---------- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (n) { return (form.querySelector('[name="' + n + '"]') || {}).value || ""; };
      var subject = encodeURIComponent("[Website] " + g("onderwerp"));
      var body = encodeURIComponent(
        "Naam: " + g("naam") + " " + g("achternaam") + "\n" +
        "Telefoon: " + g("telefoon") + "\n" +
        "E-mail: " + g("email") + "\n\n" +
        g("bericht")
      );
      window.location.href = "mailto:info@intermetal.nl?subject=" + subject + "&body=" + body;
    });
  }
})();

/* Video's: altijd automatisch afspelen, ook op telefoons.
   Energiebesparing/databesparing blokkeert soms `autoplay`; dan starten we
   zelf zodra een video in beeld komt, en bij de eerste aanraking/scroll. */
(function () {
  "use strict";
  var vids = Array.prototype.slice.call(document.querySelectorAll("video[autoplay]"));
  if (!vids.length) return;

  vids.forEach(function (v) {
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.removeAttribute("controls");
  });

  function tryPlay(v) {
    if (!v.paused) return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  var visible = new Set();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { visible.add(e.target); tryPlay(e.target); }
        else { visible.delete(e.target); }
      });
    }, { threshold: 0.1 });
    vids.forEach(function (v) { io.observe(v); });
  } else {
    vids.forEach(tryPlay);
  }

  // Eerste gebruikersactie ontgrendelt afspelen op iOS in energiebesparingsmodus.
  function kick() { vids.forEach(tryPlay); }
  ["touchstart", "touchend", "click", "scroll", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, kick, { passive: true });
  });

  // Na terugkeren naar het tabblad opnieuw starten.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) visible.forEach(tryPlay);
  });
  vids.forEach(function (v) {
    v.addEventListener("loadeddata", function () { if (visible.has(v)) tryPlay(v); });
  });
})();

/* Hero-diepte (28-09-2026): de video schuift trager dan de tekst, de tekst vervaagt.
   html.sc-on zet ook de wipe op de dienstenkaarten aan (CSS). Niets bij reduced motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("sc-reduced");
    return;
  }
  root.classList.add("sc-on");

  var hero = document.querySelector(".hero");
  if (!hero) return;
  var vid = hero.querySelector(".hero-bg video"), txt = hero.querySelector(".container");
  var ticking = false;

  function frame() {
    ticking = false;
    var r = hero.getBoundingClientRect();
    if (r.bottom <= 0) return;
    var p = Math.min(1, Math.max(0, -r.top / r.height));
    if (vid) vid.style.transform = "translate3d(0," + (p * 12).toFixed(2) + "%,0) scale(" + (1 + p * 0.08).toFixed(4) + ")";
    if (txt) { txt.style.transform = "translate3d(0," + (-p * 80).toFixed(1) + "px,0)"; txt.style.opacity = (1 - p * 0.85).toFixed(3); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();
})();

/* Cookiemelding (29-09-2026): alles accepteren, alleen noodzakelijk, of per categorie kiezen.
   Keuze in cookie 'im_consent' (12 maanden). Scripts voor statistiek/marketing later toevoegen als
   <script type="text/plain" data-consent="statistics|marketing" data-src="..."></script>;
   die worden pas geladen na toestemming. Event: window 'im:consent' (detail = keuze). */
(function () {
  "use strict";
  var KEY = "im_consent", VERSION = 1;
  var lang = (document.documentElement.lang || "nl").slice(0, 2);
  var me = document.currentScript && document.currentScript.src;
  var base = me ? me.replace(/assets\/js\/main\.js.*$/, "") : "/";
  var policy = base + (lang === "nl" ? "" : lang + "/") + "cookies/index.html";
  var T = {
    nl: { title: "Cookies op deze website", text: "Wij gebruiken alleen cookies die nodig zijn om de website goed te laten werken, zoals het onthouden van uw cookiekeuze. Statistiek- en marketingcookies plaatsen wij alleen met uw toestemming: statistieken laten ons zien hoe de website wordt gebruikt, marketingcookies maken advertenties en social media relevanter. U kunt uw keuze altijd wijzigen via “Cookie-instellingen” onderaan elke pagina. Meer informatie leest u in ons",
          all: "Alles accepteren", none: "Alleen noodzakelijk", prefs: "Instellingen", save: "Keuze opslaan", policy: "Cookiebeleid", open: "Cookie-instellingen",
          nec: "Noodzakelijk", necD: "Nodig om de website te laten werken en uw cookiekeuze te onthouden. Altijd aan.",
          stat: "Statistieken", statD: "Anoniem inzicht in hoe de website wordt gebruikt.", mkt: "Marketing", mktD: "Om advertenties en social media beter af te stemmen." },
    en: { title: "Cookies on this website", text: "We only use cookies that are needed for the website to work properly, such as remembering your cookie choice. We only place statistics and marketing cookies with your consent: statistics show us how the website is used, marketing cookies make advertising and social media more relevant. You can change your choice at any time via “Cookie settings” at the bottom of every page. More information in our",
          all: "Accept all", none: "Necessary only", prefs: "Settings", save: "Save choice", policy: "Cookie policy", open: "Cookie settings",
          nec: "Necessary", necD: "Required for the website to work and to remember your cookie choice. Always on.",
          stat: "Statistics", statD: "Anonymous insight into how the website is used.", mkt: "Marketing", mktD: "To tailor advertising and social media." },
    de: { title: "Cookies auf dieser Website", text: "Wir verwenden nur Cookies, die für den einwandfreien Betrieb der Website notwendig sind, zum Beispiel um Ihre Cookie-Auswahl zu speichern. Statistik- und Marketing-Cookies setzen wir nur mit Ihrer Einwilligung: Statistiken zeigen uns, wie die Website genutzt wird, Marketing-Cookies machen Werbung und soziale Medien relevanter. Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ unten auf jeder Seite ändern. Mehr dazu in unserer",
          all: "Alle akzeptieren", none: "Nur notwendige", prefs: "Einstellungen", save: "Auswahl speichern", policy: "Cookie-Richtlinie", open: "Cookie-Einstellungen",
          nec: "Notwendig", necD: "Erforderlich für den Betrieb der Website und um Ihre Cookie-Auswahl zu speichern. Immer aktiv.",
          stat: "Statistik", statD: "Anonyme Einblicke, wie die Website genutzt wird.", mkt: "Marketing", mktD: "Um Werbung und soziale Medien besser abzustimmen." }
  }[lang] || null;
  if (!T) return;

  function read() {
    var m = document.cookie.match(/(?:^|; )im_consent=([^;]*)/);
    if (!m) return null;
    try { var c = JSON.parse(decodeURIComponent(m[1])); return c && c.v === VERSION ? c : null; } catch (e) { return null; }
  }
  function apply(c) {
    document.querySelectorAll('script[type="text/plain"][data-consent]').forEach(function (s) {
      if (!c[s.getAttribute("data-consent")] || s.hasAttribute("data-ran")) return;
      var n = document.createElement("script");
      if (s.getAttribute("data-src")) n.src = s.getAttribute("data-src"); else n.text = s.text;
      s.setAttribute("data-ran", ""); s.parentNode.insertBefore(n, s.nextSibling);
    });
    try { window.dispatchEvent(new CustomEvent("im:consent", { detail: c })); } catch (e) {}
  }
  function save(stat, mkt) {
    var c = { v: VERSION, statistics: !!stat, marketing: !!mkt, t: new Date().toISOString().slice(0, 10) };
    document.cookie = KEY + "=" + encodeURIComponent(JSON.stringify(c)) + "; max-age=31536000; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    close(); apply(c);
  }

  var box;
  function sw(id, label, desc, on, locked) {
    return '<label class="cc-cat"><span class="cc-cat-t"><b>' + label + '</b><span>' + desc + '</span></span>' +
      '<input type="checkbox" id="' + id + '"' + (on ? " checked" : "") + (locked ? " disabled" : "") + '><span class="cc-sw" aria-hidden="true"></span></label>';
  }
  function open(showPrefs) {
    close();
    var c = read() || {};
    box = document.createElement("div");
    box.className = "cc" + (showPrefs ? " cc-prefs-on" : "");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-live", "polite");
    box.setAttribute("aria-label", T.title);
    box.innerHTML =
      '<div class="cc-in">' +
        '<div class="cc-copy"><b class="cc-title">' + T.title + '</b>' +
        '<p class="cc-text">' + T.text + ' <a href="' + policy + '">' + T.policy + '</a>.</p></div>' +
        '<div class="cc-prefs">' + sw("cc-nec", T.nec, T.necD, true, true) + sw("cc-stat", T.stat, T.statD, c.statistics, false) + sw("cc-mkt", T.mkt, T.mktD, c.marketing, false) + '</div>' +
        '<div class="cc-btns">' +
          '<button type="button" class="cc-btn cc-primary" data-a="all">' + T.all + '</button>' +
          '<button type="button" class="cc-btn" data-a="none">' + T.none + '</button>' +
          '<button type="button" class="cc-btn cc-save" data-a="save">' + T.save + '</button>' +
          '<button type="button" class="cc-link" data-a="prefs">' + T.prefs + '</button>' +
        '</div>' +
      '</div>';
    box.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-a");
      if (a === "all") save(true, true);
      else if (a === "none") save(false, false);
      else if (a === "save") save(box.querySelector("#cc-stat").checked, box.querySelector("#cc-mkt").checked);
      else if (a === "prefs") box.classList.add("cc-prefs-on");
    });
    document.body.appendChild(box);
    requestAnimationFrame(function () { if (box) box.classList.add("cc-show"); });
  }
  function close() { if (box && box.parentNode) box.parentNode.removeChild(box); box = null; }

  // link onderaan elke pagina om de keuze later te wijzigen
  var fb = document.querySelector(".footer-bottom");
  if (fb) {
    var span = document.createElement("span");
    span.className = "cc-foot";
    span.innerHTML = '<a href="' + policy + '">' + T.policy + '</a> · <button type="button" class="cc-open">' + T.open + '</button>';
    fb.appendChild(span);
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".cc-open")) { e.preventDefault(); open(true); }
  });

  var saved = read();
  if (saved) apply(saved); else open(false);
})();
