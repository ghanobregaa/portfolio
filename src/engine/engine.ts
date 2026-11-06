// @ts-nocheck
/*
 * Interaction and animation engine for the portfolio.
 * React renders the markup; this module wires up canvases, scroll effects,
 * the terminal, games and easter eggs once the DOM is mounted.
 */
import { LAND_DOTS } from "@/data/landDots";

let started = false;

export function startEngine(): void {
  if (started) return;
  started = true;

  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;

  /* ---------- Theme with circular reveal ---------- */
  var saved = null; try { saved = localStorage.getItem("theme"); } catch (e) {}
  root.setAttribute("data-theme", saved === "light" ? "light" : "dark");
  var themeBtn = document.getElementById("theme-toggle");
  themeBtn.addEventListener("click", function (ev) {
    if (window.__noThemeClick) { window.__noThemeClick = false; return; }
    var current = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    function apply() { root.setAttribute("data-theme", next); try { localStorage.setItem("theme", next); } catch (e) {} readColors(); }
    if (!document.startViewTransition || reduce) { apply(); return; }
    var r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      var t = document.startViewTransition(apply);
      t.ready.then(function () {
        root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + end + "px at " + x + "px " + y + "px)"] },
          { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" });
      }).catch(function () {});
    } catch (e) { apply(); }
  });

  /* ---------- Split hero text into letters ---------- */
  var idx = 0;
  // letters animate one by one, but each word stays together when the line wraps
  function splitWords(el, text, nextIndex) {
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
      var w = document.createElement("span"); w.className = "word";
      Array.from(part).forEach(function (c) {
        var s = document.createElement("span"); s.className = "ch"; s.textContent = c;
        s.style.setProperty("--i", nextIndex()); w.appendChild(s);
      });
      el.appendChild(w);
    });
  }
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var text = el.textContent; el.textContent = "";
    el.setAttribute("aria-hidden", "true");
    splitWords(el, text, function () { return idx++; });
  });

  /* ---------- Dates & counters ---------- */
  function yearsSince(d) {
    var n = new Date(), y = n.getFullYear() - d.getFullYear();
    if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) y--;
    return y;
  }
  var age = yearsSince(new Date(1999, 11, 4)), yrs = yearsSince(new Date(2021, 2, 1));
  document.getElementById("age").textContent = age;
  document.getElementById("year").textContent = new Date().getFullYear();
  var yEl = document.getElementById("years");
  yEl.textContent = yrs;
  if (!reduce) {
    var start = null;
    requestAnimationFrame(function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start - 900) / 900);
      if (p > 0) yEl.textContent = Math.round(yrs * (1 - Math.pow(1 - p, 3)));
      else yEl.textContent = 0;
      if (p < 1) requestAnimationFrame(step); else yEl.textContent = yrs;
    });
  }

  var clock = document.getElementById("clock");
  function tick() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Atlantic/Madeira" }).format(new Date()).split(":");
      clock.innerHTML = parts[0] + '<span class="colon">:</span>' + parts[1];
    } catch (e) {}
  }
  tick(); setInterval(tick, 20000);

  /* ---------- Stack marquee ---------- */
  var stackA = [["React", "web"], ["Flutter", "mobile"], ["TypeScript", "lang"], ["Python", "lang"], ["Flask", "api"], ["Next.js", "web"]];
  var stackB = [["Firebase", "cloud"], ["Vite", "tooling"], ["shadcn/ui", "ui"], ["Figma", "design"], ["Git", "tooling"], ["Node.js", "backend"]];
  function fill(id, list) {
    var el = document.getElementById(id), html = "";
    list.concat(list).forEach(function (s) { html += '<span class="chip">' + s[0] + ' <small>' + s[1] + '</small></span>'; });
    el.innerHTML = html;
  }

  fill("track-a", stackA); fill("track-b", stackB);

  /* ---------- Scramble labels ---------- */
  var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=<>/";
  function scramble(el, total) {
    var final = el.dataset.text, frame = 0; total = total || 18;
    (function run() {
      var out = "";
      for (var i = 0; i < final.length; i++) {
        if (final[i] === " " || i < (frame / total) * final.length) out += final[i];
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      if (++frame <= total) requestAnimationFrame(run); else el.textContent = final;
    })();
  }
  var labels = document.querySelectorAll("[data-scramble]");
  labels.forEach(function (l) { l.dataset.text = l.textContent; });

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-scramble")) scramble(el);
        else { el.classList.add("in"); el.classList.remove("pre"); }
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      var sibs = el.parentElement.querySelectorAll(":scope > [data-reveal]");
      el.style.setProperty("--d", Array.prototype.indexOf.call(sibs, el) * 90 + "ms");
      if (el.getBoundingClientRect().top > innerHeight) el.classList.add("pre");
      io.observe(el);
    });
    labels.forEach(function (l) { io.observe(l); });
  }

  /* ---------- Scroll: progress, timeline rail, active nav ---------- */
  var progress = document.getElementById("progress"), timeline = document.getElementById("timeline");
  var links = document.querySelectorAll("[data-link]");
  var ids = ["about", "experience", "work", "contact"];
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    var r = timeline.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * 0.7 - r.top) / r.height));
    timeline.style.setProperty("--p", p);
    var current = "";
    ids.forEach(function (id) { var s = document.getElementById(id); if (s.getBoundingClientRect().top < innerHeight * 0.4) current = id; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
    links.forEach(function (a) { a.classList.toggle("active", a.dataset.link === current); });
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); onScroll();
  document.getElementById("top-btn").addEventListener("click", function () { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  /* ---------- Spotlight + tilt + magnetic (fine pointers) ---------- */
  document.querySelectorAll(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
  if (fine && !reduce) {
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateX(" + (-py * 6) + "deg) rotateY(" + (px * 6) + "deg) translateY(-2px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.22 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });

  }

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copy-btn"), email = document.getElementById("email");
  var ca = document.getElementById("copy-a"), cb = document.getElementById("copy-b");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    function say(t) { ca.textContent = t; cb.textContent = t; setTimeout(function () { ca.textContent = "Copy"; cb.textContent = "Copy"; }, 1800); }
    function fallback() { var r = document.createRange(); r.selectNodeContents(email); var s = getSelection(); s.removeAllRanges(); s.addRange(r); say("Selected"); }
    if (navigator.clipboard) navigator.clipboard.writeText(email.textContent).then(function () { say("Copied ✓"); burst(copyBtn); }, fallback); else fallback();
  });

  /* ---------- Nav links scramble on hover ---------- */
  if (!reduce) links.forEach(function (a) {
    a.dataset.text = a.textContent;
    a.addEventListener("mouseenter", function () { scramble(a, 10); });
  });

  /* ---------- Status: greeting by Madeira time ---------- */
  try {
    var h = +new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Atlantic/Madeira" }).format(new Date());
    document.getElementById("greet").textContent =
      (h < 6 ? "Coding late tonight" : h < 12 ? "Good morning" : h < 19 ? "Good afternoon" : "Good evening");
  } catch (e) {}
  var statusText = document.getElementById("status-text");
  if (!reduce) setInterval(function () { statusText.classList.toggle("swap"); }, 4200);

  /* ---------- Rotating title ---------- */
  var rot = document.getElementById("rotator");
  var roles = ["Full-stack developer.", "Flutter developer.", "Automation builder.", "Python tinkerer.", "Integration nerd."];
  var ri = 0;
  function setRole(text) {
    var old = rot.querySelectorAll(".ch");
    old.forEach(function (c, j) { c.style.setProperty("--j", j); c.classList.add("out"); });
    setTimeout(function () {
      rot.textContent = "";
      var j = 0; splitWords(rot, text, function () { return (j++) - 4; });
    }, 420 + old.length * 14);
  }
  if (!reduce) setTimeout(function () {
    setInterval(function () { ri = (ri + 1) % roles.length; setRole(roles[ri]); }, 3200);
  }, 1800);

  /* ---------- About: words light up with scroll ---------- */
  var prose = document.getElementById("prose"), words = [];
  prose.querySelectorAll("p").forEach(function (p) {
    Array.from(p.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement("span"); s.className = "wd"; s.textContent = part;
          frag.appendChild(s); words.push(s);
        });
        p.replaceChild(frag, n);
      } else if (n.nodeType === 1) { n.classList.add("wd"); words.push(n); }
    });
  });
  function lightWords() {
    if (reduce) { words.forEach(function (w) { w.classList.add("lit"); }); return; }
    var r = prose.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (r.height + innerHeight * 0.3)));
    var n = Math.floor(p * words.length * 1.2);
    words.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
  }
  addEventListener("scroll", lightWords, { passive: true }); lightWords();

  /* ---------- Icons draw themselves ---------- */
  document.querySelectorAll(".work-item .ico svg *").forEach(function (el) { el.setAttribute("pathLength", "1"); });

  /* ---------- Contact: weight follows cursor ---------- */
  var big = document.getElementById("big"), cws = [];
  big.querySelectorAll(".w").forEach(function (w) {
    var t = w.textContent; w.textContent = "";
    Array.from(t).forEach(function (c) { var s = document.createElement("span"); s.className = "cw"; s.textContent = c; w.appendChild(s); cws.push(s); });
  });
  if (fine && !reduce) {
    var contactSec = document.getElementById("contact");
    contactSec.addEventListener("pointermove", function (e) {
      cws.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        s.style.fontWeight = Math.round(300 + 550 * Math.max(0, 1 - d / 170));
      });
    });
    contactSec.addEventListener("pointerleave", function () { cws.forEach(function (s) { s.style.fontWeight = ""; }); });
  }

  /* ---------- Easter egg: type "madeira" ---------- */
  var toast = document.getElementById("toast"), buf = "", boost = 1, eggUntil = 0;
  var toastTimer = 0;
  function showToast(t, ms) {
    toast.textContent = t; toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove("show"); }, ms || 2800);
  }
  function eruption() {
    eggUntil = performance.now() + 4000;
    found("madeira", "Volcano mode. Madeira was born from one.");
    for (var k = 0; k < 4; k++) (function (k) {
      setTimeout(function () { addRipple(W * (0.3 + Math.random() * 0.5), H * (0.3 + Math.random() * 0.4), 2.4); }, k * 260);
    })(k);
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }
  /* ---------- Easter egg hunt ---------- */
  var EGGS = {
    madeira:  ["Volcano",        "Type the name of the island. Anywhere."],
    konami:   ["Arcade",         "Old gamers know the code: ↑ ↑ ↓ ↓ ← → ← → B A"],
    gravity:  ["Gravity",        "Type the word Newton is famous for."],
    matrix:   ["Matrix",         "Type the name of a film about a red pill."],
    lights:   ["Lights out",     "Hold the theme button for a while."],
    console:  ["Console",        "Developers open the console. Try it."],
    coords:   ["Coordinates",    "The coordinates under the globe know where I live. Click them."],
    roll:     ["Barrel roll",    "Click the logo five times, fast."],
    dizzy:    ["Dizzy",          "Fling the globe as hard as you can."],
    idle:     ["Nap time",       "Do nothing for 30 seconds."],
    sandwich: ["Sandwich",       "Ask the terminal, politely, as a superuser, for food."],
    speed:    ["Speed demon",    "Beat my ghost in the Type race."],
    bugs:     ["Exterminator",   "Squash 25 bugs in a single run of Bug hunt."]
  };
  var EGG_TOTAL = Object.keys(EGGS).length, got = {};
  try { got = JSON.parse(localStorage.getItem("gn-eggs") || "{}") || {}; } catch (e) { got = {}; }
  var eggBtn = document.getElementById("egg-count"), eggN = document.getElementById("egg-n");
  function eggCount() { return Object.keys(got).filter(function (k) { return EGGS[k]; }).length; }
  eggN.textContent = eggCount();
  function found(id, msg) {
    var isNew = !got[id];
    if (isNew) {
      got[id] = 1;
      try { localStorage.setItem("gn-eggs", JSON.stringify(got)); } catch (e) {}
      var n = eggCount();
      eggN.textContent = n; eggBtn.classList.remove("bump"); void eggBtn.offsetWidth; eggBtn.classList.add("bump");
      if (n === EGG_TOTAL) { showToast("All " + EGG_TOTAL + " eggs found. You are officially a legend.", 4200); burst(eggBtn); return; }
      showToast((msg ? msg + "  " : "") + "Egg " + n + "/" + EGG_TOTAL, 3200);
    } else if (msg) showToast(msg);
  }
  eggBtn.addEventListener("click", function () {
    var left = Object.keys(EGGS).filter(function (k) { return !got[k]; });
    if (!left.length) { showToast("All found. Nothing left to hide."); burst(eggBtn); return; }
    showToast("Hint: " + EGGS[left[Math.floor(Math.random() * left.length)]][1], 4200);
  });

  /* typed words + Konami code */
  var KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"], kPos = 0;
  addEventListener("keydown", function (e) {
    if (!e.key) return;
    var k = e.key.toLowerCase();
    kPos = k === KONAMI[kPos] ? kPos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kPos === KONAMI.length) { kPos = 0; arcade(); }
    if (k === "escape") { root.classList.remove("crt"); lightsOff(false); }
    if (k.length === 1) {
      buf = (buf + k).slice(-12);
      if (/madeira$/.test(buf)) { buf = ""; eruption(); }
      else if (/gravity$/.test(buf)) { buf = ""; gravity(); }
      else if (/matrix$/.test(buf)) { buf = ""; matrix(); }
    }
  });

  /* Arcade: CRT scanlines, everything in mono */
  function arcade() {
    root.classList.toggle("crt");
    if (root.classList.contains("crt")) found("konami", "Arcade mode. Press Esc to leave.");
  }

  /* Gravity: the title falls and bounces, then floats back */
  var gravityBusy = false;
  function gravity() {
    if (gravityBusy) return; gravityBusy = true;
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    found("gravity", "Gravity switched on.");
    var heroRect = document.querySelector(".hero").getBoundingClientRect();
    document.querySelectorAll("h1 .ch").forEach(function (c) {
      var r = c.getBoundingClientRect(), drop = heroRect.bottom - r.bottom - 6, rot = (Math.random() - 0.5) * 70;
      var down = c.animate([
        { transform: "translateY(0) rotate(0deg)" },
        { transform: "translateY(" + drop + "px) rotate(" + rot + "deg)", offset: 0.55 },
        { transform: "translateY(" + (drop - 26) + "px) rotate(" + rot * 0.8 + "deg)", offset: 0.72 },
        { transform: "translateY(" + drop + "px) rotate(" + rot + "deg)", offset: 0.86 },
        { transform: "translateY(" + (drop - 6) + "px) rotate(" + rot + "deg)", offset: 0.93 },
        { transform: "translateY(" + drop + "px) rotate(" + rot + "deg)" }
      ], { duration: 1100 + Math.random() * 300, delay: Math.random() * 250, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" });
      setTimeout(function () {
        c.animate([{ transform: "translateY(" + drop + "px) rotate(" + rot + "deg)" }, { transform: "none" }],
          { duration: 900, delay: Math.random() * 200, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" })
          .onfinish = function () { down.cancel(); this.cancel(); };
      }, 3200);
    });
    setTimeout(function () { gravityBusy = false; }, 4600);
  }

  /* Matrix: digital rain over the hero */
  var matrixBusy = false;
  function matrix() {
    if (matrixBusy) return; matrixBusy = true;
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    found("matrix", "Wake up. Follow the white rabbit.");
    var host = document.getElementById("hero-wrap"), cv = document.createElement("canvas");
    cv.className = "matrix"; host.appendChild(cv);
    var r = host.getBoundingClientRect(), dp = Math.min(2, window.devicePixelRatio || 1), c = cv.getContext("2d");
    cv.width = r.width * dp; cv.height = r.height * dp; c.scale(dp, dp);
    var fs = 13, cols = Math.ceil(r.width / fs), drops = [], chars = "01{}<>/=;gn+*", cs = getComputedStyle(root);
    var fg = cs.getPropertyValue("--fg").trim(), bg = cs.getPropertyValue("--bg").trim(), ac = cs.getPropertyValue("--accent").trim();
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -30;
    c.font = "500 " + fs + "px " + cs.getPropertyValue("--mono");
    var start = performance.now(), last = 0;
    (function rain(ts) {
      var t = ts - start;
      if (ts - last > 45) {
        last = ts;
        c.globalAlpha = 0.18; c.fillStyle = bg; c.fillRect(0, 0, r.width, r.height);
        for (var i = 0; i < cols; i++) {
          var y = drops[i] * fs;
          c.globalAlpha = 1; c.fillStyle = Math.random() < 0.06 ? ac : fg;
          c.fillText(chars[Math.floor(Math.random() * chars.length)], i * fs, y);
          if (y > r.height && Math.random() > 0.96) drops[i] = 0;
          drops[i] += 1;
        }
      }
      if (t < 6500) requestAnimationFrame(rain);
      else { cv.classList.add("gone"); setTimeout(function () { cv.remove(); matrixBusy = false; }, 700); }
    })(start);
  }

  /* Lights out: hold the theme button, then a flashlight follows you */
  var lights = document.createElement("div"); lights.className = "lights"; lights.hidden = true; document.body.appendChild(lights);
  var holdTimer = 0, lightsTimer = 0;
  window.__noThemeClick = false;
  function lightsOff(on) {
    lights.hidden = !on; clearTimeout(lightsTimer);
    if (on) { found("lights", "Lights out. Click anywhere to switch them back on."); lightsTimer = setTimeout(function () { lightsOff(false); }, 14000); }
  }
  themeBtn.addEventListener("pointerdown", function () {
    themeBtn.classList.add("holding");
    holdTimer = setTimeout(function () { window.__noThemeClick = true; themeBtn.classList.remove("holding"); lightsOff(true); }, 1200);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) {
    themeBtn.addEventListener(ev, function () { clearTimeout(holdTimer); themeBtn.classList.remove("holding"); });
  });
  addEventListener("pointermove", function (e) {
    if (lights.hidden) return;
    lights.style.setProperty("--lx", e.clientX + "px"); lights.style.setProperty("--ly", e.clientY + "px");
  }, { passive: true });
  lights.addEventListener("click", function () { lightsOff(false); });

  /* Console: a message for developers */
  try {
    console.log("%cgn_", "font: 600 42px Geist, sans-serif; letter-spacing: -2px;");
    console.log("%cYou opened the console. I like you already.\nType hello() and press Enter.", "font: 13px 'Geist Mono', monospace; color: #888;");
  } catch (e) {}
  window.hello = function () {
    found("console", "Console hacker. Hello to you too.");
    document.getElementById("contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    return "Hello! Thanks for digging around. My links are at the bottom.";
  };

  /* Coordinates: click to copy */
  var coords = document.getElementById("coords");
  coords.addEventListener("click", function () {
    var txt = "32.65, -16.91";
    function ok() { found("coords", "Coordinates copied. That is where I write code."); }
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(ok, ok); else ok();
  });

  /* Barrel roll: five fast clicks on the logo */
  var logoClicks = [], mark = document.querySelector(".mark");
  function barrelRoll() {
    found("roll", "Do a barrel roll!");
    if (!reduce) document.querySelector("main").animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 1200, easing: "cubic-bezier(.6,0,.2,1)" });
  }
  mark.addEventListener("click", function () {
    var now = Date.now(); logoClicks = logoClicks.filter(function (t) { return now - t < 2000; }); logoClicks.push(now);
    if (logoClicks.length >= 5) { logoClicks = []; barrelRoll(); }
  });

  /* Nap time: 30 seconds of nothing */
  var idleTimer = 0, napping = false;
  function wake() {
    if (napping) { napping = false; root.classList.remove("napping"); found("idle", "Oh, you're back. I took a quick nap."); }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { napping = true; root.classList.add("napping"); }, 30000);
  }
  ["pointermove", "pointerdown", "keydown", "scroll", "touchstart", "wheel"].forEach(function (ev) { addEventListener(ev, wake, { passive: true }); });
  wake();

  /* ---------- Copy burst ---------- */
  function burst(el) {
    if (reduce) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var k = 0; k < 18; k++) {
      var p = document.createElement("span"); p.className = "spark";
      if (k % 3 === 0) p.style.borderRadius = "50%";
      if (k % 4 === 1) { p.style.background = "transparent"; p.style.border = "1px solid var(--fg)"; }
      document.body.appendChild(p);
      var a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 70;
      var anim = p.animate([
        { transform: "translate(" + cx + "px," + cy + "px) scale(1) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + (cx + Math.cos(a) * d) + "px," + (cy + Math.sin(a) * d + 20) + "px) scale(.2) rotate(" + (Math.random() * 360) + "deg)", opacity: 0 }
      ], { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.2,1)" });
      anim.onfinish = (function (p) { return function () { p.remove(); }; })(p);
    }
  }

  /* ---------- Section dividers draw on scroll ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.remove("line-pre"); lio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    document.querySelectorAll("main section").forEach(function (s) {
      if (s.getBoundingClientRect().top > innerHeight) { s.classList.add("line-pre"); lio.observe(s); }
    });
  }

  /* ---------- Dotted globe (real land, Madeira marked) ---------- */
  var DOTS = LAND_DOTS;
  var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  function dec(i) { return B64.indexOf(DOTS[i]) * 64 + B64.indexOf(DOTS[i + 1]); }
  var NP = DOTS.length / 4, PX = new Float32Array(NP), PY = new Float32Array(NP), PZ = new Float32Array(NP);
  for (var di = 0; di < NP; di++) {
    var la = (dec(di * 4) / 10 - 90) * Math.PI / 180, lo = (dec(di * 4 + 2) / 10 - 180) * Math.PI / 180;
    PX[di] = Math.cos(la) * Math.sin(lo); PY[di] = Math.sin(la); PZ[di] = Math.cos(la) * Math.cos(lo);
  }
  var MLAT = 32.65 * Math.PI / 180, MLON = -16.91 * Math.PI / 180;
  var MX = Math.cos(MLAT) * Math.sin(MLON), MY = Math.sin(MLAT), MZ = Math.cos(MLAT) * Math.cos(MLON);
  var gCan = document.getElementById("globe"), gx = gCan.getContext("2d");
  var GS = 220, gdpr = Math.min(2, window.devicePixelRatio || 1);
  gCan.width = GS * gdpr; gCan.height = GS * gdpr; gx.setTransform(gdpr, 0, 0, gdpr, 0, 0);
  var GR2 = GS / 2 - 18, GCX = GS / 2, GCY = GS / 2;
  var gYaw = -MLON + 0.55, gTilt = 0.42, gSpin = 0.0035, gV = 0, gDrag = false, gLastX = 0, gFg = "#000", gFrames = 0, gOn = true, gT0 = performance.now();
  var gAc = "#f7a8a9";
  var gBg = "#fff";
  function gColor() { var c = getComputedStyle(root); gFg = c.getPropertyValue("--fg").trim() || "#000"; gBg = c.getPropertyValue("--bg").trim() || "#fff"; gAc = c.getPropertyValue("--accent").trim() || gAc; }
  var GLx = -0.5, GLy = 0.62, GLz = 0.6, GLn = Math.hypot(GLx, GLy, GLz); GLx /= GLn; GLy /= GLn; GLz /= GLn;
  function drawGlobe(now) {
    var cy = Math.cos(gYaw), sy = Math.sin(gYaw), ct = Math.cos(gTilt), st = Math.sin(gTilt);
    gx.clearRect(0, 0, GS, GS);
    gx.fillStyle = gFg; gx.strokeStyle = gFg;
    // sphere body with soft edge shading
    var sh = gx.createRadialGradient(GCX - GR2 * 0.35, GCY - GR2 * 0.4, GR2 * 0.1, GCX, GCY, GR2);
    sh.addColorStop(0, "rgba(128,128,128,0)"); sh.addColorStop(1, "rgba(128,128,128,0.10)");
    gx.globalAlpha = 1; gx.fillStyle = sh; gx.beginPath(); gx.arc(GCX, GCY, GR2, 0, Math.PI * 2); gx.fill();
    gx.fillStyle = gFg; gx.globalAlpha = 0.16; gx.lineWidth = 1; gx.stroke();
    // graticule: faint dotted parallels and meridians on the visible side
    function proj(lat, lon) {
      var X = Math.cos(lat) * Math.sin(lon), Y = Math.sin(lat), Z = Math.cos(lat) * Math.cos(lon);
      var x1 = X * cy + Z * sy, z1 = -X * sy + Z * cy, y2 = Y * ct - z1 * st, z2 = Y * st + z1 * ct;
      return [GCX + x1 * GR2, GCY - y2 * GR2, z2];
    }
    var D = Math.PI / 180;
    for (var la = -60; la <= 60; la += 30) for (var lo = -180; lo < 180; lo += 4) {
      var q = proj(la * D, lo * D); if (q[2] <= 0) continue;
      gx.globalAlpha = 0.05 + 0.1 * q[2]; gx.fillRect(q[0] - 0.4, q[1] - 0.4, 0.8, 0.8);
    }
    for (var lo2 = -180; lo2 < 180; lo2 += 30) for (var la2 = -84; la2 <= 84; la2 += 4) {
      var q2 = proj(la2 * D, lo2 * D); if (q2[2] <= 0) continue;
      gx.globalAlpha = 0.05 + 0.1 * q2[2]; gx.fillRect(q2[0] - 0.4, q2[1] - 0.4, 0.8, 0.8);
    }
    // land dots: back first (faint), then the lit front
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < NP; i++) {
        var x1 = PX[i] * cy + PZ[i] * sy, z1 = -PX[i] * sy + PZ[i] * cy;
        var y2 = PY[i] * ct - z1 * st, z2 = PY[i] * st + z1 * ct;
        if (pass === 0 ? z2 >= 0 : z2 < 0) continue;
        var sx = GCX + x1 * GR2, syy = GCY - y2 * GR2;
        if (pass === 0) { gx.globalAlpha = 0.05; gx.fillRect(sx - 0.5, syy - 0.5, 1, 1); }
        else {
          var lit = Math.max(0, x1 * GLx + y2 * GLy + z2 * GLz);
          gx.globalAlpha = 0.16 + 0.84 * Math.min(1, z2 * 0.6 + lit * 0.6);
          var r = 0.55 + 0.7 * z2;
          gx.beginPath(); gx.arc(sx, syy, r, 0, Math.PI * 2); gx.fill();
        }
      }
    }
    // Madeira: just a glowing point
    var mx1 = MX * cy + MZ * sy, mz1 = -MX * sy + MZ * cy;
    var my2 = MY * ct - mz1 * st, mz2 = MY * st + mz1 * ct;
    if (mz2 > 0.02) {
      var mxs = GCX + mx1 * GR2, mys = GCY - my2 * GR2, vis = Math.min(1, mz2 * 3);
      var g = gx.createRadialGradient(mxs, mys, 0, mxs, mys, 10);
      g.addColorStop(0, gAc); g.addColorStop(1, "rgba(0,0,0,0)");
      gx.globalAlpha = 0.55 * vis; gx.fillStyle = g; gx.beginPath(); gx.arc(mxs, mys, 10, 0, Math.PI * 2); gx.fill();
      gx.strokeStyle = gAc; gx.lineWidth = 1;
      for (var k = 0; k < 2; k++) {
        var ph = (((now - gT0) / 2200) + k * 0.5) % 1;
        gx.globalAlpha = (1 - ph) * 0.7 * vis; gx.beginPath(); gx.arc(mxs, mys, 3 + ph * 15, 0, Math.PI * 2); gx.stroke();
      }
      gx.globalAlpha = vis; gx.fillStyle = gAc; gx.beginPath(); gx.arc(mxs, mys, 3, 0, Math.PI * 2); gx.fill();
    }
    gx.globalAlpha = 1;
  }
  gColor();
  addEventListener("click", function (e) { if (e.target.closest && e.target.closest("#theme-toggle")) setTimeout(gColor, 50); });
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", gColor);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { gOn = e[0].isIntersecting; }).observe(gCan);
  var gLastTs = 0;
  (function globeLoop(ts) {
    if (gOn && !reduce && ts - gLastTs > 30) {
      gLastTs = ts;
      if (!gDrag) { gV *= 0.95; gYaw += gSpin + gV; }
      if (++gFrames % 40 === 0) gColor();
      drawGlobe(ts);
    }
    requestAnimationFrame(globeLoop);
  })(0);
  drawGlobe(performance.now());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawGlobe(performance.now()); });
  gCan.addEventListener("pointerdown", function (e) { gDrag = true; gLastX = e.clientX; gV = 0; gCan.setPointerCapture(e.pointerId); });
  gCan.addEventListener("pointermove", function (e) {
    if (!gDrag) return;
    var dx = e.clientX - gLastX; gLastX = e.clientX;
    gYaw += dx * 0.012; gV = dx * 0.012;
    if (Math.abs(dx) > 38) { gV = dx * 0.03; found("dizzy", "Easy! The globe is getting dizzy."); }
    if (reduce) drawGlobe(performance.now());
  });
  ["pointerup", "pointercancel"].forEach(function (ev) { gCan.addEventListener(ev, function () { gDrag = false; }); });

  /* ---------- Automation: a scheduled workflow runs step by step ---------- */
  var wfNodes = document.querySelectorAll("#wf .wn"), wfLanes = document.querySelectorAll("#wf .wl");
  var wfLog = document.getElementById("wf-log"), runEl = document.getElementById("run-count"), runs = 1042;
  var stepLogs = ["schedule fired", "fetched 128 records", "normalised 128 records", "kept 24 that match the rules", "sent 24 notifications"];
  function stamp() {
    try { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Atlantic/Madeira" }).format(new Date()); } catch (e) { return ""; }
  }
  function logLine(html) {
    var d = document.createElement("div"); d.innerHTML = '<span class="m">' + stamp() + '</span> ' + html; wfLog.appendChild(d);
    while (wfLog.children.length > 4) wfLog.removeChild(wfLog.firstChild);
  }
  function wfCycle() {
    wfNodes.forEach(function (n) { n.classList.remove("run", "ok"); });
    wfLanes.forEach(function (l) { l.classList.remove("go", "done"); });
    var t0 = performance.now();
    (function step(i) {
      var n = wfNodes[i], dur = 520 + Math.random() * 300;
      n.style.setProperty("--dur", dur + "ms"); n.classList.add("run");
      setTimeout(function () {
        n.classList.remove("run"); n.classList.add("ok"); logLine(stepLogs[i]);
        if (i < wfNodes.length - 1) {
          wfLanes[i].classList.add("go", "done");
          setTimeout(function () { step(i + 1); }, 450);
        } else {
          runs++; bump(runEl, runs);
          logLine('<span class="ok">run #' + runs + ' completed in ' + ((performance.now() - t0) / 1000).toFixed(2) + 's</span>');
          setTimeout(wfCycle, 2600);
        }
      }, dur);
    })(0);
  }
  if (!reduce) {
    if ("IntersectionObserver" in window) {
      var wio = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { wfCycle(); wio.disconnect(); } });
      wio.observe(document.getElementById("wf"));
    } else wfCycle();
  } else {
    wfNodes.forEach(function (n) { n.classList.add("ok"); });
    wfLanes.forEach(function (l) { l.classList.add("done"); });
  }

  function bump(el, n) {
    el.textContent = n.toLocaleString("en-US");
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
  }

  /* ---------- Mobile app: one Flutter codebase, two phones in sync ---------- */
  var devs = document.querySelectorAll(".dev-scr"), cmdT = document.getElementById("cmd-t");
  var APP = '<div class="splash"><span class="logo"></span></div>' +
    '<div class="mtrack">' +
      '<div class="sc"><span class="art a1"><i></i><i></i><i></i></span><b>Plan</b><span class="ln"></span><span class="ln short"></span></div>' +
      '<div class="sc"><span class="art a2"><i></i><i></i><i></i></span><b>Track</b><span class="ln"></span><span class="ln short"></span></div>' +
      '<div class="sc"><span class="art a3"><i></i><i></i><i></i></span><b>Done</b><span class="ln"></span><span class="ln short"></span></div>' +
      '<div class="sc home"><div class="h-top" style="--k:0"><b>Hi, Ana</b><span class="av"></span></div><div class="h-card" style="--k:1"></div>' +
      '<div class="h-row" style="--k:2"></div><div class="h-row" style="--k:3"></div><div class="h-row" style="--k:4"></div></div>' +
    '</div><div class="dots"><i></i><i></i><i></i></div><div class="cta">Get started</div><span class="finger"></span>';
  devs.forEach(function (d) { d.insertAdjacentHTML("beforeend", APP); });
  var mobTimers = [];
  function mLater(fn, ms) { mobTimers.push(setTimeout(fn, ms)); }
  function eachDev(fn) { devs.forEach(function (d, i) { setTimeout(function () { fn(d); }, i * 90); }); }
  function setStep(n) {
    eachDev(function (d) {
      d.dataset.step = n;
      d.querySelector(".mtrack").style.transform = "translateX(" + (-Math.max(0, Math.min(3, n - 1)) * 100) + "%)";
    });
  }
  function finger(cls) { eachDev(function (d) { var f = d.querySelector(".finger"); f.className = "finger"; void f.offsetWidth; f.classList.add(cls); }); }
  function pressCta() { eachDev(function (d) { var c = d.querySelector(".cta"); c.classList.add("press"); setTimeout(function () { c.classList.remove("press"); }, 200); }); }
  function typeCmd(text, done) {
    var i = 0;
    (function st() { cmdT.textContent = text.slice(0, i); if (i++ < text.length) setTimeout(st, 38); else if (done) done(); })();
  }
  function mobCycle() {
    typeCmd("flutter run -d all", function () {
      setStep(0);
      mLater(function () { cmdT.innerHTML = '<span class="ok">✓</span> running on iOS + Android'; }, 600);
      mLater(function () { setStep(1); }, 1400);
      mLater(function () { finger("swipe"); }, 2400);
      mLater(function () { setStep(2); }, 2600);
      mLater(function () { finger("swipe"); }, 3600);
      mLater(function () { setStep(3); }, 3800);
      mLater(function () { finger("tap"); pressCta(); }, 4900);
      mLater(function () { setStep(4); cmdT.innerHTML = '<span class="ok">✓</span> same code, two apps'; }, 5300);
      mLater(mobCycle, 8000);
    });
  }
  if (!reduce) {
    if ("IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { mobCycle(); mio.disconnect(); } });
      mio.observe(devs[0]);
    } else mobCycle();
  }

  /* ---------- Website: skeleton -> built -> responsive -> click ---------- */
  var browser = document.getElementById("browser"), urlEl = document.getElementById("b-url"), perfEl = document.getElementById("perf");
  var bCursor = browser.querySelector(".b-cursor"), bBtn = browser.querySelector(".b-btn");
  var urls = ["yourbrand.com", "studio-nova.pt", "coffee-lab.co", "my-next-idea.dev"], ui = 0;
  function typeUrl(text, done) {
    var i = 0;
    (function step() { urlEl.textContent = text.slice(0, i); if (i++ < text.length) setTimeout(step, 45); else if (done) done(); })();
  }
  function countPerf() {
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / 1300);
      perfEl.textContent = Math.round(100 * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else bump(perfEl, 100);
    })(t0);
  }
  function moveCursorTo(el) {
    var br = browser.getBoundingClientRect(), r = el.getBoundingClientRect();
    bCursor.style.transform = "translate(" + (r.left - br.left + r.width * 0.6) + "px," + (r.top - br.top + r.height * 0.55) + "px)";
  }
  function siteCycle() {
    browser.classList.remove("built", "mobile");
    bCursor.classList.remove("on", "click");
    bCursor.style.transform = "translate(30px, 200px)";
    perfEl.textContent = "0";
    typeUrl(urls[ui++ % urls.length], function () {
      setTimeout(function () { browser.classList.add("built"); countPerf(); }, 700);
      setTimeout(function () { bCursor.classList.add("on"); moveCursorTo(bBtn); }, 1900);
      setTimeout(function () {
        bCursor.classList.add("click"); bBtn.classList.add("pressed");
        setTimeout(function () { bBtn.classList.remove("pressed"); }, 180);
      }, 2900);
      setTimeout(function () { bCursor.classList.remove("on", "click"); browser.classList.add("mobile"); }, 3700);
      setTimeout(function () { browser.classList.remove("mobile"); }, 5900);
      setTimeout(siteCycle, 7400);
    });
  }
  if (!reduce) {
    var siteStarted = false;
    if ("IntersectionObserver" in window) {
      var sio = new IntersectionObserver(function (e) { if (e[0].isIntersecting && !siteStarted) { siteStarted = true; siteCycle(); sio.disconnect(); } });
      sio.observe(browser);
    } else siteCycle();
  }

  /* ---------- Lead flow: payloads typed out ---------- */
  var flow = document.getElementById("flow");
  if (reduce && flow.pauseAnimations) flow.pauseAnimations();
  var payloadEl = document.getElementById("payload"), leadEl = document.getElementById("lead-count"), leads = 3902;
  var payloads = [
    '{"event":"order.created","id":1042,"total":49.90}',
    '{"event":"user.signup","plan":"pro","country":"PT"}',
    '{"event":"payment.succeeded","amount":19.00}',
    '{"event":"file.uploaded","name":"report.pdf"}'
  ];
  var pi = 0;
  function typePayload() {
    var text = payloads[pi++ % payloads.length], i = 0;
    if (reduce) { payloadEl.textContent = text; return; }
    (function step() {
      payloadEl.textContent = text.slice(0, i);
      if (i++ < text.length) setTimeout(step, 22);
      else { bump(leadEl, ++leads); setTimeout(typePayload, 1600); }
    })();
  }
  typePayload();

  /* ---------- Terminal ---------- */
  var tOut = document.getElementById("term-out"), tIn = document.getElementById("term-input"), tBody = document.getElementById("term-body");
  var hist = [], hi = 0, queue = Promise.resolve();
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function line(html) {
    var d = document.createElement("div"); d.className = "term-line"; d.innerHTML = html; tOut.appendChild(d);
    tBody.scrollTop = tBody.scrollHeight;
  }
  function print(lines, fast) {
    queue = queue.then(function () {
      return new Promise(function (res) {
        var i = 0;
        (function next() {
          if (i >= lines.length) { res(); return; }
          line(lines[i++]);
          if (fast || reduce) next(); else setTimeout(next, 45);
        })();
      });
    });
    return queue;
  }
  function madeiraTime() {
    try { return new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "Atlantic/Madeira" }).format(new Date()); } catch (e) { return ""; }
  }
  var files = { "about.txt": "about", "experience.log": "experience", "stack.json": "stack", "links.md": "links" };
  var cmds = {
    help: function () { return [
      '<span class="m">available commands</span>',
      '  <span class="b">whoami</span>      who is this guy',
      '  <span class="b">about</span>       the short story',
      '  <span class="b">experience</span>  where I have worked',
      '  <span class="b">stack</span>       tools I use daily',
      '  <span class="b">links</span>       where to find me online',
      '  <span class="b">ls</span> / <span class="b">cat</span>    browse my files',
      '  <span class="b">time</span>        my local time',
      '  <span class="b">theme</span>       switch light / dark',
      '  <span class="b">madeira</span>     you will see',
      '  <span class="b">clear</span>       clean the screen'
    ]; },
    whoami: function () { return ["Guilherme Nóbrega", '<span class="m">full-stack developer · ' + age + ' y/o</span>']; },
    about: function () { return ["I build automations, mobile apps, integrations", "and websites. From idea to production, front to back."]; },
    experience: function () { return [
      '<span class="p">2022 → now</span>   Grupo AFA         Flutter, React, Python',
      '<span class="p">2021 → 2022</span>  Savoy Signature   Flutter apps, React sites, REST APIs'
    ]; },
    stack: function () { return [
      '{',
      '  <span class="p">"web"</span>: ["React", "Next.js", "TypeScript", "Vite", "shadcn/ui"],',
      '  <span class="p">"mobile"</span>: ["Flutter", "Firebase"],',
      '  <span class="p">"backend"</span>: ["Python", "Flask", "NestJS"],',
      '  <span class="p">"automation"</span>: ["Python", "Cron", "APIs"]',
      '}'
    ]; },
    links: function () { return ["github     /ghanobregaa", "linkedin   /in/ghanobrega", "instagram  @ghanobrega"]; },
    ls: function () { return ['<span class="b">about.txt</span>  <span class="b">experience.log</span>  <span class="b">stack.json</span>  <span class="b">links.md</span>  <span class="m">.secret</span>']; },
    time: function () { return [madeiraTime() + ' <span class="m">· my local time</span>']; },
    date: function () { return cmds.time(); },
    theme: function () { themeBtn.click(); return ['<span class="m">theme switched</span>']; },
    madeira: function () { eruption(); return ['<span class="p">booting volcano...</span> scroll up ↑']; },
    coffee: function () { return ["   ( (", "    ) )", "  ........", "  |      |]", "  \\      /", "   `----'", '<span class="m">brewing... ready. back to coding.</span>']; },
    sudo: function () { return ['<span class="m">[sudo] password for guest: ********</span>', 'guest is not in the sudoers file. this incident will be reported.']; },
    "rm -rf /": function () { return ['<span class="m">not today.</span>']; },
    exit: function () { return ['<span class="m">there is no escape. try</span> <span class="b">help</span>']; },
    history: function () { return hist.length ? hist.map(function (h, i) { return '<span class="m">' + (i + 1) + '</span>  ' + esc(h); }) : ['<span class="m">empty</span>']; },
    clear: function () { tOut.innerHTML = ""; return []; }
  };
  function run(raw) {
    var input = raw.trim();
    line('<span class="p">~ $</span> ' + esc(input));
    if (!input) return;
    hist.push(input); hi = hist.length;
    var key = input.toLowerCase().replace(/\s+/g, " ");
    var out;
    if (cmds[key]) out = cmds[key]();
    else if (key.indexOf("cat ") === 0) {
      var f = key.slice(4);
      if (f === ".secret") out = ['<span class="p">you found it.</span> type <span class="b">madeira</span> anywhere on the page.'];
      else if (files[f]) out = cmds[files[f]]();
      else out = ['cat: ' + esc(f) + ': no such file'];
    } else if (key.indexOf("echo ") === 0) out = [esc(input.slice(5))];
    else if (key.indexOf("sudo ") === 0) out = cmds.sudo();
    else out = ['command not found: ' + esc(input.split(" ")[0]) + ' <span class="m">· try</span> <span class="b">help</span>'];
    print(out);
  }
  print([
    '<span class="m">gn-shell 1.0 · ' + madeiraTime() + '</span>',
    'Welcome. Type <span class="b">help</span> to see what I can do.'
  ], true);
  print(cmds.help(), true);
  tIn.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { run(tIn.value); tIn.value = ""; }
    else if (e.key === "ArrowUp") { if (hi > 0) { hi--; tIn.value = hist[hi]; } e.preventDefault(); }
    else if (e.key === "ArrowDown") { if (hi < hist.length - 1) { hi++; tIn.value = hist[hi]; } else { hi = hist.length; tIn.value = ""; } e.preventDefault(); }
    else if (e.key === "Tab") {
      e.preventDefault();
      var v = tIn.value.toLowerCase();
      var pool = Object.keys(cmds).concat(Object.keys(files).map(function (f) { return "cat " + f; }));
      var m = pool.filter(function (c) { return v && c.indexOf(v) === 0; });
      if (m.length === 1) tIn.value = m[0];
      else if (m.length > 1) line('<span class="m">' + m.join("  ") + '</span>');
    }
    e.stopPropagation();
  });
  tIn.addEventListener("keyup", function (e) { e.stopPropagation(); });
  tBody.addEventListener("click", function () { if (!getSelection().toString()) tIn.focus({ preventScroll: true }); });
  document.querySelectorAll("#term-chips button").forEach(function (b) {
    b.addEventListener("click", function () { run(b.dataset.cmd); });
  });

  /* ---------- Terminal: hidden commands ---------- */
  cmds.eggs = function () {
    var out = ['<span class="m">easter eggs found: ' + eggCount() + '/' + EGG_TOTAL + '</span>'];
    Object.keys(EGGS).forEach(function (k) { out.push(got[k] ? '  <span class="p">●</span> ' + EGGS[k][0] : '  <span class="m">○ ???</span>'); });
    return out;
  };
  cmds.gravity = function () { gravity(); return ['<span class="m">what goes up...</span>']; };
  cmds.matrix = function () { matrix(); return ['<span class="m">there is no spoon.</span>']; };
  cmds["do a barrel roll"] = cmds["barrel roll"] = function () { barrelRoll(); return ['<span class="m">wheee.</span>']; };
  cmds.konami = function () { return ['<span class="m">↑ ↑ ↓ ↓ ← → ← → B A. not here though, on the page.</span>']; };
  cmds["make sandwich"] = cmds["make me a sandwich"] = function () { return ["What? Make it yourself."]; };
  cmds["sudo make sandwich"] = cmds["sudo make me a sandwich"] = function () { found("sandwich", "Okay. One sandwich, coming up."); return ['<span class="p">Okay.</span>']; };
  cmds.ping = function () { return ["pong"]; };
  cmds.vim = function () { return ['<span class="m">you are now trapped. just kidding:</span> :q!']; };
  cmds["42"] = function () { return ["The answer. But what was the question?"]; };
  cmds.hello = cmds.hi = function () { return ["Hi! Nice of you to say hello."]; };
  cmds["hello()"] = function () { window.hello(); return ['<span class="p">hello!</span> scrolling to my links...']; };

  /* ---------- Easter egg total ---------- */
  document.getElementById("egg-t").textContent = EGG_TOTAL;

  /* ---------- Type race vs my ghost ---------- */
  var SNIPPETS = [
    "const app = createApp({ fast: true, simple: true });",
    "await fetch('/api/ideas').then((res) => res.json());",
    "if (idea.isGood) { build(idea); ship(idea); }",
    "git commit -m \"make it simple, then make it fast\"",
    "for (const step of workflow) await step.run();",
    "export default function Hello() { return <h1>Hi</h1>; }"
  ];
  var raceText = document.getElementById("race-text"), raceIn = document.getElementById("race-input"), raceBox = document.getElementById("race-box");
  var rYou = document.getElementById("r-you"), rTime = document.getElementById("r-time"), raceMsg = document.getElementById("race-msg");
  var runYou = document.getElementById("run-you"), runGhost = document.getElementById("run-ghost"), raceEl = document.querySelector(".race");
  var GHOST_WPM = 92, ghostCps = GHOST_WPM * 5 / 60, snippet = "", spans = [], raceT0 = 0, raceOn = false, raceDone = false, ghostDoneAt = 0, si = -1;
  function norm(t) { return t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"'); }
  function newRace() {
    si = (si + 1 + Math.floor(Math.random() * (SNIPPETS.length - 1))) % SNIPPETS.length;
    snippet = SNIPPETS[si]; raceText.innerHTML = "";
    spans = Array.from(snippet).map(function (ch) { var sp = document.createElement("span"); sp.className = "c"; sp.textContent = ch; raceText.appendChild(sp); return sp; });
    spans[0].classList.add("cur", "gh");
    raceIn.value = ""; raceOn = false; raceDone = false; ghostDoneAt = 0;
    rYou.textContent = "0"; rTime.textContent = "0.0"; runYou.style.left = "0%"; runGhost.style.left = "0%";
    raceEl.classList.remove("done");
    raceMsg.innerHTML = "Click the snippet and start typing. My ghost starts when you do.";
  }
  function paint() {
    var v = norm(raceIn.value).slice(0, snippet.length), correct = 0;
    spans.forEach(function (sp, i) {
      sp.classList.remove("ok", "bad", "cur");
      if (i < v.length) { if (v[i] === snippet[i]) { sp.classList.add("ok"); correct++; } else sp.classList.add("bad"); }
    });
    if (v.length < spans.length) spans[v.length].classList.add("cur");
    runYou.style.left = (v.length / snippet.length * 100) + "%";
    return { typed: v.length, correct: correct, v: v };
  }
  function raceLoop() {
    if (!raceOn) return;
    var t = (performance.now() - raceT0) / 1000;
    rTime.textContent = t.toFixed(1);
    var g = Math.min(snippet.length, Math.floor(t * ghostCps));
    spans.forEach(function (sp, i) { sp.classList.toggle("gh", i === g && g < snippet.length); });
    runGhost.style.left = (g / snippet.length * 100) + "%";
    if (g >= snippet.length && !ghostDoneAt) ghostDoneAt = t;
    var p = paint(); if (t > 0.3) rYou.textContent = Math.round((p.correct / 5) / (t / 60));
    requestAnimationFrame(raceLoop);
  }
  raceIn.addEventListener("input", function () {
    if (raceDone) { raceIn.value = snippet; return; }
    if (!raceOn && raceIn.value.length) { raceOn = true; raceT0 = performance.now(); raceMsg.innerHTML = "Go go go."; requestAnimationFrame(raceLoop); }
    var p = paint();
    if (p.typed >= snippet.length) {
      raceOn = false; raceDone = true; raceEl.classList.add("done");
      var t = (performance.now() - raceT0) / 1000, wpm = Math.round((p.correct / 5) / (t / 60)), acc = Math.round(p.correct / snippet.length * 100);
      rYou.textContent = wpm; rTime.textContent = t.toFixed(1);
      var ghostT = snippet.length / ghostCps;
      if (t < ghostT && acc >= 90) {
        raceMsg.innerHTML = "<b>You beat my ghost</b> by " + (ghostT - t).toFixed(1) + "s. " + wpm + " wpm, " + acc + "% accuracy. Respect.";
        found("speed", "Speed demon. You out-typed me."); burst(raceBox);
      } else if (t < ghostT) {
        raceMsg.innerHTML = "Faster than me, but " + acc + "% accuracy. Ghost says it doesn't count.";
      } else {
        raceMsg.innerHTML = "<b>" + wpm + " wpm</b>, " + acc + "% accuracy. My ghost won by " + (t - ghostT).toFixed(1) + "s. Rematch?";
      }
    }
  });
  raceIn.addEventListener("focus", function () { raceBox.classList.add("focus"); });
  raceIn.addEventListener("blur", function () { raceBox.classList.remove("focus"); });
  raceIn.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter" && raceDone) newRace(); });
  raceIn.addEventListener("keyup", function (e) { e.stopPropagation(); });
  document.getElementById("race-new").addEventListener("click", function () { newRace(); raceIn.focus({ preventScroll: true }); });
  newRace();

  /* ---------- Your visit, live: area gradient line charts ---------- */
  var vMain = document.getElementById("v-main"), vTip = document.getElementById("v-tip");
  var vNowEl = document.getElementById("v-now"), vPeakEl = document.getElementById("v-peak"), vTimeEl = document.getElementById("v-time");
  var vcScroll = document.getElementById("vc-scroll"), vcClicks = document.getElementById("vc-clicks"), vcKeys = document.getElementById("vc-keys");
  var NS = 240, SAMPLE = 250, act = [], sScroll = [], sClicks = [], sKeys = [];
  for (var vi = 0; vi < NS; vi++) act.push(0);
  for (vi = 0; vi < 60; vi++) { sScroll.push(0); sClicks.push(0); sKeys.push(0); }
  var moved = 0, vpx = null, vpy = null, lastSY = scrollY, nClicks = 0, nKeys = 0, peak = 0, vT0 = Date.now(), lastSample = performance.now(), tick4 = 0;
  var vMax = 200, hoverX = null, vVisible = true, vCol = {};
  addEventListener("pointermove", function (e) {
    if (vpx !== null) moved += Math.hypot(e.clientX - vpx, e.clientY - vpy);
    vpx = e.clientX; vpy = e.clientY;
  }, { passive: true });
  addEventListener("pointerdown", function () { nClicks++; }, true);
  addEventListener("keydown", function () { nKeys++; }, true);
  function depth() { var m = document.documentElement.scrollHeight - innerHeight; return m > 0 ? Math.round(scrollY / m * 100) : 0; }
  setInterval(function () {
    var dy = Math.abs(scrollY - lastSY); lastSY = scrollY;
    var v = (moved + dy) / (SAMPLE / 1000); moved = 0;
    act.push(v); act.shift(); lastSample = performance.now();
    var smooth = (act[NS - 1] + act[NS - 2] + act[NS - 3]) / 3;
    vNowEl.textContent = Math.round(smooth);
    if (smooth > peak) { peak = smooth; vPeakEl.textContent = Math.round(peak); }
    if (++tick4 % 4 === 0) {
      sScroll.push(depth()); sScroll.shift(); sClicks.push(nClicks); sClicks.shift(); sKeys.push(nKeys); sKeys.shift();
      vcScroll.textContent = depth() + "%"; vcClicks.textContent = nClicks; vcKeys.textContent = nKeys;
      var sec = Math.floor((Date.now() - vT0) / 1000);
      vTimeEl.textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
      drawSparks();
    }
  }, SAMPLE);

  function hexA(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    if (isNaN(n)) return "rgba(247,168,169," + a + ")";
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }
  function readV() {
    var c = getComputedStyle(root);
    vCol = { fg: c.getPropertyValue("--fg").trim(), muted: c.getPropertyValue("--muted").trim(), line: c.getPropertyValue("--line").trim(),
             ac: c.getPropertyValue("--accent").trim(), mono: c.getPropertyValue("--mono") };
  }
  readV();
  function niceCeil(v) {
    var p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1)))), m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
  }
  function fitCanvas(cv) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); return { c: c, w: w, h: h };
  }
  function smoothPath(c, pts) {
    c.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      c.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    var l = pts[pts.length - 1]; c.lineTo(l[0], l[1]);
  }
  function areaChart(c, pts, top, bottom, alpha) {
    var g = c.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, hexA(vCol.ac, alpha)); g.addColorStop(1, hexA(vCol.ac, 0));
    c.beginPath(); smoothPath(c, pts); c.lineTo(pts[pts.length - 1][0], bottom); c.lineTo(pts[0][0], bottom); c.closePath();
    c.fillStyle = g; c.fill();
    c.beginPath(); smoothPath(c, pts); c.strokeStyle = vCol.fg; c.lineWidth = 1.5; c.lineJoin = "round"; c.stroke();
  }
  function drawMain(now) {
    var f = fitCanvas(vMain), c = f.c, w = f.w, h = f.h, padR = 40, top = 14, bot = h - 18, pw = w - padR;
    var target = niceCeil(Math.max.apply(null, act) * 1.15);
    target = Math.max(target, 200); vMax += (target - vMax) * 0.08;
    c.clearRect(0, 0, w, h);
    c.font = "10px " + vCol.mono; c.textBaseline = "middle"; c.fillStyle = vCol.muted;
    for (var gI = 0; gI <= 2; gI++) {
      var gy = top + (bot - top) * gI / 2, val = Math.round(vMax * (1 - gI / 2));
      c.strokeStyle = vCol.line; c.lineWidth = 1; c.setLineDash(gI === 2 ? [] : [3, 4]);
      c.beginPath(); c.moveTo(0, gy); c.lineTo(pw, gy); c.stroke(); c.setLineDash([]);
      c.fillText(val >= 1000 ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + "k" : val, pw + 8, gy);
    }
    c.fillText("now", pw + 8, bot + 11 > h ? h - 4 : bot + 11);
    var step = pw / (NS - 2), phase = reduce ? 0 : Math.min(1, (now - lastSample) / SAMPLE), pts = [];
    for (var i = 0; i < NS; i++) {
      var x = (i - phase) * step, y = top + (1 - Math.min(act[i], vMax) / vMax) * (bot - top);
      pts.push([x, y]);
    }
    c.save(); c.beginPath(); c.rect(0, 0, pw, h); c.clip();
    areaChart(c, pts, top, bot, 0.55);
    var last = pts[NS - 1], lx = Math.min(last[0], pw - 1);
    c.restore();
    if (!reduce) {
      var ph = (now % 1600) / 1600;
      c.globalAlpha = 1 - ph; c.strokeStyle = vCol.ac; c.lineWidth = 1;
      c.beginPath(); c.arc(lx, last[1], 3 + ph * 10, 0, Math.PI * 2); c.stroke(); c.globalAlpha = 1;
    }
    c.fillStyle = vCol.fg; c.beginPath(); c.arc(lx, last[1], 3, 0, Math.PI * 2); c.fill();
    if (hoverX !== null && hoverX < pw) {
      var idx = Math.max(0, Math.min(NS - 1, Math.round(hoverX / step + phase))), p = pts[idx];
      c.strokeStyle = vCol.muted; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(p[0], top); c.lineTo(p[0], bot); c.stroke(); c.setLineDash([]);
      c.fillStyle = vCol.bg || vCol.fg; c.beginPath(); c.arc(p[0], p[1], 4, 0, Math.PI * 2); c.fillStyle = vCol.fg; c.fill();
      var ago = ((NS - 1 - idx) * SAMPLE / 1000).toFixed(1);
      vTip.hidden = false; vTip.textContent = Math.round(act[idx]) + " px/s · " + (ago === "0.0" ? "now" : ago + "s ago");
      vTip.style.left = Math.max(60, Math.min(w - 60, p[0])) + "px";
    } else vTip.hidden = true;
  }
  var sparkCanvases = document.querySelectorAll("[data-spark]");
  function drawSparks() {
    sparkCanvases.forEach(function (cv) {
      var key = cv.dataset.spark, data = key === "scroll" ? sScroll : key === "clicks" ? sClicks : sKeys;
      var f = fitCanvas(cv), c = f.c, w = f.w, h = f.h, top = 4, bot = h - 2;
      var mx = key === "scroll" ? 100 : Math.max(5, Math.max.apply(null, data) * 1.2);
      var pts = data.map(function (v, i) { return [i / (data.length - 1) * w, top + (1 - v / mx) * (bot - top)]; });
      c.clearRect(0, 0, w, h);
      areaChart(c, pts, top, bot, 0.45);
      var l = pts[pts.length - 1]; c.fillStyle = vCol.fg; c.beginPath(); c.arc(l[0] - 2, l[1], 2.2, 0, Math.PI * 2); c.fill();
    });
  }
  vMain.addEventListener("pointermove", function (e) { var r = vMain.getBoundingClientRect(); hoverX = e.clientX - r.left; });
  vMain.addEventListener("pointerleave", function () { hoverX = null; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { vVisible = e[0].isIntersecting; }).observe(vMain);
  var vFrames = 0;
  (function vLoop(ts) {
    if (vVisible) { if (++vFrames % 60 === 0) readV(); drawMain(ts); }
    requestAnimationFrame(vLoop);
  })(performance.now());
  drawSparks();
  addEventListener("resize", drawSparks);
  themeBtn.addEventListener("click", function () { setTimeout(function () { readV(); drawSparks(); }, 60); });

  /* ---------- Experience as git log ---------- */
  var gitlog = document.getElementById("gitlog"), tl = document.getElementById("timeline"), gitTimers = [];
  var GIT = [
    ['*', '7be1d04', '(HEAD -> main) ', 'feat: software developer @ Grupo AFA', '2022 → now'],
    ['|'],
    ['*', '41c0e88', '', 'feat: developer @ Savoy Signature', '2021'],
    ['|'],
    ['*', '0c0ffee', '', 'init: hello, world', '1999']
  ];
  var HEX = "0123456789abcdef";
  function typeGit() {
    gitTimers.forEach(clearTimeout); gitTimers = []; gitlog.innerHTML = "";
    var head = document.createElement("span"); head.className = "gl"; head.innerHTML = '<span class="g-graph">$</span> git log --graph --oneline'; gitlog.appendChild(head);
    GIT.forEach(function (g, i) {
      gitTimers.push(setTimeout(function () {
        var line = document.createElement("span"); line.className = "gl";
        if (g.length === 1) { line.innerHTML = '<span class="g-graph">|</span>'; gitlog.appendChild(line); return; }
        line.innerHTML = '<span class="g-dot">*</span> <span class="g-hash">' + g[1] + '</span> <span class="g-ref">' + g[2] + '</span>' + g[3] + '  <span class="g-date">' + g[4] + '</span>';
        gitlog.appendChild(line);
        if (reduce) return;
        var h = line.querySelector(".g-hash"), n = 0;
        (function roll() {
          h.textContent = n < 8 ? Array.from({ length: 7 }, function () { return HEX[Math.floor(Math.random() * 16)]; }).join("") : g[1];
          if (n++ < 8) setTimeout(roll, 40);
        })();
      }, reduce ? 0 : 250 + i * 180));
    });
  }
  document.querySelectorAll(".vt").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".vt").forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); });
      var git = b.dataset.view === "git";
      gitlog.hidden = !git; tl.hidden = git;
      if (git) typeGit();
    });
  });

  /* ---------- Particle morph: scroll through shapes ---------- */
  (function () {
    var sec = document.getElementById("morph"), cv = document.getElementById("morph-cv"), cx = cv.getContext("2d");
    var mcs = document.querySelectorAll("#mc-stack .mc"), mcI = document.getElementById("mc-i"), mcBar = document.getElementById("mc-bar");
    var S = 420, N = (window.innerWidth < 600 ? 1100 : 1700), shapes = [], P = [];
    var off = document.createElement("canvas"); off.width = S; off.height = S;
    var o = off.getContext("2d", { willReadFrequently: true });
    var TA = new Float32Array(N * 2), TB = new Float32Array(N * 2);
    function grab() {
      var d = o.getImageData(0, 0, S, S).data, pts = [];
      for (var y = 0; y < S; y += 3) for (var x = 0; x < S; x += 3) if (d[(y * S + x) * 4 + 3] > 128) pts.push(x, y);
      return pts;
    }
    function rr(x, y, w, h, r) { o.beginPath(); o.moveTo(x + r, y); o.arcTo(x + w, y, x + w, y + h, r); o.arcTo(x + w, y + h, x, y + h, r); o.arcTo(x, y + h, x, y, r); o.arcTo(x, y, x + w, y, r); o.closePath(); }
    function clear() { o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, S, S); o.fillStyle = "#000"; o.strokeStyle = "#000"; o.lineCap = "round"; o.lineJoin = "round"; }
    function line(x1, y1, x2, y2, w) { o.lineWidth = w; o.beginPath(); o.moveTo(x1, y1); o.lineTo(x2, y2); o.stroke(); }
    function dot(x, y, r) { o.beginPath(); o.arc(x, y, r, 0, Math.PI * 2); o.fill(); }
    function part(draw, fn, weight) { clear(); draw(); return { pts: grab(), fn: fn || null, w: weight || 1 }; }
    function rot(x, y, cx0, cy0, a, out) { var c = Math.cos(a), s = Math.sin(a), dx = x - cx0, dy = y - cy0; out[0] = cx0 + dx * c - dy * s; out[1] = cy0 + dx * s + dy * c; }
    function makeShape(parts) {
      var hands = parts.filter(function (p) { return p && p.hand; });
      parts = parts.filter(function (p) { return p && p.pts && p.pts.length; });
      var total = parts.reduce(function (a, p) { return a + p.pts.length / 2 * p.w; }, 0);
      var pi = new Uint16Array(N), bx = new Float32Array(N), by = new Float32Array(N), idx = 0;
      parts.forEach(function (p, k) {
        var n = k === parts.length - 1 ? N - idx : Math.round(N * (p.pts.length / 2 * p.w) / total);
        for (var j = 0; j < n && idx < N; j++, idx++) {
          var r = Math.floor(Math.random() * (p.pts.length / 2)) * 2;
          pi[idx] = k; bx[idx] = p.pts[r] + (Math.random() - 0.5) * 1.6; by[idx] = p.pts[r + 1] + (Math.random() - 0.5) * 1.6;
        }
      });
      for (var i = N - 1; i > 0; i--) {
        var j2 = Math.floor(Math.random() * (i + 1)), t1 = pi[i], t2 = bx[i], t3 = by[i];
        pi[i] = pi[j2]; bx[i] = bx[j2]; by[i] = by[j2]; pi[j2] = t1; bx[j2] = t2; by[j2] = t3;
      }
      var out = [0, 0];
      return { hands: hands, evalAll: function (t, buf) {
        for (var i = 0; i < N; i++) {
          var p = parts[pi[i]];
          if (p.fn) p.fn(t, bx[i], by[i], out, i); else { out[0] = bx[i]; out[1] = by[i]; }
          buf[2 * i] = out[0] / S - 0.5; buf[2 * i + 1] = out[1] / S - 0.5;
        }
      } };
    }
    function bob(t) { return Math.sin(t * 2.2) * 5; }
    // ---------- Cartoon gloved hands that "work" each scene ----------
    // Hands are not particles: they are solid vector gloves drawn on top, moved by each scene.
    var HAND_SC = 1.12, POINT_TIP = [-21, -75];
    function hand(pose, mirror, posFn, angFn, gripFn) { return { hand: true, pose: pose, mirror: mirror, posFn: posFn, angFn: angFn, gripFn: gripFn }; }
    function smooth01(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
    // where to put a pointing hand so its fingertip lands on (x, y)
    function tipTo(x, y, a, mirror) {
      var tx = POINT_TIP[0] * HAND_SC * (mirror ? -1 : 1), ty = POINT_TIP[1] * HAND_SC, c = Math.cos(a), s = Math.sin(a);
      return [x - (tx * c - ty * s), y - (tx * s + ty * c)];
    }

    // ---------- Automation: two meshing gears, cranked by hand ----------
    function gearPath(cx0, cy0, rOut, rIn, teeth) {
      o.beginPath();
      for (var k = 0; k < teeth * 4; k++) {
        var a = k / (teeth * 4) * Math.PI * 2, r = (k % 4 === 1 || k % 4 === 2) ? rOut : rIn;
        var px = cx0 + Math.cos(a) * r, py = cy0 + Math.sin(a) * r;
        if (k) o.lineTo(px, py); else o.moveTo(px, py);
      }
      o.closePath();
    }
    function crankGrip(t) {
      var f = (t % 2.8) / 2.8;
      if (f < 0.74) return 1;
      if (f < 0.82) return 1 - smooth01((f - 0.74) / 0.08);
      if (f > 0.9) return smooth01((f - 0.9) / 0.1);
      return 0;
    }
    function crank(t, th0, w) {
      var C = 2.8, f = (t % C) / C, span = w * C * 0.78;
      return th0 + span * (f < 0.78 ? f / 0.78 : 1 - (f - 0.78) / 0.22);
    }
    function automation() {
      var B = [168, 248], Sm = [294, 142], wB = 0.32, ratio = 12 / 8;
      return makeShape([
        part(function () {
          gearPath(B[0], B[1], 108, 90, 12); o.fill();
          o.globalCompositeOperation = "destination-out"; dot(B[0], B[1], 54); o.globalCompositeOperation = "source-over";
          o.lineWidth = 12; for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + Math.PI / 4; line(B[0], B[1], B[0] + Math.cos(a) * 58, B[1] + Math.sin(a) * 58, 10); }
          dot(B[0], B[1], 18);
        }, function (t, x, y, out) { rot(x, y, B[0], B[1], t * wB, out); }, 1.25),
        part(function () {
          gearPath(Sm[0], Sm[1], 74, 58, 8); o.fill();
          o.globalCompositeOperation = "destination-out"; dot(Sm[0], Sm[1], 30); o.globalCompositeOperation = "source-over";
          dot(Sm[0], Sm[1], 11);
        }, function (t, x, y, out) { rot(x, y, Sm[0], Sm[1], -t * wB * ratio + Math.PI / 8, out); }),
        // left hand rides the big gear for a while, then lets go and grabs it again
        hand("open", false, function (t) { var th = crank(t, 2.35, wB); return [B[0] + Math.cos(th) * 122, B[1] + Math.sin(th) * 122]; },
             function (t) { return crank(t, 2.35, wB) - Math.PI / 2; }, crankGrip),
        // right hand pushes the small gear the other way
        hand("open", true, function (t) { var th = crank(t + 1.3, -0.55, -wB * ratio); return [Sm[0] + Math.cos(th) * 92, Sm[1] + Math.sin(th) * 92]; },
             function (t) { return crank(t + 1.3, -0.55, -wB * ratio) - Math.PI / 2; }, function (t) { return crankGrip(t + 1.3); })
      ]);
    }

    // ---------- Mobile Apps: a home screen whose icons ripple like a wave ----------
    function phone() {
      var cols = [154, 196, 238], rows = [92, 140, 188, 236], S = 30;
      function tilt(t) { return Math.sin(t * 0.9) * 0.06; }
      return makeShape([
        part(function () { o.lineWidth = 14; rr(124, 24, 172, 372, 32); o.stroke(); rr(184, 42, 52, 13, 6.5); o.fill(); line(184, 376, 236, 376, 6); },
             function (t, x, y, out) { rot(x, y, 210, 210, tilt(t), out); }, 1.1),
        part(function () { rows.forEach(function (ry) { cols.forEach(function (cxx) { rr(cxx - 2, ry, S, S, 9); o.fill(); }); }); },
             function (t, x, y, out) {
               var c = Math.round((x - 167) / 42), r = Math.round((y - 107) / 48);
               c = Math.max(0, Math.min(2, c)); r = Math.max(0, Math.min(3, r));
               var icx = cols[c] - 2 + S / 2, icy = rows[r] + S / 2;
               var w = Math.max(0, Math.sin(t * 3.2 - (c + r) * 0.75)), s = 1 + 0.32 * w * w, lift = -10 * w * w;
               rot(icx + (x - icx) * s, icy + (y - icy) * s + lift, 210, 210, tilt(t), out);
             }, 1.6),
        part(function () { rr(146, 300, 128, 46, 16); o.lineWidth = 6; o.stroke(); [174, 210, 246].forEach(function (dx) { dot(dx, 323, 9); }); },
             function (t, x, y, out) { rot(x, y, 210, 210, tilt(t), out); }, 0.8),
        // the other taps the icons one after another
        hand("point", true, function (t) {
          var taps = [[167, 107], [251, 155], [209, 203], [167, 251], [251, 107], [209, 155]], D = 0.85;
          var k = Math.floor(t / D) % taps.length, f = (t % D) / D, a0 = taps[k], a1 = taps[(k + 1) % taps.length];
          var e = f < 0.55 ? 0 : (f - 0.55) / 0.45; e = e * e * (3 - 2 * e);
          var press = f < 0.3 ? Math.sin(f / 0.3 * Math.PI) * 7 : 0;
          var q = [0, 0]; rot(a0[0] + (a1[0] - a0[0]) * e, a0[1] + (a1[1] - a0[1]) * e + 10 - press, 210, 210, tilt(t), q);
          return tipTo(q[0], q[1], -0.45, true);
        }, function () { return -0.45; })
      ]);
    }

    // ---------- Integrations: a plug and a socket that keep connecting ----------
    function api() {
      var C = 4.2;
      function phase(t) { return (t % C) / C; }
      function gap(t) {
        var f = phase(t);
        if (f < 0.32) { var e = f / 0.32; return 1 - e * e * (3 - 2 * e); }
        if (f < 0.66) return 0;
        var e2 = (f - 0.66) / 0.34; return e2 * e2 * (3 - 2 * e2);
      }
      return makeShape([
        part(function () { line(6, 210, 70, 210, 12); rr(64, 168, 104, 84, 18); o.fill(); line(168, 192, 214, 192, 11); line(168, 228, 214, 228, 11); },
             function (t, x, y, out) { out[0] = x - gap(t) * 46; out[1] = y + Math.sin(t * 2) * 2; }, 1.2),
        part(function () {
          rr(250, 168, 104, 84, 18); o.fill(); line(350, 210, 414, 210, 12);
          o.globalCompositeOperation = "destination-out"; rr(250, 186, 22, 12, 4); o.fill(); rr(250, 222, 22, 12, 4); o.fill(); o.globalCompositeOperation = "source-over";
        }, function (t, x, y, out) { out[0] = x + gap(t) * 46; out[1] = y + Math.sin(t * 2 + 1) * 2; }, 1.2),
        part(function () { dot(232, 210, 10); }, function (t, x, y, out, i) {
          var f = phase(t), life = (f - 0.3) / 0.16;
          if (life < 0 || life > 1) { out[0] = 232 + ((i % 9) - 4); out[1] = 210 + ((i % 5) - 2) * 4; return; }
          var a = (i * 2.399) % (Math.PI * 2), sp = 40 + (i % 11) * 9;
          out[0] = 232 + Math.cos(a) * sp * life; out[1] = 210 + Math.sin(a) * sp * life * 0.8;
        }, 2.6),
        hand("open", false, function (t) { return [114 - gap(t) * 46, 132 + Math.sin(t * 2) * 2]; }, function () { return Math.PI + 0.12; },
             function (t) { var f = phase(t); return 0.95 - 0.5 * Math.max(0, Math.sin(Math.max(0, f - 0.34) / 0.3 * Math.PI)) * (f > 0.34 && f < 0.64 ? 1 : 0); }),
        hand("open", true, function (t) { return [304 + gap(t) * 46, 132 + Math.sin(t * 2 + 1) * 2]; }, function () { return Math.PI - 0.12; },
             function () { return 0.95; })
      ]);
    }

    // ---------- Websites: a page that assembles itself, block by block ----------
    function browserShape() {
      var C = 6.4, blocks = [[56, 128, 308, 18], [56, 160, 196, 72], [264, 160, 100, 72], [56, 246, 92, 92], [160, 246, 92, 92], [264, 246, 100, 92]];
      function back(x) { var c1 = 1.9; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
      function scaleOf(t, k) {
        var tt = t % C, inAt = 0.35 + k * 0.42, outAt = 4.9 + (5 - k) * 0.12;
        if (tt < inAt) return 0;
        if (tt < inAt + 0.5) return back((tt - inAt) / 0.5);
        if (tt < outAt) return 1;
        if (tt < outAt + 0.28) { var e = 1 - (tt - outAt) / 0.28; return e * e; }
        return 0;
      }
      function cursorAt(t) {
        var tt = t % C, k = Math.min(5, Math.max(0, Math.floor((tt - 0.1) / 0.42))), b = blocks[k], nb = blocks[Math.min(5, k + 1)];
        var f = Math.min(1, Math.max(0, ((tt - 0.1) % 0.42) / 0.42)), e = f * f * (3 - 2 * f);
        if (tt > 2.8) { b = blocks[5]; nb = b; e = 0; }
        var x0 = b[0] + b[2] * 0.62, y0 = b[1] + b[3] * 0.6, x1 = nb[0] + nb[2] * 0.62, y1 = nb[1] + nb[3] * 0.6;
        return [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e];
      }
      var parts2 = [part(function () { o.lineWidth = 12; rr(32, 64, 356, 296, 22); o.stroke(); line(38, 108, 382, 108, 8); [60, 84, 108].forEach(function (x) { dot(x, 87, 7); }); }, null, 1.2)];
      blocks.forEach(function (b, k) {
        parts2.push(part(function () { rr(b[0], b[1], b[2], b[3], b[3] < 30 ? 6 : 12); o.fill(); }, function (t, x, y, out) {
          var s = scaleOf(t, k), cx1 = b[0] + b[2] / 2, cy1 = b[1] + b[3] / 2;
          out[0] = cx1 + (x - cx1) * s; out[1] = cy1 + (y - cy1) * s;
        }, 0.9));
      });
      parts2.push(hand("point", true, function (t) { var p = cursorAt(t); return tipTo(p[0], p[1], -0.35, true); }, function () { return -0.35; }));
      return makeShape(parts2);
    }
    function wordmark() {
      return makeShape([part(function () {
        o.textAlign = "center"; o.textBaseline = "middle";
        o.font = "600 210px " + getComputedStyle(root).getPropertyValue("--sans");
        o.fillText("gn_", 210, 215);
      })]);
    }
    function build() { shapes = [automation(), phone(), api(), browserShape(), wordmark()]; }
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { shapes[4] = wordmark(); });

    var W = 0, H = 0, dpr = 1, scale = 1, ox = 0, oy = 0;
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(W * 0.82, H * 0.52); ox = W / 2; oy = H * 0.44;
    }
    size(); addEventListener("resize", size);
    shapes[0].evalAll(0, TA);
    for (var i = 0; i < N; i++) {
      P.push({ x: ox + TA[2 * i] * scale + (Math.random() - 0.5) * W, y: oy + TA[2 * i + 1] * scale + (Math.random() - 0.5) * H, vx: 0, vy: 0, ph: Math.random() * 6.28, th: 0.08 + Math.random() * 0.84 });
    }
    var mx = -9999, my = -9999, progress = 0, stageF = 0, shown = -1, on = !("IntersectionObserver" in window), col = {};
    function colors() { var c = getComputedStyle(root); col.fg = c.getPropertyValue("--fg").trim(); col.ac = c.getPropertyValue("--accent").trim(); }
    colors();
    cv.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.addEventListener("pointerleave", function () { mx = my = -9999; });
    cv.addEventListener("pointerdown", function (e) {
      var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      P.forEach(function (p) {
        var dx = p.x - px, dy = p.y - py, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 420) * 38;
        p.vx += dx / d * f + (Math.random() - 0.5) * 6; p.vy += dy / d * f + (Math.random() - 0.5) * 6;
      });
    });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) {
      var was = on; on = e[0].isIntersecting;
      if (on && !was && performance.now() - switchAt > 1200) switchAt = performance.now();
    }).observe(sec);
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function readScroll() {
      var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      progress = Math.min(1, Math.max(0, -r.top / total));
      // the scroll only picks which shape is showing; the change itself plays on its own
      var idx = Math.min(shapes.length - 1, Math.floor(progress * shapes.length));
      if (idx !== target) { prevStage = target < 0 ? idx : target; target = idx; switchAt = performance.now(); }
      if (idx !== shown) {
        var first = shown === -1;
        shown = idx; mcs.forEach(function (m, k) { m.classList.toggle("on", k === idx); });
        if (!first) glitch(mcs[idx].querySelector("h3"));
        mcI.textContent = String(idx + 1).padStart(2, "0");
      }
      mcBar.style.transform = "scaleX(" + progress + ")";
    }
    var target = -1, prevStage = 0, switchAt = -1e9;
    addEventListener("scroll", readScroll, { passive: true }); readScroll();
    var fr = 0;
    // ---------- vector cartoon glove ----------
    function capsule(x1, y1, x2, y2, w) { cx.lineWidth = w; cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke(); }
    // Glove skeleton in glove units (palm centre near 0,0, fingers pointing up).
    // Every finger is a chain of phalanges; c (0..1) curls each joint a bit more than the one before.
    var FINGERS = [
      { bx: -19, by: -17, spread: -0.13, len: [19, 14, 11], w: 14.5 },
      { bx: -6.5, by: -20, spread: -0.04, len: [21, 15, 12], w: 15 },
      { bx: 6.5, by: -20, spread: 0.05, len: [20, 14, 11], w: 15 },
      { bx: 19, by: -16, spread: 0.15, len: [15, 11, 9], w: 13.5 }
    ];
    function chain(x, y, ang, lens, bends, w, id, P, K) {
      for (var s = 0; s < lens.length; s++) {
        ang += bends[s];
        var x2 = x + Math.sin(ang) * lens[s], y2 = y - Math.cos(ang) * lens[s];
        P.push(["l", x, y, x2, y2, w * (1 - s * 0.04), id]);
        if (s > 0 && lens[s] > 5) K.push([x, y, ang - bends[s] / 2, w * 0.6]);
        x = x2; y = y2;
      }
      return [x, y];
    }
    function gloveParts(pose, c, t) {
      c = c || 0; t = t || 0;
      var P = [["p"]], K = [];
      if (pose === "point") {
        var wag = Math.sin(t * 5) * 0.05;
        chain(-17, -18, -0.06 + wag, [21, 16, 13], [0, 0.05, 0.06], 15, 1, P, K);
        // the other three fingers are folded down: only their knuckles show
        P.push(["c", -3, -17, 9.5, 0, 0, 2], ["c", 9.5, -16, 9.5, 0, 0, 3], ["c", 20.5, -13, 8.5, 0, 0, 4]);
        K.push([-3, -11, 0, 9], [9.5, -10, 0, 9], [20.5, -8, 0, 8]);
        chain(-24, 12, -1.15, [14, 12], [0, 0.35], 14.5, 5, P, K);
      } else {
        FINGERS.forEach(function (fg, k) {
          var wig = Math.sin(t * 7 + k * 1.3) * 0.07 * (1 - c);
          // curling towards the viewer: the fingers stay side by side, the outer phalanges fold under
          // (they get shorter) so the hand grips with its fingertips
          var toward = fg.bx > 0 ? -1 : 1;
          var bends = [0, 0.1 * c * toward + wig * 0.6, 0.12 * c * toward + wig];
          var fold = [0.1, 0.5, 0.78];
          var lens = fg.len.map(function (l, s) { return Math.max(3, l * (1 - c * fold[s])); });
          chain(fg.bx, fg.by, fg.spread * (1 - 0.5 * c), lens, bends, fg.w, k + 1, P, K);
        });
        // thumb swings in and bends at its joint to meet the fingertips
        chain(-24, 14, -1.05 + 0.55 * c, [16, 14], [0, 0.25 + 0.65 * c], 15, 9, P, K);
      }
      return { P: P, K: K };
    }
    // Puffy, hand-inked glove: organic fingers with round tips, tapered ink creases and a soft wrist roll.
    // The ink "boils" (jitters slightly 8 times a second), like hand-drawn cartoon lines.
    function boil(t, seed, amp) { var x = Math.sin((Math.floor(t * 8) * 12.9898 + seed * 78.233)) * 43758.5453; return ((x - Math.floor(x)) - 0.5) * 2 * amp; }
    function fingerPath(x1, y1, x2, y2, w, grow) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      var hb = w * 0.54 + grow, hm = w * 0.47 + grow, rt = w * 0.57 + grow;
      var bx = x1 - ux * 3, by = y1 - uy * 3, mx2 = x1 + ux * L * 0.55, my2 = y1 + uy * L * 0.55;
      cx.beginPath();
      cx.moveTo(bx - nx * hb, by - ny * hb);
      cx.quadraticCurveTo(x1 + ux * L * 0.25 - nx * hm, y1 + uy * L * 0.25 - ny * hm, mx2 - nx * hm, my2 - ny * hm);
      cx.quadraticCurveTo(x2 - ux * rt * 0.6 - nx * hm, y2 - uy * rt * 0.6 - ny * hm, x2 - nx * rt, y2 - ny * rt);
      var a0 = Math.atan2(-ny, -nx); cx.arc(x2, y2, rt, a0, a0 + Math.PI, false);
      cx.quadraticCurveTo(x2 - ux * rt * 0.6 + nx * hm, y2 - uy * rt * 0.6 + ny * hm, mx2 + nx * hm, my2 + ny * hm);
      cx.quadraticCurveTo(x1 + ux * L * 0.25 + nx * hm, y1 + uy * L * 0.25 + ny * hm, bx + nx * hb, by + ny * hb);
      cx.closePath(); cx.fill();
    }
    function taper(p0x, p0y, p1x, p1y, p2x, p2y, w) {
      var L = [], R = [], n = 12;
      for (var i = 0; i <= n; i++) {
        var s = i / n, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c2 = s * s;
        var x = a * p0x + b * p1x + c2 * p2x, y = a * p0y + b * p1y + c2 * p2y;
        var tx = 2 * (1 - s) * (p1x - p0x) + 2 * s * (p2x - p1x), ty = 2 * (1 - s) * (p1y - p0y) + 2 * s * (p2y - p1y), tl = Math.hypot(tx, ty) || 1;
        var hw = w * 0.5 * Math.pow(Math.sin(Math.PI * s), 0.7);
        L.push([x - ty / tl * hw, y + tx / tl * hw]); R.push([x + ty / tl * hw, y - tx / tl * hw]);
      }
      cx.beginPath(); cx.moveTo(L[0][0], L[0][1]);
      for (var j = 1; j < L.length; j++) cx.lineTo(L[j][0], L[j][1]);
      for (var k2 = R.length - 1; k2 >= 0; k2--) cx.lineTo(R[k2][0], R[k2][1]);
      cx.closePath(); cx.fill();
    }
    function palmPath(grow) {
      var x = -28 - grow, y = -22 - grow, w = 56 + grow * 2, h = 50 + grow * 2, r = 16 + grow;
      cx.beginPath(); cx.moveTo(x + r, y); cx.quadraticCurveTo(x + w / 2, y - 3, x + w - r, y);
      cx.quadraticCurveTo(x + w, y, x + w, y + r); cx.quadraticCurveTo(x + w + 2, y + h / 2, x + w - 2, y + h - r);
      cx.quadraticCurveTo(x + w - 3, y + h, x + w - r - 2, y + h); cx.lineTo(x + r + 2, y + h);
      cx.quadraticCurveTo(x + 3, y + h, x + 2, y + h - r); cx.quadraticCurveTo(x - 2, y + h / 2, x, y + r);
      cx.quadraticCurveTo(x, y, x + r, y); cx.closePath(); cx.fill();
    }
    function shapePath(q, grow) {
      if (q[0] === "p") { palmPath(grow); return; }
      if (q[0] === "l") { capsule(q[1], q[2], q[3], q[4], q[5] + grow * 2); return; }
      if (q[0] === "e") { cx.beginPath(); cx.ellipse(q[1], q[2], q[3] + grow, q[4] + grow, 0, 0, Math.PI * 2); cx.fill(); }
      else if (q[0] === "c") { cx.beginPath(); cx.arc(q[1], q[2], q[3] + grow, 0, Math.PI * 2); cx.fill(); }
      else fingerPath(q[1], q[2], q[3], q[4], q[5], grow);
    }
    function wrist(grow) { cx.beginPath(); cx.ellipse(0, 32, 26 + grow, 13 + grow, 0, 0, Math.PI * 2); cx.fill(); }
    function easeOutBack(x) { var c1 = 2.2; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function rnd(a, b2, c3) { var x = Math.sin(a * 12.9898 + b2 * 78.233 + c3 * 37.719) * 43758.5453; return x - Math.floor(x); }
    // jagged bolt from (x0,y0) to (x1,y1): midpoint displacement, re-rolled a few times a second so it flickers
    function boltPoints(x0, y0, x1, y1, rough, s1, s2, s3) {
      var pts = [[x0, y0], [x1, y1]];
      for (var it = 0; it < 4; it++) {
        var next = [pts[0]];
        for (var i = 0; i < pts.length - 1; i++) {
          var A = pts[i], B = pts[i + 1], mx3 = (A[0] + B[0]) / 2, my3 = (A[1] + B[1]) / 2;
          var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
          var off = (rnd(s1 + it, s2 + i, s3) - 0.5) * rough * L;
          next.push([mx3 - dy / L * off, my3 + dx / L * off], B);
        }
        pts = next; rough *= 0.62;
      }
      return pts;
    }
    function strokePts(pts) { cx.beginPath(); cx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) cx.lineTo(pts[i][0], pts[i][1]); cx.stroke(); }
    function spellRays(x, y, e, k, seed) {
      // lightning bolts crack out of the glove while it appears, then fade
      if (e >= 1) return;
      var frame = Math.floor(e * 16), n = 7, grow = Math.min(1, e / 0.35), fade = e < 0.55 ? 1 : 1 - (e - 0.55) / 0.45;
      cx.save();
      cx.lineCap = "round"; cx.lineJoin = "round";
      // white flash at the start
      if (e < 0.25) {
        var g = cx.createRadialGradient(x, y, 0, x, y, 90 * k);
        g.addColorStop(0, "rgba(255,255,255," + (0.7 * (1 - e / 0.25)) + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
        cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, 90 * k, 0, Math.PI * 2); cx.fill();
      }
      for (var r = 0; r < n; r++) {
        if (rnd(seed, r, frame) < 0.18) continue; // bolts blink on and off
        var ang = r / n * Math.PI * 2 + rnd(seed, r, 0) * 0.7, len = (100 + rnd(seed, r, 1) * 90) * k * grow;
        var x0 = x + Math.cos(ang) * 16 * k, y0 = y + Math.sin(ang) * 16 * k, x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len;
        var pts = boltPoints(x0, y0, x1, y1, 0.55, seed + r, frame, 3);
        // glow, then a bright core
        cx.globalAlpha = fade * 0.9;
        cx.shadowColor = col.ac || "#f7a8a9"; cx.shadowBlur = 14 * k;
        cx.strokeStyle = col.ac || "#f7a8a9"; cx.lineWidth = 5 * k; strokePts(pts);
        cx.shadowBlur = 0;
        cx.strokeStyle = col.fg; cx.lineWidth = 2.2 * k; strokePts(pts);
        // a small fork off the middle of the bolt
        var mid = pts[Math.floor(pts.length * (0.4 + rnd(seed, r, frame + 7) * 0.3))], fa = ang + (rnd(seed, r, frame + 9) < 0.5 ? -0.7 : 0.7);
        var fl = len * 0.35, fork = boltPoints(mid[0], mid[1], mid[0] + Math.cos(fa) * fl, mid[1] + Math.sin(fa) * fl, 0.5, seed + r + 40, frame, 5);
        cx.globalAlpha = fade * 0.75;
        cx.strokeStyle = col.ac || "#f7a8a9"; cx.lineWidth = 2.6 * k; strokePts(fork);
        cx.strokeStyle = col.fg; cx.lineWidth = 1.1 * k; strokePts(fork);
      }
      cx.restore();
    }
    function drawGlove(hd, time, alpha, seed) {
      if (alpha <= 0) return;
      var p = hd.posFn(time), a = hd.angFn(time), k = HAND_SC * scale / S;
      var sx = ox + (p[0] / S - 0.5) * scale, sy = oy + (p[1] / S - 0.5) * scale;
      spellRays(sx, sy, alpha, k, seed || 0);
      var pop = 0.55 + 0.45 * easeOutBack(Math.min(1, alpha));
      var grip = hd.gripFn ? Math.min(0.82, hd.gripFn(time)) : 0;
      var gPrev = hd.gripFn ? Math.min(0.82, hd.gripFn(time - 0.06)) : 0;
      var pPrev = hd.posFn(time - 0.06);
      // cartoon timing: squash when the fingers close, stretch when the hand moves fast, plus a little wobble
      var vel = Math.hypot(p[0] - pPrev[0], p[1] - pPrev[1]) / 0.06;
      var sq = Math.max(-0.16, Math.min(0.16, (grip - gPrev) / 0.06 * 0.05));
      var st = Math.min(0.18, vel / 900);
      a += Math.sin(time * 6.5 + (hd.mirror ? 1.7 : 0)) * 0.05;
      var GP = gloveParts(hd.pose, grip, time), parts3 = GP.P, ink = "#0d0d0d", ow = 2.4, bt = reduce ? 0 : time;
      cx.save();
      cx.globalAlpha = Math.min(1, alpha * 1.6);
      var bob = Math.sin(time * 4 + (hd.mirror ? 2 : 0)) * 2 * k;
      cx.translate(sx, sy + bob); cx.rotate(a);
      cx.scale(k * pop * (hd.mirror ? -1 : 1) * (1 + sq - st * 0.5), k * pop * (1 - sq + st));
      cx.lineCap = "round"; cx.lineJoin = "round";
      cx.strokeStyle = ink;
      // silhouette in ink (outer outline on light backgrounds) with a soft drop shadow
      cx.shadowColor = "rgba(0,0,0,0.35)"; cx.shadowBlur = 16 * k; cx.shadowOffsetY = 5 * k;
      cx.fillStyle = ink;
      cx.strokeStyle = ink; parts3.forEach(function (q) { shapePath(q, ow + boil(bt, 1, 0.35)); });
      wrist(ow);
      cx.shadowColor = "transparent";
      // white glove: wrist roll, then fingers (each one inked as a single piece so its joint has no seam),
      // then the palm on top so the fingers grow cleanly out of it
      cx.fillStyle = "#ffffff"; wrist(0);
      var ids = [];
      for (var q = 1; q < parts3.length; q++) if (ids.indexOf(parts3[q][6]) < 0) ids.push(parts3[q][6]);
      ids.forEach(function (id) {
        cx.fillStyle = ink; cx.strokeStyle = ink; parts3.forEach(function (q3, n3) { if (n3 && q3[6] === id) shapePath(q3, 1.25); });
        cx.fillStyle = "#ffffff"; cx.strokeStyle = "#ffffff"; parts3.forEach(function (q3, n3) { if (n3 && q3[6] === id) shapePath(q3, 0); });
      });
      cx.fillStyle = "#ffffff"; shapePath(parts3[0], 0);
      // tapered ink creases, like a brush pen
      cx.fillStyle = ink;
      var j = function (s2) { return boil(bt, s2, 0.7); };
      taper(-14 + j(2), 6 + j(3), -2, 12 + j(4), 10 + j(5), 6 + j(6), 2.4);                 // palm crease
      taper(-22, 26 + j(7), 0, 22 + j(8), 22, 26 + j(9), 2.4);                              // where the palm meets the wrist roll
      // a crease across every finger joint, so the fingers clearly bend
      GP.K.forEach(function (kk, n4) {
        var ca = Math.cos(kk[2]), sa = Math.sin(kk[2]), hl = kk[3] / 2;
        var x1 = kk[0] - ca * hl, y1 = kk[1] - sa * hl, x2 = kk[0] + ca * hl, y2 = kk[1] + sa * hl;
        taper(x1, y1 + j(40 + n4) * 0.4, kk[0] + sa * 2, kk[1] - ca * 2, x2, y2, 1.9);
      });
      cx.restore();
    }
    (function loop(ts) {
      if (on) {
        if (++fr % 90 === 0) colors();
        var time = reduce ? 0 : ts / 1000, since = performance.now() - switchAt;
        var switching = !reduce && since < 260 && prevStage !== target;
        shapes[target].evalAll(time, TB);
        if (switching) shapes[prevStage].evalAll(time, TA);
        cx.clearRect(0, 0, W, H);
        cx.fillStyle = col.fg;
        for (var i = 0; i < N; i++) {
          var p = P[i], T = switching && since < p.th * 260 ? TA : TB, tx = ox + T[2 * i] * scale, ty = oy + T[2 * i + 1] * scale;
          if (!reduce) { tx += Math.sin(time * 1.3 + p.ph) * 1.4; ty += Math.cos(time * 1.1 + p.ph) * 1.4; }
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { var d = Math.sqrt(d2) || 1, push = (1 - d / 95) * 3.2; p.vx += dx / d * push; p.vy += dy / d * push; }
          if (reduce) { p.x = tx; p.y = ty; }
          else {
            p.vx += (tx - p.x) * 0.13; p.vy += (ty - p.y) * 0.13;
            p.vx *= 0.72; p.vy *= 0.72; p.x += p.vx; p.y += p.vy;
          }
          var gx2 = Math.round(p.x / 5) * 5, gy2 = Math.round(p.y / 5) * 5, sp = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
          cx.globalAlpha = 0.8 + 0.2 * (1 - sp);
          cx.beginPath(); cx.arc(gx2, gy2, 1.55 + sp * 0.6, 0, 6.283); cx.fill();
        }
        cx.globalAlpha = 1;
        var hs = shapes[target].hands;
        if (hs && hs.length) {
          for (var h = 0; h < hs.length; h++) {
            // each hand appears like a spell: fade in, pop, and a burst of rays (the second one a beat later)
            var fade = reduce ? 1 : Math.min(1, Math.max(0, (performance.now() - switchAt - 180 - h * 160) / 700));
            drawGlove(hs[h], time, fade, h + target * 3);
          }
        }
      }
      requestAnimationFrame(loop);
    })(performance.now());
    themeBtn.addEventListener("click", function () { setTimeout(colors, 60); });
  })();

  /* ---------- Curtain footer: the page lifts to reveal it ---------- */
  (function () {
    var foot = document.getElementById("footer"), curtain = document.getElementById("curtain"), mainEl = document.querySelector("main");
    function fit() { mainEl.style.marginBottom = foot.offsetHeight + "px"; reveal(); }
    function reveal() {
      var fh = foot.offsetHeight, docH = document.documentElement.scrollHeight, seen = scrollY + innerHeight - (docH - fh);
      var p = Math.max(0, Math.min(1, seen / fh));
      if (reduce) p = 1;
      curtain.style.transform = "translateY(" + ((1 - p) * 40).toFixed(1) + "%) scale(" + (0.9 + p * 0.1).toFixed(3) + ")";
      curtain.style.opacity = (0.2 + p * 0.8).toFixed(3);
    }
    fit(); addEventListener("resize", fit); addEventListener("scroll", reveal, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* ---------- Contact: pink dots fall and pile up (Strike-style) ---------- */
  (function () {
    var card = document.getElementById("sand-card"), cv = document.getElementById("sand"), c = cv.getContext("2d");
    var CELL = 7, cols = 0, rows = 0, grid = null, W = 0, H = 0, dpr = 1, on = false, ac = "#f7a8a9", spawnRate = 2.2, filling = true, fade = 1;
    function readAc() { ac = getComputedStyle(root).getPropertyValue("--accent").trim() || ac; }
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = card.clientWidth; H = card.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(W / CELL); rows = Math.floor(H / CELL); grid = new Uint8Array(cols * rows);
    }
    size(); readAc(); addEventListener("resize", size);
    function drop(x, n) {
      for (var k = 0; k < n; k++) {
        var cI = Math.max(0, Math.min(cols - 1, Math.round(x / CELL + (Math.random() - 0.5) * 6)));
        var rI = Math.floor(Math.random() * 3);
        if (!grid[rI * cols + cI]) grid[rI * cols + cI] = 1 + Math.floor(Math.random() * 3);
      }
    }
    cv.addEventListener("pointerdown", function (e) { var r = cv.getBoundingClientRect(); drop(e.clientX - r.left, 40); });
    function step() {
      for (var r = rows - 2; r >= 0; r--) {
        var dir = Math.random() < 0.5 ? 1 : -1;
        for (var i = 0; i < cols; i++) {
          var cI = dir > 0 ? i : cols - 1 - i, idx = r * cols + cI, v = grid[idx];
          if (!v) continue;
          var below = idx + cols;
          if (!grid[below]) { grid[below] = v; grid[idx] = 0; continue; }
          var d = Math.random() < 0.5 ? -1 : 1, c1 = cI + d, c2 = cI - d;
          if (c1 >= 0 && c1 < cols && !grid[below + d]) { grid[below + d] = v; grid[idx] = 0; }
          else if (c2 >= 0 && c2 < cols && !grid[below - d]) { grid[below - d] = v; grid[idx] = 0; }
        }
      }
    }
    function pileHeight() {
      for (var r = 0; r < rows; r++) { var n = 0; for (var i = 0; i < cols; i++) if (grid[r * cols + i]) n++; if (n > cols * 0.5) return rows - r; }
      return 0;
    }
    function draw() {
      c.clearRect(0, 0, W, H);
      c.fillStyle = ac;
      for (var r = 0; r < rows; r++) for (var i = 0; i < cols; i++) {
        var v = grid[r * cols + i]; if (!v) continue;
        c.globalAlpha = fade * (v === 1 ? 1 : v === 2 ? 0.75 : 0.5);
        c.beginPath(); c.arc(i * CELL + CELL / 2, r * CELL + CELL / 2, CELL * 0.36, 0, 6.283); c.fill();
      }
      c.globalAlpha = 1;
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(card);
    var last = 0, fr = 0;
    (function loop(ts) {
      if (on && !reduce && ts - last > 33) {
        last = ts;
        if (++fr % 90 === 0) readAc();
        if (filling) {
          for (var k = 0; k < spawnRate; k++) if (Math.random() < 0.9) { var cI = Math.floor(Math.random() * cols); if (!grid[cI]) grid[cI] = 1 + Math.floor(Math.random() * 3); }
          if (pileHeight() > Math.min(rows * 0.3, 150 / CELL)) filling = false;
        } else {
          fade -= 0.02;
          if (fade <= 0) { grid.fill(0); fade = 1; filling = true; }
        }
        step(); draw();
      }
      requestAnimationFrame(loop);
    })(0);
    if (reduce) {
      for (var r = rows - 6; r < rows; r++) for (var i = 0; i < cols; i++) if (Math.random() < 0.8) grid[r * cols + i] = 1;
      draw();
    }
    themeBtn.addEventListener("click", function () { setTimeout(readAc, 80); });
  })();

  /* ---------- Glitch effect ---------- */
  function glitch(el) {
    if (!el || reduce) return;
    el.classList.remove("glitching"); void el.offsetWidth; el.classList.add("glitching");
    setTimeout(function () { el.classList.remove("glitching"); }, 600);
  }
  var nameLine = document.getElementById("name-line");
  nameLine.addEventListener("mouseenter", function () { glitch(nameLine); });
  (function loopGlitch() { setTimeout(function () { if (!document.hidden && scrollY < innerHeight) glitch(nameLine); loopGlitch(); }, 4500 + Math.random() * 4500); })();
  setTimeout(function () { glitch(nameLine); }, 1600);

  /* glitch the footer "gn" when it is on screen, and on hover */
  var giantEl = document.getElementById("giant");
  giantEl.addEventListener("mouseenter", function () { glitch(giantEl); });
  (function loopGiant() {
    setTimeout(function () {
      var r = giantEl.getBoundingClientRect(), cur = document.getElementById("curtain");
      if (!document.hidden && r.top < innerHeight && parseFloat(cur.style.opacity || "0") > 0.8) glitch(giantEl);
      loopGiant();
    }, 3000 + Math.random() * 3500);
  })();

  /* ---------- Bug hunt mini game ---------- */
  (function () {
    var stage = document.getElementById("game-stage"), cv = document.getElementById("game-cv"), c = cv.getContext("2d");
    var overlay = document.getElementById("game-overlay"), goTitle = document.getElementById("go-title"), goSub = document.getElementById("go-sub");
    var startBtn = document.getElementById("game-start"), scoreEl = document.getElementById("g-score"), comboEl = document.getElementById("g-combo");
    var bestEl = document.getElementById("g-best"), lifeEls = document.querySelectorAll("#g-lives i");
    var W = 0, H = 0, dpr = 1, PROD = 52, GUTTER = 34, LH = 22, TOP = 16;
    var best = 0; try { best = +localStorage.getItem("gn-bugs-best") || 0; } catch (e) {}
    bestEl.textContent = best;
    var BUG = ["..x.x..", "...x...", ".xxxxx.", "xxxxxxx", ".xxxxx.", "xxxxxxx", ".x...x."];
    var BUG2 = ["..x.x..", "...x...", ".xxxxx.", "xxxxxxx", ".xxxxx.", "xxxxxxx", "x.....x"];
    var CODE = ["import { ship } from './deploy';", "", "export async function release(app) {", "  const build = await compile(app);",
      "  if (!build.ok) throw new Error('nope');", "  await tests.run({ watch: false });", "  return ship(build, { env: 'prod' });", "}",
      "", "// TODO: fix this before friday", "const retries = 3;", "for (let i = 0; i < retries; i++) await ping();", "export default release;"];
    var col = {}, bugs = [], parts = [], floats = [], running = false, score = 0, lives = 3, combo = 1, lastHit = 0, t = 0, spawnT = 0, last = 0, flash = 0, visible = true;
    function colors() { var s2 = getComputedStyle(root); col.fg = s2.getPropertyValue("--fg").trim(); col.mu = s2.getPropertyValue("--muted").trim(); col.ln = s2.getPropertyValue("--line").trim(); col.ac = s2.getPropertyValue("--accent").trim(); col.mono = s2.getPropertyValue("--mono"); }
    function size() { dpr = Math.min(2, window.devicePixelRatio || 1); W = stage.clientWidth; H = stage.clientHeight; cv.width = W * dpr; cv.height = H * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); }
    colors(); size(); addEventListener("resize", size);
    themeBtn.addEventListener("click", function () { setTimeout(colors, 80); });
    function lanes() { return Math.max(4, Math.floor((H - TOP * 2) / LH)); }
    function pop(el, v) { el.textContent = v; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }
    function setLives() { lifeEls.forEach(function (e, i) { e.classList.toggle("off", i >= lives); }); }
    function spawn() {
      var lane = Math.floor(Math.random() * lanes()), y = TOP + lane * LH + LH / 2, diff = Math.min(1, t / 70);
      var r = Math.random(), kind = r < 0.12 ? "crit" : (r < 0.24 && t > 6 ? "feat" : "bug");
      var speed = (42 + diff * 95) * (kind === "crit" ? 1.6 : kind === "feat" ? 0.9 : 1) * (0.85 + Math.random() * 0.3);
      bugs.push({ x: GUTTER - 10, y: y, vy: 0, kind: kind, speed: speed, ph: Math.random() * 6, wob: Math.random() * 6 });
    }
    function burst(x, y, color, n) {
      for (var i = 0; i < n; i++) { var a = Math.random() * 6.283, v = 40 + Math.random() * 160; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color: color }); }
    }
    function floatText(x, y, txt, color) { floats.push({ x: x, y: y, txt: txt, life: 1, color: color }); }
    function start() {
      bugs = []; parts = []; floats = []; score = 0; lives = 3; combo = 1; t = 0; spawnT = 0.4; flash = 0;
      scoreEl.textContent = "0"; comboEl.textContent = "x1"; setLives();
      overlay.hidden = true; running = true; last = performance.now();
    }
    function gameOver() {
      running = false;
      if (score > best) { best = score; try { localStorage.setItem("gn-bugs-best", best); } catch (e) {} pop(bestEl, best); }
      goTitle.textContent = score >= 25 ? "Prod went down, but what a run." : "Prod is down.";
      goTitle.dataset.text = goTitle.textContent;
      setTimeout(function () { glitch(goTitle); }, 80); setTimeout(function () { glitch(goTitle); }, 900);
      goSub.innerHTML = "You squashed <b style=\"color:var(--fg)\">" + score + "</b> bugs in " + t.toFixed(0) + "s. Best: " + best + ".";
      startBtn.textContent = "Hotfix and retry";
      overlay.hidden = false;
    }
    startBtn.addEventListener("click", start);
    addEventListener("keydown", function (e) {
      if ((e.key === " " || e.key === "Enter") && !running && document.activeElement === startBtn) return;
    });
    cv.addEventListener("pointerdown", function (e) {
      if (!running) return;
      var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, hitR = e.pointerType === "mouse" ? 16 : 24, hit = -1, bestD = 1e9;
      bugs.forEach(function (b, i) { var d = Math.hypot(b.x - px, b.y - py); if (d < hitR && d < bestD) { bestD = d; hit = i; } });
      if (hit < 0) { burst(px, py, col.mu, 4); return; }
      var b = bugs.splice(hit, 1)[0];
      if (b.kind === "feat") {
        combo = 1; score = Math.max(0, score - 3); pop(scoreEl, score); comboEl.textContent = "x1";
        floatText(b.x, b.y - 10, "-3 that was a feature", col.mu); burst(b.x, b.y, col.mu, 10); return;
      }
      combo = (t - lastHit < 1.3) ? Math.min(5, combo + 1) : 1; lastHit = t;
      var pts = (b.kind === "crit" ? 5 : 1) * combo;
      score += pts; pop(scoreEl, score); comboEl.textContent = "x" + combo;
      floatText(b.x, b.y - 12, "+" + pts, b.kind === "crit" ? col.ac : col.fg);
      burst(b.x, b.y, col.ac, b.kind === "crit" ? 26 : 14);
      if (score >= 25) found("bugs", "Exterminator. Prod thanks you.");
    });
    function drawSprite(x, y, rows, color, scale) {
      c.fillStyle = color;
      for (var r = 0; r < rows.length; r++) for (var k = 0; k < rows[r].length; k++) {
        if (rows[r][k] !== "x") continue;
        c.beginPath(); c.arc(x + (k - 3) * scale, y + (r - 3) * scale, scale * 0.42, 0, 6.283); c.fill();
      }
    }
    function drawBoard() {
      c.font = "300 11.5px " + col.mono; c.textBaseline = "middle";
      var n = lanes();
      for (var i = 0; i < n; i++) {
        var y = TOP + i * LH + LH / 2;
        c.globalAlpha = 0.45; c.fillStyle = col.mu; c.fillText(String(i + 1).padStart(2, " "), 8, y);
        c.globalAlpha = 0.22; c.fillStyle = col.fg; c.fillText(CODE[i % CODE.length], GUTTER + 6, y);
      }
      c.globalAlpha = 1;
      c.strokeStyle = col.ln; c.beginPath(); c.moveTo(GUTTER - 4, 0); c.lineTo(GUTTER - 4, H); c.stroke();
      var px = W - PROD;
      c.globalAlpha = 1; c.fillStyle = flash > 0 ? col.ac : col.ln; c.globalAlpha = flash > 0 ? 0.25 + flash * 0.5 : 0.35;
      c.fillRect(px, 0, PROD, H); c.globalAlpha = 1;
      c.setLineDash([4, 4]); c.strokeStyle = flash > 0 ? col.ac : col.mu; c.beginPath(); c.moveTo(px, 0); c.lineTo(px, H); c.stroke(); c.setLineDash([]);
      c.save(); c.translate(px + PROD / 2, H / 2); c.rotate(-Math.PI / 2); c.textAlign = "center";
      c.fillStyle = flash > 0 ? col.ac : col.mu; c.font = "400 11px " + col.mono; c.fillText("P R O D", 0, 0); c.restore(); c.textAlign = "left";
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!visible) { requestAnimationFrame(frame); return; }
      c.clearRect(0, 0, W, H);
      drawBoard();
      if (running) {
        t += dt; spawnT -= dt;
        if (spawnT <= 0) { spawn(); spawnT = Math.max(0.36, 1.15 - t * 0.012) * (0.7 + Math.random() * 0.6); }
        for (var i = bugs.length - 1; i >= 0; i--) {
          var b = bugs[i]; b.x += b.speed * dt; b.wob += dt * 6; b.y += Math.sin(b.wob) * 0.25;
          if (b.x > W - PROD + 4) {
            bugs.splice(i, 1);
            if (b.kind === "feat") { floatText(W - PROD - 30, b.y, "shipped", col.mu); continue; }
            lives--; setLives(); flash = 1; combo = 1; comboEl.textContent = "x1";
            stage.classList.remove("shake", "glitch-hit"); void stage.offsetWidth; stage.classList.add("shake", "glitch-hit");
            if (lives <= 0) { gameOver(); break; }
          }
        }
      }
      flash = Math.max(0, flash - dt * 2);
      bugs.forEach(function (b) {
        var frameSprite = Math.floor(b.wob * 1.2) % 2 ? BUG : BUG2;
        if (b.kind === "feat") {
          c.strokeStyle = col.mu; c.lineWidth = 1; c.beginPath();
          if (c.roundRect) c.roundRect(b.x - 15, b.y - 8, 30, 16, 4); else c.rect(b.x - 15, b.y - 8, 30, 16);
          c.stroke(); c.fillStyle = col.mu; c.font = "400 9px " + col.mono; c.textAlign = "center"; c.fillText("feat", b.x, b.y + 0.5); c.textAlign = "left";
        } else drawSprite(b.x, b.y, frameSprite, b.kind === "crit" ? col.ac : col.fg, b.kind === "crit" ? 3.4 : 3);
      });
      for (var p = parts.length - 1; p >= 0; p--) {
        var q = parts[p]; q.life -= dt * 1.6; if (q.life <= 0) { parts.splice(p, 1); continue; }
        q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.92; q.vy = q.vy * 0.92 + 220 * dt;
        c.globalAlpha = q.life; c.fillStyle = q.color; c.beginPath(); c.arc(q.x, q.y, 2, 0, 6.283); c.fill();
      }
      for (var f = floats.length - 1; f >= 0; f--) {
        var fl = floats[f]; fl.life -= dt * 1.2; if (fl.life <= 0) { floats.splice(f, 1); continue; }
        fl.y -= dt * 30; c.globalAlpha = fl.life; c.fillStyle = fl.color; c.font = "500 12px " + col.mono; c.fillText(fl.txt, fl.x - 8, fl.y);
      }
      c.globalAlpha = 1;
      if (!running && overlay.hidden === false && bugs.length === 0 && !reduce) {
        // idle demo: a lone bug wandering behind the overlay
        if (Math.random() < 0.01) bugs.push({ x: GUTTER, y: TOP + Math.floor(Math.random() * lanes()) * LH + LH / 2, kind: "bug", speed: 30, ph: 0, wob: 0 });
      }
      if (!running) bugs.forEach(function (b) { b.x += b.speed * dt * 0.5; }), bugs = bugs.filter(function (b) { return b.x < W - PROD; });
      requestAnimationFrame(frame);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) last = performance.now(); }).observe(stage);
    document.addEventListener("visibilitychange", function () { last = performance.now(); });
    setLives();
    requestAnimationFrame(function (n) { last = n; frame(n); });
  })();
  cmds.game = cmds.play = function () { setTimeout(function () { openPanel("game"); }, 400); return ['<span class="m">loading bugs...</span>']; };

  /* ---------- Playground tabs ---------- */
  document.querySelectorAll(".pg-tabs .vt").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".pg-tabs .vt").forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-selected", on); });
      document.querySelectorAll(".pg-panel").forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.pg; });
      window.dispatchEvent(new Event("resize"));
    });
  });
  function openPanel(name) { var t = document.querySelector('.pg-tabs .vt[data-pg="' + name + '"]'); if (t) t.click(); }

  /* ---------- Certificates lightbox ---------- */
  (function () {
    var lb = document.createElement("div"); lb.className = "lightbox"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Certificate");
    var big = document.createElement("img"); big.alt = ""; lb.appendChild(big); document.body.appendChild(lb);
    function close() { lb.hidden = true; }
    document.querySelectorAll(".cert-card").forEach(function (c) {
      c.addEventListener("click", function () { var im = c.querySelector("img"); big.src = im.src; big.alt = im.alt; lb.hidden = false; });
    });
    lb.addEventListener("click", close);
    addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  })();

  /* ---------- Giant name: letters run from the cursor ---------- */
  var giant = document.getElementById("giant"), gls = [];
  var gText = giant.textContent; giant.textContent = "";
  Array.from(gText).forEach(function (c) {
    var s = document.createElement("span"); s.className = "gl"; s.textContent = c; giant.appendChild(s);
    gls.push({ el: s, x: 0, y: 0, vx: 0, vy: 0 });
  });
  var gp = { x: -9999, y: -9999 }, footVisible = false;
  addEventListener("pointermove", function (e) { gp.x = e.clientX; gp.y = e.clientY; }, { passive: true });
  document.addEventListener("mouseleave", function () { gp.x = gp.y = -9999; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { footVisible = e[0].isIntersecting; }).observe(giant);
  if (!reduce) (function gLoop() {
    if (footVisible) {
      gls.forEach(function (g) {
        var r = g.el.getBoundingClientRect();
        var cx = r.left + r.width / 2 - g.x, cy = r.top + r.height / 2 - g.y;
        var dx = cx - gp.x, dy = cy - gp.y, d = Math.hypot(dx, dy) || 1, R = 170;
        if (d < R) { var f = (1 - d / R) * 3.2; g.vx += dx / d * f; g.vy += dy / d * f; }
        g.vx += -g.x * 0.07; g.vy += -g.y * 0.07;
        g.vx *= 0.8; g.vy *= 0.8; g.x += g.vx; g.y += g.vy;
        g.el.style.transform = "translate(" + g.x.toFixed(1) + "px," + g.y.toFixed(1) + "px) rotate(" + (g.x * 0.35).toFixed(1) + "deg)";
        g.el.classList.toggle("hot", Math.abs(g.x) + Math.abs(g.y) > 14);
      });
    }
    requestAnimationFrame(gLoop);
  })();

  /* ---------- Hero: meteor shower (slow, soft, with depth) ---------- */
  var canvas = document.getElementById("topo"), ctx = canvas.getContext("2d"), wrap = document.getElementById("hero-wrap");
  var W = 0, H = 0, dpr = 1, meteors = [], stars = [], sparks = [], mFg = "", mAc = "", heroVisible = true, spawnAcc = 0, lastT = performance.now(), hx = 0, hy = 0, phx = 0, phy = 0;
  function rgba(col, a) {
    var h = (col || "#ffffff").replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16); if (isNaN(n)) n = 16777215;
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a.toFixed(3) + ")";
  }
  function readColors() {
    var c = getComputedStyle(root); mFg = c.getPropertyValue("--fg").trim(); mAc = c.getPropertyValue("--accent").trim();
    if (reduce) drawFrame(0, 0);
  }
  function makeStars() {
    stars = [];
    var n = Math.round(W * H / 9000);
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: 0.35 + Math.random() * 0.8, z: 0.3 + Math.random() * 0.7, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.6 });
  }
  var hole = null;
  function measureHole() {
    var wr = wrap.getBoundingClientRect(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    document.querySelectorAll(".hero .avatar, .hero h1, .hero .lead").forEach(function (el) {
      var r = el.getBoundingClientRect(); if (!r.width) return;
      x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
    });
    hole = x1 > x0 ? { x: x0 - wr.left - 28, y: y0 - wr.top - 24, w: x1 - x0 + 56, h: y1 - y0 + 48 } : null;
  }
  function resize() {
    var r = wrap.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars(); measureHole(); if (reduce) drawFrame(0, 0);
  }
  function eraseHole() {
    if (!hole) return;
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.shadowColor = "rgba(0,0,0,1)"; ctx.shadowBlur = 60; ctx.shadowOffsetX = 10000;
    ctx.fillStyle = "#000"; ctx.fillRect(hole.x - 10000, hole.y, hole.w, hole.h);
    ctx.fillRect(hole.x - 10000, hole.y, hole.w, hole.h);
    ctx.restore();
  }
  function spawn(inside, hot) {
    var z = 0.35 + Math.random() * 0.65, ang = (26 + Math.random() * 10) * Math.PI / 180, sp = (55 + Math.random() * 70) * (0.5 + z * 0.7);
    var x, y;
    if (inside) { x = Math.random() * W; y = Math.random() * H * 0.8; }
    else if (Math.random() < 0.6) { x = -0.25 * W + Math.random() * W; y = -30; }
    else { x = -30; y = Math.random() * H * 0.6; }
    meteors.push({ x: x, y: y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, len: 70 + z * 120, z: z, age: 0, hot: hot || Math.random() < 0.06 });
  }
  function addRipple(x, y, amp) {
    var n = Math.round(16 * (amp || 1.6) / 1.6);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, v = 20 + Math.random() * 120;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, r: 0.8 + Math.random() * 1.2, hot: Math.random() < 0.4 });
    }
    for (var k = 0; k < Math.round((amp || 1.6) / 1.6 * 2); k++) spawn(false, Math.random() < 0.5);
  }
  wrap.addEventListener("pointerdown", function (e) {
    if (e.target.closest && e.target.closest("a, button, .avatar")) return;
    var r = wrap.getBoundingClientRect(); addRipple(e.clientX - r.left, e.clientY - r.top);
  });
  wrap.addEventListener("pointermove", function (e) { var r = wrap.getBoundingClientRect(); hx = (e.clientX - r.left) / W - 0.5; hy = (e.clientY - r.top) / H - 0.5; });
  wrap.addEventListener("pointerleave", function () { hx = hy = 0; });
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; lastT = performance.now(); }).observe(wrap);
  function drawFrame(t, dt) {
    ctx.clearRect(0, 0, W, H);
    phx += (hx - phx) * 0.05; phy += (hy - phy) * 0.05;
    // stars
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s], a = 0.06 + 0.12 * (0.5 + 0.5 * Math.sin(t * st.sp + st.ph)) * st.z;
      ctx.fillStyle = rgba(mFg, a);
      ctx.beginPath(); ctx.arc(st.x - phx * 18 * st.z, st.y - phy * 12 * st.z, st.r, 0, 6.283); ctx.fill();
    }
    // meteors
    for (var i = meteors.length - 1; i >= 0; i--) {
      var m = meteors[i];
      m.age += dt; m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.x - m.len > W + 40 || m.y - m.len > H + 40) { meteors.splice(i, 1); continue; }
      var sp = Math.hypot(m.vx, m.vy), ux = m.vx / sp, uy = m.vy / sp;
      var fade = Math.min(1, m.age / 1.2), base = (0.14 + 0.32 * m.z) * fade, col = m.hot ? mAc : mFg;
      var px = m.x - phx * 10 * m.z, py = m.y - phy * 6 * m.z, tx = px - ux * m.len, ty = py - uy * m.len;
      var g = ctx.createLinearGradient(tx, ty, px, py);
      g.addColorStop(0, rgba(col, 0)); g.addColorStop(0.75, rgba(col, base * 0.45)); g.addColorStop(1, rgba(col, base));
      ctx.strokeStyle = g; ctx.lineWidth = 0.6 + m.z * 0.9; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(px, py); ctx.stroke();
      var glow = ctx.createRadialGradient(px, py, 0, px, py, 5 + m.z * 5);
      glow.addColorStop(0, rgba(col, base * 1.1)); glow.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(px, py, 5 + m.z * 5, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgba(col, Math.min(1, base * 1.6)); ctx.beginPath(); ctx.arc(px, py, 0.8 + m.z * 0.7, 0, 6.283); ctx.fill();
    }
    eraseHole();
    // sparkles from clicks
    for (var k = sparks.length - 1; k >= 0; k--) {
      var p = sparks[k]; p.life -= dt * 0.9;
      if (p.life <= 0) { sparks.splice(k, 1); continue; }
      p.vx *= 0.97; p.vy = p.vy * 0.97 + 18 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      ctx.fillStyle = rgba(p.hot ? mAc : mFg, p.life * 0.6);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, 6.283); ctx.fill();
    }
  }
  function meteorFrame(now) {
    var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (heroVisible && W) {
      var storm = now < eggUntil;
      boost += ((storm ? 8 : 1) - boost) * 0.05;
      spawnAcc += dt * 0.9 * boost;
      while (spawnAcc > 1) { spawnAcc -= 1; spawn(false, storm && Math.random() < 0.6); }
      drawFrame(now / 1000, dt * (storm ? 2 : 1));
    }
    requestAnimationFrame(meteorFrame);
  }
  addEventListener("resize", resize);
  if (window.matchMedia) matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readColors);
  resize(); readColors();
  setTimeout(measureHole, 1200);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureHole);
  if (reduce) { for (var q = 0; q < 6; q++) spawn(true); drawFrame(0, 0); }
  else {
    for (var pre = 0; pre < 5; pre++) spawn(true);
    requestAnimationFrame(meteorFrame);
  }
}
