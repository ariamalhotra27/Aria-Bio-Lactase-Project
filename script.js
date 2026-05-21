/* ============================================================
   Lactase Website — Shared JS
   - Hover-to-define tooltips (auto-built from data-define attrs)
   - Clickable diagram labels
   - Toggle groups (persistent vs nonpersistent)
   - Lactose-splitting animation
   ============================================================ */

(function () {
  "use strict";

  // ----------------------------------------------------------
  // 1. Glossary — definitions used by all hover tooltips.
  //    Add new terms here and they'll be available everywhere.
  // ----------------------------------------------------------
  const GLOSSARY = {
    "lactase":        "An enzyme produced by cells lining the small intestine. It breaks lactose into glucose and galactose.",
    "lactose":        "The main sugar in milk. A disaccharide made of one glucose and one galactose joined by a β-1,4 glycosidic bond.",
    "enzyme":         "A protein that speeds up a specific chemical reaction in the body without being used up itself.",
    "disaccharide":   "A sugar made of two simple sugars joined together.",
    "monosaccharide": "A single-unit sugar, like glucose or galactose.",
    "hydrolysis":     "A reaction that uses a water molecule to split a chemical bond.",
    "enterocyte":     "An absorptive cell that lines the small intestine. Lactase sits on the surface of these cells.",
    "chyme":          "The semi-liquid mixture of partially digested food and digestive juices that leaves the stomach.",
    "duodenum":       "The first section of the small intestine, just after the stomach.",
    "jejunum":        "The middle section of the small intestine, where most digestion and absorption happens.",
    "brush-border":   "The fuzzy, microvilli-covered surface of intestinal cells. Many digestive enzymes — including lactase — are anchored here.",
    "microvilli":     "Tiny finger-like projections on the surface of enterocytes that massively increase surface area for absorption.",
    "villi":          "Larger finger-like folds of the small intestine wall, each covered in enterocytes (which themselves have microvilli).",
    "glycoprotein":   "A protein with sugar molecules attached. Many membrane proteins, including lactase, are glycoproteins.",
    "transmembrane":  "A protein region that passes through a cell membrane, anchoring the protein in place.",
    "apical":         "The top surface of an intestinal cell — the side facing the lumen (the inside of the intestine).",
    "lumen":          "The hollow inside of a tube-shaped organ, like the inside of the intestine where food passes.",
    "glycosidic-bond":"The chemical bond that links two sugars in a disaccharide or polysaccharide.",
    "active-site":    "The specific region of an enzyme where the substrate binds and the reaction happens.",
    "lct-gene":       "The gene that codes for the lactase enzyme. Located on chromosome 2 in humans.",
    "mcm6":           "A neighboring gene whose regulatory region controls whether the LCT gene stays switched on into adulthood.",
    "snp":            "Single Nucleotide Polymorphism — a one-letter difference in DNA between individuals.",
    "allele":         "One of the alternative versions of a gene.",
    "regulatory-region":"A stretch of DNA that controls when and how much a nearby gene is expressed.",
    "transcription":  "The process of copying a gene's DNA into RNA — the first step in making a protein.",
    "gene-expression":"How actively a gene is being read and turned into protein.",
    "ancestral-trait":"The original form of a trait — the version present before recent evolution changed it.",
    "derived-trait":  "A newer form of a trait that evolved more recently from the ancestral form.",
    "osmotic":        "Relating to osmosis — when dissolved particles pull water across a membrane.",
    "anaerobic":      "Without oxygen. Anaerobic fermentation breaks down sugars without using oxygen.",
    "fermentation":   "A metabolic process where microbes break down sugars (here, anaerobically) into smaller molecules and gases.",
    "scfa":           "Short-Chain Fatty Acids — small organic acids (like acetate, propionate, butyrate) produced when gut bacteria ferment carbohydrates.",
    "colon":          "The large intestine. Home to trillions of bacteria that ferment leftover carbohydrates.",
    "microbiota":     "The community of microorganisms (mostly bacteria) living in a particular place, like the gut.",
    "flatulence":     "Gas produced in the intestines, mostly from bacterial fermentation."
  };

  // ----------------------------------------------------------
  // 2. Hover-to-define tooltips
  //    Mark any span with class="define" and data-term="key" and
  //    a tooltip will be auto-attached.
  // ----------------------------------------------------------
  function buildTooltips() {
    document.querySelectorAll(".define").forEach(function (el) {
      const term = el.getAttribute("data-term");
      if (!term || !GLOSSARY[term]) return;
      if (el.querySelector(".define-tooltip")) return; // already built

      const tip = document.createElement("span");
      tip.className = "define-tooltip";
      tip.setAttribute("role", "tooltip");
      tip.innerHTML =
        '<span class="tooltip-term">' + el.textContent.trim() + "</span>" +
        GLOSSARY[term];
      el.appendChild(tip);

      // Make it keyboard accessible
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    });
  }

  // ----------------------------------------------------------
  // 3. Clickable diagram labels
  //    <div class="interactive-figure" data-figure="...">
  //      <ul class="label-list">
  //        <li><button data-detail="...">Stomach</button></li>
  //      </ul>
  //      <div class="label-detail"></div>
  //    </div>
  // ----------------------------------------------------------
  function buildLabelClickers() {
    document.querySelectorAll(".interactive-figure").forEach(function (fig) {
      const detailBox = fig.querySelector(".label-detail");
      const buttons = fig.querySelectorAll(".label-list button");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (detailBox) {
            detailBox.innerHTML = btn.getAttribute("data-detail") || "";
          }
        });
      });
    });
  }

  // ----------------------------------------------------------
  // 4. Toggle groups
  //    <div class="toggle-group" data-target="#someId">
  //      <button data-state="persistent" class="active">Persistent</button>
  //      <button data-state="nonpersistent">Nonpersistent</button>
  //    </div>
  //    Target element gets data-state set on it; CSS or JS can react.
  // ----------------------------------------------------------
  function buildToggles() {
    document.querySelectorAll(".toggle-group").forEach(function (group) {
      const targetSel = group.getAttribute("data-target");
      const target = targetSel ? document.querySelector(targetSel) : null;
      const buttons = group.querySelectorAll("button");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          const state = btn.getAttribute("data-state");
          if (target) {
            target.setAttribute("data-state", state);
            // Dispatch a custom event so page-specific JS can react
            target.dispatchEvent(new CustomEvent("toggle:change", { detail: { state: state } }));
          }
        });
      });
    });
  }

  // ----------------------------------------------------------
  // 5. Lactose-splitting animation (SVG-based)
  //    A <div id="lactose-anim"> with a play button triggers a
  //    short keyframe-style animation. The SVG is built here so
  //    the HTML stays clean.
  // ----------------------------------------------------------
  function buildLactoseAnimation() {
    const host = document.getElementById("lactose-anim");
    if (!host) return;

    host.innerHTML = `
      <svg viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg" aria-label="Animation showing lactose being split by lactase into glucose and galactose">
        <!-- Brush border line -->
        <line x1="20" y1="180" x2="540" y2="180" stroke="#6B8E5A" stroke-width="3" stroke-dasharray="4 6" />
        <text x="20" y="200" font-family="Inter, sans-serif" font-size="11" fill="#6B6F61">Brush border (lumen above, cell below)</text>

        <!-- Lactase enzyme anchored on the membrane -->
        <g id="lactase-shape">
          <rect x="245" y="135" width="70" height="45" rx="22" fill="#2F4F3A" />
          <rect x="270" y="120" width="20" height="20" fill="#2F4F3A" />
          <text x="280" y="162" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="#FAF5E9">lactase</text>
          <!-- active site cleft -->
          <path d="M268 122 Q280 110 292 122" fill="none" stroke="#D4A24C" stroke-width="2.5" />
        </g>

        <!-- Lactose (two joined sugars) -->
        <g id="lactose-mol">
          <circle id="sugar-glu" cx="80" cy="80" r="22" fill="#6B8E5A" />
          <text x="80" y="84" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#FAF5E9">Glu</text>
          <line id="bond" x1="102" y1="80" x2="138" y2="80" stroke="#D4A24C" stroke-width="4" />
          <circle id="sugar-gal" cx="160" cy="80" r="22" fill="#D4A24C" />
          <text x="160" y="84" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#1F2A22">Gal</text>
          <text id="lactose-label" x="120" y="50" text-anchor="middle" font-family="Fraunces, serif" font-size="13" fill="#2F4F3A">lactose</text>
        </g>

        <!-- Step caption -->
        <text id="step-caption" x="280" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#2F4F3A">Step 1: Lactose approaches lactase</text>
      </svg>
      <div class="anim-controls">
        <button id="lactose-play">▶ Play animation</button>
      </div>
    `;

    const playBtn = host.querySelector("#lactose-play");
    const svg = host.querySelector("svg");

    function getEls() {
      return {
        lactose: svg.querySelector("#lactose-mol"),
        glu:     svg.querySelector("#sugar-glu"),
        gal:     svg.querySelector("#sugar-gal"),
        bond:    svg.querySelector("#bond"),
        label:   svg.querySelector("#lactose-label"),
        caption: svg.querySelector("#step-caption")
      };
    }

    function reset() {
      const e = getEls();
      e.lactose.setAttribute("transform", "translate(0,0)");
      e.glu.setAttribute("transform", "translate(0,0)");
      e.gal.setAttribute("transform", "translate(0,0)");
      e.bond.setAttribute("opacity", "1");
      e.label.textContent = "lactose";
      e.label.setAttribute("opacity", "1");
      e.caption.textContent = "Step 1: Lactose approaches lactase";
    }

    function animate(el, attr, from, to, dur) {
      return new Promise(function (resolve) {
        const start = performance.now();
        function tick(now) {
          const t = Math.min(1, (now - start) / dur);
          // ease in-out
          const e = t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t;
          const value = from + (to - from) * e;
          el.setAttribute(attr, value);
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        }
        requestAnimationFrame(tick);
      });
    }

    async function playSequence() {
      playBtn.disabled = true;
      reset();
      const e = getEls();

      // Step 1 → move lactose toward the active site
      e.caption.textContent = "Step 1: Lactose moves toward lactase";
      await new Promise(function (res) {
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / 1200);
          const x = 0 + (150) * (t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t);
          e.lactose.setAttribute("transform", "translate(" + x + ",0)");
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });

      // Step 2 → bond breaks (hydrolysis)
      e.caption.textContent = "Step 2: Lactase hydrolyzes the bond (adds H₂O)";
      await new Promise(function (res) {
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / 800);
          e.bond.setAttribute("opacity", 1 - t);
          e.label.setAttribute("opacity", 1 - t);
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });

      // Step 3 → separate the two sugars
      e.caption.textContent = "Step 3: Glucose and galactose drift apart";
      await new Promise(function (res) {
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / 1200);
          const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t;
          e.glu.setAttribute("transform", "translate(" + (-40 * ease) + "," + (60 * ease) + ")");
          e.gal.setAttribute("transform", "translate(" + (40 * ease)  + "," + (60 * ease) + ")");
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });

      // Step 4 → absorbed into the cell
      e.caption.textContent = "Step 4: Glucose & galactose are absorbed into the cell";

      setTimeout(function () { playBtn.disabled = false; }, 400);
    }

    playBtn.addEventListener("click", playSequence);
  }

  // ----------------------------------------------------------
  // 6. Init
  // ----------------------------------------------------------
  function init() {
    buildTooltips();
    buildLabelClickers();
    buildToggles();
    buildLactoseAnimation();

    // Highlight the active nav link based on filename
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".site-nav a.nav-link").forEach(function (a) {
      if (a.getAttribute("href") === path) a.classList.add("active");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
