/* basarapp.com — Başar! tanıtım sayfası */
(function () {
  'use strict';
  /* Mağaza bağlantıları: uygulama yayınlanınca yalnız buraya adres yazılır, düğmeler kendiliğinden etkinleşir. */
  var LINKLER = { appstore: '', googleplay: '' };

  var hareketAz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var veriTasarrufu = !!(navigator.connection && navigator.connection.saveData);
  var depo = { al: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, yaz: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* özel pencere */ } } };

  /* ---------- mağaza bağlantıları ---------- */
  Object.keys(LINKLER).forEach(function (k) {
    if (!LINKLER[k]) return;
    document.querySelectorAll('[data-link="' + k + '"]').forEach(function (el) {
      var a = document.createElement('a'); a.href = LINKLER[k]; a.rel = 'noopener'; a.target = '_blank';
      a.className = el.className.replace('yakinda', '').trim(); a.innerHTML = el.innerHTML;
      var s = a.querySelector('small'); if (s) { s.removeAttribute('data-en'); s.setAttribute('data-en', 'Download on the'); s.textContent = 'İndir'; }
      el.parentNode.replaceChild(a, el);
    });
  });

  /* ---------- dil ---------- */
  var dilBtn = document.getElementById('dil'), dil = 'tr';
  var EN = { title: 'Başar! · Focus, and watch your island grow', meow: 'meow', wish: 'Make a wish!' };
  var TR = { title: 'Başar! · Odaklan, adan büyüsün', meow: 'miyav', wish: 'Dilek tut!' };
  function dilSec(d) {
    dil = d;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.hasAttribute('data-tr')) el.setAttribute('data-tr', el.innerHTML);
      el.innerHTML = d === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-tr');
    });
    document.querySelectorAll('img[data-src-en]').forEach(function (im) {
      if (!im.hasAttribute('data-src-tr')) { im.setAttribute('data-src-tr', im.getAttribute('src')); im.setAttribute('data-alt-tr', im.getAttribute('alt') || ''); }
      im.setAttribute('src', d === 'en' ? im.getAttribute('data-src-en') : im.getAttribute('data-src-tr'));
      im.setAttribute('alt', d === 'en' ? (im.getAttribute('data-alt-en') || '') : im.getAttribute('data-alt-tr'));
    });
    document.documentElement.lang = d; document.title = (d === 'en' ? EN : TR).title;
    dilBtn.textContent = d === 'en' ? 'Türkçe' : 'English';
  }
  var ilkDil = depo.al('basar-site-dil') || ((navigator.language || 'tr').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en');
  if (ilkDil === 'en') dilSec('en');
  dilBtn.addEventListener('click', function () { var d = dil === 'tr' ? 'en' : 'tr'; dilSec(d); depo.yaz('basar-site-dil', d); });

  /* ---------- sabit arka plan: kaydırdıkça saat ve mevsim değişir ---------- */
  var katmanlar = {}; document.querySelectorAll('.katman').forEach(function (k) { katmanlar[k.getAttribute('data-bg')] = k; });
  var SIRA = ['sabah', 'oglen', 'aksam', 'kis', 'gece', 'bahar'];
  var videoVar = !hareketAz && !veriTasarrufu && !!document.createElement('video').canPlayType;
  var aktif = null;
  function posterKoy(ad) { var k = katmanlar[ad]; if (k && !k.style.backgroundImage) k.style.backgroundImage = 'url("bg-' + ad + '.jpg")'; }
  function videoKoy(ad) {
    var k = katmanlar[ad]; if (!videoVar || !k || k.querySelector('video')) return;
    var v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.innerHTML = '<source src="bg-' + ad + '.webm" type="video/webm"><source src="bg-' + ad + '.mp4" type="video/mp4">';
    v.addEventListener('error', function () { v.remove(); }, true);
    k.appendChild(v);
  }
  function arkaPlan(ad) {
    if (!katmanlar[ad] || ad === aktif) return;
    aktif = ad; posterKoy(ad); videoKoy(ad);
    Object.keys(katmanlar).forEach(function (n) {
      var k = katmanlar[n], v = k.querySelector('video'), on = n === ad;
      k.classList.toggle('on', on);
      if (v) { if (on) { var p = v.play(); if (p && p.catch) p.catch(function () { /* otomatik oynatma kapalıysa poster kalır */ }); } else setTimeout(function () { if (!k.classList.contains('on')) v.pause(); }, 1500); }
    });
    var i = SIRA.indexOf(ad), sonraki = SIRA[i + 1];
    if (sonraki) setTimeout(function () { posterKoy(sonraki); }, 800);
  }
  var bolumler = [].slice.call(document.querySelectorAll('[data-bg]')).filter(function (el) { return !el.classList.contains('katman'); });
  var bekliyor = false;
  function kontrol() {
    bekliyor = false; var orta = window.innerHeight / 2, en = null, enD = 1e9;
    bolumler.forEach(function (b) { var r = b.getBoundingClientRect(); var d = r.top <= orta && r.bottom >= orta ? 0 : Math.min(Math.abs(r.top - orta), Math.abs(r.bottom - orta)); if (d < enD) { enD = d; en = b; } });
    if (en) arkaPlan(en.getAttribute('data-bg'));
  }
  window.addEventListener('scroll', function () { if (!bekliyor) { bekliyor = true; requestAnimationFrame(kontrol); } }, { passive: true });
  window.addEventListener('resize', kontrol);
  kontrol();

  /* ---------- gündüz kuşları ve gece kayan yıldızı (piksel çizim) ---------- */
  var cv = document.getElementById('kuslar'), cx = cv.getContext('2d');
  var P = 3, W = 0, H = 0, kuslar = [], yildizlar = [], sonSuru = 0, gizli = false;
  function boyut() { P = Math.max(2, Math.round(Math.min(window.innerWidth, window.innerHeight * 1.8) / 360)); W = Math.ceil(window.innerWidth / P); H = Math.ceil(window.innerHeight / P); cv.width = W; cv.height = H; cx.imageSmoothingEnabled = false; }
  boyut(); window.addEventListener('resize', boyut);
  var GUNDUZ = { sabah: 1, oglen: 1, aksam: 1, bahar: 1 };
  function suru(t) {
    var sol = Math.random() < 0.5, n = 3 + Math.floor(Math.random() * 4), y0 = 10 + Math.random() * H * 0.28, hiz = (14 + Math.random() * 8) * (sol ? 1 : -1);
    for (var i = 0; i < n; i++) kuslar.push({ x: (sol ? -10 : W + 10) - i * 7 * (sol ? 1 : -1), y: y0 + (i % 2 ? 4 : 0) + i * 2.2, vx: hiz, faz: Math.random() * 6, renk: aktif === 'aksam' ? '#2a1d22' : '#22303c' });
    sonSuru = t;
  }
  function kusCiz(k, t) {
    var x = Math.round(k.x), y = Math.round(k.y), kanat = Math.sin(t * 9 + k.faz) > 0;
    cx.fillStyle = k.renk; cx.fillRect(x, y, 1, 1);
    if (kanat) { cx.fillRect(x - 1, y - 1, 1, 1); cx.fillRect(x + 1, y - 1, 1, 1); cx.fillRect(x - 2, y - 2, 1, 1); cx.fillRect(x + 2, y - 2, 1, 1); }
    else { cx.fillRect(x - 1, y, 1, 1); cx.fillRect(x + 1, y, 1, 1); cx.fillRect(x - 2, y + 1, 1, 1); cx.fillRect(x + 2, y + 1, 1, 1); }
  }
  function yildizAt(x, y) { yildizlar.push({ x: x !== undefined ? x : W * (0.3 + Math.random() * 0.6), y: y !== undefined ? y : H * (0.05 + Math.random() * 0.2), t: 0 }); }
  var onceki = 0;
  function dongu(ms) {
    var t = ms / 1000, dt = Math.min(0.05, t - (onceki || t)); onceki = t;
    if (!gizli) {
      cx.clearRect(0, 0, W, H);
      if (!hareketAz && GUNDUZ[aktif] && t - sonSuru > 9 + Math.random() * 40 && kuslar.length === 0) suru(t);
      kuslar = kuslar.filter(function (k) { k.x += k.vx * dt; k.y += Math.sin(t * 1.3 + k.faz) * 0.05; kusCiz(k, t); return k.x > -30 && k.x < W + 30; });
      yildizlar = yildizlar.filter(function (s) {
        s.t += dt; var k = s.t / 1.1, x = s.x - k * W * 0.35, y = s.y + k * W * 0.12;
        for (var i = 0; i < 14; i++) { cx.globalAlpha = Math.max(0, (1 - i / 14) * (1 - Math.max(0, k - 0.7) / 0.3)); cx.fillStyle = i < 2 ? '#ffffff' : '#cfe6ff'; cx.fillRect(Math.round(x + i * 2.4), Math.round(y - i * 0.82), 1, 1); }
        cx.globalAlpha = 1; return k < 1;
      });
    }
    requestAnimationFrame(dongu);
  }
  document.addEventListener('visibilitychange', function () { gizli = document.hidden; });
  requestAnimationFrame(dongu);

  /* ---------- küçük sürprizler ---------- */
  // 1) gece gökyüzüne dokununca kayan yıldız
  var gok = document.getElementById('gok');
  if (gok) gok.addEventListener('click', function (e) {
    if (e.target.closest('a, button')) return;
    yildizAt(e.clientX / P + W * 0.12, Math.max(4, e.clientY / P - H * 0.06));
    var d = document.createElement('div'); d.className = 'dilek'; d.textContent = (dil === 'en' ? EN : TR).wish; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 2500);
  });
  // 2) logoya art arda 5 kez dokununca Bilgi Puanı yağmuru
  var dokun = [];
  document.getElementById('logo').addEventListener('click', function () {
    var now = Date.now(); dokun = dokun.filter(function (x) { return now - x < 2500; }); dokun.push(now);
    if (dokun.length < 5) return; dokun = [];
    if (hareketAz) return;
    for (var i = 0; i < 28; i++) (function (i) {
      setTimeout(function () { var p = document.createElement('img'); p.src = 'spr-coin.png'; p.alt = ''; p.className = 'para'; p.style.left = (Math.random() * 96) + 'vw'; p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's'; document.body.appendChild(p); setTimeout(function () { p.remove(); }, 3800); }, i * 60);
    })(i);
  });
  // 3) sayfanın en altında dolaşan kedi: sevince kalp çıkarır
  var kedi = document.getElementById('kedi'), yol = kedi && kedi.parentNode;
  if (kedi) {
    var kare = ['spr-kedi_turuncu_0.png', 'spr-kedi_turuncu_1.png'];
    kare.forEach(function (s) { var i = new Image(); i.src = s; });
    var kx = 30, yon = 1, dur = 0, kk = 0, kSon = 0;
    function kediAdim(ms) {
      var w = yol.clientWidth - 78; if (w > 0) {
        if (dur > 0) dur -= 16; else if (!hareketAz) { kx += yon * 0.45; if (kx < 8 || kx > w - 8) { yon *= -1; kx = Math.max(8, Math.min(w - 8, kx)); } if (Math.random() < 0.003) dur = 1800 + Math.random() * 2500; }
        if (ms - kSon > 220) { kSon = ms; if (dur <= 0 && !hareketAz) kk = 1 - kk; }
        kedi.style.backgroundImage = 'url("' + kare[dur > 0 ? 0 : kk] + '")';
        kedi.style.transform = 'translateX(' + Math.round(kx) + 'px) scaleX(' + (yon < 0 ? -1 : 1) + ')';
      }
      requestAnimationFrame(kediAdim);
    }
    requestAnimationFrame(kediAdim);
    kedi.addEventListener('click', function () {
      dur = 2400;
      for (var i = 0; i < 3; i++) (function (i) { setTimeout(function () { var h = document.createElement('span'); h.className = 'kalp'; h.textContent = '♥'; h.style.left = (kx + 24 + i * 12) + 'px'; h.style.bottom = (34 + i * 4) + 'px'; yol.appendChild(h); setTimeout(function () { h.remove(); }, 1400); }, i * 180); })(i);
      var b = document.createElement('span'); b.className = 'balon'; b.textContent = (dil === 'en' ? EN : TR).meow; b.style.left = (kx + 10) + 'px'; yol.appendChild(b); setTimeout(function () { b.remove(); }, 1900);
    });
  }
})();
