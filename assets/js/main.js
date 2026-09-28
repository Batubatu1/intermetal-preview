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

/* scroll-craft v2 (28-09-2026): hero-diepte, 'deuren' bij eigen productie,
   en de piek: CAD van de echte plaat -> laser -> metaal -> levering.
   Alleen transform/opacity/clip-path; één rAF per scroll-event. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { root.classList.add("sc-reduced"); return; }
  root.classList.add("sc-on");

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function prog(el, lead) {                  // voortgang door een hoge, vastgezette act
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp((-r.top + lead) / (r.height - vh + lead));
  }
  var narrow = window.matchMedia("(max-width:880px)");

  // act 1: hero-diepte (video trager dan tekst)
  var hero = document.querySelector(".hero");
  var heroVid = hero && hero.querySelector(".hero-bg video");
  var heroTxt = hero && hero.querySelector(".container");

  // act 4: stalen schuifdeuren met het beeldmerk openen en tonen de productiefilm
  var ep = document.querySelector(".ep");
  var doorL = ep && ep.querySelector(".ep-door-l"), doorR = ep && ep.querySelector(".ep-door-r");
  var seam = ep && ep.querySelector(".ep-seam"), epVid = ep && ep.querySelector(".ep-frame video");
  function measure() {}

  // act 5: piek
  var fg = document.querySelector(".forge2");
  var fStage = fg && fg.querySelector(".f2-stage"), fMetal = fg && fg.querySelector(".f2-metal");
  var fLaser = fg && fg.querySelector(".f2-laser"), fCad = fg && fg.querySelector(".f2-cad");
  var fBg = fg && fg.querySelector(".f2-bg"), fBgImg = fBg && fBg.querySelector("img");
  var fBar = fg && fg.querySelector(".f2-progress span");
  var fTruck = fg && fg.querySelector(".f2-truck"), fTruckImg = fTruck && fTruck.querySelector("img");
  var fPh = fg ? Array.prototype.slice.call(fg.querySelectorAll(".f2-ph")) : [];
  var fLbl = fg && fg.querySelector(".cad-lbl");
  var fEls = fCad ? Array.prototype.slice.call(fCad.querySelectorAll(".fd,.cl")).map(function (e) {
    return { e: e, s: parseFloat(e.getAttribute("data-s")), l: parseFloat(e.getAttribute("data-l") || ".04"), cl: e.classList.contains("cl") };
  }) : [];
  if (fg) fg.querySelectorAll("img").forEach(function (im) { im.loading = "eager"; });

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;

    if (hero) {
      var r = hero.getBoundingClientRect();
      if (r.bottom > 0) {
        var p = clamp(-r.top / r.height);
        if (heroVid) heroVid.style.transform = "translate3d(0," + (p * 12).toFixed(2) + "%,0) scale(" + (1 + p * 0.08).toFixed(4) + ")";
        if (heroTxt) { heroTxt.style.transform = "translate3d(0," + (-p * 80).toFixed(1) + "px,0)"; heroTxt.style.opacity = (1 - p * 0.85).toFixed(3); }
      }
    }

    if (ep && doorL) {
      var er = ep.getBoundingClientRect();
      if (er.top < vh && er.bottom > 0) {
        var q4 = prog(ep, vh * 0.3);
        var glow = clamp(q4 / 0.18), o = ease(clamp((q4 - 0.2) / 0.42));
        if (seam) { seam.style.opacity = (glow * (1 - o)).toFixed(3); seam.style.transform = "scaleX(" + (1 + glow * 1.5).toFixed(2) + ")"; }
        doorL.style.transform = "translate3d(" + (-o * 101).toFixed(2) + "%,0,0)";
        doorR.style.transform = "translate3d(" + (o * 101).toFixed(2) + "%,0,0)";
        doorL.style.opacity = doorR.style.opacity = (1 - clamp((o - 0.82) / 0.16)).toFixed(3);
        if (epVid) epVid.style.transform = "scale(" + (1.12 - 0.12 * o).toFixed(4) + ")";
        ep.classList.toggle("open", o > 0.97);
      }
    }

    if (fg) {
      var fr = fg.getBoundingClientRect();
      if (fr.top < vh && fr.bottom > 0) {
        var f = prog(fg, vh * 0.55);
        for (var i = 0; i < fEls.length; i++) {         // 1. tekening: elk lijnstuk op zijn moment
          var o = fEls[i], t = clamp((f - o.s) / o.l);
          if (o.cl) o.e.style.opacity = (t * 0.8).toFixed(3); else o.e.style.strokeDashoffset = (1 - t).toFixed(3);
        }
        if (fLbl) fLbl.style.opacity = clamp((f - 0.34) / 0.04).toFixed(3);
        var x = clamp((f - 0.40) / 0.26);                // 2. laser zet de tekening om in metaal
        if (fMetal) fMetal.style.clipPath = "inset(0 " + ((1 - x) * 100).toFixed(2) + "% 0 0)";
        if (fLaser) { fLaser.style.left = (x * 100).toFixed(2) + "%"; fLaser.style.opacity = x > 0.001 && x < 0.999 ? 1 : 0; }
        if (fCad) fCad.style.opacity = (1 - 0.74 * clamp((f - 0.62) / 0.08)).toFixed(3);
        var q = ease(clamp((f - 0.70) / 0.18));          // 3. levering: de plaat gaat weg, de vrachtwagen komt groot in beeld
        if (fStage) { fStage.style.transform = "translate3d(" + (-q * 8).toFixed(2) + "%,0,0) scale(" + (1 - q * 0.1).toFixed(4) + ")"; fStage.style.opacity = (1 - q).toFixed(3); }
        if (fTruck) {
          fTruck.style.clipPath = "inset(0 0 0 " + ((1 - q) * 100).toFixed(2) + "% round 14px)";
          if (fTruckImg) fTruckImg.style.transform = "scale(" + (1.12 - 0.12 * q).toFixed(4) + ")";
        }
        var idx = f < 0.38 ? 0 : f < 0.69 ? 1 : 2;
        fPh.forEach(function (li, k) { li.classList.toggle("on", k === idx); });
        if (fBar) fBar.style.transform = "scaleX(" + clamp(f / 0.9).toFixed(4) + ")";
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); frame(); });
  measure(); frame();
})();
