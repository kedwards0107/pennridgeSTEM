/* ============================================================
   Pennridge STEM Initiative — station simulations
   Hero ripple tank · Oobleck · Volcanic eruption · String waves
   ============================================================ */
(function () {
  "use strict";

  /* ───────────────────────────────────────────────────────────
     SIGN-UP FORM — paste your Google Form link here. It is applied
     to every element marked data-signup: the nav button, the hero
     CTA, the registration strip, and two Get Involved cards.
     ─────────────────────────────────────────────────────────── */
  var SIGNUP_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScJpix7q33VMVvC8oPNLhUc_EbmgVjE-XVKoZhaSKe0x_TICQ/viewform";

  var SPONSOR_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfWFTd7lVgC8d6uyAIW14D5YiE9P5gx2mBli3VX3pbdvKnk6Q/viewform";
  var MAILING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScuTpEN5VTPQmHNjeYTL1SYbk5AamcCIb2fogCdf-NvYgZchQ/viewform";

  Array.prototype.forEach.call(document.querySelectorAll("[data-signup]"), function (a) {
    a.href = SIGNUP_FORM_URL;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-sponsor]"), function (a) {
    a.href = SPONSOR_FORM_URL;
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-mailing]"), function (a) {
    a.href = MAILING_FORM_URL;
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme-aware colors ---------- */
  var C = {};
  function hex(v) {
    v = v.trim();
    if (v[0] === "#") {
      if (v.length === 4) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];
    }
    var m = v.match(/\d+/g);
    return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
  }
  function readTheme() {
    var s = getComputedStyle(document.documentElement);
    ["paper", "ink", "blue", "pink", "acid", "deep", "deep-2", "deep-line", "deep-dim", "deep-text"]
      .forEach(function (k) { C[k] = hex(s.getPropertyValue("--" + k)); });
    C.css = function (k, a) {
      var c = C[k];
      return a === undefined ? "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"
                             : "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    };
  }
  readTheme();
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(readTheme);

  function fit(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w: r.width, h: r.height, ctx: ctx };
  }

  /* run a loop only while its canvas is on screen */
  function onScreen(el, start, stop) {
    if (!("IntersectionObserver" in window)) { start(); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { rootMargin: "160px" }).observe(el);
  }

  /* =========================================================
     HERO — two-source ripple tank
     Renders a coarse amplitude field, CSS-scaled for a soft
     water-surface look. Sources are draggable.
     ========================================================= */
  (function ripple() {
    var cv = document.getElementById("ripple");
    if (!cv) return;
    var hero = cv.parentElement;
    var ctx = cv.getContext("2d");
    var CELL = 5, gw = 1, gh = 1, W = 1, H = 1, img = null;
    var src = [{ x: 0.30, y: 0.40 }, { x: 0.72, y: 0.66 }];
    var drag = -1, t = 0, raf = 0, last = 0;

    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      gw = Math.max(2, Math.ceil(W / CELL));
      gh = Math.max(2, Math.ceil(H / CELL));
      cv.width = gw; cv.height = gh;
      img = ctx.createImageData(gw, gh);
    }

    function draw() {
      var d = img.data, i = 0;
      var p = C.paper, a = C.blue, b = C.pink;
      var k = 0.105 * CELL, decay = 0.0075 * CELL;
      var s0x = src[0].x * gw, s0y = src[0].y * gh;
      var s1x = src[1].x * gw, s1y = src[1].y * gh;
      for (var y = 0; y < gh; y++) {
        for (var x = 0; x < gw; x++) {
          var dx = x - s0x, dy = y - s0y;
          var r0 = Math.sqrt(dx * dx + dy * dy) + 4;
          dx = x - s1x; dy = y - s1y;
          var r1 = Math.sqrt(dx * dx + dy * dy) + 4;
          var amp = Math.sin(k * r0 - t) * Math.exp(-decay * r0)
                  + Math.sin(k * r1 - t) * Math.exp(-decay * r1);
          amp *= 0.5;
          var w = Math.min(1, Math.abs(amp)) * 0.22;
          var tint = amp > 0 ? b : a;
          d[i++] = p[0] + (tint[0] - p[0]) * w;
          d[i++] = p[1] + (tint[1] - p[1]) * w;
          d[i++] = p[2] + (tint[2] - p[2]) * w;
          d[i++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      t += 0.17;
      if (drag < 0) {
        src[0].x = 0.30 + Math.sin(t * 0.013) * 0.05;
        src[1].y = 0.66 + Math.cos(t * 0.011) * 0.06;
      }
      draw();
    }

    function pos(e) {
      var r = hero.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    }
    hero.addEventListener("pointerdown", function (e) {
      // touch drags belong to the page — never steal a scroll gesture
      if (e.pointerType === "touch") return;
      var p = pos(e), best = -1, bd = 1e9;
      src.forEach(function (s, i) {
        var dx = (s.x - p.x) * W, dy = (s.y - p.y) * H, d = Math.sqrt(dx * dx + dy * dy);
        if (d < bd) { bd = d; best = i; }
      });
      if (bd < 90) { drag = best; e.preventDefault(); }
    });
    window.addEventListener("pointermove", function (e) {
      if (drag < 0) return;
      var p = pos(e);
      src[drag].x = Math.max(0.02, Math.min(0.98, p.x));
      src[drag].y = Math.max(0.02, Math.min(0.98, p.y));
      if (reduced) draw();
    });
    window.addEventListener("pointerup", function () { drag = -1; });

    window.addEventListener("resize", function () { size(); draw(); });
    size();
    draw();
    raf = requestAnimationFrame(frame);
  })();

  /* =========================================================
     STATION 02 — Oobleck (shear-thickening suspension)
     Particle bed whose contact stiffness rises with the
     shear rate the pointer imposes: slow = flow, fast = jam.
     ========================================================= */
  (function oobleck() {
    var cv = document.getElementById("oobleck");
    if (!cv) return;
    var hint = document.getElementById("oobleckHint");
    var elShear = document.getElementById("ooShear");
    var elVisc = document.getElementById("ooVisc");
    var elState = document.getElementById("ooState");
    var elKnob = document.getElementById("ooKnob");
    var elLabels = document.querySelectorAll(".phase-labels li");
    var PHASE_NAMES = ["Liquid", "Semi-solid", "Solid"];
    var phaseIdx = -1;

    var W, H, ctx, P = [], R = 6.2;
    var ptr = { x: -999, y: -999, px: -999, py: -999, on: false, speed: 0 };
    var shear = 0, jam = 0, running = false, raf = 0, touched = false, visible = false;
    var everSolid = false, stirred = 0, hintMode = "idle", hintTimer = 0;

    function build() {
      var f = fit(cv); W = f.w; H = f.h; ctx = f.ctx;
      R = Math.max(4.4, Math.min(W, H) / 34);
      P = [];
      var cols = Math.floor(W / (R * 2.05));
      var rows = Math.floor((H * 0.55) / (R * 2.05));
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var x = R + c * R * 2.05 + (r % 2) * R * 0.5 + Math.random();
          var y = H - R - r * R * 1.95;
          P.push({ x: x, y: y, ox: x, oy: y });
        }
      }
    }

    function step() {
      var GR = 0.34, drag = 0.986;
      var stiff = 0.42 + jam * 0.52;          // contact stiffness rises when jammed
      var damp = 1 - jam * 0.55;              // jammed grains stop sloshing

      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        var vx = (p.x - p.ox) * drag * damp, vy = (p.y - p.oy) * drag * damp;
        p.ox = p.x; p.oy = p.y;
        p.x += vx; p.y += vy + GR;
      }

      // pointer acts as a stirring rod
      if (ptr.on) {
        var rad = R * 4.2;
        for (var i2 = 0; i2 < P.length; i2++) {
          var q = P[i2], dx = q.x - ptr.x, dy = q.y - ptr.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < rad && d > 0.01) {
            var push = (rad - d) / rad;
            q.x += (dx / d) * push * 3.4 + (ptr.x - ptr.px) * push * 0.55;
            q.y += (dy / d) * push * 3.4 + (ptr.y - ptr.py) * push * 0.55;
          }
        }
      }

      // contacts + walls
      for (var it = 0; it < 3; it++) {
        for (var a = 0; a < P.length; a++) {
          var A = P[a];
          for (var b = a + 1; b < P.length; b++) {
            var B = P[b], ddx = B.x - A.x, ddy = B.y - A.y;
            var dd = ddx * ddx + ddy * ddy, min = R * 2;
            if (dd < min * min && dd > 0.0001) {
              var dl = Math.sqrt(dd), ov = (min - dl) * stiff * 0.5;
              var nx = ddx / dl * ov, ny = ddy / dl * ov;
              A.x -= nx; A.y -= ny; B.x += nx; B.y += ny;
            }
          }
          if (A.x < R) A.x = R;
          if (A.x > W - R) A.x = W - R;
          if (A.y > H - R) A.y = H - R;
          if (A.y < R) A.y = R;
        }
      }
    }

    function render() {
      ctx.fillStyle = C.css("deep");
      ctx.fillRect(0, 0, W, H);

      // bonds appear where the suspension has jammed into a solid
      if (jam > 0.08) {
        ctx.strokeStyle = C.css("pink", 0.10 + jam * 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var a = 0; a < P.length; a++) {
          for (var b = a + 1; b < P.length; b++) {
            var dx = P[b].x - P[a].x, dy = P[b].y - P[a].y;
            if (dx * dx + dy * dy < (R * 2.45) * (R * 2.45)) {
              ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y);
            }
          }
        }
        ctx.stroke();
      }

      var fluid = C.blue, solid = C.pink;
      var cr = fluid[0] + (solid[0] - fluid[0]) * jam;
      var cg = fluid[1] + (solid[1] - fluid[1]) * jam;
      var cb = fluid[2] + (solid[2] - fluid[2]) * jam;
      ctx.fillStyle = "rgb(" + (cr | 0) + "," + (cg | 0) + "," + (cb | 0) + ")";
      ctx.beginPath();
      for (var i = 0; i < P.length; i++) {
        ctx.moveTo(P[i].x + R, P[i].y);
        ctx.arc(P[i].x, P[i].y, R * (0.92 + jam * 0.08), 0, 6.2832);
      }
      ctx.fill();

      if (ptr.on) {
        ctx.strokeStyle = C.css("acid", 0.85);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, R * 4.2, 0, 6.2832);
        ctx.stroke();
      }
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      // shear rate: pointer speed over the ~1 cm gap it opens in the bed
      var target = ptr.on ? ptr.speed / Math.max(R * 2, 1) * 8 : 0;
      shear += (target - shear) * 0.18;
      var j = Math.max(0, Math.min(1, (shear - 5) / 17));
      jam += (j - jam) * 0.22;
      ptr.px = ptr.x; ptr.py = ptr.y;
      ptr.speed *= 0.72;
      step();
      render();

      // K·γ̇^(n−1) with n = 1.7 — shear thickening
      var g = Math.max(0.1, shear);
      var eta = 1.2 * Math.pow(g, 0.7);
      elShear.textContent = shear.toFixed(1);
      elVisc.textContent = (shear < 0.15 ? 1.2 : eta).toFixed(1);
      // the knob rides the jam value, so the reading is continuous
      var pos = Math.max(0, Math.min(1, jam));
      if (elKnob) elKnob.style.left = (pos * 100).toFixed(1) + "%";
      var idx = pos < 0.34 ? 0 : (pos < 0.67 ? 1 : 2);
      if (idx !== phaseIdx) {
        phaseIdx = idx;
        if (elKnob) elKnob.style.background = ["var(--blue)", "var(--acid)", "var(--pink)"][idx];
        for (var q = 0; q < elLabels.length; q++) elLabels[q].classList.toggle("on", q === idx);
        elState.textContent = PHASE_NAMES[idx];
      }
      var solid = jam > 0.5;

      // counts only frames where the bed is actually being dragged through,
      // so resting a finger on it does not advance the prompt
      if (ptr.on && shear > 0.4) stirred++;
      if (solid && !everSolid) {
        everSolid = true;
        setHint("Shear thickening — the grains jammed into a solid.", "win", true);
      } else if (!everSolid && stirred > 4) {
        setHint("Now swipe fast — speed is what locks it solid.", "fast");
      }
    }

    /* The hint teaches the effect rather than vanishing on first contact:
       it nudges toward speed, then names what happened once they find it. */
    function setHint(text, mode, done) {
      if (!hint || hintMode === mode) return;
      hintMode = mode;
      hint.textContent = text;
      hint.classList.remove("is-hidden");
      hint.classList.toggle("is-win", !!done);
      clearTimeout(hintTimer);
      if (done) hintTimer = setTimeout(function () { hint.classList.add("is-hidden"); }, 4500);
    }

    function local(e) {
      var r = cv.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function move(e) {
      var p = local(e);
      var dx = p.x - ptr.x, dy = p.y - ptr.y;
      if (ptr.on) ptr.speed = Math.max(ptr.speed, Math.sqrt(dx * dx + dy * dy));
      ptr.x = p.x; ptr.y = p.y;
      touched = true;
    }
    function start() { if (!running && visible) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { if (running) { running = false; cancelAnimationFrame(raf); } }

    function grab(e) {
      ptr.on = true;
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      var p = local(e);
      ptr.x = ptr.px = p.x; ptr.y = ptr.py = p.y;
      touched = true;
      start();               // a touch counts as consent to animate
      e.preventDefault();
    }
    function release(e) {
      ptr.on = false; ptr.speed = 0;
      try { cv.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    cv.addEventListener("pointerdown", grab);
    cv.addEventListener("pointermove", function (e) {
      // a mouse stirs on hover; a finger only stirs while it is down
      if (!ptr.on) {
        if (e.pointerType !== "mouse") return;
        ptr.on = true;
        var p = local(e); ptr.x = ptr.px = p.x; ptr.y = ptr.py = p.y;
        start();
      }
      move(e);
      e.preventDefault();
    });
    cv.addEventListener("pointerup", release);
    cv.addEventListener("pointercancel", release);
    cv.addEventListener("pointerenter", function (e) {
      if (e.pointerType !== "mouse") return;
      ptr.on = true;
      var p = local(e); ptr.x = ptr.px = p.x; ptr.y = ptr.py = p.y;
      start();
    });
    cv.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") { ptr.on = false; ptr.speed = 0; }
    });

    build();
    render();
    window.addEventListener("resize", function () { build(); render(); });
    onScreen(cv,
      function () { visible = true; if (!reduced) start(); },
      function () { visible = false; stop(); });
  })();

  /* =========================================================
     STATION 01 — Volcanic eruption
     NaHCO3 + CH3COOH -> CO2 + H2O + NaCH3COO
     Limiting reagent sets the CO2 yield; yield sets the plume.
     ========================================================= */
  (function volcano() {
    var cv = document.getElementById("volcano");
    if (!cv) return;
    var soda = document.getElementById("soda");
    var vin = document.getElementById("vinegar");
    var canErupt = true;
    var sodaVal = document.getElementById("sodaVal");
    var vinVal = document.getElementById("vinVal");
    var oLimit = document.getElementById("vLimit");
    var oMol = document.getElementById("vMol");
    var oVol = document.getElementById("vVol");

    var M_SODA = 84.007;       // g/mol NaHCO3
    var M_ACID = 60.052;       // g/mol CH3COOH
    var ACID_G_PER_ML = 0.05;  // 5% household vinegar
    var MOLAR_VOL = 24.2;      // L/mol at 22 degC, 1 atm

    var W, H, ctx, foam = [], raf = 0, running = false, chem = {};
    /* Full scale is the most these sliders can actually produce, derived from
       their own max attributes — so the gauge and the plume top out exactly
       when the sliders do, not partway up. */
    var VOL_MAX = Math.min((+soda.max) / M_SODA, (+vin.max) * ACID_G_PER_ML / M_ACID) * MOLAR_VOL;
    var MAX_ERUPT_MS = 2000;      // longest plume, reached at full yield
    var emitUntil = 0, emitPower = 0, emitVigor = 0, emitCarry = 0;
    function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

    function calc() {
      var nS = (+soda.value) / M_SODA;
      var nA = (+vin.value) * ACID_G_PER_ML / M_ACID;
      var n = Math.min(nS, nA);
      chem = {
        n: n,
        vol: n * MOLAR_VOL,
        limit: nS <= nA ? "Baking soda" : "Vinegar",
        even: Math.abs(nS - nA) < 0.004
      };
      sodaVal.textContent = (+soda.value).toFixed(1);
      vinVal.textContent = vin.value;
      var missing = (+soda.value === 0 || +vin.value === 0);
      canErupt = !missing;
      oLimit.textContent = missing ? "—" : chem.even ? "balanced" : chem.limit;
      oMol.textContent = n.toFixed(3);
      oVol.textContent = chem.vol.toFixed(1);
    }

    function size() { var f = fit(cv); W = f.w; H = f.h; ctx = f.ctx; }

    function cone() {
      var baseY = H * 0.95, peakY = H * 0.42, cx = W / 2;
      ctx.fillStyle = C.css("deep-dim", 0.22);
      ctx.beginPath();
      ctx.moveTo(cx - W * 0.40, baseY);
      ctx.lineTo(cx - W * 0.105, peakY);
      ctx.lineTo(cx + W * 0.105, peakY);
      ctx.lineTo(cx + W * 0.40, baseY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = C.css("deep-dim", 0.6);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // crater mouth
      ctx.fillStyle = C.css("deep");
      ctx.beginPath();
      ctx.ellipse(cx, peakY, W * 0.105, H * 0.028, 0, 0, 6.2832);
      ctx.fill();

      // the only control: a prompt across the base of the cone
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "500 " + Math.max(11, Math.round(W * 0.036)) + "px 'DM Mono', monospace";
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "0.14em";
      ctx.fillStyle = canErupt ? C.css("acid") : C.css("deep-dim");
      ctx.fillText(canErupt ? "TAP TO ERUPT" : "ADD BOTH REAGENTS", cx, baseY - H * 0.05);
      ctx.restore();

      return { cx: cx, cy: peakY, baseY: baseY };
    }

    function spawn(count, power) {
      var cx = W / 2, cy = H * 0.42;
      for (var i = 0; i < count; i++) {
        foam.push({
          x: cx + (Math.random() - 0.5) * W * 0.17,
          y: cy + Math.random() * 6,
          vx: (Math.random() - 0.5) * (1.6 + power * 3.4),
          vy: -(1.6 + power * 8.5) * (0.45 + Math.random() * 0.8),
          r: (2 + Math.random() * 4.5) * (0.6 + power * 0.8),
          life: 1,
          fade: 0.006 + Math.random() * 0.009,
          hot: Math.random() < 0.35
        });
      }
    }

    /* The plume is emitted over time rather than in one burst, so the yield
       sets how long gas keeps coming as well as how hard it leaves the crater
       — a small batch fizzes briefly, a full one sustains for two seconds. */
    function erupt() {
      if (!chem.n) return;              // no reagent, no reaction, no plume
      emitPower = Math.min(1, chem.vol / VOL_MAX);   // linear in CO₂: sets duration
      emitVigor = Math.pow(emitPower, 0.55);         // eased: sets jet speed and drop size
      emitUntil = nowMs() + Math.max(200, MAX_ERUPT_MS * emitPower);
      emitCarry = 0;
      if (!running) { running = true; raf = requestAnimationFrame(frame); }
    }

    function frame(ts) {
      raf = requestAnimationFrame(frame);
      var t = ts || nowMs();
      if (t < emitUntil) {
        emitCarry += 3;                          // constant rate, so total ∝ duration ∝ CO₂
        var n = Math.floor(emitCarry);
        if (n > 0) { spawn(n, emitVigor); emitCarry -= n; }
      }
      ctx.fillStyle = C.css("deep");
      ctx.fillRect(0, 0, W, H);
      var g = cone();

      for (var i = foam.length - 1; i >= 0; i--) {
        var f = foam[i];
        f.vy += 0.13;
        f.vx *= 0.995;
        f.x += f.vx; f.y += f.vy;
        f.life -= f.fade;
        f.r *= 1.004;
        if (f.y > g.baseY) { f.y = g.baseY; f.vy *= -0.22; f.vx *= 0.7; f.life -= 0.02; }
        if (f.life <= 0 || f.x < -40 || f.x > W + 40) { foam.splice(i, 1); continue; }
        ctx.fillStyle = f.hot ? C.css("pink", f.life * 0.85) : C.css("acid", f.life * 0.6);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, 6.2832);
        ctx.fill();
      }

      // fill gauge: how much of the 4.5 L reference plume this batch makes
      var frac = Math.min(1, chem.vol / VOL_MAX);
      ctx.fillStyle = C.css("deep-line");
      ctx.fillRect(W * 0.06, H * 0.06, W * 0.05, H * 0.30);
      ctx.fillStyle = C.css("acid");
      ctx.fillRect(W * 0.06, H * 0.06 + H * 0.30 * (1 - frac), W * 0.05, H * 0.30 * frac);
      ctx.fillStyle = C.css("deep-dim");
      ctx.font = "500 10px 'DM Mono', monospace";
      ctx.fillText("CO₂", W * 0.06, H * 0.055 + H * 0.30 + 14);

      if (foam.length === 0 && t >= emitUntil) { running = false; cancelAnimationFrame(raf); }
    }

    function still() {
      ctx.fillStyle = C.css("deep");
      ctx.fillRect(0, 0, W, H);
      cone();
      var frac = Math.min(1, chem.vol / VOL_MAX);
      ctx.fillStyle = C.css("deep-line");
      ctx.fillRect(W * 0.06, H * 0.06, W * 0.05, H * 0.30);
      ctx.fillStyle = C.css("acid");
      ctx.fillRect(W * 0.06, H * 0.06 + H * 0.30 * (1 - frac), W * 0.05, H * 0.30 * frac);
      ctx.fillStyle = C.css("deep-dim");
      ctx.font = "500 10px 'DM Mono', monospace";
      ctx.fillText("CO₂", W * 0.06, H * 0.055 + H * 0.30 + 14);
    }

    /* iOS Safari claims the bottom strip of the screen to re-reveal its toolbar,
       so a tap on Erupt down there is swallowed. Tapping the volcano itself
       works from anywhere on screen, and reads as the obvious thing to try. */
    var tapFrom = null;
    cv.style.cursor = "pointer";
    cv.addEventListener("pointerdown", function (e) {
      tapFrom = { x: e.clientX, y: e.clientY, t: nowMs() };
    });
    cv.addEventListener("pointercancel", function () { tapFrom = null; });   // became a scroll
    cv.addEventListener("pointerup", function (e) {
      if (!tapFrom) return;
      var dx = e.clientX - tapFrom.x, dy = e.clientY - tapFrom.y;
      var still_ = Math.sqrt(dx * dx + dy * dy) < 12;
      var quick = nowMs() - tapFrom.t < 600;
      tapFrom = null;
      if (still_ && quick && canErupt) erupt();
    });

    soda.addEventListener("input", function () { calc(); if (!running) still(); });
    vin.addEventListener("input", function () { calc(); if (!running) still(); });

    size(); calc(); still();
    window.addEventListener("resize", function () { size(); still(); });
  })();

  /* =========================================================
     STATION 03 — Superposition on a string
     Two travelling waves plus their sum. Phase 180 deg
     cancels; phase 0 doubles the amplitude.
     ========================================================= */
  (function strings() {
    var cv = document.getElementById("string");
    if (!cv) return;
    var fA = document.getElementById("freqA");
    var ph = document.getElementById("phase");
    var fAVal = document.getElementById("freqAVal");
    var phVal = document.getElementById("phaseVal");
    var segs = Array.prototype.slice.call(document.querySelectorAll(".seg-btn"));

    var W, H, ctx, t = 0, raf = 0, running = false, mode = "all";
    var paused = false, visible = false;
    var playBtn = document.getElementById("wavePlay");
    var legend = document.getElementById("waveLegend");

    function size() { var f = fit(cv); W = f.w; H = f.h; ctx = f.ctx; }

    function wave(lambdaScale, phase) {
      var k = (2 * Math.PI) / (W / (1.9 / lambdaScale));
      return function (x) { return Math.sin(k * x - t + phase); };
    }

    function curve(fn, amp, mid, color, width, alpha, dash) {
      ctx.beginPath();
      for (var x = 0; x <= W; x += 2) {
        var y = mid - fn(x) * amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = alpha === undefined ? C.css(color) : C.css(color, alpha);
      ctx.lineWidth = width;
      ctx.lineJoin = "round";
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function render() {
      ctx.fillStyle = C.css("deep");
      ctx.fillRect(0, 0, W, H);
      var mid = H / 2, amp = H * 0.17;

      ctx.strokeStyle = C.css("deep-line");
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
      ctx.setLineDash([]);

      var scale = +fA.value;
      var phase = (+ph.value) * Math.PI / 180;
      var a = wave(scale, 0), b = wave(scale, phase);

      if (mode === "all") {
        curve(a, amp, mid, "blue", 1.8, 0.8);
        curve(b, amp, mid, "pink", 1.8, 0.8);
      }
      curve(function (x) { return a(x) + b(x); }, amp, mid, "acid", 3);

      // end posts of the string
      ctx.fillStyle = C.css("deep-dim");
      ctx.fillRect(0, mid - H * 0.30, 2, H * 0.60);
      ctx.fillRect(W - 2, mid - H * 0.30, 2, H * 0.60);

      var peak = Math.abs(2 * Math.cos(phase / 2));
      ctx.font = "500 11px 'DM Mono', monospace";
      ctx.fillStyle = C.css(peak < 0.35 ? "pink" : "acid");
      ctx.fillText(
        peak < 0.05 ? "DESTRUCTIVE  ·  sum = 0"
                    : (peak > 1.995 ? "CONSTRUCTIVE  ·  sum = 2 × Amplitude"
                                    : "PARTIAL  ·  sum = " + peak.toFixed(2) + " × Amplitude"),
        14, 22);
    }

    function frame() { raf = requestAnimationFrame(frame); t += 0.055; render(); }
    function start() { if (!running && visible && !paused) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { if (running) { running = false; cancelAnimationFrame(raf); } }

    if (playBtn) {
      playBtn.addEventListener("click", function () {
        paused = !paused;
        playBtn.textContent = paused ? "Play" : "Pause";
        playBtn.setAttribute("aria-pressed", paused ? "true" : "false");
        paused ? stop() : start();
      });
    }

    fA.addEventListener("input", function () { fAVal.textContent = (+fA.value).toFixed(2); render(); });
    ph.addEventListener("input", function () { phVal.textContent = ph.value; render(); });
    segs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        segs.forEach(function (o) { o.classList.remove("is-on"); });
        btn.classList.add("is-on");
        mode = btn.dataset.show;
        if (legend) legend.classList.toggle("is-sum-only", mode === "sum");
        render();
      });
    });

    /* ---- audio: you hear the sum, and only the sum ----
       Two waves superposing at your ear IS one resultant tone of amplitude
       2·cos(p/2) — so the honest thing to play is that resultant, with its
       amplitude driven straight off the phase. Summing two oscillators would
       depend on them staying phase-locked, which browsers do not guarantee;
       any drift there would leak sound at 180 degrees instead of cancelling. */
    var sndBtn = document.getElementById("waveSound");
    var actx = null, osc, amp, master, limiter, soundOn = false;
    /* Hearing-safety ceiling. A sustained pure sine is more fatiguing than
       music at the same level, and this gets played through earbuds, so the
       signal is capped around -21 dBFS. gainTo() clamps to it, and a brickwall
       limiter sits after the gain as a backstop no code path can get past. */
    var MAX_GAIN = 0.09;

    function freqNow() { return 330 / (+fA.value); }
    // normalised amplitude of the sum: |2cos(p/2)| / 2, so 0 at 180deg, 1 at 0deg
    function ampNow() { return Math.abs(Math.cos((+ph.value) * Math.PI / 360)); }

    function buildAudio() {
      if (actx) return true;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      actx = new AC();
      master = actx.createGain(); master.gain.value = 0;
      amp = actx.createGain(); amp.gain.value = ampNow();
      osc = actx.createOscillator(); osc.type = "sine";
      osc.frequency.value = freqNow();
      limiter = actx.createDynamicsCompressor();
      limiter.threshold.value = -18;   // above the -21 dBFS ceiling, so it is
      limiter.knee.value = 0;          // silent in normal use and only acts if
      limiter.ratio.value = 20;        // something ever exceeds the cap
      limiter.attack.value = 0.003;
      limiter.release.value = 0.10;
      osc.connect(amp); amp.connect(master);
      master.connect(limiter); limiter.connect(actx.destination);
      osc.start();
      return true;
    }

    function gainTo(v) {
      if (!actx) return;
      var safe = Math.max(0, Math.min(v, MAX_GAIN));
      master.gain.cancelScheduledValues(actx.currentTime);
      // slower fade in than out, so switching it on never arrives as a jolt
      master.gain.setTargetAtTime(safe, actx.currentTime, safe > 0 ? 0.09 : 0.04);
    }

    function syncAudio() {
      if (!actx) return;
      var t = actx.currentTime;
      osc.frequency.setTargetAtTime(freqNow(), t, 0.02);
      amp.gain.setTargetAtTime(ampNow(), t, 0.03);
    }

    function setSound(on) {
      if (on && !buildAudio()) return;
      soundOn = on;
      if (on && actx.state === "suspended") actx.resume();
      syncAudio();
      gainTo(on && visible ? MAX_GAIN : 0);
      if (sndBtn) {
        sndBtn.setAttribute("aria-pressed", on ? "true" : "false");
        sndBtn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
      }
    }

    if (sndBtn) sndBtn.addEventListener("click", function () { setSound(!soundOn); });
    fA.addEventListener("input", syncAudio);
    ph.addEventListener("input", syncAudio);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) gainTo(0); else if (soundOn && visible) gainTo(MAX_GAIN);
    });

    size(); render();
    window.addEventListener("resize", function () { size(); render(); });
    onScreen(cv,
      function () { visible = true; start(); if (soundOn) gainTo(MAX_GAIN); },
      function () { visible = false; stop(); gainTo(0); });
  })();

  /* ---------- tap the discipline band to pause it ---------- */
  (function marquee() {
    var bar = document.querySelector(".marquee");
    if (!bar) return;
    bar.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse") return;   // mouse already pauses on hover
      bar.classList.toggle("is-paused");
    });
  })();

  /* ---------- hamburger menu ---------- */
  (function menu() {
    var btn = document.getElementById("navToggle");
    var nav = document.getElementById("topnav");
    if (!btn || !nav) return;

    function set(open) {
      nav.classList.toggle("is-open", open);
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    function isOpen() { return btn.getAttribute("aria-expanded") === "true"; }

    btn.addEventListener("click", function (e) { e.stopPropagation(); set(!isOpen()); });

    // jumping to a section should close the menu behind you
    nav.addEventListener("click", function (e) {
      if (e.target && e.target.closest && e.target.closest("a")) set(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { set(false); btn.focus(); }
    });
    document.addEventListener("click", function (e) {
      if (isOpen() && !nav.contains(e.target) && !btn.contains(e.target)) set(false);
    });

    // leaving phone width restores the normal bar
    var wide = window.matchMedia("(min-width: 761px)");
    var onWide = function (e) { if (e.matches) set(false); };
    wide.addEventListener ? wide.addEventListener("change", onWide) : wide.addListener(onWide);
  })();

  /* ---------- active section in the top nav ---------- */
  (function nav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".topnav a[href^='#']"));
    var map = {};
    links.forEach(function (l) {
      var el = document.getElementById(l.getAttribute("href").slice(1));
      if (el) map[el.id] = l;
    });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var l = map[e.target.id];
        if (l && !l.classList.contains("topnav-cta")) {
          l.style.color = e.isIntersecting ? "var(--blue)" : "";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();
})();
