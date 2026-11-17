/* POSHAAK — standalone MVP web app. Everything is stored on this device (IndexedDB). */
(function () {
'use strict';

/* ---------- constants ---------- */
var K = function (n) { return 'assets/kaaj/' + n + '.webp'; };
var IC = function (n) { return 'assets/icons/' + n + '.svg'; };
var LOGO = 'assets/poshaak-mark-cocoa.svg';
var OCC = [
  { id: 'college', label: 'College', icon: 'handbag', bg: 'var(--lilac)' },
  { id: 'casual', label: 'Casual', icon: 'tshirt', bg: 'var(--pistachio)' },
  { id: 'work', label: 'Work', icon: 'button', bg: 'var(--raised)' },
  { id: 'party', label: 'Party', icon: 'sparkle', bg: 'var(--apricot)' },
  { id: 'special', label: 'Special occasion', short: 'Special', icon: 'kurta', bg: 'var(--deep)' }
];
var OCC_BY = {}; OCC.forEach(function (o) { OCC_BY[o.id] = o; });
var CATS = [
  { id: 'top', label: 'Top', plural: 'Tops', icon: 'tshirt' },
  { id: 'bottom', label: 'Bottom', plural: 'Bottoms', icon: 'jeans' },
  { id: 'dress', label: 'Dress', plural: 'Dresses', icon: 'dress' },
  { id: 'layer', label: 'Layer', plural: 'Layers', icon: 'button' },
  { id: 'footwear', label: 'Footwear', plural: 'Footwear', icon: 'sneaker' },
  { id: 'accessory', label: 'Accessory', plural: 'Accessories', icon: 'handbag' }
];
var CAT_BY = {}; CATS.forEach(function (c) { CAT_BY[c.id] = c; });
var STYLES = [
  { id: 'casual', label: 'Casual', hint: 'Tees, denim, easy', icon: 'tshirt', bg: 'var(--lilac)' },
  { id: 'minimal', label: 'Minimal', hint: 'Clean, neutral, calm', icon: 'hanger', bg: 'var(--raised)' },
  { id: 'street', label: 'Streetwear', hint: 'Sneakers, oversized', icon: 'sneaker', bg: 'var(--pistachio)' },
  { id: 'ethnic', label: 'Ethnic', hint: 'Kurtas, co-ords, drapes', icon: 'kurta', bg: 'var(--apricot)' },
  { id: 'formal', label: 'Formal', hint: 'Shirts, blazers, crisp', icon: 'button', bg: 'var(--lilac)' },
  { id: 'boho', label: 'Bohemian', hint: 'Flowy, printed, free', icon: 'dress', bg: 'var(--raised)' }
];
// named colours: [name, hex, hue (deg or null for neutral)]
var COLORS = [
  ['White', '#f7f5f0', null], ['Black', '#262222', null], ['Grey', '#9a9a9a', null], ['Beige', '#dcc9a8', null], ['Brown', '#7a5236', null],
  ['Navy', '#283a63', null], ['Denim', '#5f7fa8', null], ['Blue', '#4a7fd1', 215], ['Sky', '#9cc6ea', 205], ['Green', '#5f9c5c', 115],
  ['Olive', '#7c7a3d', 60], ['Mint', '#b4e2c8', 150], ['Yellow', '#efcd45', 48], ['Mustard', '#c99a2e', 42], ['Orange', '#e6813a', 25],
  ['Red', '#c9372f', 2], ['Maroon', '#6e1f2b', 350], ['Pink', '#ef9fbb', 340], ['Lilac', '#b9a6e3', 265], ['Purple', '#7449a6', 275]
];
var COLOR_BY = {}; COLORS.forEach(function (c) { COLOR_BY[c[0]] = { name: c[0], hex: c[1], hue: c[2] }; });
var NEUTRAL = { White: 1, Black: 1, Grey: 1, Beige: 1, Brown: 1, Navy: 1, Denim: 1 };

/* ---------- tiny helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(sel, root) { return (root || document).querySelector(sel); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function svgBack() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>'; }
function svgX() { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'; }
function svgTick(c) { return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + (c || 'currentColor') + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; }
function svgHeart(fill) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="' + (fill || 'none') + '" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20C7 16.5 3.5 13.5 4 9c.4-3.2 4.5-4.2 8 0 3.5-4.2 7.6-3.2 8 0 .5 4.5-3 7.5-8 11z"/></svg>'; }
function svgRefresh() { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg>'; }
function svgThumb(down) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"' + (down ? ' style="transform:rotate(180deg)"' : '') + '><path d="M7 10v10H4V10zM7 10l4-7c1.5 0 2.5 1 2.2 2.6L12.6 9H19a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/></svg>'; }
function svgPlus() { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'; }
function svgLock() { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>'; }
function img(src, alt, style, cls) { return '<img src="' + src + '" alt="' + esc(alt || '') + '"' + (style ? ' style="' + style + '"' : '') + (cls ? ' class="' + cls + '"' : '') + '>'; }
function kaaj(n, size, style) { return '<img class="kaaj" src="' + K(n) + '" alt="" style="width:' + size + 'px;height:' + size + 'px;' + (style || '') + '">'; }

/* ---------- storage (IndexedDB) ---------- */
var db;
function openDB() {
  return new Promise(function (res, rej) {
    var r = indexedDB.open('poshaak', 1);
    r.onupgradeneeded = function () { var d = r.result; d.createObjectStore('items', { keyPath: 'id' }); d.createObjectStore('looks', { keyPath: 'key' }); d.createObjectStore('kv', { keyPath: 'k' }); };
    r.onsuccess = function () { db = r.result; res(db); };
    r.onerror = function () { rej(r.error); };
  });
}
function tx(store, mode, fn) {
  return new Promise(function (res, rej) {
    if (!db) { res(null); return; }
    var t = db.transaction(store, mode), s = t.objectStore(store), out = fn(s);
    t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
    t.onerror = function () { rej(t.error); };
  });
}
function getAll(store) { return tx(store, 'readonly', function (s) { return s.getAll(); }); }
function put(store, v) { return tx(store, 'readwrite', function (s) { s.put(v); }); }
function del(store, k) { return tx(store, 'readwrite', function (s) { s.delete(k); }); }
function clearAll() { return Promise.all(['items', 'looks', 'kv'].map(function (n) { return tx(n, 'readwrite', function (s) { s.clear(); }); })); }
function kvSet(k, v) { return put('kv', { k: k, v: v }); }

/* ---------- app state ---------- */
var S = { profile: null, items: [], looks: [], fb: {}, add: null, rec: null, look: null, toast: null, sheet: null, authMode: 'signup', authErr: {}, wf: 'all', wq: '', sf: 'all', confirmReset: false, onbStep: {} };

/* ---------- image processing ---------- */
function loadImage(file) {
  return new Promise(function (res, rej) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () { res({ im: im, url: url }); };
    im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('decode')); };
    im.src = url;
  });
}
function compress(im, max, q) {
  var w = im.naturalWidth, h = im.naturalHeight, sc = Math.min(1, max / Math.max(w, h));
  var c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
  c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
  return { data: c.toDataURL('image/jpeg', q), w: c.width, h: c.height, canvas: c };
}
function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) { var d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s, l];
}
// Real colour detection: sample the centre of the photo, drop pixels that match the background (corners), take the dominant cluster.
function detectColor(canvas) {
  var N = 48, c = document.createElement('canvas'); c.width = N; c.height = N;
  var x = c.getContext('2d'); x.drawImage(canvas, 0, 0, N, N);
  var d = x.getImageData(0, 0, N, N).data;
  function px(i, j) { var k = (j * N + i) * 4; return [d[k], d[k + 1], d[k + 2]]; }
  var corners = [px(1, 1), px(N - 2, 1), px(1, N - 2), px(N - 2, N - 2)];
  var bg = [0, 1, 2].map(function (q) { return corners.reduce(function (a, c2) { return a + c2[q]; }, 0) / 4; });
  var buckets = {};
  for (var j = Math.floor(N * .2); j < N * .8; j++) for (var i = Math.floor(N * .2); i < N * .8; i++) {
    var p = px(i, j), dist = Math.abs(p[0] - bg[0]) + Math.abs(p[1] - bg[1]) + Math.abs(p[2] - bg[2]);
    if (dist < 42) continue;
    var key = (p[0] >> 5) + ',' + (p[1] >> 5) + ',' + (p[2] >> 5);
    var b2 = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 }); b2.n++; b2.r += p[0]; b2.g += p[1]; b2.b += p[2];
  }
  var best = null; Object.keys(buckets).forEach(function (k) { if (!best || buckets[k].n > best.n) best = buckets[k]; });
  var rgb = best ? [best.r / best.n, best.g / best.n, best.b / best.n] : px(N >> 1, N >> 1);
  return nearestColor(rgb);
}
function nearestColor(rgb) {
  var hsl = rgb2hsl(rgb[0], rgb[1], rgb[2]), h = hsl[0], s = hsl[1], l = hsl[2];
  if (l > .86 && s < .5) return 'White';
  if (l < .15) return 'Black';
  if (s < .14) return l > .62 ? 'White' : (l < .3 ? 'Black' : 'Grey');
  if (h >= 200 && h <= 235 && s < .45) return l < .35 ? 'Navy' : 'Denim';
  if (h >= 20 && h <= 45 && s < .5) return l > .62 ? 'Beige' : (l < .45 ? 'Brown' : 'Beige');
  if (h >= 15 && h <= 40 && l < .38) return 'Brown';
  var bestN = 'Grey', bestD = 1e9;
  COLORS.forEach(function (c) {
    var r = parseInt(c[1].slice(1, 3), 16), g = parseInt(c[1].slice(3, 5), 16), b = parseInt(c[1].slice(5, 7), 16);
    var dd = (r - rgb[0]) * (r - rgb[0]) * .3 + (g - rgb[1]) * (g - rgb[1]) * .59 + (b - rgb[2]) * (b - rgb[2]) * .11;
    if (dd < bestD) { bestD = dd; bestN = c[0]; }
  });
  return bestN;
}

/* ---------- on-device clothing guess (MobileNet via TensorFlow.js, loaded on demand) ---------- */
var modelP = null;
function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
function getModel() {
  if (modelP) return modelP;
  modelP = new Promise(function (res) {
    var done = false, t = setTimeout(function () { if (!done) { done = true; res(null); } }, 20000);
    loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js')
      .then(function () { return loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js'); })
      .then(function () { return window.mobilenet.load({ version: 2, alpha: 0.5 }); })
      .then(function (m) { if (!done) { done = true; clearTimeout(t); res(m); } })
      .catch(function () { if (!done) { done = true; clearTimeout(t); res(null); } });
  });
  return modelP;
}
var LABELS = [
  [/jersey|t-shirt|tee shirt/, 'top', 'T-shirt'], [/sweatshirt/, 'top', 'Sweatshirt'], [/polo/, 'top', 'Polo'],
  [/cardigan/, 'layer', 'Cardigan'], [/\bsuit\b/, 'layer', 'Blazer'], [/trench coat|fur coat|lab coat|parka/, 'layer', 'Jacket'], [/poncho|cloak|shawl/, 'layer', 'Shawl'],
  [/kimono|abaya|gown|sarong|vestment|overskirt/, 'dress', 'Long dress'],
  [/\bjean|denim/, 'bottom', 'Jeans'], [/miniskirt|hoopskirt/, 'bottom', 'Skirt'], [/swimming trunks/, 'bottom', 'Shorts'],
  [/running shoe/, 'footwear', 'Sneakers'], [/sandal/, 'footwear', 'Sandals'], [/clog/, 'footwear', 'Clogs'], [/loafer/, 'footwear', 'Loafers'], [/boot/, 'footwear', 'Boots'],
  [/backpack/, 'accessory', 'Backpack'], [/purse|mailbag|wallet/, 'accessory', 'Bag'], [/sunglass/, 'accessory', 'Sunglasses'], [/bow tie|windsor tie/, 'accessory', 'Tie'],
  [/stole|feather boa/, 'accessory', 'Dupatta'], [/necklace/, 'accessory', 'Necklace'], [/cowboy hat|sombrero|bonnet|hat/, 'accessory', 'Hat'], [/watch/, 'accessory', 'Watch']
];
function classify(canvas) {
  return getModel().then(function (m) {
    if (!m) return null;
    return m.classify(canvas, 5).then(function (preds) {
      for (var i = 0; i < preds.length; i++) {
        var name = preds[i].className.toLowerCase();
        for (var j = 0; j < LABELS.length; j++) if (LABELS[j][0].test(name)) return { cat: LABELS[j][1], type: LABELS[j][2], conf: preds[i].probability };
      }
      return null;
    });
  }).catch(function () { return null; });
}

/* ---------- item knowledge ---------- */
var TYPES = { top: ['T-shirt', 'Shirt', 'Top', 'Kurta', 'Sweatshirt', 'Crop top'], bottom: ['Jeans', 'Trousers', 'Skirt', 'Shorts', 'Cargo pants', 'Palazzo'], dress: ['Dress', 'Long dress', 'Anarkali', 'Co-ord set'], layer: ['Jacket', 'Blazer', 'Cardigan', 'Shawl'], footwear: ['Sneakers', 'Sandals', 'Kolhapuris', 'Heels', 'Loafers', 'Boots'], accessory: ['Bag', 'Sunglasses', 'Watch', 'Dupatta', 'Jewellery', 'Backpack'] };
function defaultOcc(cat, name) {
  var n = (name || '').toLowerCase();
  if (cat === 'accessory') return ['college', 'casual', 'work', 'party', 'special'];
  if (/kurta|anarkali|lehenga|saree|sari|dupatta|kolhapuri|jutti|ethnic/.test(n)) return ['college', 'casual', 'work', 'special'];
  if (cat === 'top') { if (/shirt$|blouse|polo/.test(n) && !/t-shirt|sweat/.test(n)) return ['college', 'work', 'casual']; if (/crop/.test(n)) return ['college', 'casual', 'party']; return ['college', 'casual']; }
  if (cat === 'bottom') { if (/jean/.test(n)) return ['college', 'casual', 'party']; if (/trouser|formal/.test(n)) return ['work', 'college', 'casual']; if (/short/.test(n)) return ['casual']; if (/skirt/.test(n)) return ['college', 'casual', 'party']; return ['college', 'casual', 'work']; }
  if (cat === 'dress') return ['casual', 'party', 'special', 'college'];
  if (cat === 'layer') return /blazer/.test(n) ? ['work', 'party', 'special'] : ['college', 'casual', 'work'];
  if (cat === 'footwear') { if (/heel|boot/.test(n)) return ['party', 'special', 'work']; if (/loafer/.test(n)) return ['work', 'college', 'casual']; if (/sandal|chappal/.test(n)) return ['college', 'casual', 'special']; return ['college', 'casual']; }
  return ['college', 'casual'];
}
function styleTags(name) {
  var n = (name || '').toLowerCase(), t = [];
  if (/kurta|anarkali|lehenga|saree|sari|dupatta|kolhapuri|jutti|palazzo|co-ord/.test(n)) t.push('ethnic');
  if (/blazer|shirt$|trouser|loafer|formal/.test(n)) t.push('formal');
  if (/hoodie|sweatshirt|cargo|sneaker|oversized/.test(n)) t.push('street');
  if (/t-shirt|tee|jean|denim/.test(n)) t.push('casual');
  if (/dress|skirt|print|flow/.test(n)) t.push('boho');
  return t;
}
function itemColor(it) { return COLOR_BY[it.color] || COLOR_BY.Grey; }
function isNeutral(it) { return !!NEUTRAL[it.color]; }

/* ---------- outfit engine: only combines confirmed wardrobe items ---------- */
function hueDist(a, b) { var d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
function pairScore(a, b) {
  if (isNeutral(a) || isNeutral(b)) return isNeutral(a) && isNeutral(b) ? 1.5 : 2;
  if (a.color === b.color) return -1;
  var d = hueDist(itemColor(a).hue, itemColor(b).hue);
  if (d < 45) return 1; if (d > 140) return 1.5; return -0.5;
}
function pickWhy(core, occ) {
  var a = core[0], b = core[1], lines = [];
  if (!b) lines.push('One piece, zero thinking.');
  else if (isNeutral(a) && isNeutral(b)) lines.push('All neutrals: clean and easy to repeat.');
  else if (isNeutral(a) !== isNeutral(b)) { var n = isNeutral(a) ? a : b, c = isNeutral(a) ? b : a; lines.push('The ' + n.color.toLowerCase() + ' ' + typeOf(n) + ' lets your ' + c.color.toLowerCase() + ' ' + typeOf(c) + ' pop.'); }
  else { var d = hueDist(itemColor(a).hue, itemColor(b).hue); lines.push(d > 140 ? a.color + ' and ' + b.color.toLowerCase() + ' are opposites: bold but balanced.' : a.color + ' and ' + b.color.toLowerCase() + ' sit close together: calm and cohesive.'); }
  return lines[0];
}
function typeOf(it) { var n = it.name.toLowerCase(), c = it.color.toLowerCase(); return n.indexOf(c + ' ') === 0 ? n.slice(c.length + 1) : n; }
function lookName(core) {
  var cs = core.map(function (i) { return i.color; }), nonN = core.filter(function (i) { return !isNeutral(i); });
  if (core.length === 1) return nonN.length ? cs[0] + ' moment' : 'Easy one-piece';
  if (!nonN.length) return 'Neutral ease';
  if (nonN.length === 1) return 'Pop of ' + nonN[0].color.toLowerCase();
  return cs[0] + ' × ' + cs[1].toLowerCase();
}
function lookKey(ids) { return ids.slice().sort().join('+'); }
function buildLooks(occ) {
  var pool = S.items.filter(function (i) { return (i.occ || []).indexOf(occ) > -1; });
  var by = {}; CATS.forEach(function (c) { by[c.id] = pool.filter(function (i) { return i.cat === c.id; }); });
  var prefs = (S.profile && S.profile.styles) || [];
  var bases = [];
  by.top.forEach(function (t) { by.bottom.forEach(function (b) { bases.push([t, b]); }); });
  by.dress.forEach(function (d) { bases.push([d]); });
  var out = [];
  bases.forEach(function (core) {
    var base = core.length === 2 ? pairScore(core[0], core[1]) : 1.2;
    var shoes = by.footwear.map(function (f) { return { f: f, s: core.reduce(function (a, c) { return a + pairScore(c, f) * .5; }, 0) }; }).sort(function (x, y) { return y.s - x.s; }).slice(0, 2);
    if (!shoes.length) shoes = [{ f: null, s: -1 }];
    shoes.forEach(function (sh) {
      var parts = core.slice(); if (sh.f) parts.push(sh.f);
      var acc = by.accessory.map(function (a) { return { a: a, s: parts.reduce(function (t, c) { return t + pairScore(c, a) * .3; }, 0) }; }).sort(function (x, y) { return y.s - x.s; })[0];
      if (acc && acc.s > 0) parts.push(acc.a);
      var ids = parts.map(function (p) { return p.id; }), key = occ + ':' + lookKey(ids);
      if (S.fb[key] === 'down') return;
      var score = base + sh.s + (acc && acc.s > 0 ? acc.s : 0);
      parts.forEach(function (p) { (p.tags || []).forEach(function (t) { if (prefs.indexOf(t) > -1) score += .6; }); });
      if (S.fb[key] === 'up') score += 3;
      score += ((parseInt(key.replace(/\D/g, '').slice(-3), 10) || 0) % 7) / 100;
      out.push({ key: key, occ: occ, ids: ids, core: core.map(function (c) { return c.id; }), score: score, name: lookName(core), why: pickWhy(core, occ), noShoes: !sh.f });
    });
  });
  out.sort(function (a, b) { return b.score - a.score; });
  // spread variety: avoid repeating the same core back-to-back
  var res = [], used = {};
  out.forEach(function (l) { var ck = lookKey(l.core); if (!used[ck]) { used[ck] = 1; res.push(l); } });
  out.forEach(function (l) { if (res.indexOf(l) < 0) res.push(l); });
  return res;
}
function missingFor(occ) {
  var pool = S.items.filter(function (i) { return (i.occ || []).indexOf(occ) > -1; });
  var has = function (c) { return pool.some(function (i) { return i.cat === c; }); };
  var miss = [];
  if (!has('dress')) { if (!has('top')) miss.push('A top'); if (!has('bottom')) miss.push('A bottom'); }
  if (!miss.length && !has('dress') && !(has('top') && has('bottom'))) miss.push('A dress, or a top + bottom');
  if (!has('footwear')) miss.push('Shoes');
  return miss;
}
function canStyle() { return OCC.some(function (o) { return buildLooks(o.id).length > 0; }); }
function itemById(id) { for (var i = 0; i < S.items.length; i++) if (S.items[i].id === id) return S.items[i]; return null; }
function lookItems(l) { return l.ids.map(itemById).filter(Boolean); }
function isSaved(key) { return S.looks.some(function (l) { return l.key === key; }); }

/* ---------- routing ---------- */
function go(r) { if (location.hash === '#/' + r) render(); else location.hash = '#/' + r; }
function route() { return (location.hash || '').replace(/^#\/?/, '') || (S.profile ? 'home' : 'welcome'); }
window.addEventListener('hashchange', function () { S.sheet = null; render(); window.scrollTo(0, 0); });

/* ---------- shared UI ---------- */
function nav(active) {
  var t = function (id, href, label, icon) {
    var on = id === active;
    return '<a href="#/' + href + '" class="' + (on ? 'on' : '') + '"' + (on ? ' aria-current="page"' : '') + '><svg width="24" height="24" viewBox="0 0 24 24" fill="' + (on ? '#cfe3a8' : 'none') + '" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icon + '</svg>' + label + '</a>';
  };
  return '<nav class="nav" aria-label="Main">' +
    t('home', 'home', 'Home', '<path d="M4 11l8-6.5 8 6.5V20H4z"/>') +
    t('wardrobe', 'wardrobe', 'Wardrobe', '<path d="M12 9V7.5a2 2 0 1 0-2-2" fill="none"/><path d="M12 9.5L3.5 16h17z"/>') +
    '<a href="#/occasion" class="fab" aria-label="Style me: get outfit ideas"><span>' + img(IC('sparkle'), '') + '</span>Style</a>' +
    t('saved', 'saved', 'Saved', '<path d="M12 20C7 16.5 3.5 13.5 4 9c.4-3.2 4.5-4.2 8 0 3.5-4.2 7.6-3.2 8 0 .5 4.5-3 7.5-8 11z"/>') +
    t('me', 'me', 'Me', '<circle cx="12" cy="9" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.5 7-5.5s5.8 1.9 7 5.5" fill="none"/>') +
    '</nav>';
}
function topBar(backTo, title, right) {
  return '<div class="row between"><a href="#/' + backTo + '" class="icon-btn" aria-label="Back">' + svgBack() + '</a>' + (title ? '<span class="h-s">' + title + '</span>' : '<span></span>') + (right || '<span style="width:44px"></span>') + '</div>';
}
function photoTile(it, extra) {
  if (!it) return '<span class="ph"></span>';
  return '<span class="ph b" style="' + (extra || '') + '"><img class="photo" src="' + it.img + '" alt="' + esc(it.name) + '"></span>';
}
function lookCollage(l, cols) {
  var its = lookItems(l), n = cols || Math.min(4, Math.max(3, its.length)), cells = '';
  for (var i = 0; i < n; i++) cells += its[i] ? photoTile(its[i]) : '<span class="ph" style="opacity:.5"></span>';
  return '<span class="grid' + n + '" style="display:grid">' + cells + '</span>';
}
function toastHTML() {
  if (!S.toast) return '';
  return '<div class="toast" role="status">' + esc(S.toast.text) + (S.toast.href ? '<a href="' + S.toast.href + '">' + esc(S.toast.cta) + '</a>' : '') + '</div>';
}
function flash(text, href, cta) {
  S.toast = { text: text, href: href, cta: cta };
  clearTimeout(flash.t); flash.t = setTimeout(function () { S.toast = null; var t = $('.toast'); if (t) t.remove(); }, 3200);
}

/* ---------- screens ---------- */
var V = {};

V.welcome = function () {
  return '<main class="screen" style="--band:var(--lilac);gap:0">' +
    '<div class="band" style="position:relative;padding-bottom:12px">' +
      '<div class="row" style="justify-content:center;gap:8px">' + img(LOGO, '', 'width:34px;height:34px') + '<span style="font-family:var(--display);font-size:18px;letter-spacing:7px">POSHAAK</span></div>' +
      img(IC('sparkle'), '', 'position:absolute;left:30px;top:calc(var(--safe-t) + 110px);width:36px;transform:rotate(-12deg)') +
      img(IC('button'), '', 'position:absolute;right:30px;top:calc(var(--safe-t) + 90px);width:38px;transform:rotate(14deg)') +
      img(IC('heart'), '', 'position:absolute;right:36px;bottom:30px;width:32px') + img(IC('hanger'), '', 'position:absolute;left:36px;bottom:26px;width:38px') +
      '<div style="margin:22px auto 6px;width:216px;height:232px;background:var(--milk);border:3px solid var(--cocoa);border-radius:58% 42% 52% 48% / 46% 54% 46% 54%;box-shadow:var(--sh-lg);display:flex;align-items:center;justify-content:center;overflow:hidden">' + kaaj('wave', 200) + '</div>' +
    '</div><div class="scallop" style="margin:0 -20px"></div>' +
    '<div class="col" style="gap:14px;margin-top:26px"><h1 class="h-xl">Nothing to wear? <span class="it">Think again.</span></h1><p class="muted" style="margin:0">Snap your clothes. Get outfits for class, chai dates and fest nights.</p></div>' +
    '<div class="col mt-auto" style="gap:12px;padding-top:24px"><a class="btn primary block" href="#/auth">Get started <span aria-hidden="true">→</span></a>' +
    '<p class="center muted small" style="margin:0">Already have an account? <button class="link" data-act="toLogin">Log in</button></p></div></main>';
};

V.auth = function () {
  var su = S.authMode === 'signup', e = S.authErr;
  var f = function (id, label, type, ph, ac) { return '<div class="field"><label class="lbl" for="' + id + '">' + label + '</label><input class="input' + (e[id] ? ' err' : '') + '" id="' + id + '" type="' + type + '" placeholder="' + ph + '" autocomplete="' + ac + '"' + (e[id] ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') + '>' + (e[id] ? '<span class="err-text" id="' + id + '-e">' + e[id] + '</span>' : '') + '</div>'; };
  return '<main class="screen">' +
    '<div class="row between"><a href="#/welcome" class="icon-btn" aria-label="Back">' + svgBack() + '</a><div class="progress" aria-label="Step 1 of 3"><i class="on"></i><i></i><i></i></div><span style="width:44px"></span></div>' +
    '<div class="row between" style="align-items:flex-end"><h1 class="h-l">Let’s get you <span class="it">dressed.</span></h1>' + kaaj('idle', 100, 'margin:-24px -10px -10px 0') + '</div>' +
    '<div class="seg" role="tablist"><button role="tab" aria-selected="' + su + '" class="' + (su ? 'on' : '') + '" data-act="mode" data-v="signup">Sign up</button><button role="tab" aria-selected="' + !su + '" class="' + (su ? '' : 'on') + '" data-act="mode" data-v="login">Log in</button></div>' +
    '<form class="card sticker" id="authForm" novalidate style="box-shadow:var(--sh-lg)"><div class="win-bar"><span class="dots"><i style="background:var(--apricot)"></i><i style="background:var(--pistachio)"></i><i style="background:var(--raised)"></i></span>' + (su ? 'new-closet.poshaak' : 'welcome-back.poshaak') + '</div>' +
    '<div class="col" style="padding:18px;gap:14px">' + (su ? f('name', 'Name', 'text', 'What should Kaaj call you?', 'given-name') : '') + f('email', 'Email', 'email', 'you@college.edu', 'email') + f('pw', 'Password', 'password', 'At least 8 characters', su ? 'new-password' : 'current-password') + (e.form ? '<span class="err-text" role="alert">' + e.form + '</span>' : '') + '</div>' +
    '<button type="submit" class="sr">Submit</button></form>' +
    '<div class="col mt-auto" style="gap:10px"><button class="btn primary block" data-act="auth">' + (su ? 'Create account' : 'Log in') + ' <span aria-hidden="true">→</span></button>' +
    '<p class="center muted xs" style="margin:0">Prototype: your account and photos stay on this phone.</p></div></main>';
};

V.about = function () {
  var p = S.draft || {}, ch = function (list, key) { return list.map(function (l) { var on = p[key] === l; return '<button class="chip' + (on ? ' on' : ' dark-line') + '" style="flex:1;min-width:0;border-radius:14px;min-height:48px;padding:0 6px' + (on ? ';background:var(--lilac);color:var(--cocoa);border-width:3px;box-shadow:var(--sh-sm)' : '') + '" aria-pressed="' + on + '" data-act="draft" data-k="' + key + '" data-v="' + l + '">' + l + '</button>'; }).join(''); };
  return '<main class="screen" style="gap:24px">' +
    '<div class="row between"><a href="#/auth" class="icon-btn" aria-label="Back">' + svgBack() + '</a><div class="progress" aria-label="Step 2 of 3"><i class="on"></i><i class="on"></i><i></i></div><a class="link" href="#/vibe" style="display:flex;align-items:center;text-decoration:none">Skip</a></div>' +
    '<div class="row between" style="align-items:flex-end"><h1 class="h-l">A bit about <span class="it">you</span></h1>' + kaaj('idle', 96, 'margin:-20px -10px -12px 0') + '</div>' +
    '<div class="col"><span class="lbl" id="lw" style="font-weight:700">I usually wear</span><div role="group" aria-labelledby="lw" class="row" style="gap:8px">' + ch(['Womenswear', 'Menswear', 'Both'], 'wear') + '</div></div>' +
    '<div class="col"><span class="lbl" id="la" style="font-weight:700">Age</span><div role="group" aria-labelledby="la" class="row" style="gap:8px">' + ch(['18–20', '21–23', '24–26', '27+'], 'age') + '</div></div>' +
    '<button class="btn primary block mt-auto" data-act="aboutNext">Next <span aria-hidden="true">→</span></button></main>';
};

V.vibe = function () {
  var picked = ((S.draft || S.profile || {}).styles) || [];
  return '<main class="screen">' +
    '<div class="row between"><a href="#/' + (S.profile && S.profile.done ? 'me' : 'about') + '" class="icon-btn" aria-label="Back">' + svgBack() + '</a>' + (S.profile && S.profile.done ? '<span></span>' : '<div class="progress" aria-label="Step 3 of 3"><i class="on"></i><i class="on"></i><i class="on"></i></div>') + '<button class="link" data-act="vibeDone">Skip</button></div>' +
    '<div style="position:relative;padding-right:92px" class="col"><h1 class="h-l">What’s your <span class="it">vibe?</span></h1><p class="muted" style="margin:0">Pick all that feel like you.</p>' + kaaj('love', 88, 'position:absolute;right:-6px;top:-14px') + '</div>' +
    '<div class="grid2">' + STYLES.map(function (s) { var on = picked.indexOf(s.id) > -1; return '<button class="tile' + (on ? ' on' : '') + '" style="background:' + s.bg + '" aria-pressed="' + on + '" data-act="style" data-v="' + s.id + '">' + img(IC(s.icon), '') + '<span class="t-name">' + s.label + '</span><span class="xs muted">' + s.hint + '</span>' + (on ? '<span class="tick">' + svgTick() + '</span>' : '') + '</button>'; }).join('') + '</div>' +
    '<button class="btn primary block mt-auto" data-act="vibeDone">' + (S.profile && S.profile.done ? 'Save' : 'Continue') + ' <span aria-hidden="true">→</span></button></main>';
};

V.home = function () {
  var name = esc((S.profile && S.profile.name) || 'there');
  if (!canStyle()) {
    var has = function (c) { return S.items.some(function (i) { return i.cat === c; }); };
    var req = [['A top', has('top') || has('dress')], ['A bottom (or a dress)', has('bottom') || has('dress')], ['Shoes', has('footwear')]];
    var done = req.filter(function (r) { return r[1]; }).length;
    return '<main class="screen has-nav" style="--band:var(--apricot)">' +
      '<div class="band" style="padding-bottom:6px"><div class="row between"><div class="col" style="gap:4px"><span class="eyebrow" style="color:var(--cocoa)">Welcome in</span><h1 class="h-m">Hey <span class="it-plain">' + name + '</span></h1></div><a href="#/me" class="icon-btn" aria-label="Profile" style="width:48px;height:48px">' + img(LOGO, '', 'width:28px') + '</a></div></div><div class="scallop" style="margin:-18px -20px 0"></div>' +
      '<section class="card sticker" style="box-shadow:var(--sh-lg)"><div class="win-bar"><span class="dots"><i style="background:var(--apricot)"></i><i style="background:var(--pistachio)"></i><i style="background:var(--raised)"></i></span>my-closet · ' + S.items.length + ' items</div>' +
      '<div class="col center" style="padding:6px 18px 20px;gap:10px">' + kaaj(S.items.length ? 'peek' : 'sleep', 120) +
      '<h2 class="h-m" style="text-transform:uppercase;font-size:28px">' + (S.items.length ? 'Almost <span class="it">there</span>' : 'Your closet is <span class="it">snoozing.</span>') + '</h2>' +
      '<div class="col" style="align-self:stretch;gap:6px;text-align:left"><div class="row between small"><b>Outfits unlock with</b><span class="muted">' + done + ' / 3</span></div>' +
      req.map(function (r) { return '<div class="row small" style="gap:8px"><span style="width:24px;height:24px;border-radius:50%;border:2px solid var(--cocoa);display:flex;align-items:center;justify-content:center;background:' + (r[1] ? 'var(--pistachio)' : 'var(--raised)') + '">' + (r[1] ? svgTick() : '') + '</span>' + r[0] + '</div>'; }).join('') + '</div>' +
      '<a class="btn primary block" href="#/add">' + img(IC('camera'), '') + 'Add clothes</a></div></section>' +
      '<div class="row" style="gap:12px;padding:12px 14px;border-radius:22px;border:2px dashed var(--cocoa);background:var(--deep)"><span style="width:52px;height:52px;border-radius:16px;background:var(--raised);border:2px solid var(--cocoa);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + img(IC('sparkle'), '', 'width:32px') + '</span><span class="col grow" style="gap:2px"><b>Outfit ideas</b><span class="xs muted">Built only from your clothes</span></span>' + svgLock() + '</div>' +
      '</main>' + nav('home');
  }
  var occ = S.homeOcc || 'college', looks = buildLooks(occ), pick = looks[0];
  var recent = S.items.slice().sort(function (a, b) { return b.added - a.added; }).slice(0, 4);
  return '<main class="screen has-nav" style="gap:20px">' +
    '<div class="row between"><h1 class="h-m">Hey <span class="it-plain">' + name + '</span></h1><a href="#/me" class="icon-btn" aria-label="Profile" style="width:46px;height:46px">' + img(LOGO, '', 'width:28px') + '</a></div>' +
    '<section style="position:relative;background:var(--lilac);border:2px solid var(--cocoa);border-radius:28px;box-shadow:var(--sh-lg);padding:20px 18px 18px" class="col">' + kaaj('hop', 110, 'position:absolute;right:2px;top:-6px') +
    '<span class="badge">' + img(IC('hanger'), '') + 'From your ' + S.items.length + ' pieces</span>' +
    '<h2 style="max-width:220px;font-size:34px;text-transform:uppercase">What should I <span class="it">wear?</span></h2>' +
    '<div class="chips" role="radiogroup" aria-label="Occasion">' + OCC.map(function (o) { var on = o.id === occ; return '<button role="radio" aria-checked="' + on + '" class="chip dark-line' + (on ? ' on' : '') + '" data-act="homeOcc" data-v="' + o.id + '">' + (o.short || o.label) + '</button>'; }).join('') + '</div>' +
    '<button class="btn primary block" data-act="styleMe" data-v="' + occ + '" style="min-height:60px;font-size:18px">' + img(IC('sparkle'), '') + 'Get outfit ideas</button></section>' +
    (pick ? '<section class="col"><div class="row between"><h3 class="h-s">Today’s <span class="it-plain">pick</span></h3><button class="link" data-act="openLook" data-k="' + esc(pick.key) + '" data-from="home">Open</button></div>' +
      '<button class="card col tap" style="padding:12px;text-align:left;cursor:pointer;gap:10px" data-act="openLook" data-k="' + esc(pick.key) + '" data-from="home">' + lookCollage(pick) +
      '<span class="col" style="gap:2px"><b>' + esc(pick.name) + '</b><span class="xs muted">' + lookItems(pick).map(function (i) { return esc(i.name); }).join(' · ') + '</span></span></button></section>'
      : '<section class="card col center" style="padding:16px;gap:6px">' + kaaj('peek', 80) + '<b>No ' + OCC_BY[occ].label.toLowerCase() + ' look yet</b><span class="xs muted">Missing: ' + missingFor(occ).join(', ') + '</span></section>') +
    '<section class="col"><div class="row between"><h3 class="h-s">Your <span class="it-plain">closet</span></h3><a class="link" href="#/wardrobe" style="display:flex;align-items:center;text-decoration:none">See all ' + S.items.length + '</a></div>' +
    '<div class="grid5">' + recent.map(function (i) { return '<button class="ph b tap" style="padding:0;cursor:pointer" data-act="item" data-id="' + i.id + '" aria-label="' + esc(i.name) + '"><img class="photo" src="' + i.img + '" alt=""></button>'; }).join('') + '<a href="#/add" class="ph empty-ph" aria-label="Add clothes">' + svgPlus() + '</a></div></section>' +
    '</main>' + nav('home');
};

V.add = function () {
  var A = S.add || (S.add = { stage: 'capture', q: [], idx: 0, saved: 0 });
  var head = function (t, right) { return '<div class="row between"><a href="#/home" class="icon-btn" aria-label="Close">' + svgX() + '</a><span class="h-s">' + t + '</span><span style="width:44px;text-align:right" class="small muted"><b>' + (right || '') + '</b></span></div>'; };
  var inputs = '';
  if (A.stage === 'capture') {
    var n = A.q.length;
    return '<main class="screen">' + head('Add clothes') + inputs +
      '<div style="flex:1;min-height:300px;position:relative;background:#2e1a12;border-radius:28px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--milk);padding:24px;text-align:center"><div style="position:absolute;inset:28px;border:3px dashed var(--milk);border-radius:22px;opacity:.6"></div>' +
      '<div style="width:150px;height:150px;border-radius:50%;background:var(--lilac);display:flex;align-items:center;justify-content:center">' + img(IC('tshirt'), '', 'width:104px') + '</div>' +
      '<b style="font-size:17px;position:relative">One item per photo</b><span class="small" style="position:relative;opacity:.9">Lay it flat on a plain surface, good light</span></div>' +
      (n ? '<div class="col" style="gap:8px"><div class="row between small"><b>' + n + ' photo' + (n > 1 ? 's' : '') + ' ready</b><span class="muted">Up to 10 at once</span></div><div class="row" style="gap:8px;overflow-x:auto;padding:4px 2px">' + A.q.map(function (q, i) { return '<span style="position:relative;flex-shrink:0"><span class="ph b" style="width:58px;height:58px">' + '<img class="photo" src="' + q.thumb + '" alt="Photo ' + (i + 1) + '"></span><button class="icon-btn" style="position:absolute;right:-8px;top:-8px;width:28px;height:28px;border-width:1.5px" aria-label="Remove photo ' + (i + 1) + '" data-act="rmShot" data-i="' + i + '">' + svgX() + '</button></span>'; }).join('') + '</div></div>' : '') +
      '<div class="grid2"><button class="btn" data-act="pick" data-v="camIn">' + img(IC('camera'), '') + 'Take photo</button><button class="btn" data-act="pick" data-v="galIn" style="background:var(--apricot)">Gallery</button></div>' +
      '<button class="btn primary block" data-act="process"' + (n ? '' : ' disabled') + '>' + (n ? 'Read ' + n + ' photo' + (n > 1 ? 's' : '') + ' <span aria-hidden="true">→</span>' : 'Add a photo to continue') + '</button></main>';
  }
  if (A.stage === 'processing') {
    var busy = A.q.some(function (q) { return q.status === 'busy'; }), ok = A.q.filter(function (q) { return q.status === 'ok'; }).length;
    return '<main class="screen">' + head('Reading photos') +
      '<div class="row" style="gap:4px">' + kaaj('think', 84, 'margin:-14px -6px -14px -14px') + '<div class="col" style="gap:2px"><b style="font-size:17px">' + (busy ? 'Kaaj is looking…' : ok + ' ready to check') + '</b><span class="small muted">' + (S.modelState === 'off' ? 'Detecting colour. You’ll pick the type.' : 'Guessing type and colour on your phone') + '</span></div></div>' +
      '<div class="col" style="gap:10px">' + A.q.map(function (q, i) {
        var st = q.status, g = q.guess || {};
        return '<div class="card row" style="padding:10px 12px;min-height:66px;gap:12px"><span class="ph" style="width:46px;height:46px;flex-shrink:0' + (st === 'busy' ? ';opacity:.55' : '') + '"><img class="photo" src="' + q.thumb + '" alt=""></span>' +
          '<span class="col grow" style="gap:2px"><b>' + (st === 'ok' ? esc(g.name) : st === 'err' ? 'Couldn’t read this one' : 'Photo ' + (i + 1)) + '</b><span class="xs" style="color:' + (st === 'err' ? '#9c3615' : 'var(--muted)') + '">' + (st === 'ok' ? (g.cat ? CAT_BY[g.cat].label : 'Type: you pick') + ' · ' + g.color : st === 'err' ? 'That file didn’t open as a photo.' : 'Detecting…') + '</span></span>' +
          (st === 'busy' ? '<span class="spin" aria-hidden="true"></span>' : st === 'ok' ? '<span style="width:26px;height:26px;border-radius:50%;background:var(--pistachio);border:2px solid var(--cocoa);display:flex;align-items:center;justify-content:center">' + svgTick() + '</span>' : '<button class="btn sm" data-act="rmShot" data-i="' + i + '">Remove</button>') + '</div>';
      }).join('') + '</div>' +
      '<button class="btn primary block mt-auto" data-act="toReview"' + (!busy && ok ? '' : ' disabled') + '>' + (busy ? 'Hang on…' : ok ? 'Check ' + ok + ' item' + (ok > 1 ? 's' : '') + ' <span aria-hidden="true">→</span>' : 'Nothing to check') + '</button></main>';
  }
  if (A.stage === 'review') {
    var items = A.q.filter(function (q) { return q.status === 'ok'; }), q = items[A.idx], e = q.edit;
    var types = e.cat ? TYPES[e.cat] : [];
    return '<main class="screen" style="gap:14px">' + head('Check details', (A.idx + 1) + '/' + items.length) +
      '<div style="height:200px;border:2px solid var(--cocoa);border-radius:28px;overflow:hidden;box-shadow:var(--sh-md);background:var(--deep)"><img src="' + q.img + '" alt="Your photo" style="width:100%;height:100%;object-fit:contain"></div>' +
      '<div class="row small muted" style="gap:6px">' + kaaj('yes', 40, 'margin:-8px -4px -8px -8px') + (q.guess.cat ? 'Kaaj’s guess. Tap to fix anything.' : '<b style="color:var(--chai)">Kaaj isn’t sure what this is. Pick a type.</b>') + '</div>' +
      '<div class="field"><label class="lbl" for="itName">Name</label><input class="input" id="itName" value="' + esc(e.name) + '" data-input="itName" maxlength="40"></div>' +
      '<div class="col" style="gap:8px"><span class="lbl" id="lc">Type</span><div class="chips" role="radiogroup" aria-labelledby="lc">' + CATS.map(function (c) { var on = e.cat === c.id; return '<button role="radio" aria-checked="' + on + '" class="chip' + (on ? ' on' : '') + '" data-act="edCat" data-v="' + c.id + '">' + c.label + '</button>'; }).join('') + '</div>' +
      (types.length ? '<div class="chips scroll" aria-label="Quick names">' + types.map(function (t) { return '<button class="chip" style="min-height:40px;font-weight:500" data-act="edType" data-v="' + t + '">' + t + '</button>'; }).join('') + '</div>' : '') + '</div>' +
      '<div class="col" style="gap:8px"><span class="lbl" id="lcol">Colour · <span style="font-weight:400">' + e.color + (e.color === q.guess.color ? ' (detected)' : '') + '</span></span><div class="row" role="radiogroup" aria-labelledby="lcol" style="gap:8px;overflow-x:auto;padding:6px 4px">' + COLORS.map(function (c) { var on = e.color === c[0]; return '<button role="radio" aria-checked="' + on + '" aria-label="' + c[0] + '" class="swatch' + (on ? ' on' : '') + '" style="background:' + c[1] + ';flex-shrink:0" data-act="edCol" data-v="' + c[0] + '"></button>'; }).join('') + '</div></div>' +
      '<div class="col" style="gap:8px"><span class="lbl" id="lo">Good for</span><div class="chips" role="group" aria-labelledby="lo">' + OCC.map(function (o) { var on = e.occ.indexOf(o.id) > -1; return '<button aria-pressed="' + on + '" class="chip' + (on ? ' on' : '') + '" data-act="edOcc" data-v="' + o.id + '">' + (o.short || o.label) + '</button>'; }).join('') + '</div></div>' +
      '<div class="row mt-auto" style="gap:10px;padding-top:6px"><button class="btn" data-act="skipItem">Skip</button><button class="btn primary grow" data-act="saveItem"' + (e.cat && e.occ.length ? '' : ' disabled') + '>' + (A.idx + 1 < items.length ? 'Save · next' : 'Save to wardrobe') + '</button></div></main>';
  }
  // done
  return '<main class="screen center" style="justify-content:center">' + kaaj('party', 180, 'margin:0 auto') +
    '<h2 class="h-l">' + A.saved + (A.saved === 1 ? ' piece' : ' pieces') + ' <span class="it">added!</span></h2><p class="muted" style="margin:0">Ready to style with the rest of your closet.</p>' +
    '<div class="col" style="align-self:stretch;margin-top:18px">' + (canStyle() ? '<button class="btn primary block" data-act="styleMe" data-v="' + (S.homeOcc || 'college') + '">' + img(IC('sparkle'), '') + 'Get outfit ideas</button>' : '<p class="small" style="margin:0"><b>Still needed:</b> ' + missingFor('casual').join(', ') + '</p>') +
    '<div class="grid2"><button class="btn" data-act="addMore">Add more</button><a class="btn" href="#/wardrobe">View wardrobe</a></div></div></main>';
};

V.wardrobe = function () {
  var q = S.wq.toLowerCase().trim();
  var list = S.items.filter(function (i) { return (S.wf === 'all' || i.cat === S.wf) && (!q || (i.name + ' ' + i.color + ' ' + CAT_BY[i.cat].label).toLowerCase().indexOf(q) > -1); }).sort(function (a, b) { return b.added - a.added; });
  var cats = [{ id: 'all', plural: 'All' }].concat(CATS);
  return '<main class="screen has-nav" style="gap:14px">' +
    '<div class="row between"><h1 class="h-m">My <span class="it-plain">wardrobe</span></h1><span class="row" style="gap:10px"><span class="small muted"><b>' + S.items.length + '</b></span><a class="btn sm primary" href="#/add" style="box-shadow:var(--sh-sm)">' + svgPlus() + 'Add</a></span></div>' +
    (S.items.length ? '<div style="position:relative"><label class="sr" for="q">Search wardrobe</label><input class="input" id="q" type="search" placeholder="Search your clothes" value="' + esc(S.wq) + '" data-input="wq" style="border-radius:999px;min-height:46px;background:var(--raised);padding-left:18px"></div>' +
    '<div class="chips scroll" role="group" aria-label="Category">' + cats.map(function (c) { var on = S.wf === c.id; return '<button class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="wf" data-v="' + c.id + '">' + c.plural + '</button>'; }).join('') + '</div>' : '') +
    (list.length ? '<div class="grid3">' + list.map(function (i) { return '<button class="col tap" style="gap:6px;background:none;border:0;padding:0;text-align:left;cursor:pointer" data-act="item" data-id="' + i.id + '"><span class="ph b" style="width:100%"><img class="photo" src="' + i.img + '" alt=""></span><span class="xs" style="font-weight:700;line-height:1.2">' + esc(i.name) + '</span></button>'; }).join('') + '</div>'
      : '<div class="col center" style="padding-top:24px;gap:8px">' + kaaj(S.items.length ? 'peek' : 'sleep', 130) + '<b>' + (S.items.length ? 'No matches' : 'Nothing here yet') + '</b><span class="small muted">' + (S.items.length ? 'Try another word or category.' : 'Snap a few pieces to start.') + '</span>' + (S.items.length ? '' : '<a class="btn primary" href="#/add" style="margin-top:8px">' + img(IC('camera'), '') + 'Add clothes</a>') + '</div>') +
    '</main>' + nav('wardrobe');
};

V.occasion = function () {
  var cur = S.pickOcc || S.homeOcc || 'college';
  return '<main class="screen" style="gap:20px">' + topBar('home') +
    '<div class="row between" style="align-items:flex-end"><h1 class="h-l">Where to <span class="it">today?</span></h1>' + kaaj('think', 110, 'margin:-30px -14px -14px 0') + '</div>' +
    '<div class="grid2" role="radiogroup" aria-label="Occasion">' + OCC.map(function (o) { var on = o.id === cur, wide = o.id === 'special'; return '<button role="radio" aria-checked="' + on + '" class="tile' + (on ? ' on' : '') + '" style="background:' + o.bg + (wide ? ';grid-column:span 2;flex-direction:row;align-items:center;gap:14px;min-height:84px' : ';justify-content:space-between;min-height:118px') + '" data-act="pickOcc" data-v="' + o.id + '">' + img(IC(o.icon), '', 'width:48px;height:48px') + '<span class="t-name">' + o.label + '</span></button>'; }).join('') + '</div>' +
    '<span class="badge" style="align-self:center">' + img(IC('hanger'), '') + 'Uses only your ' + S.items.length + ' pieces</span>' +
    '<button class="btn primary block mt-auto" data-act="styleMe" data-v="' + cur + '" style="min-height:58px">' + img(IC('sparkle'), '') + 'Style me</button></main>';
};

V.recs = function () {
  var R = S.rec; if (!R) { go('occasion'); return ''; }
  var page = R.list.slice(0, (R.page + 1) * 3), more = R.list.length > page.length, empty = !R.loading && R.list.length === 0;
  return '<main class="screen" style="gap:14px">' +
    '<div class="row between"><a href="#/home" class="icon-btn" aria-label="Back to home">' + svgBack() + '</a><span class="badge">' + img(IC('hanger'), '') + 'Only your clothes</span></div>' +
    '<h1 class="h-l" style="font-size:34px">' + (R.loading ? 'Styling <span class="it">you…</span>' : empty ? 'Hmm, <span class="it">not yet</span>' : R.list.length + (R.list.length === 1 ? ' look' : ' looks') + ' <span class="it">for you</span>') + '</h1>' +
    '<div class="chips scroll" role="radiogroup" aria-label="Occasion">' + OCC.map(function (o) { var on = o.id === R.occ; return '<button role="radio" aria-checked="' + on + '" class="chip' + (on ? ' on' : '') + '" data-act="recOcc" data-v="' + o.id + '">' + (o.short || o.label) + '</button>'; }).join('') + '</div>' +
    (R.loading ? '<div class="col center" style="gap:12px">' + kaaj('think', 150) + '<b>Matching your pieces…</b><div class="pulse" style="align-self:stretch;height:130px;border-radius:22px;background:var(--deep)"></div></div>'
    : empty ? '<div class="col center" style="gap:10px;flex:1" role="status">' + kaaj('sleep', 140) + '<h2 class="h-s" style="font-size:26px">Not enough for <span class="it">' + OCC_BY[R.occ].label.toLowerCase() + '</span> yet</h2><p class="small muted" style="margin:0">Kaaj won’t invent clothes. You’re missing:</p><div class="chips" style="justify-content:center">' + missingFor(R.occ).map(function (m) { return '<span class="chip" style="border:2px dashed var(--cocoa);cursor:default">' + m + '</span>'; }).join('') + '</div><p class="xs muted" style="margin:0">Or tag more pieces as “' + (OCC_BY[R.occ].short || OCC_BY[R.occ].label) + '” in your wardrobe.</p><a class="btn primary block mt-auto" href="#/add">' + img(IC('camera'), '') + 'Add pieces</a></div>'
    : '<div class="col" style="gap:14px">' + page.map(function (l) {
        var sv = isSaved(l.key);
        return '<div class="card sticker"><button class="tap" style="display:block;width:100%;padding:12px;border:0;border-bottom:2px solid var(--cocoa);background:var(--lilac);cursor:pointer" data-act="openLook" data-k="' + esc(l.key) + '" data-from="recs" aria-label="Open ' + esc(l.name) + '">' + lookCollage(l) + '</button>' +
          '<div class="row" style="padding:10px 8px 12px 14px;gap:10px"><button class="col grow" style="gap:3px;background:none;border:0;padding:0;text-align:left;cursor:pointer" data-act="openLook" data-k="' + esc(l.key) + '" data-from="recs"><span style="font-family:var(--display);font-size:20px;line-height:1">' + esc(l.name) + '</span><span class="xs muted">' + lookItems(l).map(function (i) { return esc(i.name); }).join(' · ') + '</span><span class="xs"><b>' + esc(l.why) + '</b></span></button>' +
          '<button class="icon-btn" style="width:48px;height:48px;' + (sv ? 'background:var(--cocoa);color:var(--apricot)' : '') + '" aria-pressed="' + sv + '" aria-label="' + (sv ? 'Saved' : 'Save look') + '" data-act="saveLook" data-k="' + esc(l.key) + '">' + svgHeart(sv ? '#f4b98e' : 'none') + '</button></div></div>';
      }).join('') +
      (!more && R.page > 0 ? '<div class="row small" role="status" style="padding:10px 14px;border-radius:18px;background:var(--deep)">' + kaaj('peek', 44, 'margin:-8px 0') + 'That’s every combo for now. Add pieces for more.</div>' : '') + '</div>' +
      '<button class="btn block mt-auto" data-act="moreLooks"' + (more ? '' : ' disabled') + '>' + svgRefresh() + (more ? 'Another look' : 'All looks shown') + '</button>') +
    '</main>';
};

V.look = function () {
  var L = S.look; if (!L || !lookItems(L).length) { go('home'); return ''; }
  var its = lookItems(L), sv = isSaved(L.key), fb = S.fb[L.key];
  var band = ['var(--lilac)', 'var(--apricot)', 'var(--pistachio)'][(L.key.length) % 3];
  var pos = [['left:12%;top:20px;width:132px;height:132px;border-radius:50%;transform:rotate(-6deg)'], ['right:10%;top:30px;width:118px;height:156px;border-radius:28px;transform:rotate(5deg)'], ['left:20%;top:166px;width:112px;height:96px;border-radius:24px;transform:rotate(4deg)'], ['right:16%;top:196px;width:88px;height:88px;border-radius:50%;transform:rotate(-8deg)']];
  if (its.length === 2 && its[0].cat === 'dress') pos[0] = ['left:14%;top:20px;width:150px;height:200px;border-radius:30px;transform:rotate(-4deg)'];
  return '<main class="screen" style="--band:' + band + ';gap:14px">' +
    '<div class="band" style="padding-bottom:0"><div class="row between" style="position:relative;z-index:2"><a href="#/' + (S.lookFrom || 'recs') + '" class="icon-btn" aria-label="Back">' + svgBack() + '</a><span class="chip dark-line" style="min-height:36px;cursor:default">' + OCC_BY[L.occ].label + '</span></div>' +
    '<div class="flatlay" style="margin:0 -20px;height:290px">' + its.slice(0, 4).map(function (it, i) { return '<span class="p" style="' + pos[i][0] + '"><img src="' + it.img + '" alt="' + esc(it.name) + '"></span>'; }).join('') + (sv ? kaaj('party', 110, 'position:absolute;right:0;bottom:-10px') : '') + '</div></div><div class="scallop" style="margin:-18px -20px 0"></div>' +
    '<div class="row between" style="align-items:flex-start;gap:12px"><div class="col" style="gap:4px"><h1 class="h-m" style="font-size:32px">' + esc(L.name) + '</h1><p style="margin:0;font-size:15px">' + esc(L.why) + '</p></div>' +
    '<div class="row" role="group" aria-label="Rate this look" style="gap:6px"><button class="icon-btn" style="' + (fb === 'up' ? 'background:var(--cocoa);color:var(--milk)' : '') + '" aria-pressed="' + (fb === 'up') + '" aria-label="More like this" data-act="fb" data-v="up">' + svgThumb() + '</button><button class="icon-btn" style="' + (fb === 'down' ? 'background:var(--cocoa);color:var(--milk)' : '') + '" aria-pressed="' + (fb === 'down') + '" aria-label="Not for me" data-act="fb" data-v="down">' + svgThumb(true) + '</button></div></div>' +
    '<span class="row xs muted" style="gap:6px;font-weight:700">' + img(IC('hanger'), '', 'width:18px') + 'All ' + its.length + ' pieces from your wardrobe' + (L.noShoes ? ' · add shoes to finish it' : '') + '</span>' +
    '<div class="grid2" style="gap:8px">' + its.map(function (it) { return '<button class="row tap" style="gap:10px;background:var(--raised);border:2px solid var(--line);border-radius:16px;padding:8px;text-align:left;cursor:pointer" data-act="item" data-id="' + it.id + '"><span class="ph" style="width:42px;height:42px;flex-shrink:0"><img class="photo" src="' + it.img + '" alt=""></span><span class="xs" style="line-height:1.25"><b>' + esc(it.name) + '</b><br><span class="muted">' + CAT_BY[it.cat].label + '</span></span></button>'; }).join('') + '</div>' +
    '<div class="row mt-auto" style="gap:10px"><button class="btn" data-act="anotherLook">' + svgRefresh() + 'Another</button><button class="btn grow ' + (sv ? 'dark' : 'primary') + '" aria-pressed="' + sv + '" data-act="saveLook" data-k="' + esc(L.key) + '">' + svgHeart(sv ? '#f4b98e' : 'none') + (sv ? 'Saved' : 'Save look') + '</button></div></main>';
};

V.saved = function () {
  var list = S.looks.filter(function (l) { return S.sf === 'all' || l.occ === S.sf; }).sort(function (a, b) { return b.saved - a.saved; }).filter(function (l) { return lookItems(l).length; });
  return '<main class="screen has-nav" style="gap:14px"><div class="row between"><h1 class="h-m">Saved <span class="it-plain">looks</span></h1><span class="small muted"><b>' + list.length + '</b></span></div>' +
    (S.looks.length ? '<div class="chips scroll" role="group" aria-label="Occasion">' + [{ id: 'all', label: 'All' }].concat(OCC).map(function (o) { var on = S.sf === o.id; return '<button class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="sf" data-v="' + o.id + '">' + (o.short || o.label) + '</button>'; }).join('') + '</div>' : '') +
    (list.length ? '<div class="grid2" style="gap:14px">' + list.map(function (l) { return '<button class="card sticker col tap" style="padding:0;gap:0;text-align:left;cursor:pointer" data-act="openLook" data-k="' + esc(l.key) + '" data-from="saved"><span style="display:block;padding:10px;background:var(--lilac);border-bottom:2px solid var(--cocoa)">' + lookCollage(l, 2) + '</span><span class="col" style="padding:10px 12px 12px;gap:2px"><span style="font-family:var(--display);font-size:18px;line-height:1.1">' + esc(l.name) + '</span><span class="xs muted"><b>' + (OCC_BY[l.occ].short || OCC_BY[l.occ].label) + '</b></span></span></button>'; }).join('') + '</div>'
      : '<div class="col center grow" style="justify-content:center;gap:10px">' + kaaj('peek', 150) + '<p class="h-s" style="margin:0">Nothing saved ' + (S.looks.length ? 'here ' : '') + 'yet</p><span class="small muted">Tap the heart on a look you love.</span><a class="btn primary" href="#/occasion">' + img(IC('sparkle'), '') + 'Find a look</a></div>') +
    '</main>' + nav('saved');
};

V.me = function () {
  var p = S.profile || {};
  return '<main class="screen has-nav"><div class="row between"><h1 class="h-m">Hi <span class="it-plain">' + esc(p.name || 'there') + '</span></h1>' + img(LOGO, '', 'width:40px') + '</div>' +
    '<div class="grid2"><div class="card col" style="padding:14px;gap:2px;background:var(--pistachio)"><span style="font-family:var(--display);font-size:32px">' + S.items.length + '</span><span class="small"><b>pieces</b></span></div><div class="card col" style="padding:14px;gap:2px;background:var(--lilac)"><span style="font-family:var(--display);font-size:32px">' + S.looks.length + '</span><span class="small"><b>saved looks</b></span></div></div>' +
    '<a class="card row tap" href="#/vibe" style="padding:14px;text-decoration:none;color:var(--cocoa)"><span class="col grow" style="gap:2px"><b>Style preferences</b><span class="xs muted">' + ((p.styles || []).map(function (s) { for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === s) return STYLES[i].label; }).join(', ') || 'None picked') + '</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></a>' +
    '<div class="card col" style="padding:14px;gap:6px;background:var(--deep);border-style:dashed"><b>Your data stays on this phone</b><span class="xs muted">Photos, wardrobe and looks are stored in this browser only. Nothing is uploaded. The clothing guess runs on your device.</span></div>' +
    (S.confirmReset ? '<div class="card col" role="alert" style="padding:14px;gap:10px;border-color:#9c3615"><b>Delete everything?</b><span class="small muted">This removes your profile, all clothes and saved looks from this phone.</span><div class="grid2"><button class="btn sm" data-act="resetNo">Cancel</button><button class="btn sm dark" data-act="resetYes">Delete all</button></div></div>' : '<button class="btn sm" data-act="resetAsk" style="align-self:flex-start">Reset app data</button>') +
    '</main>' + nav('me');
};

function itemSheet() {
  var it = itemById(S.sheet); if (!it) return '';
  return '<div class="sheet-bg" data-act="closeSheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(it.name) + '" data-stop="1"><span class="grabber"></span>' +
    '<div style="height:230px;border:2px solid var(--cocoa);border-radius:24px;overflow:hidden;background:var(--deep)"><img src="' + it.img + '" alt="' + esc(it.name) + '" style="width:100%;height:100%;object-fit:contain"></div>' +
    '<div class="row between"><div class="col" style="gap:2px"><h2 class="h-s" style="font-size:26px">' + esc(it.name) + '</h2><span class="small muted">' + CAT_BY[it.cat].label + ' · ' + it.color + '</span></div><span class="swatch" style="background:' + itemColor(it).hex + ';cursor:default"></span></div>' +
    '<div class="col" style="gap:8px"><span class="lbl" id="sg">Good for</span><div class="chips" role="group" aria-labelledby="sg">' + OCC.map(function (o) { var on = (it.occ || []).indexOf(o.id) > -1; return '<button class="chip' + (on ? ' on' : '') + '" aria-pressed="' + on + '" data-act="itemOcc" data-v="' + o.id + '">' + (o.short || o.label) + '</button>'; }).join('') + '</div></div>' +
    '<div class="grid2"><button class="btn" data-act="delItem">Remove</button><button class="btn primary" data-act="closeSheet">Done</button></div></div></div>';
}

/* ---------- render ---------- */
var AUTHED = { home: 1, add: 1, wardrobe: 1, occasion: 1, recs: 1, look: 1, saved: 1, me: 1 };
function render() {
  var r = route();
  if (AUTHED[r] && !(S.profile && S.profile.done)) { location.replace('#/welcome'); r = 'welcome'; }
  var fn = V[r] || V.home;
  var y = window.scrollY, focusId = document.activeElement && document.activeElement.id, selStart = document.activeElement && document.activeElement.selectionStart;
  $('#app').innerHTML = fn() + (S.sheet ? itemSheet() : '') + toastHTML();
  if (render.keep) { window.scrollTo(0, y); render.keep = false; }
  if (focusId && (focusId === 'q' || focusId === 'itName')) { var el = document.getElementById(focusId); if (el) { el.focus(); try { el.setSelectionRange(selStart, selStart); } catch (e) {} } }
}
function rerender() { render.keep = true; render(); }

/* ---------- actions ---------- */
var A = {
  toLogin: function () { S.authMode = 'login'; S.authErr = {}; go('auth'); },
  mode: function (d) { S.authMode = d.v; S.authErr = {}; rerender(); },
  auth: function () {
    var su = S.authMode === 'signup', e = {}, nm = su ? $('#name').value.trim() : '', em = $('#email').value.trim(), pw = $('#pw').value;
    if (su && !nm) e.name = 'Tell Kaaj your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) e.email = 'That email looks incomplete, e.g. you@college.edu';
    if (pw.length < 8) e.pw = 'Use at least 8 characters.';
    if (!su && !e.email && (!S.profile || S.profile.email !== em.toLowerCase())) e.form = 'No account on this phone for that email. Try Sign up.';
    S.authErr = e;
    if (Object.keys(e).length) { rerender(); var f = $('.input.err'); if (f) f.focus(); return; }
    if (su) { S.draft = { name: nm, email: em.toLowerCase(), wear: 'Womenswear', age: '18–20', styles: [] }; go('about'); }
    else go('home');
  },
  draft: function (d) { S.draft = S.draft || {}; S.draft[d.k] = d.v; rerender(); },
  aboutNext: function () { go('vibe'); },
  style: function (d) {
    S.draft = S.draft || Object.assign({}, S.profile || {}); var a = (S.draft.styles || []).slice(), i = a.indexOf(d.v);
    if (i > -1) a.splice(i, 1); else a.push(d.v); S.draft.styles = a; rerender();
  },
  vibeDone: function () {
    var editing = S.profile && S.profile.done;
    S.profile = Object.assign({}, S.profile || {}, S.draft || {}, { done: true });
    kvSet('profile', S.profile); S.draft = null;
    if (editing) { flash('Style preferences saved'); go('me'); } else go('home');
  },
  homeOcc: function (d) { S.homeOcc = d.v; rerender(); },
  pickOcc: function (d) { S.pickOcc = d.v; rerender(); },
  styleMe: function (d) { startRecs(d.v); },
  recOcc: function (d) { if (S.rec && d.v !== S.rec.occ) startRecs(d.v, true); },
  moreLooks: function () { S.rec.page++; rerender(); },
  openLook: function (d) {
    var key = d.k, l = null;
    if (S.rec) S.rec.list.forEach(function (x) { if (x.key === key) l = x; });
    if (!l) S.looks.forEach(function (x) { if (x.key === key) l = x; });
    if (!l) { var occ = key.split(':')[0]; buildLooks(occ).forEach(function (x) { if (x.key === key) l = x; }); if (!S.rec || S.rec.occ !== occ) S.rec = { occ: occ, list: buildLooks(occ), page: 0 }; }
    if (!l) return;
    S.look = l; S.lookFrom = d.from || 'recs'; go('look');
  },
  anotherLook: function () {
    var L = S.look, list = (S.rec && S.rec.occ === L.occ) ? S.rec.list : buildLooks(L.occ);
    if (list.length < 2) { flash('That’s the only combo for now. Add pieces for more.'); rerender(); return; }
    var i = -1; list.forEach(function (x, k) { if (x.key === L.key) i = k; });
    S.look = list[(i + 1) % list.length]; rerender(); window.scrollTo(0, 0);
  },
  saveLook: function (d) {
    var key = d.k, l = null;
    if (isSaved(key)) { S.looks = S.looks.filter(function (x) { return x.key !== key; }); del('looks', key); flash('Removed from saved'); rerender(); return; }
    if (S.look && S.look.key === key) l = S.look; else if (S.rec) S.rec.list.forEach(function (x) { if (x.key === key) l = x; });
    if (!l) return;
    var rec = { key: l.key, occ: l.occ, ids: l.ids, core: l.core, name: l.name, why: l.why, noShoes: l.noShoes, saved: Date.now() };
    S.looks.push(rec); put('looks', rec); flash('Saved to your looks', '#/saved', 'View'); rerender();
  },
  fb: function (d) {
    var k = S.look.key; S.fb[k] = S.fb[k] === d.v ? null : d.v; kvSet('fb', S.fb);
    if (S.fb[k] === 'down') flash('Got it. Kaaj won’t suggest this one again.');
    else if (S.fb[k] === 'up') flash('Noted! More like this.');
    if (S.rec && S.rec.occ === S.look.occ) S.rec.list = buildLooks(S.look.occ);
    rerender();
  },
  sf: function (d) { S.sf = d.v; rerender(); },
  wf: function (d) { S.wf = d.v; rerender(); },
  item: function (d) { S.sheet = d.id; rerender(); },
  closeSheet: function () { S.sheet = null; rerender(); },
  itemOcc: function (d) {
    var it = itemById(S.sheet); var a = (it.occ || []).slice(), i = a.indexOf(d.v);
    if (i > -1) { if (a.length === 1) { flash('Keep at least one occasion'); rerender(); return; } a.splice(i, 1); } else a.push(d.v);
    it.occ = a; put('items', it); rerender();
  },
  delItem: function () {
    var id = S.sheet; S.items = S.items.filter(function (i) { return i.id !== id; }); del('items', id);
    S.looks.filter(function (l) { return l.ids.indexOf(id) > -1; }).forEach(function (l) { del('looks', l.key); });
    S.looks = S.looks.filter(function (l) { return l.ids.indexOf(id) < 0; });
    S.sheet = null; flash('Removed from wardrobe'); if (route() === 'look') go('home'); else rerender();
  },
  resetAsk: function () { S.confirmReset = true; rerender(); },
  resetNo: function () { S.confirmReset = false; rerender(); },
  resetYes: function () { clearAll().then(function () { S.profile = null; S.items = []; S.looks = []; S.fb = {}; S.confirmReset = false; S.add = null; S.rec = null; go('welcome'); }); },
  pick: function (d) { var el = document.getElementById(d.v); if (el) { el.value = ''; el.click(); } },
  rmShot: function (d) { S.add.q.splice(+d.i, 1); if (S.add.stage === 'processing' && !S.add.q.length) S.add.stage = 'capture'; rerender(); },
  process: function () { processQueue(); },
  toReview: function () { S.add.stage = 'review'; S.add.idx = 0; render(); window.scrollTo(0, 0); },
  edCat: function (d) { var e = curEdit(); e.cat = d.v; e.occ = defaultOcc(d.v, e.name); rerender(); },
  edType: function (d) { var e = curEdit(); e.name = e.color + ' ' + d.v.toLowerCase(); e.occ = defaultOcc(e.cat, e.name); rerender(); },
  edCol: function (d) { var e = curEdit(), old = e.color; if (e.name.indexOf(old + ' ') === 0) e.name = d.v + e.name.slice(old.length); e.color = d.v; rerender(); },
  edOcc: function (d) { var e = curEdit(), i = e.occ.indexOf(d.v); if (i > -1) e.occ.splice(i, 1); else e.occ.push(d.v); rerender(); },
  saveItem: function () {
    var e = curEdit(), q = curReview(); if (!e.cat || !e.occ.length) return;
    var it = { id: uid(), img: q.img, name: (e.name || e.color + ' ' + CAT_BY[e.cat].label.toLowerCase()).trim(), cat: e.cat, color: e.color, occ: e.occ.slice(), tags: styleTags(e.name), added: Date.now(), guessed: q.guess.cat || null };
    S.items.push(it); put('items', it); S.add.saved++; nextReview();
  },
  skipItem: function () { nextReview(); },
  addMore: function () { S.add = null; rerender(); }
};
function curReview() { var items = S.add.q.filter(function (q) { return q.status === 'ok'; }); return items[S.add.idx]; }
function curEdit() { return curReview().edit; }
function nextReview() {
  var n = S.add.q.filter(function (q) { return q.status === 'ok'; }).length;
  if (S.add.idx + 1 < n) S.add.idx++; else S.add.stage = 'done';
  render(); window.scrollTo(0, 0);
}
function startRecs(occ, keepScreen) {
  S.homeOcc = occ; S.pickOcc = occ;
  S.rec = { occ: occ, list: [], page: 0, loading: true };
  if (keepScreen && route() === 'recs') rerender(); else go('recs');
  setTimeout(function () { if (!S.rec || S.rec.occ !== occ) return; S.rec.list = buildLooks(occ); S.rec.loading = false; if (route() === 'recs') rerender(); }, 650);
}

/* ---------- photo pipeline ---------- */
function addFiles(files) {
  var A2 = S.add, room = 10 - A2.q.length;
  Array.prototype.slice.call(files, 0, room).forEach(function (f) {
    var entry = { id: uid(), file: f, thumb: '', status: 'new' };
    A2.q.push(entry);
    loadImage(f).then(function (r) { entry.thumb = compress(r.im, 160, .7).data; URL.revokeObjectURL(r.url); rerender(); })
      .catch(function () { entry.thumb = IC('tshirt'); entry.bad = true; rerender(); });
  });
  if (files.length > room) flash('Up to 10 photos at a time');
  rerender();
}
function processQueue() {
  var A2 = S.add; A2.stage = 'processing'; A2.q.forEach(function (q) { q.status = 'busy'; }); render();
  if (S.modelState !== 'off') getModel().then(function (m) { S.modelState = m ? 'on' : 'off'; });
  var chain = Promise.resolve();
  A2.q.forEach(function (q) {
    chain = chain.then(function () {
      return loadImage(q.file).then(function (r) {
        var full = compress(r.im, 900, .82); URL.revokeObjectURL(r.url);
        q.img = full.data;
        var color = detectColor(full.canvas);
        return classify(full.canvas).then(function (g) {
          var cat = g ? g.cat : null, type = g ? g.type : (cat ? CAT_BY[cat].label : 'piece');
          q.guess = { cat: cat, color: color, name: color + ' ' + type.toLowerCase(), conf: g ? g.conf : 0 };
          q.edit = { cat: cat, color: color, name: g ? q.guess.name : color + ' ', occ: cat ? defaultOcc(cat, q.guess.name) : [] };
          q.status = 'ok';
        });
      }).catch(function () { q.status = 'err'; }).then(function () { if (route() === 'add') rerender(); });
    });
  });
}

/* ---------- events ---------- */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]'); if (!el) return;
  if (el.dataset.act === 'closeSheet' && e.target.closest('[data-stop]') && el.classList.contains('sheet-bg')) return;
  var fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'BUTTON' && el.disabled) return;
  e.preventDefault(); fn(el.dataset);
});
document.addEventListener('submit', function (e) { if (e.target.id === 'authForm') { e.preventDefault(); A.auth(); } });
document.addEventListener('change', function (e) { if (e.target.dataset && e.target.dataset.change === 'files' && e.target.files && e.target.files.length) addFiles(e.target.files); });
document.addEventListener('input', function (e) {
  var k = e.target.dataset && e.target.dataset.input; if (!k) return;
  if (k === 'wq') { S.wq = e.target.value; rerender(); }
  if (k === 'itName') { curEdit().name = e.target.value; var b = $('[data-act="saveItem"]'); }
});
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet) { S.sheet = null; rerender(); } });

/* ---------- boot ---------- */
openDB().then(function () { return Promise.all([getAll('items'), getAll('looks'), getAll('kv')]); }).then(function (r) {
  S.items = r[0] || []; S.looks = r[1] || [];
  (r[2] || []).forEach(function (kv) { if (kv.k === 'profile') S.profile = kv.v; if (kv.k === 'fb') S.fb = kv.v || {}; });
}).catch(function () {}).then(function () {
  render();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});
});
})();
