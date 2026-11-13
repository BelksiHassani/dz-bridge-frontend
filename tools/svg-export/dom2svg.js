/* dom2svg — turns the rendered page into a vector SVG (shapes + live text).
   Injected by export_svg.py; call window.__dom2svg() once the page is in the wanted state.
   Covers what the DZ-Bridge pages use: solid / linear / radial / tiled backgrounds, masks,
   borders, radii, box-shadows, opacity, overflow clipping, inline SVG, <img>, inputs and text. */
window.__dom2svg = function () {
  'use strict';
  var defs = [], topLayer = [], uid = 0;
  var SX = window.scrollX, SY = window.scrollY;
  function nid(p) { return p + (++uid); }
  function n(v) { return Math.round(v * 100) / 100; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cs(el, p) { return getComputedStyle(el, p || null); }

  /* ---------- colours ---------- */
  var cctx = document.createElement('canvas').getContext('2d');
  function parseColor(c) {
    if (!c) return null;
    c = c.trim();
    if (c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    var m = c.match(/^rgba?\(([^)]+)\)$/), p;
    if (m) { p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = c.match(/^color\(srgb\s+([^)]+)\)$/);
    if (m) { p = m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; }
    m = c.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      var h = m[1];
      if (h.length <= 4) h = h.split('').map(function (x) { return x + x; }).join('');
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length > 6 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
    }
    cctx.fillStyle = '#010203'; cctx.fillStyle = c;
    var v = cctx.fillStyle;
    return (v !== '#010203' && v !== c) ? parseColor(v) : null;
  }
  function hex(c) { return '#' + [c.r, c.g, c.b].map(function (v) { return ('0' + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(''); }
  function paint(c, prop) { prop = prop || 'fill'; return prop + '="' + hex(c) + '"' + (c.a < 1 ? ' ' + prop + '-opacity="' + n(c.a) + '"' : ''); }

  /* ---------- geometry ---------- */
  function boxOf(el) { var b = el.getBoundingClientRect(); return { x: b.left + SX, y: b.top + SY, w: b.width, h: b.height }; }
  function radiiOf(s, box) {
    var r = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(function (k) {
      var v = s[k].split(' ')[0];
      return v.indexOf('%') > -1 ? parseFloat(v) / 100 * Math.min(box.w, box.h) : (parseFloat(v) || 0);
    });
    var f = Math.min(1, box.w / ((r[0] + r[1]) || 1), box.w / ((r[3] + r[2]) || 1), box.h / ((r[0] + r[3]) || 1), box.h / ((r[1] + r[2]) || 1));
    return r.map(function (v) { return v * f; });
  }
  function shape(b, r, attrs) {
    if (b.w <= 0 || b.h <= 0) return '';
    r = r || [0, 0, 0, 0];
    if (r[0] === r[1] && r[1] === r[2] && r[2] === r[3]) {
      return '<rect x="' + n(b.x) + '" y="' + n(b.y) + '" width="' + n(b.w) + '" height="' + n(b.h) + '"' + (r[0] ? ' rx="' + n(r[0]) + '"' : '') + ' ' + attrs + '/>';
    }
    var x = b.x, y = b.y, w = b.w, h = b.h;
    var d = 'M' + n(x + r[0]) + ' ' + n(y) + 'H' + n(x + w - r[1]) + (r[1] ? 'A' + n(r[1]) + ' ' + n(r[1]) + ' 0 0 1 ' + n(x + w) + ' ' + n(y + r[1]) : '') +
      'V' + n(y + h - r[2]) + (r[2] ? 'A' + n(r[2]) + ' ' + n(r[2]) + ' 0 0 1 ' + n(x + w - r[2]) + ' ' + n(y + h) : '') +
      'H' + n(x + r[3]) + (r[3] ? 'A' + n(r[3]) + ' ' + n(r[3]) + ' 0 0 1 ' + n(x) + ' ' + n(y + h - r[3]) : '') +
      'V' + n(y + r[0]) + (r[0] ? 'A' + n(r[0]) + ' ' + n(r[0]) + ' 0 0 1 ' + n(x + r[0]) + ' ' + n(y) : '') + 'Z';
    return '<path d="' + d + '" ' + attrs + '/>';
  }

  /* ---------- gradients ---------- */
  function splitTop(s) {
    var out = [], d = 0, cur = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === '(') d++; else if (ch === ')') d--;
      if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  }
  function isConfig(p) { return / at |^at |^(circle|ellipse|closest|farthest|to )|deg$|turn$|rad$|^-?[\d.]+(px|%)(\s+-?[\d.]+(px|%))?$/.test(p); }
  function stopsOf(parts, len) {
    var st = parts.map(function (p) {
      var m = p.match(/^(.*?)(?:\s+(-?[\d.]+)(%|px))?$/);
      var pos = m[2] == null ? null : (m[3] === '%' ? parseFloat(m[2]) / 100 : parseFloat(m[2]) / len);
      return { c: parseColor(m[1]) || { r: 0, g: 0, b: 0, a: 0 }, o: pos };
    });
    if (st[0].o == null) st[0].o = 0;
    if (st[st.length - 1].o == null) st[st.length - 1].o = 1;
    for (var i = 1; i < st.length - 1; i++) if (st[i].o == null) {
      var j = i; while (st[j].o == null) j++;
      for (var k = i; k < j; k++) st[k].o = st[i - 1].o + (st[j].o - st[i - 1].o) * (k - i + 1) / (j - i + 1);
    }
    // CSS fades to "transparent" without going dark: borrow the neighbour's hue
    st.forEach(function (s, i) {
      if (s.c.a === 0) { var nb = st[i - 1] && st[i - 1].c.a ? st[i - 1] : st[i + 1]; if (nb) s.c = { r: nb.c.r, g: nb.c.g, b: nb.c.b, a: 0 }; }
    });
    return st;
  }
  function stopXml(st, asMask) {
    return st.map(function (s) {
      var c = asMask ? { r: 255, g: 255, b: 255, a: s.c.a } : s.c;
      return '<stop offset="' + n(Math.max(0, Math.min(1, s.o))) + '" stop-color="' + hex(c) + '"' + (c.a < 1 ? ' stop-opacity="' + n(c.a) + '"' : '') + '/>';
    }).join('');
  }
  // Returns a gradient id for `str` painted over the box (x,y,w,h), or null.
  function gradient(str, x, y, w, h, asMask) {
    var m = str.match(/^(linear|radial)-gradient\((.*)\)$/);
    if (!m) return null;
    var parts = splitTop(m[2]), conf = isConfig(parts[0]) ? parts.shift() : '', id = nid('g');
    if (m[1] === 'linear') {
      var a = 180, mm;
      if ((mm = conf.match(/(-?[\d.]+)deg/))) a = parseFloat(mm[1]);
      else if ((mm = conf.match(/(-?[\d.]+)turn/))) a = parseFloat(mm[1]) * 360;
      else if (/^to /.test(conf)) a = { 'to top': 0, 'to right': 90, 'to bottom': 180, 'to left': 270, 'to top right': 45, 'to right top': 45, 'to bottom right': 135, 'to right bottom': 135, 'to bottom left': 225, 'to left bottom': 225, 'to top left': 315, 'to left top': 315 }[conf] || 180;
      var rad = a * Math.PI / 180, dx = Math.sin(rad), dy = -Math.cos(rad);
      var len = Math.abs(w * dx) + Math.abs(h * dy), cx = x + w / 2, cy = y + h / 2;
      defs.push('<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + n(cx - dx * len / 2) + '" y1="' + n(cy - dy * len / 2) + '" x2="' + n(cx + dx * len / 2) + '" y2="' + n(cy + dy * len / 2) + '">' + stopXml(stopsOf(parts, len), asMask) + '</linearGradient>');
      return id;
    }
    var at = conf.split(/\s*\bat\b\s*/), size = at[0].trim(), pos = (at[1] || '50% 50%').trim().split(/\s+/);
    function pp(v, L) { return v === 'center' ? L / 2 : v === 'left' || v === 'top' ? 0 : v === 'right' || v === 'bottom' ? L : v.indexOf('%') > -1 ? parseFloat(v) / 100 * L : parseFloat(v); }
    var px = x + pp(pos[0], w), py = y + pp(pos[1] || pos[0], h);
    var lens = size.replace(/circle|ellipse/g, '').trim().split(/\s+/).filter(function (s) { return /[\d.]/.test(s); });
    var rx, ry;
    if (lens.length === 2) { rx = pp(lens[0], w); ry = pp(lens[1], h); }
    else if (lens.length === 1) { rx = ry = parseFloat(lens[0]); }
    else {
      var fx = Math.max(px - x, x + w - px), fy = Math.max(py - y, y + h - py);
      if (/circle/.test(size)) rx = ry = Math.sqrt(fx * fx + fy * fy);
      else { rx = fx * Math.SQRT2; ry = fy * Math.SQRT2; }
    }
    rx = Math.max(rx, 0.01); ry = Math.max(ry, 0.01);
    defs.push('<radialGradient id="' + id + '" gradientUnits="userSpaceOnUse" cx="' + n(px) + '" cy="' + n(py) + '" r="' + n(rx) + '"' +
      (Math.abs(rx - ry) > 0.01 ? ' gradientTransform="translate(' + n(px) + ' ' + n(py) + ') scale(1 ' + n(ry / rx) + ') translate(' + n(-px) + ' ' + n(-py) + ')"' : '') +
      '>' + stopXml(stopsOf(parts, rx), asMask) + '</radialGradient>');
    return id;
  }
  function sizeOf(v, box) {
    var p = (v || 'auto').split(/\s+/);
    if (p[0] === 'auto' || p[0] === 'cover' || p[0] === 'contain') return { w: box.w, h: box.h, auto: true };
    var w = p[0].indexOf('%') > -1 ? parseFloat(p[0]) / 100 * box.w : parseFloat(p[0]);
    var h = !p[1] || p[1] === 'auto' ? w : p[1].indexOf('%') > -1 ? parseFloat(p[1]) / 100 * box.h : parseFloat(p[1]);
    return { w: w, h: h };
  }
  function bgLayer(str, size, pos, rep, box, r) {
    var t = sizeOf(size, box);
    var um = str.match(/^url\("?(.*?)"?\)$/);
    if (um) {
      var pp = (pos || '50% 50%').split(/\s+/);
      function off(v, free) { return v.indexOf('%') > -1 ? parseFloat(v) / 100 * free : parseFloat(v) || 0; }
      var ix = box.x + off(pp[0], box.w - t.w), iy = box.y + off(pp[1] || pp[0], box.h - t.h);
      return '<image href="' + esc(um[1]) + '" x="' + n(ix) + '" y="' + n(iy) + '" width="' + n(t.w) + '" height="' + n(t.h) + '" preserveAspectRatio="xMidYMid meet"/>';
    }
    if (t.auto || /no-repeat/.test(rep || '')) {
      var g = gradient(str, box.x, box.y, box.w, box.h);
      return g ? shape(box, r, 'fill="url(#' + g + ')"') : '';
    }
    var gt = gradient(str, 0, 0, t.w, t.h);
    if (!gt) return '';
    var pid = nid('p');
    defs.push('<pattern id="' + pid + '" patternUnits="userSpaceOnUse" x="' + n(box.x) + '" y="' + n(box.y) + '" width="' + n(t.w) + '" height="' + n(t.h) + '"><rect width="' + n(t.w) + '" height="' + n(t.h) + '" fill="url(#' + gt + ')"/></pattern>');
    return shape(box, r, 'fill="url(#' + pid + ')"');
  }

  /* ---------- box painting ---------- */
  function shadows(box, s, r) {
    if (!s.boxShadow || s.boxShadow === 'none') return '';
    return splitTop(s.boxShadow).reverse().map(function (sh) {
      if (/\binset\b/.test(sh)) return '';
      var m = sh.match(/^((?:rgba?|color)\([^)]*\)|#\w+|transparent)\s+(.*)$/);
      if (!m) return '';
      var c = parseColor(m[1]), v = m[2].split(/\s+/).map(parseFloat);
      if (!c || !c.a) return '';
      var ox = v[0] || 0, oy = v[1] || 0, blur = v[2] || 0, sp = v[3] || 0;
      var b = { x: box.x + ox - sp, y: box.y + oy - sp, w: box.w + 2 * sp, h: box.h + 2 * sp };
      var rr = r.map(function (x) { return Math.max(0, x + sp); }), f = '';
      if (blur > 0) {
        var fid = nid('f'), pad = blur * 1.5;
        defs.push('<filter id="' + fid + '" filterUnits="userSpaceOnUse" x="' + n(b.x - pad) + '" y="' + n(b.y - pad) + '" width="' + n(b.w + pad * 2) + '" height="' + n(b.h + pad * 2) + '"><feGaussianBlur stdDeviation="' + n(blur / 2) + '"/></filter>');
        f = ' filter="url(#' + fid + ')"';
      }
      return shape(b, rr, paint(c) + f);
    }).join('');
  }
  function borders(box, s, r) {
    var sides = ['Top', 'Right', 'Bottom', 'Left'].map(function (k) {
      return { w: parseFloat(s['border' + k + 'Width']) || 0, st: s['border' + k + 'Style'], c: parseColor(s['border' + k + 'Color']) };
    }).map(function (x) { x.on = x.w > 0 && x.st !== 'none' && x.st !== 'hidden' && x.c && x.c.a > 0; return x; });
    function dash(x) { return x.st === 'dashed' ? ' stroke-dasharray="' + n(x.w * 3) + ' ' + n(x.w * 3) + '"' : x.st === 'dotted' ? ' stroke-dasharray="0 ' + n(x.w * 2) + '" stroke-linecap="round"' : ''; }
    var a = sides[0];
    if (sides.every(function (x) { return x.on && x.w === a.w && x.st === a.st && hex(x.c) === hex(a.c) && x.c.a === a.c.a; })) {
      var b = { x: box.x + a.w / 2, y: box.y + a.w / 2, w: box.w - a.w, h: box.h - a.w };
      return shape(b, r.map(function (v) { return Math.max(0, v - a.w / 2); }), 'fill="none" ' + paint(a.c, 'stroke') + ' stroke-width="' + n(a.w) + '"' + dash(a));
    }
    var L = [
      [box.x, box.y + sides[0].w / 2, box.x + box.w, box.y + sides[0].w / 2],
      [box.x + box.w - sides[1].w / 2, box.y, box.x + box.w - sides[1].w / 2, box.y + box.h],
      [box.x, box.y + box.h - sides[2].w / 2, box.x + box.w, box.y + box.h - sides[2].w / 2],
      [box.x + sides[3].w / 2, box.y, box.x + sides[3].w / 2, box.y + box.h]
    ];
    return sides.map(function (x, i) {
      if (!x.on) return '';
      var l = L[i];
      return '<line x1="' + n(l[0]) + '" y1="' + n(l[1]) + '" x2="' + n(l[2]) + '" y2="' + n(l[3]) + '" ' + paint(x.c, 'stroke') + ' stroke-width="' + n(x.w) + '"' + dash(x) + '/>';
    }).join('');
  }
  function background(box, s, r) {
    var o = '', bg = parseColor(s.backgroundColor);
    if (bg && bg.a > 0) o += shape(box, r, paint(bg));
    if (s.backgroundImage && s.backgroundImage !== 'none') {
      var L = splitTop(s.backgroundImage), Z = splitTop(s.backgroundSize), P = splitTop(s.backgroundPosition), R = splitTop(s.backgroundRepeat);
      for (var i = L.length - 1; i >= 0; i--) o += bgLayer(L[i], Z[i % Z.length], P[i % P.length], R[i % R.length], box, r);
    }
    return o;
  }

  /* ---------- text ---------- */
  var mctx = document.createElement('canvas').getContext('2d'), mcache = {};
  function fontStr(s) { return s.fontStyle + ' ' + s.fontWeight + ' ' + s.fontSize + ' ' + s.fontFamily; }
  function metrics(s) {
    var f = fontStr(s);
    if (!mcache[f]) { mctx.font = f; var m = mctx.measureText('Hg'); mcache[f] = { a: m.fontBoundingBoxAscent, d: m.fontBoundingBoxDescent }; }
    return mcache[f];
  }
  function textAttrs(s, color) {
    var c = color || parseColor(s.color) || { r: 0, g: 0, b: 0, a: 1 };
    return 'font-family="' + esc(s.fontFamily.replace(/"/g, "'")) + '" font-size="' + parseFloat(s.fontSize) + '" font-weight="' + s.fontWeight + '"' +
      (s.fontStyle !== 'normal' ? ' font-style="' + s.fontStyle + '"' : '') +
      (s.letterSpacing !== 'normal' && parseFloat(s.letterSpacing) ? ' letter-spacing="' + n(parseFloat(s.letterSpacing)) + '"' : '') + ' ' + paint(c);
  }
  var BIDI = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
  function textNode(tn, s) {
    var txt = tn.nodeValue;
    if (!txt || !txt.trim()) return '';
    if (s.textTransform === 'uppercase') txt = txt.toUpperCase();
    else if (s.textTransform === 'lowercase') txt = txt.toLowerCase();
    var pieces = [], re = /\S+/g, m;
    while ((m = re.exec(tn.nodeValue))) {
      var rg = document.createRange();
      rg.setStart(tn, m.index); rg.setEnd(tn, m.index + m[0].length);
      var rects = rg.getClientRects();
      if (!rects.length) continue;
      if (rects.length === 1) {
        var b = rects[0];
        if (b.width > 0) pieces.push({ t: txt.substr(m.index, m[0].length), x: b.left + SX, r: b.right + SX, y: b.top + SY, h: b.height, gap: true });
        continue;
      }
      // a word broken across lines (e.g. long email): fall back to per-character runs
      var first = true;
      for (var i = 0; i < m[0].length; i++) {
        var cr = document.createRange(); cr.setStart(tn, m.index + i); cr.setEnd(tn, m.index + i + 1);
        var bb = cr.getBoundingClientRect();
        if (!bb.width) continue;
        pieces.push({ t: txt.substr(m.index + i, 1), x: bb.left + SX, r: bb.right + SX, y: bb.top + SY, h: bb.height, gap: first });
        first = false;
      }
    }
    if (!pieces.length) return '';
    var mt = metrics(s), attrs = textAttrs(s), out = '';
    var rtlPage = s.direction === 'rtl', perWord = rtlPage || BIDI.test(txt);
    function baseOf(p) { return p.y + (p.h - (mt.a + mt.d)) / 2 + mt.a; }
    // Arabic / RTL text is placed word by word (measured boxes), so mixed scripts and punctuation land where the browser put them.
    // In an RTL context each word is anchored at its right edge with direction="rtl", which gives neutrals (. ? ،) the same bidi resolution.
    if (perWord) pieces.forEach(function (p) {
      out += '<text x="' + n(rtlPage ? p.r : p.x) + '" y="' + n(baseOf(p)) + '" ' + attrs + (rtlPage ? ' direction="rtl" unicode-bidi="embed"' : '') +
        ' textLength="' + n(p.r - p.x) + '" lengthAdjust="spacingAndGlyphs">' + esc(p.t) + '</text>';
    });
    // LTR text is grouped into one <text> per line so it stays editable
    var lines = [];
    pieces.forEach(function (p) {
      var last = lines[lines.length - 1];
      if (last && Math.abs(last.y - p.y) < 2) { last.t += (p.gap ? ' ' : '') + p.t; last.x = Math.min(last.x, p.x); last.r = Math.max(last.r, p.r); }
      else lines.push({ t: p.t, x: p.x, r: p.r, y: p.y, h: p.h });
    });
    var deco = /underline/.test(s.textDecorationLine) ? parseColor(s.textDecorationColor) : null;
    var fsz = parseFloat(s.fontSize);
    var uoff = parseFloat(s.textUnderlineOffset), uth = parseFloat(s.textDecorationThickness);
    if (isNaN(uoff)) uoff = mt.d * 0.35; if (isNaN(uth)) uth = Math.max(1, fsz / 14);
    lines.forEach(function (l) {
      var base = baseOf(l), w = l.r - l.x;
      if (!perWord) out += '<text x="' + n(l.x) + '" y="' + n(base) + '" ' + attrs + ' textLength="' + n(w) + '" lengthAdjust="spacingAndGlyphs">' + esc(l.t) + '</text>';
      if (deco) out += '<rect x="' + n(l.x) + '" y="' + n(base + uoff) + '" width="' + n(w) + '" height="' + n(uth) + '" ' + paint(deco) + '/>';
    });
    return out;
  }

  /* ---------- replaced elements ---------- */
  function contentBox(box, s) {
    var l = parseFloat(s.borderLeftWidth) + parseFloat(s.paddingLeft), t = parseFloat(s.borderTopWidth) + parseFloat(s.paddingTop);
    var r = parseFloat(s.borderRightWidth) + parseFloat(s.paddingRight), b = parseFloat(s.borderBottomWidth) + parseFloat(s.paddingBottom);
    return { x: box.x + l, y: box.y + t, w: box.w - l - r, h: box.h - t - b };
  }
  function transformWrap(el, s, box, inner) {
    if (!s.transform || s.transform === 'none') return inner;
    var m = s.transform.match(/matrix\(([^)]+)\)/);
    if (!m) return inner;
    var v = m[1].split(',').map(parseFloat);
    if (Math.abs(v[1]) > 0.01 || Math.abs(v[2]) > 0.01 || (v[0] > 0 && v[3] > 0)) return inner; // only mirror flips matter here
    var cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    return '<g transform="translate(' + n(cx) + ' ' + n(cy) + ') scale(' + (v[0] < 0 ? -1 : 1) + ' ' + (v[3] < 0 ? -1 : 1) + ') translate(' + n(-cx) + ' ' + n(-cy) + ')">' + inner + '</g>';
  }
  function inlineSvg(el, box, s) {
    var cb = contentBox(box, s);
    if (cb.w <= 0 || cb.h <= 0) return '';
    var clone = el.cloneNode(true);
    var O = [el].concat([].slice.call(el.querySelectorAll('*'))), C = [clone].concat([].slice.call(clone.querySelectorAll('*')));
    var drop = [];
    O.forEach(function (o, i) {
      var st = cs(o), c = C[i];
      if (i > 0 && st.display === 'none') { drop.push(c); return; }
      if (/^(path|circle|rect|ellipse|line|polyline|polygon|text|g|use|svg)$/.test(o.tagName)) {
        ['fill', 'stroke'].forEach(function (p) {
          var v = st[p];
          if (!v || /url\(/.test(v)) return;
          if (v === 'none') { c.setAttribute(p, 'none'); return; }
          var col = parseColor(v);
          if (col) { c.setAttribute(p, hex(col)); if (col.a < 1) c.setAttribute(p + '-opacity', n(col.a)); }
        });
        if (i > 0 && parseFloat(st.opacity) < 1) c.setAttribute('opacity', st.opacity);
      }
      ['class', 'style', 'aria-hidden', 'focusable', 'role'].forEach(function (a) { c.removeAttribute(a); });
    });
    drop.forEach(function (d) { d.parentNode && d.parentNode.removeChild(d); });
    var map = {};
    [].slice.call(clone.querySelectorAll('[id]')).forEach(function (e) { var k = nid('s'); map[e.id] = k; e.id = k; });
    [].slice.call(clone.querySelectorAll('*')).forEach(function (e) {
      [].slice.call(e.attributes).forEach(function (a) {
        var v = a.value.replace(/url\(["']?#([^)"']+)["']?\)/g, function (_, k) { return 'url(#' + (map[k] || k) + ')'; });
        if ((a.name === 'href' || a.name === 'xlink:href') && v[0] === '#' && map[v.slice(1)]) v = '#' + map[v.slice(1)];
        if (v !== a.value) e.setAttribute(a.name, v);
      });
    });
    clone.setAttribute('x', n(cb.x)); clone.setAttribute('y', n(cb.y));
    clone.setAttribute('width', n(cb.w)); clone.setAttribute('height', n(cb.h));
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', '0 0 ' + n(cb.w) + ' ' + n(cb.h));
    clone.removeAttribute('xmlns');
    return transformWrap(el, s, box, new XMLSerializer().serializeToString(clone).replace(/ xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, ''));
  }
  function image(el, box, s) {
    var src = el.currentSrc || el.src;
    if (!src || !el.naturalWidth) return '';
    if (!/^data:|^https?:/.test(src)) {
      try { var c = document.createElement('canvas'); c.width = el.naturalWidth; c.height = el.naturalHeight; c.getContext('2d').drawImage(el, 0, 0); src = c.toDataURL('image/png'); }
      catch (e) { /* local file the browser won't let us read: keep the relative path */ src = el.getAttribute('src'); }
    }
    var fit = { cover: 'xMidYMid slice', contain: 'xMidYMid meet', fill: 'none' }[s.objectFit] || 'none';
    var cb = contentBox(box, s), r = radiiOf(s, box), clip = '';
    if (r.some(Boolean)) { var cid = nid('c'); defs.push('<clipPath id="' + cid + '">' + shape(box, r, '') + '</clipPath>'); clip = ' clip-path="url(#' + cid + ')"'; }
    return '<image href="' + esc(src) + '" x="' + n(cb.x) + '" y="' + n(cb.y) + '" width="' + n(cb.w) + '" height="' + n(cb.h) + '" preserveAspectRatio="' + fit + '"' + clip + '/>';
  }
  function input(el, box, s) {
    var type = (el.type || 'text').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      var sz = Math.min(box.w, box.h), b = { x: box.x + (box.w - sz) / 2, y: box.y + (box.h - sz) / 2, w: sz, h: sz };
      var ac = parseColor(s.accentColor) || { r: 0, g: 117, b: 255, a: 1 }, rr = type === 'radio' ? sz / 2 : 3;
      if (!el.checked) return shape({ x: b.x + .75, y: b.y + .75, w: sz - 1.5, h: sz - 1.5 }, [rr, rr, rr, rr], 'fill="#ffffff" stroke="#767676" stroke-width="1.5"');
      return shape(b, [rr, rr, rr, rr], paint(ac)) +
        '<path d="M' + n(b.x + sz * .22) + ' ' + n(b.y + sz * .52) + 'L' + n(b.x + sz * .42) + ' ' + n(b.y + sz * .72) + 'L' + n(b.x + sz * .78) + ' ' + n(b.y + sz * .3) + '" fill="none" stroke="#ffffff" stroke-width="' + n(sz / 9) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    var val = el.value, col = null;
    if (!val) { val = el.placeholder; col = parseColor(cs(el, '::placeholder').color); }
    else if (type === 'password') val = new Array(val.length + 1).join('•');
    if (!val) return '';
    var cb = contentBox(box, s), mt = metrics(s), base = cb.y + cb.h / 2 + (mt.a - mt.d) / 2;
    var ta = s.textAlign, end = s.direction === 'rtl' ? !(ta === 'left' || ta === 'end') : (ta === 'right' || ta === 'end');
    return '<text x="' + n(end ? cb.x + cb.w : cb.x) + '" y="' + n(base) + '" ' + textAttrs(s, col) + (end ? ' text-anchor="end"' : '') + '>' + esc(val) + '</text>';
  }

  // <select> shows its chosen option; <textarea> its text or placeholder (first line, top-aligned)
  function selectText(el, box, s) {
    var o = el.options[el.selectedIndex], val = o ? o.text : '';
    if (!val) return '';
    var cb = contentBox(box, s), mt = metrics(s), base = cb.y + cb.h / 2 + (mt.a - mt.d) / 2;
    var rtl = s.direction === 'rtl';
    return '<text x="' + n(rtl ? cb.x + cb.w : cb.x) + '" y="' + n(base) + '" ' + textAttrs(s) + (rtl ? ' text-anchor="end" direction="rtl"' : '') + '>' + esc(val) + '</text>';
  }
  function textareaText(el, box, s) {
    var val = el.value, col = null;
    if (!val) { val = el.placeholder; col = parseColor(cs(el, '::placeholder').color); }
    if (!val) return '';
    var cb = contentBox(box, s), mt = metrics(s), lh = parseFloat(s.lineHeight) || (mt.a + mt.d) * 1.2, rtl = s.direction === 'rtl';
    return '<text x="' + n(rtl ? cb.x + cb.w : cb.x) + '" y="' + n(cb.y + (lh - (mt.a + mt.d)) / 2 + mt.a) + '" ' + textAttrs(s, col) + (rtl ? ' text-anchor="end" direction="rtl"' : '') + '>' + esc(val.split(String.fromCharCode(10))[0]) + '</text>';
  }

  /* ---------- tree walk ---------- */
  function zKey(node) {
    if (node.nodeType !== 1) return 0;
    var s = cs(node);
    if (s.position === 'static') return 0;
    var z = parseInt(s.zIndex, 10);
    return isNaN(z) ? 0 : z < 0 ? -1 : 0;
  }
  function walk(el, force) {
    if (el.__skip && !force) return '';
    var s = cs(el);
    if (s.display === 'none' || s.display === 'contents' && false) return '';
    if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|LINK|META)$/.test(el.tagName)) return '';
    if (!force && s.position !== 'static' && parseInt(s.zIndex, 10) > 0) { topLayer.push({ el: el, z: parseInt(s.zIndex, 10), i: topLayer.length }); return ''; }
    var op = parseFloat(s.opacity);
    if (op === 0) return '';
    if (s.clip === 'rect(0px, 0px, 0px, 0px)') return '';
    var box = boxOf(el), r = radiiOf(s, box), vis = s.visibility !== 'hidden', out = '';
    if (vis && box.w > 0 && box.h > 0) out += shadows(box, s, r) + background(box, s, r) + borders(box, s, r);
    var tag = el.tagName.toUpperCase();
    if (tag === 'SVG') { if (vis) out += inlineSvg(el, box, s); }
    else if (tag === 'IMG') { if (vis) out += image(el, box, s); }
    else if (tag === 'INPUT') { if (vis) out += input(el, box, s); }
    else if (tag === 'SELECT') { if (vis) out += selectText(el, box, s); }
    else if (tag === 'TEXTAREA') { if (vis) out += textareaText(el, box, s); }
    else {
      var kids = [].slice.call(el.childNodes).map(function (k, i) { return { k: k, i: i, z: zKey(k) }; });
      kids.sort(function (a, b) { return a.z - b.z || a.i - b.i; });
      var inner = '';
      kids.forEach(function (o) {
        if (o.k.nodeType === 3) { if (vis) inner += textNode(o.k, s); }
        else if (o.k.nodeType === 1) inner += walk(o.k);
      });
      var clips = el !== document.body && el !== document.documentElement && (s.overflowX !== 'visible' || s.overflowY !== 'visible');
      if (clips && inner) {
        var cid = nid('c');
        defs.push('<clipPath id="' + cid + '">' + shape(box, r, '') + '</clipPath>');
        inner = '<g clip-path="url(#' + cid + ')">' + inner + '</g>';
      }
      out += inner;
    }
    if (!out) return '';
    var mi = s.webkitMaskImage || s.maskImage;
    if (mi && mi !== 'none') {
      var g = gradient(splitTop(mi)[0], box.x, box.y, box.w, box.h, true);
      if (g) {
        var mid = nid('m');
        defs.push('<mask id="' + mid + '" maskUnits="userSpaceOnUse" x="' + n(box.x) + '" y="' + n(box.y) + '" width="' + n(box.w) + '" height="' + n(box.h) + '"><rect x="' + n(box.x) + '" y="' + n(box.y) + '" width="' + n(box.w) + '" height="' + n(box.h) + '" fill="url(#' + g + ')"/></mask>');
        out = '<g mask="url(#' + mid + ')">' + out + '</g>';
      }
    }
    if (op < 1) out = '<g opacity="' + n(op) + '">' + out + '</g>';
    return out;
  }

  /* pseudo-elements become real spans so they get a box we can measure */
  function materialisePseudo() {
    var st = document.createElement('style');
    st.textContent = '.__np::before,.__np::after{content:none!important}';
    var jobs = [];
    [].slice.call(document.body.querySelectorAll('*')).forEach(function (el) {
      if (el instanceof SVGElement || /^(INPUT|IMG|BR|TEXTAREA|SELECT|SCRIPT|STYLE)$/.test(el.tagName)) return;
      ['::before', '::after'].forEach(function (p) {
        var s = cs(el, p);
        if (s.content === 'none' || s.content === 'normal' || s.display === 'none') return;
        var css = [];
        for (var i = 0; i < s.length; i++) css.push([s[i], s.getPropertyValue(s[i])]);
        var m = s.content.match(/^"(.*)"$/);
        jobs.push({ el: el, p: p, css: css, text: m ? m[1].replace(/\\"/g, '"') : '' });
      });
    });
    jobs.forEach(function (j) {
      var sp = document.createElement('span');
      j.css.forEach(function (kv) { if (kv[0] !== 'content') sp.style.setProperty(kv[0], kv[1]); });
      sp.style.setProperty('transition', 'none');
      if (j.text) sp.textContent = j.text;
      if (j.p === '::before') j.el.insertBefore(sp, j.el.firstChild); else j.el.appendChild(sp);
      j.el.classList.add('__np');
    });
    document.head.appendChild(st);
  }

  materialisePseudo();
  var W = document.documentElement.clientWidth;
  var H = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight);
  var canvas = parseColor(cs(document.documentElement).backgroundColor);
  if (!canvas || !canvas.a) canvas = parseColor(cs(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  var modal = [].slice.call(document.querySelectorAll('dialog[open]')).filter(function (d) { return d.matches(':modal'); });
  modal.forEach(function (d) { d.__skip = true; });
  var body = walk(document.body);
  topLayer.sort(function (a, b) { return a.z - b.z || a.i - b.i; });
  var over = '';
  for (var t = 0; t < topLayer.length; t++) over += walk(topLayer[t].el, true);
  modal.forEach(function (d) {
    var bc = parseColor(cs(d, '::backdrop').backgroundColor);
    if (bc && bc.a) over += '<rect x="0" y="0" width="' + document.documentElement.clientWidth + '" height="' + Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, window.innerHeight) + '" ' + paint(bc) + '/>';
    over += walk(d, true);
  });
  var font = document.querySelector('link[rel="stylesheet"][href*="fonts.googleapis"]');
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    '<title>' + esc(document.title) + '</title>' +
    (font ? '<style>@import url("' + esc(font.href) + '");</style>' : '') +
    '<defs>' + defs.join('') + '</defs>' +
    '<rect width="' + W + '" height="' + H + '" ' + paint(canvas) + '/>' + body + over + '</svg>';
};
