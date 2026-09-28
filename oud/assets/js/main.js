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
