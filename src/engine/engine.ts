// @ts-nocheck
/*
 * Interaction and animation engine for the portfolio.
 * React renders the markup; this module wires up canvases, scroll effects,
 * the terminal, games and easter eggs once the DOM is mounted.
 */
import { LAND_DOTS } from "@/data/landDots";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const loadThree = () => Promise.resolve({ THREE, RoomEnvironment });

let started = false;

export function startEngine(): void {
  if (started) return;
  started = true;

  var root = document.documentElement;
  // phones fire "resize" while the address bar slides in and out; only rebuild on a real change
  function onRealResize(fn) {
    var lw = innerWidth, lh = innerHeight, t = 0;
    addEventListener("resize", function () {
      if (innerWidth === lw && Math.abs(innerHeight - lh) < 160) return;
      clearTimeout(t); t = setTimeout(function () { lw = innerWidth; lh = innerHeight; fn(); }, 120);
    });
  }
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;

  /* ---------- Theme with circular reveal ---------- */
  // always opens in dark; the toggle only changes the current visit
  try { localStorage.removeItem("theme"); } catch (e) { }
  root.setAttribute("data-theme", "dark");
  var themeBtn = document.getElementById("theme-toggle");
  themeBtn.addEventListener("click", function (ev) {
    if (window.__noThemeClick) { window.__noThemeClick = false; return; }
    var current = root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    function apply() { root.setAttribute("data-theme", next); readColors(); }
    if (!document.startViewTransition || reduce) { apply(); return; }
    var r = themeBtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    try {
      var t = document.startViewTransition(apply);
      t.ready.then(function () {
        root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + end + "px at " + x + "px " + y + "px)"] },
          { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" });
      }).catch(function () { });
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
    } catch (e) { }
  }
  tick(); setInterval(tick, 20000);

  /* ---------- Stack marquee ---------- */
  var stackA = [["ReactJS", "frontend"], ["JavaScript", "language"], ["Flutter", "mobile"], ["HTML", "web"], ["CSS", "web"]];
  var stackB = [["Python", "language"], ["Flask", "backend"], ["MySQL", "data"], ["API REST", "integration"], ["Tailwind CSS", "styling"]];
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
  var ids = ["about", "experience", "craft", "contact"];
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

  /* ---------- Nav links roll on hover ---------- */
  // each link rolls to a copy of itself on hover (CSS), so the letters never jump around
  links.forEach(function (a) {
    var t = a.textContent;
    a.setAttribute("aria-label", t);
    a.innerHTML = '<span class="roll" aria-hidden="true"><span>' + t + "</span><span>" + t + "</span></span>";
  });

  /* ---------- Status: greeting by Madeira time ---------- */
  try {
    var h = +new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Atlantic/Madeira" }).format(new Date());
    document.getElementById("greet").textContent =
      (h < 6 ? "Coding late tonight" : h < 12 ? "Good morning" : h < 19 ? "Good afternoon" : "Good evening");
  } catch (e) { }
  var statusText = document.getElementById("status-text");
  if (!reduce) setInterval(function () { statusText.classList.toggle("swap"); }, 4200);

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

  // (easter eggs removed) a couple of hooks elsewhere still call these
  var eggUntil = 0, boost = 1;
  function found() {}

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

  /* ---------- Full stack: a real 3D laptop (three.js) opens, the code types, the stack jumps out ---------- */
  (function () {
    var sec = document.getElementById("craft"), cv = document.getElementById("lp-gl");
    if (!sec || !cv) return;
    var sticky = document.getElementById("lp-sticky"), scr = document.getElementById("lp-screen");
    var codeEl = document.getElementById("lp-code"), st = document.getElementById("lp-st"), ed = document.getElementById("lp-ed");
    var build = document.getElementById("lp-build"), bt = document.getElementById("lp-bt"), bp = document.getElementById("lp-bp"), app = document.getElementById("lp-app");
    var head = document.getElementById("lp-head"), cap = document.getElementById("lp-cap"), footEl = sec.querySelector(".lp-foot");
    var chipsEl = document.getElementById("lp-chips"), over = document.getElementById("lp-over"), view = document.getElementById("lp-view");
    var stackSec = document.querySelector(".lp-next"); // the section the screen turns into (the gallery)
    var SW = 1000, SH = 625;

    // ---- the file that gets typed: [text, class, stack name]
    var L = [
      [["import", "k"], [" { ", "p"], ["Python", "t", "Python"], [", ", "p"], ["Flask", "t", "Flask"], [" } ", "p"], ["from", "k"], [' "@gn/backend"', "s"], [";", "p"]],
      [["import", "k"], [" { ", "p"], ["ReactJS", "t", "ReactJS"], [", ", "p"], ["JavaScript", "t", "JavaScript"], [" } ", "p"], ["from", "k"], [' "@gn/frontend"', "s"], [";", "p"]],
      [["import", "k"], [" { ", "p"], ["Flutter", "t", "Flutter"], [" } ", "p"], ["from", "k"], [' "@gn/mobile"', "s"], [";", "p"]],
      [["import", "k"], [" { ", "p"], ["MySQL", "t", "MySQL"], [", ", "p"], ["API_REST", "t", "API REST"], [" } ", "p"], ["from", "k"], [' "@gn/data"', "s"], [";", "p"]],
      [["import", "k"], [" { ", "p"], ["HTML", "t", "HTML"], [", ", "p"], ["CSS", "t", "CSS"], [", ", "p"], ["Tailwind", "t", "Tailwind CSS"], [" } ", "p"], ["from", "k"], [' "@gn/web"', "s"], [";", "p"]],
      [],
      [["export default", "k"], [" build", "t"], ["({ ", "p"], ["fullStack", "t"], [": ", "p"], ["true", "s"], [" });", "p"]]
    ];
    // where each stack settles, in world units around the laptop
    var TGT = [[-2.3, 1.75, 0.3], [2.35, 1.6, 0.1], [-2.5, 0.75, 0.8], [2.55, 0.85, 0.7], [-1.75, 2.4, -0.4],
      [1.8, 2.45, -0.5], [-2.15, 0.05, 1.2], [2.2, 0.1, 1.1], [0, 2.65, -0.6], [0.3, -0.15, 1.5]];
    // each tool leaves the screen as a tiny piece of what it makes: a response, a query, a component...
    var CARD = {
      "Python": ["python", "$ python sync.py", "✓ done · 0.8s"],
      "Flask": ["flask", "GET /api/health", "200 OK · 12 ms"],
      "ReactJS": ["react", "<Toggle on />", "ui"],
      "JavaScript": ["js", "[1, 2, 3].map(n => n * 2)", "→ [2, 4, 6]"],
      "Flutter": ["flutter", "$ flutter build apk", "✓ app-release.apk"],
      "MySQL": ["mysql", "SELECT COUNT(*) FROM users;", "→ 1 204 rows"],
      "API REST": ["rest", "POST /v1/items", "201 Created"],
      "HTML": ["html", "<h1>Hello</h1>", "Hello"],
      "CSS": ["css", "--accent: #f7a8a9;", "swatch"],
      "Tailwind CSS": ["tailwind", 'class="flex gap-4"', "flex"]
    };
    function escC(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function cardHTML(name) {
      var d = CARD[name] || [name.toLowerCase(), name, ""], r = d[2], out;
      if (r === "ui") out = '<span class="lc-ui"><i></i></span>';
      else if (r === "swatch") out = '<span class="lc-sw"><i></i><i></i><i></i></span>';
      else if (r === "flex") out = '<span class="lc-fx"><i></i><i></i><i></i></span>';
      else if (r === "Hello") out = '<span class="lc-h1">Hello</span>';
      else out = '<span class="lc-out">' + escC(r) + "</span>";
      return '<span class="lc-bar"><i></i><i></i><i></i><em>' + d[0] + '</em></span><span class="lc-in">' + escC(d[1]) + "</span>" + out;
    }
    var total0 = 0, chips = [], ci = 0;
    L.forEach(function (line) { line.s = total0; line.forEach(function (tk) {
      tk.start = total0; total0 += tk[0].length;
      if (tk[2]) {
        var c = document.createElement("span"); c.className = "lp-chip"; c.innerHTML = cardHTML(tk[2]); c.setAttribute("aria-label", tk[2]); chipsEl.appendChild(c);
        var o = { el: c, tok: tk, at: tk.start + tk[0].length, tg: TGT[ci++], ph: Math.random() * 6.28, hl: 0 };
        c.addEventListener("click", function () { o.hl = performance.now(); c.classList.remove("hit"); void c.offsetWidth; c.classList.add("hit"); setTimeout(function () { c.classList.remove("hit"); }, 1200); });
        chips.push(o);
      }
    }); total0 += 1; });
    function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
    function render(n, now) {
      var out = [];
      L.forEach(function (line, li) {
        if (li > 0 && n < line.s) return;
        var s = "";
        line.forEach(function (tk) {
          var k = n - tk.start; if (k <= 0) return;
          var hl = tk[2] && chips.some(function (c) { return c.tok === tk && now - c.hl < 1200; });
          s += '<span class="' + tk[1] + (hl ? " hl" : "") + '">' + esc(tk[0].slice(0, k)) + "</span>";
        });
        out.push(s);
      });
      return out.join("\n") + '<span class="cur"></span>';
    }

    // ---- the next section (the gallery), copied onto the screen
    var realTracks = [], copyTracks = [], liveCv = [];
    function makeCopy() {
      if (!stackSec) return;
      // copy the next section, plus whatever follows it, until a full screen is filled
      var c = document.createElement("div"), el = stackSec, h = 0;
      while (el && h < innerHeight + 40) {
        var k = el.cloneNode(true); k.classList.remove("lp-next");
        k.removeAttribute("id"); k.querySelectorAll("[id]").forEach(function (x) { x.removeAttribute("id"); });
        k.querySelectorAll("[data-reveal],[data-scramble],.pre").forEach(function (x) { x.removeAttribute("data-reveal"); x.removeAttribute("data-scramble"); x.classList.remove("pre"); x.classList.add("in"); });
        c.appendChild(k); h += el.offsetHeight; el = el.nextElementSibling;
      }
      // a WebGL scene in the next section hands over a still of its first frame
      var cvs = stackSec.querySelectorAll("canvas"), ccs = c.querySelectorAll("canvas");
      liveCv = [];
      for (var ci = 0; ci < cvs.length; ci++) if (cvs[ci].__snap) { try { var sc = cvs[ci].__snap(); ccs[ci].width = sc.width; ccs[ci].height = sc.height; ccs[ci].getContext("2d").drawImage(sc, 0, 0); liveCv.push([sc, ccs[ci]]); } catch (e) {} }
      view.innerHTML = ""; view.appendChild(c);
      view.style.width = innerWidth + "px"; view.style.height = innerHeight + "px";
      realTracks = Array.prototype.slice.call(stackSec.querySelectorAll(".track")); copyTracks = Array.prototype.slice.call(c.querySelectorAll(".track"));
    }
    makeCopy();
    if (stackSec) stackSec.addEventListener("snap-ready", makeCopy);
    themeBtn.addEventListener("click", function () { setTimeout(makeCopy, 220); });
    function syncTracks() {
      // the timeline rail fills with scroll on the real section; mirror it on the copy
      var rt = stackSec && stackSec.querySelector(".timeline"), ct = view.querySelector(".timeline");
      if (rt && ct) ct.style.setProperty("--p", rt.style.getPropertyValue("--p") || "0");
      realTracks.forEach(function (rt, i) {
        var a = rt.getAnimations && rt.getAnimations()[0], b = copyTracks[i] && copyTracks[i].getAnimations && copyTracks[i].getAnimations()[0];
        if (a && b && a.currentTime != null) b.currentTime = a.currentTime;
      });
    }

    // ---- glitches on the screen
    var lidOpen = false, wasShow = false, glT = 0, on = false;
    function glitch(big) {
      if (reduce) return;
      scr.style.setProperty("--gy", (Math.random() * 82).toFixed(1) + "%"); scr.style.setProperty("--gh", (4 + Math.random() * 12).toFixed(1) + "%");
      scr.classList.remove("gl", "big"); void scr.offsetWidth; scr.classList.add(big ? "big" : "gl");
      clearTimeout(glT); glT = setTimeout(function () { scr.classList.remove("gl", "big"); }, big ? 700 : 320);
    }
    (function loop() {
      if (on && lidOpen) { glitch(false); if (Math.random() < 0.35) setTimeout(function () { glitch(false); }, 380); }
      setTimeout(loop, 1600 + Math.random() * 3200);
    })();

    // ---- three.js scene: only built when the section gets close, so the page loads light
    // (if three.js fails to load, the rest of the page keeps working)
    var glStarted = false;
    function startGL() { if (glStarted) return; glStarted = true; buildGL(); }
    if ("IntersectionObserver" in window) {
      var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { near.disconnect(); startGL(); } }, { rootMargin: "150% 0px" });
      near.observe(sec);
    } else startGL();
    function buildGL() {
    loadThree().then(function (mod) {
    var THREE = mod.THREE, RoomEnvironment = mod.RoomEnvironment;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (err) { cv.style.display = "none"; return; }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.05, 100);
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    var sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 6, 4); scene.add(sun);
    var rim = new THREE.DirectionalLight(0xf7a8a9, 0.9); rim.position.set(-4, 2, -4); scene.add(rim);

    function rrShape(w, h, r) {
      var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
    }
    var BW = 3.0, BD = 2.06, BH = 0.075, LW = 3.0, LH = 1.98, LT = 0.04;
    var DW = 2.78, DH = DW / 1.6, DY = 0.135; // display size and its bottom edge on the lid
    var alu = new THREE.MeshStandardMaterial({ metalness: 0.8, roughness: 0.34 });
    var aluDark = new THREE.MeshStandardMaterial({ metalness: 0.7, roughness: 0.45 });
    var glass = new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.3, roughness: 0.12 });
    var keyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.15, roughness: 0.55 });
    var padMat = new THREE.MeshStandardMaterial({ metalness: 0.65, roughness: 0.22 });
    function themeColors() {
      var dark = root.getAttribute("data-theme") ? root.getAttribute("data-theme") === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
      alu.color.set(dark ? 0x48494e : 0xc9ccd1); aluDark.color.set(dark ? 0x26272a : 0xaeb2b8); padMat.color.set(dark ? 0x45464b : 0xd3d6da);
      keyBase.set(dark ? 0x0d0d0f : 0x1b1c1f);
      if (keys) for (var i = 0; i < keyCount; i++) keys.setColorAt(i, keyBase);
      if (keys && keys.instanceColor) keys.instanceColor.needsUpdate = true;
      rim.intensity = dark ? 0.9 : 0.35;
    }
    var keyBase = new THREE.Color(0x0d0d0f), keyHot = new THREE.Color(0xf7a8a9), keys = null, keyCount = 0, keyFlash = [];
    var laptop = new THREE.Group(); scene.add(laptop);
    // base
    var bGeo = new THREE.ExtrudeGeometry(rrShape(BW, BD, 0.14), { depth: BH, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 12 });
    bGeo.rotateX(-Math.PI / 2); var base = new THREE.Mesh(bGeo, alu); laptop.add(base);
    var top0 = BH + 0.012;
    // keyboard well, keys, trackpad
    var well = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(2.62, 1.0, 0.05)), aluDark); well.rotation.x = -Math.PI / 2; well.position.set(0, top0 + 0.001, -0.37); laptop.add(well);
    var ROWS = [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75], [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.3], [1, 1, 1, 1.25, 5.3, 1.25, 1, 1, 1, 1]];
    ROWS.forEach(function (r) { keyCount += r.length; });
    keys = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), keyMat, keyCount);
    (function () {
      var m = new THREE.Matrix4(), q = new THREE.Quaternion(), idx = 0, z = -0.83, KW = 2.5, gap = 0.024;
      // unit width chosen so every row ends exactly at the edge of the keyboard well
      ROWS.forEach(function (row, ri) {
        var units = row.reduce(function (a, b) { return a + b; }, 0), u = (KW - gap * (units - 1)) / units, d = ri === 0 ? 0.075 : 0.142, x = -KW / 2;
        row.forEach(function (w) {
          var kw = u * w + gap * (w - 1);
          m.compose(new THREE.Vector3(x + kw / 2, top0 + 0.012, z + d / 2), q, new THREE.Vector3(kw, 0.022, d));
          keys.setMatrixAt(idx, m); keys.setColorAt(idx, keyBase); keyFlash[idx] = 0; idx++; x += kw + gap;
        });
        z += d + gap;
      });
    })();
    laptop.add(keys);
    var pad = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(1.18, 0.7, 0.06)), padMat); pad.rotation.x = -Math.PI / 2; pad.position.set(0, top0 + 0.0015, 0.56); laptop.add(pad);
    // lid on a hinge at the back of the base
    var hinge = new THREE.Group(); hinge.position.set(0, top0, -BD / 2 + 0.03); laptop.add(hinge);
    var lGeo = new THREE.ExtrudeGeometry(rrShape(LW, LH, 0.13), { depth: LT, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 12 });
    lGeo.translate(0, LH / 2, -LT); var lid = new THREE.Mesh(lGeo, alu); hinge.add(lid);
    var bezel = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(LW - 0.05, LH - 0.05, 0.11)), glass); bezel.position.set(0, LH / 2, 0.0095); hinge.add(bezel);
    // the logo on the back of the lid
    (function () {
      var c = document.createElement("canvas"); c.width = 512; c.height = 256; var g = c.getContext("2d");
      g.fillStyle = "#fff"; g.font = "500 150px " + (getComputedStyle(root).getPropertyValue("--mono") || "monospace"); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("gn_", 256, 128);
      var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
      var logo = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.55 }));
      logo.position.set(0, LH / 2, -LT - 0.0105); logo.rotation.set(0, Math.PI, Math.PI); hinge.add(logo);
    })();
    // soft contact shadow
    (function () {
      var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d"), gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
      gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(0.6, "rgba(0,0,0,0.25)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      var sh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      sh.rotation.x = -Math.PI / 2; sh.position.y = -0.012; laptop.add(sh);
    })();
    laptop.position.y = -0.55;
    themeColors();
    themeBtn.addEventListener("click", function () { setTimeout(themeColors, 80); });
    var W = 0, H = 0;
    function size() {
      W = sticky.clientWidth; H = sticky.clientHeight;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix(); makeCopy();
    }
    size(); onRealResize(size);

    // ---- 4-point perspective mapping of the HTML screen onto the 3D display
    function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
    function mm(a, b) { var c = []; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) { var s = 0; for (var k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
    function mv(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
    function basis(p) { var m = [p[0], p[2], p[4], p[1], p[3], p[5], 1, 1, 1], v = mv(adj(m), [p[6], p[7], 1]); return mm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]); }
    function homography(src, dst) { var t = mm(basis(dst), adj(basis(src))); for (var i = 0; i < 9; i++) t[i] /= t[8]; return "matrix3d(" + [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]].join(",") + ")"; }
    var SRC = [0, 0, SW, 0, SW, SH, 0, SH];
    var LOC = [new THREE.Vector3(-DW / 2, DY + DH, 0.0105), new THREE.Vector3(DW / 2, DY + DH, 0.0105), new THREE.Vector3(DW / 2, DY, 0.0105), new THREE.Vector3(-DW / 2, DY, 0.0105)];
    var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), pts = [], vis = true;
    function project(v) { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, tmp.z]; }

    // ---- interaction
    var tmx = 0, tmy = 0, mx = 0, my = 0, lastN = -1, lastHl = 0, lastCap = "", offX = 0, offY = 0, navEl = document.querySelector(".nav");
    // outline points of the laptop (base corners + lid top corners) used to centre it
    var BOX = [new THREE.Vector3(-BW / 2, 0, BD / 2), new THREE.Vector3(BW / 2, 0, BD / 2), new THREE.Vector3(-BW / 2, 0, -BD / 2), new THREE.Vector3(BW / 2, 0, -BD / 2)];
    [new THREE.Vector3(-LW / 2, LH, 0), new THREE.Vector3(LW / 2, LH, 0), new THREE.Vector3(-LW / 2, LH, -LT), new THREE.Vector3(LW / 2, LH, -LT)].forEach(function (v) { v.lid = true; BOX.push(v); });
    addEventListener("pointermove", function (e) { if (!on) return; tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });
    function cl(x) { return Math.max(0, Math.min(1, x)); }
    function ease(x) { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    var fr2 = 0;
    function back(x) { x = cl(x); var c1 = 1.5; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function lerp(a, b, t) { return a + (b - a) * t; }
    var target = new THREE.Vector3(), camPos = new THREE.Vector3(), up = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3(), U = new THREE.Vector3();
    var fromPos = new THREE.Vector3(), fromTgt = new THREE.Vector3();

    var stackVis = null;
    function setStackVis() {
      if (!stackSec) return;
      var v = stackSec.getBoundingClientRect().top > 0.5 ? "hidden" : "";
      if (v !== stackVis) { stackVis = v; stackSec.style.visibility = v; document.body.classList.toggle("lp-zooming", v === "hidden"); }
    }
    function frame(ts) {
      var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight);
      // once the real Stack section covers the scene, stop drawing the 3D laptop
      if (stackSec && stackSec.getBoundingClientRect().top <= 0.5 && -r.top >= span - 1) { setStackVis(); return; }
      var p = reduce ? 0.7 : cl(-r.top / span), t = ts / 1000, now = performance.now(), small = W < 700;
      mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
      // phases: open 0.03-0.26 · type 0.26-0.52 · build 0.53-0.6 · stack on screen 0.6 · zoom into it 0.72-1
      var o = ease((p - 0.03) / 0.23), ez = ease((p - 0.72) / 0.28), ea = ease(ez / 0.45), eb = ease((ez - 0.45) / 0.55);
      hinge.rotation.x = Math.PI / 2 - (Math.PI / 2 + 0.3) * o + Math.PI * 0.0;
      laptop.rotation.y = (-0.5 + 0.5 * ease((p - 0.08) / 0.4)) * (1 - ea);
      laptop.position.y = -0.55 + Math.sin(t * 0.9) * 0.03 * (1 - ea);
      laptop.updateMatrixWorld(true);
      // orbit camera: above when closed, three-quarter when open, follows the mouse
      var theta = (-0.35 + 0.35 * o) + mx * 0.55, phi = lerp(0.5, 1.22, o) + my * 0.22;
      var fit = Math.max(1, 4.4 / (2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.aspect) / 7.2);
      // while the title is on screen, the laptop lives in the space below it (and steps back to fit)
      var hv = 1 - cl((p - 0.06) / 0.08), hb = head.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top + 28;
      var navB0 = navEl ? Math.max(0, navEl.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top) : 0;
      var areaTop = navB0 + Math.max(0, hb - navB0) * hv, room = Math.max(0.35, (H - areaTop) / Math.max(1, H - navB0));
      var rad = lerp(8.4, 7.8, o) * fit / Math.pow(room, 0.9);
      fromTgt.set(0, lerp(-0.4, 0.45, o), 0);
      fromPos.set(fromTgt.x + rad * Math.sin(phi) * Math.sin(theta), fromTgt.y + rad * Math.cos(phi), fromTgt.z + rad * Math.sin(phi) * Math.cos(theta));
      // the display: centre, normal and up, in world space
      C.set(0, DY + DH / 2, 0.0105); hinge.localToWorld(C);
      N.set(0, 0, 1).transformDirection(hinge.matrixWorld); U.set(0, 1, 0).transformDirection(hinge.matrixWorld);
      var tn = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), dCover = Math.min(DH / (2 * tn), DW / (2 * tn * camera.aspect)) * 0.996;
      if (ez > 0) {
        tmp2.copy(N).multiplyScalar(dCover * 2.6).add(C);
        camPos.copy(fromPos).lerp(tmp2, ea); target.copy(fromTgt).lerp(C, ea); up.set(0, 1, 0).lerp(U, ea).normalize();
        if (eb > 0) { tmp2.copy(N).multiplyScalar(lerp(dCover * 2.6, dCover, eb)).add(C); camPos.copy(tmp2); target.copy(C); up.copy(U); }
      } else { camPos.copy(fromPos); target.copy(fromTgt); up.set(0, 1, 0); }
      camera.position.copy(camPos); camera.up.copy(up); camera.lookAt(target); camera.updateMatrixWorld();
      // keep the laptop centred below the nav: measure its outline and shift the view (released during the zoom)
      var navB = navEl ? Math.max(0, navEl.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top) : 0;
      var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      BOX.forEach(function (v) { tmp2.copy(v); (v.lid ? hinge : laptop).localToWorld(tmp2); var q = project(tmp2); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
      var keep = 1 - ea;
      offX += (((x0 + x1) / 2 - W / 2) * 0.25) * keep; offY += (((y0 + y1) / 2 - (areaTop + H) / 2) * 0.25) * keep;
      offX *= keep > 0.999 ? 1 : keep; offY *= keep > 0.999 ? 1 : keep;
      if (Math.abs(offX) > 0.05 || Math.abs(offY) > 0.05) camera.setViewOffset(W, H, offX, offY, W, H); else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      // key presses glow pink
      var n = Math.round(total0 * cl((p - 0.26) / 0.26));
      if (n > lastN && lastN >= 0 && !reduce) for (var k = 0; k < Math.min(3, n - lastN); k++) keyFlash[Math.floor(Math.random() * keyCount)] = 1;
      var dirty = false;
      for (var i = 0; i < keyCount; i++) if (keyFlash[i] > 0) { keyFlash[i] = Math.max(0, keyFlash[i] - 0.08); tmp.set(0, 0, 0); var cc = keyBase.clone().lerp(keyHot, keyFlash[i]); keys.setColorAt(i, cc); dirty = true; }
      if (dirty) keys.instanceColor.needsUpdate = true;
      renderer.render(scene, camera);

      // map the HTML screen onto the display
      pts = LOC.map(function (v) { tmp2.copy(v); hinge.localToWorld(tmp2); return project(tmp2); });
      tmp.copy(camera.position).sub(C);
      var facing = tmp.dot(N) > 0 && pts.every(function (q) { return q[2] < 1; });
      var so = facing ? cl((o - 0.55) / 0.3) : 0;
      scr.style.opacity = so.toFixed(3);
      if (so > 0) scr.style.transform = homography(SRC, [pts[0][0], pts[0][1], pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]]);
      // typing, build, then the stack on screen
      var bld = cl((p - 0.53) / 0.07), hlOn = chips.some(function (c) { return now - c.hl < 1250; });
      if (n !== lastN || hlOn || lastHl) { lastN = n; codeEl.innerHTML = render(n, now); lastHl = hlOn ? 1 : 0; }
      st.textContent = n >= total0 ? "● saved" : n > 0 ? "● editing" : "○ empty";
      build.style.opacity = bld > 0 ? 1 : 0; bp.style.transform = "scaleX(" + bld.toFixed(3) + ")";
      bt.textContent = bld >= 1 ? "✓ compiled" : "$ npm run build";
      var showNow = p > 0.61;
      if (showNow !== wasShow) { wasShow = showNow; if (so > 0.5) glitch(true); }
      app.classList.toggle("show", showNow); lidOpen = o > 0.9 && ez <= 0;
      app.style.opacity = cl((p - 0.6) / 0.04).toFixed(3); ed.style.opacity = (1 - cl((p - 0.61) / 0.04)).toFixed(3);
      if (showNow) syncTracks();
      // the gallery keeps moving on the screen (its dust drifts, its lights breathe): copy its live frame
      if (p > 0.56) liveCv.forEach(function (lc) { try { var g2 = lc[1].getContext("2d"); g2.clearRect(0, 0, lc[1].width, lc[1].height); g2.drawImage(lc[0], 0, 0, lc[1].width, lc[1].height); } catch (e) {} });
      scr.classList.toggle("zoom", ez > 0.01);
      // the copy of the Stack section: whole page, at real size once the screen fills the view
      var bx0 = Math.min(pts[0][0], pts[3][0]), bx1 = Math.max(pts[1][0], pts[2][0]), by0 = Math.min(pts[0][1], pts[1][1]), by1 = Math.max(pts[2][1], pts[3][1]);
      var rw = Math.max(1, bx1 - bx0), rh = Math.max(1, by1 - by0), fitS = Math.min(rw / innerWidth, rh / innerHeight);
      if (eb > 0.02) {
        if (view.parentNode !== over) over.appendChild(view);
        over.style.display = "block";
        var gk = cl((eb - 0.8) / 0.2); // the last stretch: the panel grows to the full view so no bezel peeks out
        over.style.left = lerp(bx0, 0, gk).toFixed(2) + "px"; over.style.top = lerp(by0, 0, gk).toFixed(2) + "px";
        over.style.width = lerp(rw, W, gk).toFixed(2) + "px"; over.style.height = lerp(rh, H, gk).toFixed(2) + "px";
        over.style.borderRadius = (10 * (1 - eb)).toFixed(2) + "px";
        view.style.transform = "translate(-50%,-50%) scale(" + fitS.toFixed(5) + ")";

      } else {

        if (view.parentNode !== app) app.insertBefore(view, app.firstChild);
        over.style.display = "none";
        view.style.transform = "translate(-50%,-50%) scale(" + Math.min(SW / innerWidth, SH / innerHeight).toFixed(5) + ")";
      }
      // the cards leave the screen and settle in a tidy layout around the laptop, laid out in screen space so they
      // never overlap it or each other: two columns on the sides when there is room, rows above and below on phones
      var fade = 1 - cl(ez * 3);
      var navT = (navEl ? Math.max(0, navEl.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top) : 0) + 14;
      var lw = bx1 - bx0, lL = bx0 - lw * 0.08, lR = bx1 + lw * 0.08, lT = by0, lB = by1 + (by1 - by0) * 0.62;
      var sc = project(C), cw0 = 0, ch0 = 0;
      // card sizes are measured again whenever the layout width changes (fonts, rotation, first paint)
      chips.forEach(function (c) { if (!c.w || c.mw !== W || (fr2 % 120) === 0) { c.w = c.el.offsetWidth; c.h = c.el.offsetHeight; c.mw = W; } cw0 = Math.max(cw0, c.w); ch0 = Math.max(ch0, c.h); });
      fr2++;
      var gap = small ? 8 : 18, sideRoom = Math.min(lL, W - lR) - gap * 2, sides = sideRoom >= cw0;
      var half = Math.ceil(chips.length / 2);
      chips.forEach(function (c, i) {
        var e = cl((n - c.at + 1) / 18), ae = back(e), k = i % 2, j = Math.floor(i / 2), tx, ty, cs = 1;
        if (sides) {
          // left / right columns, spread along the laptop's height
          var y0 = Math.max(navT + ch0 / 2, lT - ch0 * 0.4), y1 = Math.min(H - 48 - ch0 / 2, lB + ch0 * 0.2);
          ty = half > 1 ? y0 + (y1 - y0) * j / (half - 1) : (y0 + y1) / 2;
          var off = (j % 2 ? 0.35 : 0) * Math.min(sideRoom - cw0, 60); // a gentle zig-zag
          tx = k ? lR + gap + cw0 / 2 + off : lL - gap - cw0 / 2 - off;
          tx = Math.max(cw0 / 2 + 12, Math.min(W - cw0 / 2 - 12, tx));
        } else {
          // rows above and below the laptop, as many per row as fit
          // as many per row as fit (shrinking the cards a little rather than dropping to one column)
          var per = Math.max(1, Math.floor((W - 16 + gap) / (cw0 * 0.8 + gap))), csW = Math.min(1, (W - 16 - (per - 1) * gap) / (per * cw0));
          var row = Math.floor(j / per), col = j % per, cwS = cw0 * csW;
          var inRow = Math.min(per, half - row * per), rowW = inRow * cwS + (inRow - 1) * gap;
          tx = (W - rowW) / 2 + cwS / 2 + col * (cwS + gap);
          var rows = Math.ceil(half / per);
          if (k === 0) { var top0 = Math.max(navT, lT - 16 - rows * (ch0 + gap)); ty = top0 + ch0 / 2 + row * (ch0 + gap); }
          else ty = Math.min(H - 50 - (rows - row) * (ch0 + gap) + ch0 / 2 + gap, lB + 16 + ch0 / 2 + row * (ch0 + gap));
          var spaceA = lT - 16 - navT, spaceB = H - 50 - lB - 16, need = rows * (ch0 + gap);
          cs = Math.min(csW, Math.max(0.6, Math.min(1, (k === 0 ? spaceA : spaceB) / need)));
          ty = k === 0 ? lT - 16 - (rows - row) * (ch0 + gap) * cs + ch0 * cs / 2 : lB + 16 + row * (ch0 + gap) * cs + ch0 * cs / 2;
        }
        // smooth the target so the layout glides while the laptop opens and turns
        if (c.sx === undefined) { c.sx = tx; c.sy = ty; }
        c.sx += (tx - c.sx) * 0.18; c.sy += (ty - c.sy) * 0.18;
        var fx = c.sx + Math.sin(t * 0.9 + c.ph) * 3 - mx * 10, fy = c.sy + Math.cos(t * 1.1 + c.ph) * 4 - my * 6;
        var qx = sc[0] + (fx - sc[0]) * ae, qy = sc[1] + (fy - sc[1]) * ae, sz = cs * (0.35 + 0.65 * Math.min(1, ae));
        c.el.style.visibility = fade > 0.01 && e > 0 ? "visible" : "hidden";
        c.el.style.opacity = (Math.min(1, e * 2.5) * fade).toFixed(2);
        c.el.style.transform = "translate(" + qx.toFixed(1) + "px," + qy.toFixed(1) + "px) translate(-50%,-50%) rotate(" + ((1 - Math.min(1, e)) * (k ? 8 : -8)).toFixed(2) + "deg) scale(" + sz.toFixed(3) + ")";
      });
      head.style.transform = "translate3d(" + (mx * -16).toFixed(1) + "px," + (-36 * (1 - hv)).toFixed(1) + "px,0)";
      head.style.opacity = hv.toFixed(3);
      footEl.style.opacity = (1 - cl(ez * 4)).toFixed(3);
      setStackVis();
      var c2 = p < 0.04 ? "// scroll to open" : o < 0.98 ? "// opening…" : n < total0 ? "// writing stack.ts" : bld < 1 ? "// npm run build" : ez > 0 ? "// entering…" : "// keep scrolling to go inside";
      if (c2 !== lastCap) { lastCap = c2; cap.textContent = c2; cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap"); }
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; if (!on && stackSec) { stackSec.style.visibility = ""; stackVis = ""; document.body.classList.remove("lp-zooming"); } }, { rootMargin: "120px 0px" }).observe(sec); else on = true;
    (function loop(ts) { if (on) frame(ts || 0); requestAnimationFrame(loop); })(0);
    }).catch(function () { cv.style.display = "none"; });
    }
  })();

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
    var S = 420, N = (window.innerWidth < 600 ? 3200 : 5200), shapes = [], P = [];
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
      parts = parts.filter(function (p) { return p && p.pts && p.pts.length; });
      var total = parts.reduce(function (a, p) { return a + p.pts.length / 2 * p.w; }, 0);
      var pi = new Uint16Array(N), bx = new Float32Array(N), by = new Float32Array(N), ax = new Float32Array(N), ay = new Float32Array(N), idx = 0;
      parts.forEach(function (p, k) {
        var n = k === parts.length - 1 ? N - idx : Math.round(N * (p.pts.length / 2 * p.w) / total);
        for (var j = 0; j < n && idx < N; j++, idx++) {
          var r = Math.floor(Math.random() * (p.pts.length / 2)) * 2;
          pi[idx] = k; bx[idx] = p.pts[r] + (Math.random() - 0.5) * 1.6; by[idx] = p.pts[r + 1] + (Math.random() - 0.5) * 1.6;
          if (p.alt && p.alt.length) { var r2 = Math.floor(Math.random() * (p.alt.length / 2)) * 2; ax[idx] = p.alt[r2]; ay[idx] = p.alt[r2 + 1]; }
        }
      });
      for (var i = N - 1; i > 0; i--) {
        var j2 = Math.floor(Math.random() * (i + 1)), t1 = pi[i], t2 = bx[i], t3 = by[i], t4 = ax[i], t5 = ay[i];
        pi[i] = pi[j2]; bx[i] = bx[j2]; by[i] = by[j2]; ax[i] = ax[j2]; ay[i] = ay[j2];
        pi[j2] = t1; bx[j2] = t2; by[j2] = t3; ax[j2] = t4; ay[j2] = t5;
      }
      var out = [0, 0];
      return {
        evalAll: function (t, buf) {
          for (var i = 0; i < N; i++) {
            var p = parts[pi[i]];
            if (p.fn) p.fn(t, bx[i], by[i], out, i, ax[i], ay[i]); else { out[0] = bx[i]; out[1] = by[i]; }
            buf[2 * i] = out[0] / S - 0.5; buf[2 * i + 1] = out[1] / S - 0.5;
          }
        }
      };
    }
    function bob(t) { return Math.sin(t * 2.2) * 5; }
    function clamp01(x) { return Math.max(0, Math.min(1, x)); }
    function ease3(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
    function popBack(x) { x = clamp01(x); var c1 = 1.9; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    // a part whose particles also know a second drawing (used for the phone's back side)
    function part2(drawA, drawB, fn, weight) { var A = part(drawA, fn, weight); clear(); drawB(); A.alt = grab(); return A; }

    // ---------- Automation: code that writes itself, runs, and clears ----------
    function automation() {
      var C = 7, LINES = [[0, 150], [1, 196], [2, 128], [2, 214], [1, 96], [1, 170], [0, 66]];
      function yOf(i) { return 96 + i * 36; }
      function xOf(i) { return 72 + LINES[i][0] * 34; }
      function typed(t, i) {
        var tt = t % C;
        if (tt < 5.3) return ease3((tt - 0.2 - i * 0.44) / 0.4);
        return 1 - ease3((tt - 5.3 - (LINES.length - 1 - i) * 0.1) / 0.22);
      }
      var P2 = [part(function () { LINES.forEach(function (l, i) { dot(40, yOf(i), 4.5); }); }, null, 0.45)];
      LINES.forEach(function (l, i) {
        P2.push(part(function () { rr(xOf(i), yOf(i) - 8, l[1], 16, 8); o.fill(); }, function (t, x, y, out) {
          var r = typed(t, i), x0 = xOf(i); out[0] = x0 + (x - x0) * r; out[1] = y;
        }, 1));
      });
      // blinking caret at the end of the line being typed
      P2.push(part(function () { rr(205, 198, 10, 24, 3); o.fill(); }, function (t, x, y, out) {
        var tt = t % C, cur = 0;
        for (var i = 0; i < LINES.length; i++) if (typed(t, i) > 0) cur = i;
        var r = typed(t, cur), blink = (tt > 3.4 && tt < 5.3) ? (Math.floor(tt * 2.5) % 2 ? 0.15 : 1) : 1;
        out[0] = xOf(cur) + LINES[cur][1] * r + 10 + (x - 210); out[1] = yOf(cur) + (y - 210) * blink;
      }, 0.35));
      // a big check stamp when the script finishes
      P2.push(part(function () { o.lineWidth = 9; o.beginPath(); o.arc(330, 300, 42, 0, Math.PI * 2); o.stroke(); o.lineWidth = 11; o.beginPath(); o.moveTo(310, 301); o.lineTo(325, 316); o.lineTo(352, 286); o.stroke(); },
        function (t, x, y, out) {
          var tt = t % C, s = tt < 3.5 ? 0 : tt < 5.1 ? popBack((tt - 3.5) / 0.45) : 1 - ease3((tt - 5.1) / 0.25);
          out[0] = 330 + (x - 330) * s; out[1] = 300 + (y - 300) * s;
        }, 0.9));
      return makeShape(P2);
    }

    // ---------- Mobile Apps: icons land on a home screen, one is tapped, the app opens out of it ----------
    function phone() {
      var C = 6.8, TAP = 4, U0 = 160, US = 100;
      var G = [];
      for (var r = 0; r < 4; r++) for (var c = 0; c < 3; c++) G.push([140 + c * 52, 82 + r * 58, 36, 36]);
      // header, hero, three list rows (avatar + text), a button and a tab bar
      var UI = [[140, 72, 140, 14], [140, 98, 140, 70], [140, 182, 26, 26], [174, 186, 106, 18], [140, 220, 26, 26], [174, 224, 106, 18],
      [140, 258, 26, 26], [174, 262, 106, 18], [140, 298, 140, 22], [146, 336, 28, 18], [196, 336, 28, 18], [246, 336, 28, 18]];
      function scaleR(R, s) { var cx0 = R[0] + R[2] / 2, cy0 = R[1] + R[3] / 2; return [cx0 - R[2] * s / 2, cy0 - R[3] * s / 2, R[2] * s, R[3] * s]; }
      function lerpR(a, b, e) { return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, a[3] + (b[3] - a[3]) * e]; }
      function inApp(tt, k) {
        var u = UI[k], R = u.slice();
        if (k === 3 || k === 5 || k === 7) R[2] = u[2] * (0.28 + 0.72 * ease3((tt - 3.1 - (k - 3) * 0.2) / 0.45)); // skeleton rows load in
        if (k >= 9) R = scaleR(R, 1 + 0.35 * Math.sin(Math.PI * clamp01((tt - 4.1 - (k - 9) * 0.38) / 0.3))); // tabs get tapped in turn
        return R;
      }
      function rectAt(t, k) {
        var tt = t % C, g = G[k], T = G[TAP];
        if (tt < 2.1) {
          var s = popBack((tt - 0.1 - k * 0.09) / 0.4);
          if (k === TAP && tt > 1.75) s *= 1 - 0.2 * Math.sin(Math.PI * clamp01((tt - 1.75) / 0.3));
          return scaleR(g, s);
        }
        if (tt < 2.45) return lerpR(g, T, ease3((tt - 2.1) / 0.3));
        if (tt < 5.4) { var d = (UI[k][1] - 72) / 280 * 0.35; return lerpR(T, inApp(tt, k), ease3((tt - 2.45 - d) / 0.45)); }
        if (tt < 6.1) { var d2 = (1 - (UI[k][1] - 72) / 280) * 0.25; return lerpR(inApp(tt, k), T, ease3((tt - 5.4 - d2) / 0.42)); }
        return scaleR(T, 1 - ease3((tt - 6.1) / 0.35));
      }
      var P2 = [part(function () { o.lineWidth = 14; rr(124, 26, 172, 368, 32); o.stroke(); rr(184, 40, 52, 12, 6); o.fill(); line(184, 376, 236, 376, 5); }, null, 0.9)];
      G.forEach(function (g, k) {
        P2.push(part(function () { rr(U0, U0, US, US, 24); o.fill(); }, function (t, x, y, out) {
          var R = rectAt(t, k); out[0] = R[0] + (x - U0) / US * R[2]; out[1] = R[1] + (y - U0) / US * R[3];
        }, k === 1 ? 2.2 : (k === 3 || k === 5 || k === 7) ? 1.25 : k === 8 ? 1 : k === 0 ? 0.75 : 0.6));
      });
      // the tap ripple
      P2.push(part(function () { o.lineWidth = 5; o.beginPath(); o.arc(210, 210, 40, 0, Math.PI * 2); o.stroke(); }, function (t, x, y, out) {
        var tt = t % C, T = G[TAP], cx0 = T[0] + T[2] / 2, cy0 = T[1] + T[3] / 2;
        if (tt > 1.8 && tt < 2.3) { var e = ease3((tt - 1.8) / 0.5), s = 0.55 + 0.8 * e; out[0] = cx0 + (x - 210) * s; out[1] = cy0 + (y - 210) * s; return; }
        var R = rectAt(t, TAP); out[0] = R[0] + R[2] / 2 + (x - 210) * 0.12; out[1] = R[1] + R[3] / 2 + (y - 210) * 0.12;
      }, 0.5));
      return makeShape(P2);
    }

    // ---------- Integrations: three sources stream into a sync hub that fans out to two outputs ----------
    function api() {
      var HX = 210, HY = 210, U0 = 160, US = 100;
      var SRC = [120, 210, 300], OUT = [150, 270];
      var E = [
        [[100, 120], [140, 120], [140, 210], [176, 210]],
        [[100, 210], [130, 210], [150, 210], [176, 210]],
        [[100, 300], [140, 300], [140, 210], [176, 210]],
        [[244, 210], [282, 210], [282, 150], [320, 150]],
        [[244, 210], [282, 210], [282, 270], [320, 270]]
      ];
      function bez(e, u, out) {
        var a = 1 - u, p = E[e];
        out[0] = a * a * a * p[0][0] + 3 * a * a * u * p[1][0] + 3 * a * u * u * p[2][0] + u * u * u * p[3][0];
        out[1] = a * a * a * p[0][1] + 3 * a * a * u * p[1][1] + 3 * a * u * u * p[2][1] + u * u * u * p[3][1];
      }
      // [edge, duration, offset] like the little flow chart in the Work section
      var PK = [[0, 2.4, 0], [1, 2.4, 0.8], [2, 2.4, 1.6], [1, 2.4, 1.2], [3, 1.8, 0.3], [3, 1.8, 1.2], [4, 3.6, 0.9]];
      var P2 = [];
      // nodes: sources on the left, outputs on the right, each with a "label"
      P2.push(part(function () {
        o.lineWidth = 6;
        SRC.forEach(function (y) { rr(10, y - 20, 90, 40, 11); o.stroke(); rr(30, y - 4, 50, 8, 4); o.fill(); });
        OUT.forEach(function (y) { rr(320, y - 20, 90, 40, 11); o.stroke(); });
        // email envelope
        o.lineWidth = 4; rr(348, 258, 34, 24, 4); o.stroke(); o.beginPath(); o.moveTo(350, 261); o.lineTo(365, 272); o.lineTo(380, 261); o.stroke();
      }, null, 1.25));
      // the dashboard's bars bounce as data lands
      [0, 1, 2].forEach(function (k) {
        P2.push(part(function () { rr(U0, U0, US, US, 20); o.fill(); }, function (t, x, y, out) {
          var h = 8 + 16 * (0.5 + 0.5 * Math.sin(t * 2.6 + k * 1.9)), bx0 = 340 + k * 18, by0 = 162 - h;
          out[0] = bx0 + (x - U0) / US * 12; out[1] = by0 + (y - U0) / US * h;
        }, 0.45));
      });
      // hub ring and the sync arrows spinning inside it
      P2.push(part(function () { o.lineWidth = 8; o.beginPath(); o.arc(HX, HY, 34, 0, Math.PI * 2); o.stroke(); }, null, 1.3));
      P2.push(part(function () {
        o.lineWidth = 6;
        [0, Math.PI].forEach(function (a0) {
          o.beginPath(); o.arc(HX, HY, 17, a0 + 0.3, a0 + 2.5); o.stroke();
          var ex = HX + Math.cos(a0 + 2.5) * 17, ey = HY + Math.sin(a0 + 2.5) * 17;
          dot(ex, ey, 5.5);
        });
      }, function (t, x, y, out) { rot(x, y, HX, HY, t * 2.4, out); }, 2));
      // sonar pulse leaving the hub
      P2.push(part(function () { o.lineWidth = 4; o.beginPath(); o.arc(HX, HY, 34, 0, Math.PI * 2); o.stroke(); }, function (t, x, y, out) {
        var s = 1 + 0.75 * ((t * 0.8) % 1); out[0] = HX + (x - HX) * s; out[1] = HY + (y - HY) * s;
      }, 1.3));
      // dashed edges that march towards the hub and out of it
      P2.push(part(function () { dot(HX, HY, 6); }, function (t, x, y, out, i) {
        var e = i % 5, K = 8, sl = Math.floor(i / 5) % K, u = ((sl + t * 1.6) / K) % 1;
        bez(e, u, out); out[0] += (x - HX) * 0.15; out[1] += (y - HY) * 0.15;
      }, 22));
      // packets riding the edges
      P2.push(part(function () { dot(HX, HY, 6.5); }, function (t, x, y, out, i) {
        var p = PK[i % PK.length], u = ((t + p[2]) / p[1]) % 1;
        bez(p[0], u, out); out[0] += x - HX; out[1] += y - HY;
      }, 22));
      return makeShape(P2);
    }

    // ---------- Websites: one window, three breakpoints, the layout reflows ----------
    function browserShape() {
      // frame [x, y, w, h] and blocks [header, hero, card1, card2, card3] for desktop, tablet, mobile
      var L = [
        { f: [30, 80, 360, 260], b: [[46, 128, 328, 16], [46, 156, 328, 74], [46, 242, 101, 82], [159, 242, 102, 82], [273, 242, 101, 82]] },
        { f: [75, 62, 270, 296], b: [[91, 110, 238, 16], [91, 138, 238, 74], [91, 224, 113, 62], [216, 224, 113, 62], [91, 298, 238, 44]] },
        { f: [125, 44, 170, 332], b: [[141, 92, 138, 14], [141, 118, 138, 64], [141, 194, 138, 50], [141, 254, 138, 50], [141, 314, 138, 46]] }
      ];
      var HOLD = 1.8, MOVE = 0.75, C = 3 * (HOLD + MOVE);
      function lerpR(a, b, e) { return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e, a[3] + (b[3] - a[3]) * e]; }
      function layout(t) {
        var tt = t % C, k = Math.floor(tt / (HOLD + MOVE)), f = tt - k * (HOLD + MOVE), e = f < HOLD ? 0 : ease3((f - HOLD) / MOVE);
        var A = L[k], B = L[(k + 1) % 3];
        return { f: lerpR(A.f, B.f, e), b: A.b.map(function (r, n) { return lerpR(r, B.b[n], e); }) };
      }
      var U0 = 160, US = 100;
      function edge(side) {
        return part(function () { if (side === 0 || side === 1) line(U0, U0, U0 + US, U0, 7); else line(U0, U0, U0, U0 + US, 7); }, function (t, x, y, out) {
          var F = layout(t).f, u = (x - U0) / US, v = (y - U0) / US;
          if (side === 0) { out[0] = F[0] + u * F[2]; out[1] = F[1] + (y - U0); }
          else if (side === 1) { out[0] = F[0] + u * F[2]; out[1] = F[1] + F[3] + (y - U0); }
          else if (side === 2) { out[0] = F[0] + (x - U0); out[1] = F[1] + v * F[3]; }
          else { out[0] = F[0] + F[2] + (x - U0); out[1] = F[1] + v * F[3]; }
        }, side < 2 ? 1.5 : 1.25);
      }
      var parts4 = [edge(0), edge(1), edge(2), edge(3)];
      parts4.push(part(function () { line(U0, U0, U0 + US, U0, 5); }, function (t, x, y, out) { var F = layout(t).f; out[0] = F[0] + (x - U0) / US * F[2]; out[1] = F[1] + 34 + (y - U0); }, 0.9));
      [0, 1, 2].forEach(function (d) {
        parts4.push(part(function () { dot(U0, U0, 6); }, function (t, x, y, out) { var F = layout(t).f; out[0] = F[0] + 18 + d * 17 + (x - U0); out[1] = F[1] + 17 + (y - U0); }, 0.3));
      });
      [0, 1, 2, 3, 4].forEach(function (n) {
        parts4.push(part(function () { rr(U0, U0, US, US, 10); o.fill(); }, function (t, x, y, out) {
          var R = layout(t).b[n]; out[0] = R[0] + (x - U0) / US * R[2]; out[1] = R[1] + (y - U0) / US * R[3];
        }, n === 0 ? 0.3 : n === 1 ? 0.75 : 0.5));
      });
      return makeShape(parts4);
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
    function colors() { var c = getComputedStyle(root); col.fg = c.getPropertyValue("--fg").trim(); col.ac = c.getPropertyValue("--accent").trim(); col.bg = c.getPropertyValue("--bg").trim() || "#000"; }
    colors();
    cv.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      // moving over the sea leaves a wake of small rings
      var nt = performance.now();
      if (gForm < 1 && !reduce && nt - lastRip > 120) { lastRip = nt; ripples.push({ sx: mx, sy: my, t0: nt, a: 0.32 }); if (ripples.length > 16) ripples.shift(); }
    });
    cv.addEventListener("pointerleave", function () { mx = my = -9999; });
    var ripples = [], gForm = 0, lastRip = 0;
    cv.addEventListener("pointerdown", function (e) {
      var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      // on the sea, a click drops a stone: a big ring runs across the surface
      if (gForm < 1 && !reduce) { ripples.push({ sx: px, sy: py, t0: performance.now(), a: 1 }); return; }
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
      // the first stretch of scroll turns the tornado into the first shape; after that the scroll picks the shape
      var q = Math.max(0, (progress - PRE) / (1 - PRE));
      var idx = Math.min(shapes.length - 1, Math.floor(q * shapes.length));
      if (idx !== target) { prevStage = target < 0 ? idx : target; target = idx; switchAt = performance.now(); }
      if (idx !== shown) {
        var first = shown === -1;
        shown = idx; mcs.forEach(function (m, k) { m.classList.toggle("on", k === idx); });
        if (!first) glitch(mcs[idx].querySelector("h3"));
        mcI.textContent = String(idx + 1).padStart(2, "0");
      }
      mcBar.style.transform = "scaleX(" + progress + ")";
    }
    var target = -1, prevStage = 0, switchAt = -1e9, PRE = 0.14;
    addEventListener("scroll", readScroll, { passive: true }); readScroll();
    // the intro: a calm sea of dots seen in perspective. It breathes on its own,
    // a soft swell follows the cursor, moving leaves a wake, a click sends a ring across it
    var GX = Math.round(Math.sqrt(N * 3.1)), GY = Math.ceil(N / GX);
    P.forEach(function (p, i) {
      var row = Math.floor(i / GX);
      // alternate rows sit half a step apart, so the far water never lines up into stripes
      p.su = ((i % GX) + (row % 2 ? 0.5 : 0)) / GX * 2 - 1; p.sv = row / Math.max(1, GY - 1);
    });
    var capEl = sec.querySelector(".morph-cap"), lastCapO = -1;
    var fr = 0, asleep = true, lastVis = -1, uiBits = Array.prototype.slice.call(sec.querySelectorAll(".morph-hint"));
    var hint2 = sec.querySelector(".morph-hint span:last-child"), hintSea = null;
    var HOR = 0.26, CAMY = 0.7, rp = [], hillX = 0, hillZ = 3, hillA = 0;
    function toSea(sx, sy) {
      // screen point -> point on the sea (world x, depth z)
      var fv = H * 0.72, hz = H * HOR, dy = Math.max(6, sy - hz), z = Math.min(5.4, Math.max(1, CAMY * fv / dy));
      return [(sx - W / 2) / (W * 0.56) * z * 1.1, z];
    }
    function seaAt(p, time) {
      var z = 1 + (1 - p.sv) * 4.4, x = p.su * z * 1.1, fv = H * 0.72;
      var y = 0.06 * Math.sin(x * 2.1 + time * 0.8) + 0.05 * Math.sin(z * 2.6 - time * 1.15 + x * 0.6) + 0.02 * Math.sin((x - z) * 5.3 + time * 1.9);
      var hot = 0;
      for (var k = 0; k < rp.length; k++) {
        var r = rp[k], d = Math.hypot(x - r.x, (z - r.z) * 1.15), front = r.age * 1.35, e = d - front;
        if (e > 0.6 || e < -1.4) continue;
        var w = r.a * Math.exp(-r.age * 0.85) * Math.exp(-e * e * 9) * 0.16;
        y += w; hot += w;
      }
      if (hillA > 0.001) { var hd = (x - hillX) * (x - hillX) + (z - hillZ) * (z - hillZ) * 1.3; y += 0.1 * hillA * Math.exp(-hd * 2.4); }
      p.wx = W / 2 + p.su * W * 0.56;
      p.wy = H * HOR + (CAMY - y) * fv / z;
      var near = 1 - (z - 1) / 4.4, edge = 1 - Math.pow(Math.abs(p.su), 6);
      p.wd = Math.max(0, (0.16 + 0.84 * near * near) * edge * (1 + y * 3.5));
      p.hot = hot > 0.022;
    }
    function scatter() {
      var t0 = performance.now() / 1000;
      for (var i = 0; i < N; i++) { var p = P[i]; seaAt(p, t0); p.x = p.wx; p.y = p.wy; p.vx = p.vy = 0; }
    }
    scatter();
    (function loop(ts) {
      // stay hidden until the section is actually arriving; then the dots assemble as you scroll in
      var vis = 1;
      if (on && !reduce) {
        var rr = sec.getBoundingClientRect();
        vis = Math.max(0, Math.min(1, 1 - rr.top / (innerHeight * 0.75)));
        if (vis <= 0) { if (!asleep) { asleep = true; scatter(); } cx.clearRect(0, 0, W, H); }
        else asleep = false;
      }
      if (vis !== lastVis) { lastVis = vis; var vs = vis.toFixed(3); uiBits.forEach(function (el) { el.style.opacity = vs; }); }
      if (on && vis > 0) {
        if (++fr % 90 === 0) colors();
        var time = reduce ? 0 : ts / 1000, since = performance.now() - switchAt;
        var switching = !reduce && since < 260 && prevStage !== target;
        shapes[target].evalAll(time, TB);
        if (switching) shapes[prevStage].evalAll(time, TA);
        cx.clearRect(0, 0, W, H);
        cx.fillStyle = col.fg;
        var form = reduce ? 1 : Math.min(1, progress / PRE); gForm = form;
        var gal = form < 1, nowT = performance.now();
        if (hint2 && hintSea !== gal) { hintSea = gal; hint2.textContent = gal ? "move to make waves · click to splash" : "move to scatter · click to explode"; }
        if (gal) {
          // rings in sea coordinates, oldest dropped once they have faded
          rp.length = 0;
          for (var q = ripples.length - 1; q >= 0; q--) {
            var rr0 = ripples[q], age = (nowT - rr0.t0) / 1000;
            if (age > 4.5) { ripples.splice(q, 1); continue; }
            if (rr0.x === undefined) { var w0 = toSea(rr0.sx, rr0.sy); rr0.x = w0[0]; rr0.z = w0[1]; }
            rp.push({ x: rr0.x, z: rr0.z, age: age, a: rr0.a });
          }
          var hasM = mx > -9000 && my > H * HOR;
          hillA += ((hasM ? 1 : 0) - hillA) * 0.06;
          if (hasM) { var hw = toSea(mx, my); hillX += (hw[0] - hillX) * 0.12; hillZ += (hw[1] - hillZ) * 0.12; }
        }
        var hots = [];
        var capO = vis * Math.max(0, Math.min(1, (form - 0.7) / 0.3));
        if (Math.abs(capO - lastCapO) > 0.01 && capEl) { lastCapO = capO; capEl.style.opacity = capO.toFixed(3); }
        for (var i = 0; i < N; i++) {
          var p = P[i], T = switching && since < p.th * 260 ? TA : TB, tx = ox + T[2 * i] * scale, ty = oy + T[2 * i + 1] * scale, depth = 1;
          // still the sea? blend from the surface to the shape, each dot at its own moment
          var fi = form >= 1 ? 1 : ease(Math.max(0, Math.min(1, form * 1.45 - p.th * 0.45)));
          if (fi < 1) {
            // the sea holds until the scroll pulls each dot into the next figure
            seaAt(p, time);
            tx = p.wx + (tx - p.wx) * fi; ty = p.wy + (ty - p.wy) * fi; depth = p.wd + (1 - p.wd) * fi;
          }
          if (!reduce) { var wob = fi < 1 ? 1.4 * fi : 1.4; tx += Math.sin(time * 1.3 + p.ph) * wob; ty += Math.cos(time * 1.1 + p.ph) * wob; }
          var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (fi > 0.5 && d2 < 9000) { var d = Math.sqrt(d2) || 1, push = (1 - d / 95) * 3.2; p.vx += dx / d * push; p.vy += dy / d * push; }
          if (reduce) { p.x = tx; p.y = ty; }
          else {
            p.vx += (tx - p.x) * 0.13; p.vy += (ty - p.y) * 0.13;
            p.vx *= 0.72; p.vy *= 0.72; p.x += p.vx; p.y += p.vy;
          }
          var snap = fi > 0.6, gx2 = snap ? Math.round(p.x / 3) * 3 : p.x, gy2 = snap ? Math.round(p.y / 3) * 3 : p.y, sp = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
          if (depth <= 0.01) continue;
          var al = Math.min(1, (0.8 + 0.2 * (1 - sp)) * vis * depth), rad2 = (1.05 + sp * 0.45) * (0.55 + 0.45 * Math.min(1.3, depth));
          if (p.hot && fi < 0.5) { hots.push(gx2, gy2, al, rad2); continue; }
          cx.globalAlpha = al;
          cx.beginPath(); cx.arc(gx2, gy2, rad2, 0, 6.283); cx.fill();
        }
        // the crest of each ring catches the light in pink
        if (hots.length) {
          cx.fillStyle = col.ac;
          for (var hI = 0; hI < hots.length; hI += 4) { cx.globalAlpha = hots[hI + 2]; cx.beginPath(); cx.arc(hots[hI], hots[hI + 1], hots[hI + 3] * 1.15, 0, 6.283); cx.fill(); }
          cx.fillStyle = col.fg;
        }
        cx.globalAlpha = 1;
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

  /* ---------- Elsewhere: three big doors; the hovered one shows a preview that floats with the cursor ---------- */
  (function () {
    var peek = document.getElementById("ct-peek"), grid = document.getElementById("pk-grid");
    var rows = Array.prototype.slice.call(document.querySelectorAll(".ct-row"));
    if (!peek || !rows.length) return;
    // a GitHub-style contribution grid, the same every visit
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 7 * 24; i++) { var c = document.createElement("i"), r0 = rnd(), col = Math.floor(i / 7); c.dataset.l = r0 < 0.28 ? 0 : r0 < 0.55 ? 1 : r0 < 0.78 ? 2 : r0 < 0.93 ? 3 : 4; if (col > 18 && r0 > 0.3) c.dataset.l = Math.min(4, +c.dataset.l + 1); c.style.setProperty("--i", i); grid.appendChild(c); }
    // each name rolls letter by letter
    rows.forEach(function (a) {
      var nm = a.querySelector(".ct-name"), t = nm.dataset.t; nm.textContent = ""; nm.setAttribute("aria-label", t);
      Array.from(t).forEach(function (ch, k) {
        var s = document.createElement("span"); s.className = "ct-ch"; s.style.setProperty("--k", k); s.setAttribute("aria-hidden", "true");
        s.innerHTML = "<span>" + ch + "</span><span>" + ch + "</span>"; nm.appendChild(s);
      });
    });
    if (!fine) return;
    var tx = 0, ty = 0, x = 0, y = 0, vx = 0, shown = false, raf = 0;
    function loop() {
      var px = x; x += (tx - x) * 0.16; y += (ty - y) * 0.16; vx += ((x - px) - vx) * 0.3;
      peek.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) rotate(" + Math.max(-12, Math.min(12, vx * 0.9)).toFixed(2) + "deg)";
      raf = shown || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
    }
    rows.forEach(function (a) {
      a.addEventListener("pointerenter", function (e) {
        if (!shown) { x = tx = e.clientX; y = ty = e.clientY; }
        shown = true; peek.dataset.k = a.dataset.k; peek.classList.add("on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      a.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
      a.addEventListener("pointerleave", function () { shown = false; peek.classList.remove("on"); });
    });
    addEventListener("scroll", function () { if (shown) { shown = false; peek.classList.remove("on"); } }, { passive: true });
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
  (function loopGiant() {
    setTimeout(function () {
      var r = giantEl.getBoundingClientRect(), cur = document.getElementById("curtain");
      if (!document.hidden && r.top < innerHeight && parseFloat(cur.style.opacity || "0") > 0.8) glitch(giantEl);
      loopGiant();
    }, 3000 + Math.random() * 3500);
  })();

  /* ---------- Certificates: a 3D gallery (three.js). Scroll walks the corridor, the lights come on, each certificate hangs framed ---------- */
  (function () {
    var sec = document.getElementById("certificates"), cv = document.getElementById("gl-cv");
    if (!sec || !cv) return;
    var sticky = sec.querySelector(".gl-sticky"), head = sec.querySelector(".gl-head"), foot = sec.querySelector(".gl-foot"), cap = document.getElementById("gl-cap"), countEl = document.getElementById("gl-count");
    var box = document.getElementById("gl-box"), boxImg = document.getElementById("gl-img"), boxCap = document.getElementById("gl-boxcap"), closeBtn = document.getElementById("gl-close");
    var srBtns = Array.prototype.slice.call(sec.querySelectorAll(".bs-real"));
    var N = srBtns.length, nSeg = N + 1;
    if (!N) return;
    var HOLD_VH = 90; // you arrive and stand still for a moment before the walk starts
    sec.style.height = (nSeg * 105 + HOLD_VH + 100) + "vh";
    var HOLD = HOLD_VH / (nSeg * 105 + HOLD_VH);
    var infos = srBtns.map(function (btn, i) { return { i: i, img: btn.dataset.img, title: btn.dataset.title, issuer: btn.dataset.issuer, date: btn.dataset.date, btn: btn, ar: 1.414 }; });
    var started = false;
    function go() {
      if (started) return; started = true;
      var left = N;
      function one() { if (--left === 0) loadThree().then(build).catch(function () { cv.style.display = "none"; }); }
      infos.forEach(function (f) { var im = new Image(); im.onload = function () { f.ar = im.naturalWidth / im.naturalHeight; f.el = im; one(); }; im.onerror = one; im.src = f.img; });
    }
    if ("IntersectionObserver" in window) {
      var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { near.disconnect(); go(); } }, { rootMargin: "150% 0px" });
      near.observe(sec);
    } else go();
    function cl(x) { return Math.max(0, Math.min(1, x)); }
    function ease(x) { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function lerp(a, b, k) { return a + (b - a) * k; }
    function pad(n) { return String(n).padStart(2, "0"); }

    function build(mod) {
      var THREE = mod.THREE, renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { cv.style.display = "none"; return; }
      renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
      var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(50, 1, 0.05, 80);
      camera.rotation.order = "YXZ";
      var fog = new THREE.Fog(0x000000, 5, 24); scene.fog = fog;
      var hemi = new THREE.HemisphereLight(0xffffff, 0x222226, 0.2); scene.add(hemi);
      function dark() { return (root.getAttribute("data-theme") || "dark") === "dark"; }
      function canvasTex(w, h, draw) {
        var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
      }
      var MONO = (getComputedStyle(root).getPropertyValue("--mono") || "monospace").trim(), SANS = (getComputedStyle(root).getPropertyValue("--sans") || "sans-serif").trim();
      var EY = 1.6, GZ = 7, Z0 = -6, WH = 4.2, zEnd = Z0 - (N - 1) * GZ - GZ, LEN = 8 - zEnd, zMid = (8 + zEnd) / 2;

      // ---- the room
      var wallM = new THREE.MeshStandardMaterial({ roughness: 0.92 }), floorM = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.25 }), ceilM = new THREE.MeshStandardMaterial({ roughness: 1 });
      var accM = new THREE.MeshBasicMaterial({ color: 0xf7a8a9 });
      var wallL = new THREE.Mesh(new THREE.BoxGeometry(0.1, WH, LEN), wallM), wallR = wallL.clone(); scene.add(wallL); scene.add(wallR);
      var floor = new THREE.Mesh(new THREE.PlaneGeometry(1, LEN), floorM); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zMid); scene.add(floor);
      var ceil = new THREE.Mesh(new THREE.PlaneGeometry(1, LEN), ceilM); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, WH, zMid); scene.add(ceil);
      var endWall = new THREE.Mesh(new THREE.BoxGeometry(1, WH, 0.1), wallM); endWall.position.set(0, WH / 2, zEnd); scene.add(endWall);
      var stripL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.025, LEN), accM), stripR = stripL.clone(); scene.add(stripL); scene.add(stripR);
      var endTex = canvasTex(1024, 512, function (g, w, h) {
        g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
        g.font = "600 150px " + SANS; g.fillText("More soon.", w / 2, h * 0.42);
        g.globalAlpha = 0.6; g.font = "400 32px " + MONO; g.fillText("// this wall is reserved for what I learn next", w / 2, h * 0.72);
      });
      var endText = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshBasicMaterial({ map: endTex, transparent: true, fog: true })); endText.position.set(0, EY + 0.05, zEnd + 0.06); scene.add(endText);
      var endLight = new THREE.PointLight(0xf7a8a9, 0, 9, 1.6); endLight.position.set(0, 2.6, zEnd + 2.2); scene.add(endLight);

      // ---- frames
      var glowTex = canvasTex(128, 128, function (g, w, h) { var r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, "rgba(255,255,255,.9)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
      var frameM = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.35, metalness: 0.6 }), matM = new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.95 });
      var fixM = new THREE.MeshStandardMaterial({ color: 0x1c1c1f, roughness: 0.4, metalness: 0.8 });
      var pickables = [], frames = [];
      infos.forEach(function (f, i) {
        var side = i % 2 ? 1 : -1, grp = new THREE.Group(), MG = 0.13;
        var tex = new THREE.Texture(f.el || document.createElement("canvas")); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
        var certM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
        var outer = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.07), frameM), mat = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.012), matM), cert = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), certM);
        mat.position.z = 0.04; cert.position.z = 0.048; grp.add(outer); grp.add(mat); grp.add(cert);
        var plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.3), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(880, 240, function (g, w, h) {
          g.fillStyle = "#fff"; g.textBaseline = "middle";
          g.globalAlpha = 0.55; g.font = "500 30px " + MONO; g.fillText(pad(i + 1) + " / " + pad(N) + "  ·  " + f.date.toUpperCase(), 0, 34);
          g.globalAlpha = 1; var fs = 52; g.font = "600 " + fs + "px " + SANS; while (g.measureText(f.title).width > w - 4 && fs > 26) { fs -= 2; g.font = "600 " + fs + "px " + SANS; }
          g.fillText(f.title, 0, 110); g.globalAlpha = 0.6; g.font = "400 34px " + SANS; g.fillText(f.issuer, 0, 186);
        }) }));
        grp.add(plaque);
        grp.rotation.y = -side * Math.PI / 2; scene.add(grp);
        var spot = new THREE.SpotLight(0xfff4e6, 0, 10, 0.66, 0.9, 1.3), tgt = new THREE.Object3D(); scene.add(spot); scene.add(tgt); spot.target = tgt;
        var fix = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 20), fixM); scene.add(fix);
        var bulb = new THREE.Mesh(new THREE.CircleGeometry(0.06, 20), new THREE.MeshBasicMaterial({ color: 0x000000 })); scene.add(bulb);
        var pool = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; scene.add(pool);
        var fr = { f: f, i: i, side: side, grp: grp, outer: outer, mat: mat, cert: cert, certM: certM, plaque: plaque, spot: spot, tgt: tgt, fix: fix, bulb: bulb, pool: pool, MG: MG, z: Z0 - i * GZ, lit: 0, hov: 0 };
        cert.userData.fr = fr; mat.userData.fr = fr; pickables.push(cert, mat); frames.push(fr);
      });
      // dust in the light
      var DN = 420, dpos = new Float32Array(DN * 3), dseed = [];
      for (var d = 0; d < DN; d++) dseed.push([Math.random(), Math.random(), Math.random(), Math.random() * 6.28]);
      var dustG = new THREE.BufferGeometry(); dustG.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
      var dustTex = canvasTex(64, 64, function (g, w, h) { var r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
      var dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: 0xffffff, size: 0.032, map: dustTex, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(dust);

      function themeColors() {
        var dk = dark(), bg = (getComputedStyle(root).getPropertyValue("--bg") || (dk ? "#000" : "#fff")).trim();
        try { fog.color.set(bg); } catch (e) { fog.color.set(dk ? 0x000000 : 0xffffff); }
        wallM.color.set(dk ? 0x2a2a2f : 0xf0f0f2); floorM.color.set(dk ? 0x141417 : 0xd4d4d9); ceilM.color.set(dk ? 0x0a0a0b : 0xe6e6ea);
        hemi.intensity = dk ? 0.75 : 1.6; hemi.groundColor.set(dk ? 0x222226 : 0xd9d9de); accM.color.set(dk ? 0xf7a8a9 : 0xea7479);
        endText.material.color.set(dk ? 0xffffff : 0x111111); dust.material.color.set(dk ? 0xffffff : 0x666666);
        frames.forEach(function (fr) { fr.plaque.material.color.set(dk ? 0xffffff : 0x111111); });
      }
      themeColors(); themeBtn.addEventListener("click", function () { setTimeout(themeColors, 80); });

      // ---- layout: corridor width and the camera stops depend on the viewport
      var W = 0, H = 0, HX = 2.4, K = [];
      function size() {
        W = sticky.clientWidth; H = sticky.clientHeight;
        renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W, H, false);
        camera.aspect = W / H; camera.fov = camera.aspect < 0.8 ? 62 : 50; camera.updateProjectionMatrix();
        var tn = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), port = camera.aspect < 0.8, maxD = 0;
        frames.forEach(function (fr) {
          var ar = fr.f.ar, w, h;
          if (ar >= 1) { w = port ? 1.55 : 2.3; h = w / ar; } else { h = port ? 1.9 : 2.05; w = h * ar; }
          fr.w = w; fr.h = h;
          var ow = w + fr.MG * 2 + 0.1, oh = h + fr.MG * 2 + 0.1;
          fr.outer.scale.set(ow, oh, 1); fr.mat.scale.set(w + fr.MG * 2, h + fr.MG * 2, 1); fr.cert.scale.set(w, h, 1);
          var pw = Math.min(1.1, ow); fr.plaque.scale.set(pw / 1.1, pw / 1.1, 1); fr.plaque.position.set(-ow / 2 + pw / 2, -oh / 2 - 0.1 - 0.15 * pw / 1.1, 0.02);
          fr.th = oh + 0.5; // frame + plaque
          fr.dist = Math.max(ow / (2 * tn * camera.aspect), fr.th / (2 * tn)) * (port ? 1.16 : 1.55);
          maxD = Math.max(maxD, fr.dist);
        });
        HX = Math.max(2.4, (maxD + 0.9) / 2);
        wallL.position.set(-HX - 0.05, WH / 2, zMid); wallR.position.set(HX + 0.05, WH / 2, zMid);
        floor.scale.x = ceil.scale.x = endWall.scale.x = HX * 2 + 0.2;
        stripL.position.set(-HX + 0.01, 0.02, zMid); stripR.position.set(HX - 0.01, 0.02, zMid);
        K = [{ x: 0, y: EY, z: 4.5, yaw: 0, pitch: 0 }];
        frames.forEach(function (fr) {
          var s = fr.side, fx = s * (HX - 0.04), cy = EY + 0.05;
          fr.grp.position.set(fx, cy, fr.z);
          fr.spot.position.set(s * (HX - 1.5), WH - 0.25, fr.z + 0.25); fr.tgt.position.set(fx, cy - 0.1, fr.z);
          fr.fix.position.set(s * (HX - 1.5), WH - 0.11, fr.z + 0.25); fr.bulb.position.set(s * (HX - 1.5), WH - 0.225, fr.z + 0.25); fr.bulb.rotation.x = Math.PI / 2;
          fr.pool.position.set(s * (HX - 0.9), 0.012, fr.z); fr.pool.scale.set(2.6, 3.4, 1);
          var px = fx - s * fr.dist, pz = fr.z + 0.45, ly = cy + (camera.aspect < 0.8 ? -0.12 : 0.16), dx = fx - px, dz = fr.z - pz;
          K.push({ x: px, y: EY, z: pz, yaw: Math.atan2(dx, -dz), pitch: Math.atan2(ly - EY, Math.hypot(dx, dz)) });
        });
        var dE = Math.max(3.2 / (2 * tn * camera.aspect), 1.9 / (2 * tn)) * 1.5;
        K.push({ x: 0, y: EY, z: zEnd + Math.min(dE, GZ - 0.5), yaw: 0, pitch: 0 });
      }
      size(); onRealResize(size);

      // ---- interaction: hover, click to enlarge
      var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hover = null, mx = 0, my = 0, tmx = 0, tmy = 0, on = false, S = 0, openI = -1, tmp = new THREE.Vector3(), lastCap = "", openY = 0;
      function pick(e) {
        var r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera); var hit = ray.intersectObjects(pickables, false)[0];
        return hit && hit.distance < 9 ? hit.object.userData.fr : null;
      }
      cv.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - 0.5; tmy = (e.clientY - r.top) / r.height - 0.5;
        if (e.pointerType !== "mouse") return;
        hover = pick(e); cv.style.cursor = hover ? "zoom-in" : "";
      });
      cv.addEventListener("pointerleave", function () { hover = null; tmx = tmy = 0; });
      cv.addEventListener("click", function (e) { var fr = pick(e); if (fr) openBox(fr.i); });
      srBtns.forEach(function (btn, i) { btn.addEventListener("click", function () { openBox(i); }); });
      function stopY(i) { var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight; return top + span * (HOLD + (1 - HOLD) * (i + 1) / nSeg); }
      function rectOf(fr) {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].forEach(function (c) {
          tmp.set(c[0], c[1], 0); fr.cert.localToWorld(tmp); tmp.project(camera);
          var x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        });
        return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      }
      function fromT(fr, F) { var I = rectOf(fr); return "translate(" + ((I.x + I.w / 2) - (F.x + F.w / 2)).toFixed(1) + "px," + ((I.y + I.h / 2) - (F.y + F.h / 2)).toFixed(1) + "px) scale(" + (I.w / F.w).toFixed(4) + "," + (I.h / F.h).toFixed(4) + ")"; }
      var F = null;
      function openBox(i) {
        if (openI >= 0) return;
        var y = stopY(i);
        if (Math.abs(scrollY - y) > 30) {
          scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
          var t0 = performance.now(); (function wait() { if (Math.abs(S - (i + 1)) < 0.03 || performance.now() - t0 > 1800) show(i); else requestAnimationFrame(wait); })();
        } else show(i);
      }
      function show(i) {
        if (openI >= 0) return;
        var fr = frames[i], f = fr.f, top = 96, bot = 92, aw = W * 0.92, ah = Math.max(120, H - top - bot), w = aw, h = w / f.ar;
        if (h > ah) { h = ah; w = h * f.ar; }
        F = { x: (W - w) / 2, y: top + (ah - h) / 2, w: w, h: h };
        openI = i; openY = scrollY;
        boxImg.src = f.img; boxImg.alt = f.title + ", " + f.issuer + ", " + f.date;
        boxImg.style.left = F.x + "px"; boxImg.style.top = F.y + "px"; boxImg.style.width = F.w + "px"; boxImg.style.height = F.h + "px";
        boxImg.style.transition = "none"; boxImg.style.transform = fromT(fr, F);
        boxCap.textContent = "// " + f.title.toLowerCase() + " · " + f.issuer.toLowerCase() + " · " + f.date.toLowerCase();
        box.hidden = false; void box.offsetWidth; boxImg.style.transition = ""; box.classList.add("on"); boxImg.style.transform = "none";
        closeBtn.tabIndex = 0; closeBtn.focus({ preventScroll: true });
      }
      function hide() {
        if (openI < 0) return;
        var fr = frames[openI]; openI = -1;
        boxImg.style.transform = fromT(fr, F); box.classList.remove("on"); closeBtn.tabIndex = -1;
        setTimeout(function () { if (openI < 0) box.hidden = true; }, 520);
        if (document.activeElement === closeBtn) fr.f.btn.focus({ preventScroll: true });
      }
      box.addEventListener("click", hide);
      addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
      addEventListener("scroll", function () { if (openI >= 0 && Math.abs(scrollY - openY) > 60) hide(); }, { passive: true });
      function setCap(s) { if (s === lastCap) return; lastCap = s; cap.textContent = s; cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap"); }

      function frame(ts) {
        var t = ts / 1000, r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight), p = cl((cl(-r.top / span) - HOLD) / (1 - HOLD));
        S = p * nSeg;
        var seg = Math.min(nSeg - 1, Math.floor(S)), q = S - seg, e = ease(q / 0.72), a = K[seg], b = K[seg + 1];
        mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
        var walk = Math.sin(e * Math.PI), bob = reduce ? 0 : Math.sin(S * 26) * 0.018 * walk;
        camera.position.set(lerp(a.x, b.x, e), lerp(a.y, b.y, e) + bob, lerp(a.z, b.z, e));
        camera.rotation.set(lerp(a.pitch, b.pitch, e) - my * 0.07, -(lerp(a.yaw, b.yaw, e) + mx * 0.12), 0);
        // the lights come on as you get there
        frames.forEach(function (fr) {
          var lv = cl((S - fr.i - 0.06) / 0.3), fl = lv > 0 && lv < 1 && !reduce ? (Math.sin(t * 43 + fr.i) > -0.2 ? 1 : 0.25) : 1, L = ease(lv) * fl;
          fr.lit = L; fr.spot.intensity = L * (dark() ? 62 : 30);
          fr.certM.color.setScalar(0.05 + 0.95 * L); fr.bulb.material.color.setScalar(L);
          fr.pool.material.opacity = L * (dark() ? 0.1 : 0.0);
          fr.hov += ((fr === hover ? 1 : 0) - fr.hov) * 0.15;
          var sc = 1 + fr.hov * 0.025; fr.grp.scale.set(sc, sc, 1);
        });
        var le = ease((S - N - 0.05) / 0.4); endLight.intensity = le * (dark() ? 9 : 4); endText.material.opacity = 0.05 + 0.95 * le;
        // dust drifting through the corridor, around the camera
        for (var i = 0; i < DN; i++) {
          var sd = dseed[i];
          dpos[i * 3] = (sd[0] - 0.5) * 2 * (HX - 0.2) + Math.sin(t * 0.35 + sd[3]) * 0.22;
          dpos[i * 3 + 1] = ((sd[1] * WH + t * 0.07 * (0.4 + sd[2])) % WH) + Math.sin(t * 0.6 + sd[3] * 2) * 0.05;
          dpos[i * 3 + 2] = camera.position.z - 0.8 - ((sd[2] * 14 + (4.5 - camera.position.z)) % 14);
        }
        dustG.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
        // HUD
        var hv = 1 - cl((S - 0.05) / 0.25);
        head.style.opacity = hv.toFixed(3); head.style.transform = "translate3d(0," + (-30 * (1 - hv)).toFixed(1) + "px,0)";
        var at = Math.round(S), close = Math.abs(S - at) < 0.3 || (q > 0.6);
        var idx = q > 0.6 ? seg : (q < 0.08 ? seg - 1 : -2);
        if (idx >= 0 && idx < N) { setCap("// " + frames[idx].f.issuer.toLowerCase() + " · " + frames[idx].f.date.toLowerCase() + " — click to enlarge"); countEl.textContent = pad(idx + 1) + " / " + pad(N); }
        else if (S < 0.08) { setCap("// scroll to walk in"); countEl.textContent = pad(0) + " / " + pad(N); }
        else if (seg >= N && q > 0.5) { setCap("// to be continued"); countEl.textContent = pad(N) + " / " + pad(N); }
        else setCap("// keep walking");
      }
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; if (!on) hide(); }, { rootMargin: "60px 0px" }).observe(sec); else on = true;
      cv.__snap = function () { frame(performance.now()); return cv; };
      sec.dispatchEvent(new Event("snap-ready"));
      (function loop(ts) { if (on) frame(ts || performance.now()); requestAnimationFrame(loop); })();
    }
  })();

  /* ---------- Mobile: a real 3D phone (three.js). It spins in, tips back into an exploded view of its widget tree,
     the layers of an analytics app drop in one by one, then everything snaps flat and the phone turns once ---------- */
  (function () {
    var sec = document.getElementById("mobile"), cv = document.getElementById("mb-gl");
    if (!sec || !cv) return;
    var sticky = sec.querySelector(".mb-sticky"), head = sec.querySelector(".mb-head"), cap = sec.querySelector(".mb-cap"), navEl = document.querySelector(".nav");
    var started = false;
    function go() { if (started) return; started = true; loadThree().then(build).catch(function () { cv.style.display = "none"; }); }
    if ("IntersectionObserver" in window) {
      var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { near.disconnect(); go(); } }, { rootMargin: "120% 0px" });
      near.observe(sec);
    } else go();
    function cl(x) { return Math.max(0, Math.min(1, x)); }
    function ease(x) { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function eo(x) { x = cl(x); return 1 - Math.pow(1 - x, 3); }
    function back(x) { x = cl(x); var c1 = 1.4; return 1 + (c1 + 1) * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
    function lerp(a, b, k) { return a + (b - a) * k; }

    function build(mod) {
      var THREE = mod.THREE, RoomEnvironment = mod.RoomEnvironment, renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { cv.style.display = "none"; return; }
      renderer.setClearColor(0, 0); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      var scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
      var pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(2.5, 4, 5); scene.add(key);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x222226, 0.6));
      var rim = new THREE.DirectionalLight(0xf7a8a9, 1.1); rim.position.set(-4, 1.5, -3); scene.add(rim);
      var css = getComputedStyle(root), SANS = (css.getPropertyValue("--sans") || "sans-serif").trim(), MONO = (css.getPropertyValue("--mono") || "monospace").trim();
      var AC = "#f7a8a9";
      function readAc() { AC = (getComputedStyle(root).getPropertyValue("--accent") || "#f7a8a9").trim() || "#f7a8a9"; }
      readAc();

      // ---- geometry helpers
      function rrShape(w, h, r) {
        var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
        s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
        s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
      }
      function rrGeo(w, h, r) {
        // a rounded plane whose UVs run 0..1 across it, so a texture fills it exactly
        var g = new THREE.ShapeGeometry(rrShape(w, h, r), 18), pos = g.attributes.position, uv = g.attributes.uv;
        for (var i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
        return g;
      }
      function tex(c) { var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

      // ---- the phone
      var phone = new THREE.Group(), body = new THREE.Group(); phone.add(body); scene.add(phone);
      var PW = 1.0, PH = 2.1, PD = 0.09, PR = 0.17;
      var frameM = new THREE.MeshStandardMaterial({ color: 0x8a8c93, metalness: 0.95, roughness: 0.22 });
      var backM = new THREE.MeshStandardMaterial({ color: 0x2a2b30, metalness: 0.45, roughness: 0.3 });
      var bodyG = new THREE.ExtrudeGeometry(rrShape(PW, PH, PR), { depth: PD, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 5, curveSegments: 22 });
      bodyG.translate(0, 0, -PD / 2); body.add(new THREE.Mesh(bodyG, frameM));
      var glass = new THREE.Mesh(rrGeo(PW - 0.02, PH - 0.02, PR - 0.01), new THREE.MeshStandardMaterial({ color: 0x050506, metalness: 0.3, roughness: 0.08 }));
      glass.position.z = PD / 2 + 0.0165; body.add(glass);
      var backP = new THREE.Mesh(rrGeo(PW - 0.02, PH - 0.02, PR - 0.01), backM); backP.rotation.y = Math.PI; backP.position.z = -PD / 2 - 0.0165; body.add(backP);
      var bump = new THREE.Mesh(new THREE.ExtrudeGeometry(rrShape(0.42, 0.42, 0.11), { depth: 0.028, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 }), frameM);
      bump.position.set(0.24, 0.78, -PD / 2 - 0.016); bump.rotation.y = Math.PI; body.add(bump);
      var lensM = new THREE.MeshStandardMaterial({ color: 0x07070a, metalness: 0.7, roughness: 0.08 }), ringM = new THREE.MeshStandardMaterial({ color: 0xa2a4aa, metalness: 1, roughness: 0.18 });
      [[0.15, 0.87], [0.33, 0.69], [0.15, 0.69]].forEach(function (q) {
        var rg = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.072, 0.03, 36), ringM); rg.rotation.x = Math.PI / 2; rg.position.set(q[0], q[1], -PD / 2 - 0.058); body.add(rg);
        var ln = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.032, 36), lensM); ln.rotation.x = Math.PI / 2; ln.position.set(q[0], q[1], -PD / 2 - 0.06); body.add(ln);
      });
      var logoC = document.createElement("canvas"); logoC.width = 256; logoC.height = 128;
      var lg = logoC.getContext("2d"); lg.fillStyle = "rgba(255,255,255,.6)"; lg.font = "500 80px " + MONO; lg.textAlign = "center"; lg.textBaseline = "middle"; lg.fillText("gn_", 128, 64);
      var logo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshBasicMaterial({ map: tex(logoC), transparent: true })); logo.rotation.y = Math.PI; logo.position.set(0, 0, -PD / 2 - 0.018); body.add(logo);
      [[PW / 2 + 0.012, 0.45, 0.28], [-PW / 2 - 0.012, 0.56, 0.15], [-PW / 2 - 0.012, 0.32, 0.15]].forEach(function (q) {
        var b = new THREE.Mesh(new THREE.BoxGeometry(0.022, q[2], 0.045), frameM); b.position.set(q[0], q[1], 0); body.add(b);
      });

      // ---- the screen: a dark base with the island, and the app's widgets as separate layers above it
      var DW = PW - 0.075, DH = PH - 0.075, SZ = PD / 2 + 0.018, UX = 300, UY = 640, K = 3; // design units -> canvas pixels
      var baseC = document.createElement("canvas"); baseC.width = UX * K; baseC.height = UY * K;
      (function () {
        var g = baseC.getContext("2d"); g.scale(K, K);
        var gr = g.createLinearGradient(0, 0, 0, UY); gr.addColorStop(0, "#111114"); gr.addColorStop(1, "#0a0a0c"); g.fillStyle = gr; g.fillRect(0, 0, UX, UY);
        g.fillStyle = "#000"; rr(g, UX / 2 - 46, 12, 92, 26, 13); g.fill();
      })();
      var screenM = new THREE.MeshBasicMaterial({ map: tex(baseC), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
      var screen = new THREE.Mesh(rrGeo(DW, DH, PR - 0.045), screenM); screen.position.z = SZ; screen.renderOrder = 1; body.add(screen);
      function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

      // smooth chart data
      var DATA = [32, 44, 38, 56, 49, 71, 64, 82, 76, 94], CPTS = [];
      (function () {
        var w = 268, h = 76, pts = DATA.map(function (v, i) { return [i * w / (DATA.length - 1), h - v / 100 * h]; });
        for (var i = 0; i < pts.length - 1; i++) {
          var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
          for (var s = 0; s < 16; s++) {
            var t = s / 16, t2 = t * t, t3 = t2 * t;
            CPTS.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
              0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
          }
        }
        CPTS.push(pts[pts.length - 1]);
      })();
      function txt(g, s, x, y, font, color, align) { g.font = font; g.fillStyle = color; g.textAlign = align || "left"; g.textBaseline = "alphabetic"; g.fillText(s, x, y); }
      var MUTED = "#8b8b90", FG = "#f2f2f2", CARD = "#17171a";
      // each layer: name, rect in design units [x, y, w, h], draw(g, state)
      var LAYERS = [
        ["StatusBar", [16, 12, 268, 26], function (g) {
          txt(g, "9:41", 6, 19, "600 14px " + SANS, FG);
          g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 1.2; rr(g, 236, 7, 24, 12, 3.5); g.stroke(); g.fillStyle = FG; rr(g, 238.5, 9.5, 16, 7, 2); g.fill(); g.fillRect(261.5, 10.5, 2, 5);
        }],
        ["AppBar", [16, 50, 268, 42], function (g) {
          g.fillStyle = AC; g.beginPath(); g.arc(20, 21, 19, 0, 6.283); g.fill();
          txt(g, "gn", 20, 26, "600 13px " + MONO, "#111", "center");
          txt(g, "Last 7 days", 50, 16, "400 11.5px " + SANS, MUTED); txt(g, "Analytics", 50, 35, "600 19px " + SANS, FG);
          g.fillStyle = "rgba(255,255,255,.07)"; rr(g, 196, 9, 72, 24, 12); g.fill();
          g.fillStyle = AC; g.beginPath(); g.arc(210, 21, 3.6, 0, 6.283); g.fill(); txt(g, "3 live", 220, 25.5, "500 11.5px " + MONO, "#d8d8dc");
        }],
        ["Metric", [16, 104, 268, 76], function (g, st) {
          txt(g, "Total visitors", 0, 14, "400 12px " + SANS, MUTED);
          txt(g, st.count, -1, 52, "600 38px " + SANS, FG);
          txt(g, "▲ 18.2%", 0, 70, "500 11px " + MONO, AC); txt(g, "vs last week", 58, 70, "400 11px " + MONO, "#6f6f75");
        }],
        ["LineChart", [16, 190, 268, 104], function (g, st) {
          g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 1; [8, 34, 60].forEach(function (y) { g.beginPath(); g.moveTo(0, y); g.lineTo(268, y); g.stroke(); });
          var n = Math.max(2, Math.round(CPTS.length * st.line)), pts = CPTS.slice(0, n);
          if (st.line > 0.001) {
            // the gradient area follows the line
            var ag = g.createLinearGradient(0, 0, 0, 80); ag.addColorStop(0, hexA(AC, 0.5)); ag.addColorStop(1, hexA(AC, 0));
            g.beginPath(); g.moveTo(pts[0][0], 80); pts.forEach(function (p) { g.lineTo(p[0], p[1] + 4); }); g.lineTo(pts[pts.length - 1][0], 80); g.closePath(); g.fillStyle = ag; g.fill();
            g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1] + 4); else g.moveTo(p[0], p[1] + 4); });
            g.strokeStyle = AC; g.lineWidth = 2.4; g.lineCap = "round"; g.lineJoin = "round"; g.shadowColor = hexA(AC, 0.6); g.shadowBlur = 8; g.stroke(); g.shadowBlur = 0;
            var e = pts[pts.length - 1];
            if (st.live > 0) { var ph = (st.t % 1.8) / 1.8; g.strokeStyle = hexA(AC, (1 - ph) * 0.8 * st.live); g.lineWidth = 1.5; g.beginPath(); g.arc(e[0], e[1] + 4, 4 + ph * 11, 0, 6.283); g.stroke(); }
            g.fillStyle = AC; g.beginPath(); g.arc(e[0], e[1] + 4, 4, 0, 6.283); g.fill(); g.strokeStyle = "#0d0d0f"; g.lineWidth = 2; g.stroke();
          }
          ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(function (d, i) { txt(g, d, i * 268 / 6, 100, "400 9.5px " + MONO, "#6f6f75", i === 0 ? "left" : i === 6 ? "right" : "center"); });
        }],
        ["StatGrid", [16, 306, 268, 134], function (g, st) {
          [["Page views", "38 920", 0.78], ["Bounce rate", "32%", 0.32], ["Avg. visit", "2m 48s", 0.56], ["Returning", "41%", 0.41]].forEach(function (c, i) {
            var x = (i % 2) * 138, y = Math.floor(i / 2) * 70, w = 130, h = 62;
            g.fillStyle = CARD; rr(g, x, y, w, h, 12); g.fill(); g.strokeStyle = "rgba(255,255,255,.06)"; g.lineWidth = 1; g.stroke();
            txt(g, c[0], x + 11, y + 18, "400 10.5px " + SANS, MUTED); txt(g, c[1], x + 11, y + 40, "600 17px " + SANS, FG);
            g.fillStyle = "rgba(255,255,255,.08)"; rr(g, x + 11, y + 49, w - 22, 4, 2); g.fill();
            g.fillStyle = AC; rr(g, x + 11, y + 49, Math.max(4, (w - 22) * c[2] * st.bars), 4, 2); g.fill();
          });
        }],
        ["TopPages", [16, 452, 268, 118], function (g, st) {
          txt(g, "Top pages", 0, 12, "500 11px " + SANS, MUTED);
          [["/", "5 240", 1], ["/craft", "3 350", 0.64], ["/certificates", "2 150", 0.41]].forEach(function (r0, i) {
            var y = 22 + i * 32;
            g.fillStyle = hexA(AC, 0.16); rr(g, 0, y, Math.max(8, 268 * r0[2] * st.bars), 26, 8); g.fill();
            txt(g, r0[0], 10, y + 17.5, "400 11px " + MONO, FG); txt(g, r0[1], 260, y + 17.5, "500 11px " + MONO, "#a9a9ae", "right");
          });
        }],
        ["NavBar", [16, 588, 268, 40], function (g) {
          g.strokeStyle = "rgba(255,255,255,.07)"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 2); g.lineTo(268, 2); g.stroke();
          for (var i = 0; i < 4; i++) { g.fillStyle = i ? "rgba(255,255,255,.14)" : AC; rr(g, 22 + i * 68, 13, 22, 22, 7); g.fill(); }
        }]
      ];
      function hexA(hex, a) {
        var h = hex.replace("#", ""); if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
        var n = parseInt(h, 16); if (isNaN(n)) return "rgba(247,168,169," + a + ")";
        return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
      }
      var dashM = new THREE.LineDashedMaterial({ color: 0xf7a8a9, dashSize: 0.022, gapSize: 0.016, transparent: true, opacity: 0 });
      var layers = LAYERS.map(function (L, i) {
        var R = L[1], c = document.createElement("canvas"); c.width = Math.round(R[2] * K); c.height = Math.round(R[3] * K);
        var w = R[2] / UX * DW, h = R[3] / UY * DH, x = (R[0] + R[2] / 2) / UX * DW - DW / 2, y = DH / 2 - (R[1] + R[3] / 2) / UY * DH;
        var g = new THREE.Group(); g.position.set(x, y, SZ); body.add(g);
        var t = tex(c), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, opacity: 0, depthWrite: false }));
        m.renderOrder = 10 + i; g.add(m);
        // the inspector look: a dashed outline and the widget's name
        var pad = 0.012, ow = w + pad * 2, oh = h + pad * 2, op = rrShape(ow, oh, 0.02).getPoints(8).map(function (q) { return new THREE.Vector3(q.x, q.y, 0.001); });
        var outline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(op), dashM.clone()); outline.computeLineDistances(); outline.renderOrder = 30; g.add(outline);
        var lc = document.createElement("canvas"); lc.width = 512; lc.height = 64; var l2 = lc.getContext("2d");
        l2.font = "500 34px " + MONO; l2.fillStyle = "#f7a8a9"; l2.textAlign = "right"; l2.textBaseline = "middle"; l2.fillText(L[0], 506, 34);
        var label = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.05), new THREE.MeshBasicMaterial({ map: tex(lc), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }));
        label.position.set(ow / 2 - 0.2, oh / 2 + 0.032, 0.002); label.renderOrder = 31; g.add(label);
        return { name: L[0], draw: L[2], c: c, ctx: c.getContext("2d"), t: t, g: g, m: m, outline: outline, label: label, key: "", lc: lc, l2: l2 };
      });
      function paintLabels() {
        layers.forEach(function (l) { l.l2.clearRect(0, 0, 512, 64); l.l2.font = "500 34px " + MONO; l.l2.fillStyle = AC; l.l2.textAlign = "right"; l.l2.textBaseline = "middle"; l.l2.fillText(l.name, 506, 34); l.label.material.map.needsUpdate = true; l.outline.material.color.set(AC); });
      }
      paintLabels();
      function paint(l, st) {
        var g = l.ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, l.c.width, l.c.height); g.setTransform(K, 0, 0, K, 0, 0);
        l.draw(g, st); l.t.needsUpdate = true;
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layers.forEach(function (l) { l.key = ""; }); paintLabels(); });
      themeBtn.addEventListener("click", function () { setTimeout(function () { readAc(); paintLabels(); layers.forEach(function (l) { l.key = ""; }); }, 80); });

      // soft shadow under the phone
      var shC = document.createElement("canvas"); shC.width = shC.height = 256;
      (function () { var g = shC.getContext("2d"), r0 = g.createRadialGradient(128, 128, 10, 128, 128, 128); r0.addColorStop(0, "rgba(0,0,0,.55)"); r0.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r0; g.fillRect(0, 0, 256, 256); })();
      var shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: tex(shC), transparent: true, depthWrite: false, opacity: 0 }));
      shadow.position.z = -0.6; phone.add(shadow);

      // ---- layout
      var W = 0, H = 0;
      function size() {
        W = sticky.clientWidth; H = sticky.clientHeight;
        renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W, H, false);
        camera.aspect = W / H; camera.updateProjectionMatrix();
      }
      size(); onRealResize(size);
      var tmx = 0, tmy = 0, mx = 0, my = 0, on = false, lastCap = "", count0 = -1;
      addEventListener("pointermove", function (e) { if (!on) return; tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; }, { passive: true });

      function frame(ts) {
        var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight), p = reduce ? 0.78 : cl(-r.top / span), t = ts / 1000;
        mx += (tmx - mx) * 0.06; my += (tmy - my) * 0.06;
        // phases: spin in 0-0.12 · tip back 0.1-0.22 · layers drop 0.16-0.42 · hold · snap flat 0.56-0.7 · turn once 0.8-0.96
        var enter = ease(p / 0.12), tilt = ease((p - 0.1) / 0.12) * (1 - ease((p - 0.56) / 0.14)), ex = 1 - ease((p - 0.56) / 0.14);
        var spin = ease((p - 0.74) / 0.16), leave = ease((p - 0.88) / 0.12);
        // the camera frames the phone in the space under the title, then centres it once the title has gone
        var navB = navEl ? Math.max(0, navEl.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top) : 0;
        var hv = 1 - cl((p - 0.07) / 0.07), hb = head.getBoundingClientRect().bottom - sticky.getBoundingClientRect().top + 18;
        var areaTop = navB + Math.max(0, hb - navB) * hv, areaBot = H - 46, areaH = Math.max(120, areaBot - areaTop);
        var tn = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), need = 2.3 / (areaH / H); // world height we want visible
        var dist = Math.max(need / (2 * tn), 2.5 / (2 * tn * camera.aspect)) * (1 - 0.08 * tilt);
        camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
        var upp = 2 * dist * tn / H; // world units per pixel at the phone
        phone.position.y = -((areaTop + areaBot) / 2 - H / 2) * upp;
        // the phone: spins in from its back, tips back into the exploded view, the mouse turns it a little
        var sway = reduce ? 0 : Math.sin(t * 0.7) * 0.03;
        body.rotation.set(
          lerp(0.18, -0.78, tilt) + my * 0.25,
          (1 - enter) * Math.PI * 1.1 + lerp(-0.28, 0.12, tilt) + mx * 0.5 + sway + spin * Math.PI * 2,
          lerp(0.05, 0.42, tilt));
        // it leaves the way it came: drifting back into the dark, tipping away and fading out
        body.position.set(0, (1 - enter) * -0.5 + Math.sin(t * 1.1) * 0.015 + leave * 0.35, (1 - enter) * -1.2 - leave * 2.6);
        body.rotation.x += leave * -0.35;
        var fadeOut = 1 - leave;
        cv.style.opacity = fadeOut.toFixed(3);
        sec.querySelector(".mb-foot").style.opacity = fadeOut.toFixed(3);
        var vis = cl(p / 0.05) * 0.999 + 0.001;
        frameM.opacity = 1;
        screenM.opacity = cl((p - 0.08) / 0.04);
        shadow.material.opacity = 0.7 * enter * (1 - leave);
        // the app's state
        var line = ease((p - 0.3) / 0.14), bars = ease((p - 0.33) / 0.14), live = p > 0.44 ? 1 : 0;
        var cnt = Math.round(12480 * ease((p - 0.25) / 0.14)), cs = cnt.toLocaleString("en-US").replace(/,/g, " ");
        var st = { count: cs, line: line, bars: bars, live: live, t: t };
        var gap = 0.042, lift = 0.16;
        layers.forEach(function (l, i) {
          var a = eo((p - (0.16 + i * 0.034)) / 0.07), drop = 1 - back((p - (0.16 + i * 0.034)) / 0.09);
          l.g.position.z = SZ + 0.004 + 0.0015 * i + (lift + i * gap) * tilt * ex + drop * 1.4;
          l.m.material.opacity = a;
          var o = a * tilt * ex;
          l.outline.material.opacity = o * 0.9; l.label.material.opacity = o;
          l.outline.visible = l.label.visible = o > 0.01;
          // repaint only what changes
          var k = l.name === "Metric" ? cs : l.name === "LineChart" ? line.toFixed(3) + (live ? "|" + Math.floor(t * 30) : "") : (l.name === "StatGrid" || l.name === "TopPages") ? bars.toFixed(3) : "s";
          k += AC;
          if (k !== l.key && a > 0) { l.key = k; paint(l, st); }
        });
        renderer.render(scene, camera);
        head.style.opacity = hv.toFixed(3); head.style.transform = "translate3d(" + (mx * -12).toFixed(1) + "px," + (-30 * (1 - hv)).toFixed(1) + "px,0)";
        var idx = Math.min(layers.length - 1, Math.max(0, Math.floor((p - 0.16) / 0.034)));
        var c2 = p < 0.1 ? "// scroll to build" : p < 0.16 ? "// opening the widget tree" : p < 0.42 ? "// " + layers[idx].name : p < 0.56 ? "// flutter run · hot reload ✓" : p < 0.72 ? "// flattening the layers" : p < 0.74 ? "// 60 fps" : p < 0.88 ? "// one codebase, every pocket" : "// see you on the other side";
        if (c2 !== lastCap) { lastCap = c2; cap.textContent = c2; cap.classList.remove("swap"); void cap.offsetWidth; cap.classList.add("swap"); }
      }
      if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { on = en[0].isIntersecting; }, { rootMargin: "80px 0px" }).observe(sec); else on = true;
      (function loop(ts) { if (on) frame(ts || 0); requestAnimationFrame(loop); })(0);
    }
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
    var n = Math.round(W * H / 4200);
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
      spawnAcc += dt * 1.7 * boost;
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
