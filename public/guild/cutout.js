// Cuts a game character out of a screenshot, in the browser. Used by the "내 캐릭터" update form and the admin page.
//
// The game draws characters with a dark outline on a soft, light backdrop. So: fill the backdrop inwards from the
// edges of the area where the character stands, stopping at outline pixels; whatever the fill could not reach is
// the character. Thin outlines fade to under a pixel on shallow curves, so "outline" means either dark enough or
// clearly darker than its surroundings.
//
//   GuildCutout.cut(source, layout) → { canvas, face: {x, y, r}, layout }
//     source: anything drawImage accepts (an <img>, ImageBitmap or canvas) holding the whole screenshot
//     layout: 'self'  the player's own character screen (big character in the middle; the pet stands apart and is dropped)
//             'card'  another player's info card (small character at the left of the card; the pet overlaps and stays)
//             'auto'  decide from the picture
(function (global) {
  'use strict';

  // Where the character stands, as fractions of the screenshot.
  var AREAS = {
    self: { x0: 0.215, x1: 0.775, y0: 0.25, y1: 0.57 },
    card: { x0: 92 / 1179, x1: 386 / 1179, y0: 803 / 2556, y1: 1130 / 2556 },
  };
  var OUTLINE = [40, 38, 44];

  // The info card dims the rest of the screen; the character screen is bright from edge to edge.
  function guessLayout(ctx, W, H) {
    var d = ctx.getImageData(0, Math.round(H * 0.5), Math.max(1, Math.round(W * 0.04)), 4).data;
    var sum = 0;
    for (var i = 0; i < d.length; i += 4) sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    return sum / (d.length / 4) < 150 ? 'card' : 'self';
  }

  // Grey-scale closing with a k×k square (max filter, then min filter), done one axis at a time.
  function slide(src, w, h, k, horizontal, takeMax) {
    var out = new Float32Array(src.length), r = (k - 1) >> 1;
    var n = horizontal ? w : h, lines = horizontal ? h : w;
    for (var line = 0; line < lines; line++) {
      for (var i = 0; i < n; i++) {
        var best = takeMax ? -1 : 1e9;
        for (var j = Math.max(0, i - r), end = Math.min(n - 1, i + r); j <= end; j++) {
          var v = horizontal ? src[line * w + j] : src[j * w + line];
          if (takeMax ? v > best : v < best) best = v;
        }
        out[horizontal ? line * w + i : i * w + line] = best;
      }
    }
    return out;
  }
  function closing(l, w, h, k) {
    var d = slide(slide(l, w, h, k, true, true), w, h, k, false, true);
    return slide(slide(d, w, h, k, true, false), w, h, k, false, false);
  }

  function cut(source, layout) {
    var W = source.naturalWidth || source.videoWidth || source.width;
    var H = source.naturalHeight || source.videoHeight || source.height;
    var full = document.createElement('canvas');
    full.width = W; full.height = H;
    var fctx = full.getContext('2d', { willReadFrequently: true });
    fctx.drawImage(source, 0, 0);
    if (!layout || layout === 'auto') layout = guessLayout(fctx, W, H);
    var A = AREAS[layout] || AREAS.self;
    var x0 = Math.round(W * A.x0), y0 = Math.round(H * A.y0);
    var w = Math.round(W * A.x1) - x0, h = Math.round(H * A.y1) - y0;
    var px = fctx.getImageData(x0, y0, w, h).data;
    var n = w * h, i, x, y;

    var l = new Float32Array(n);
    for (i = 0; i < n; i++) l[i] = px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114;
    var k = Math.max(5, Math.round(W / 170) | 1);
    var closed = closing(l, w, h, k);

    // state: 0 wall (outline), 1 open and not yet reached, 2 backdrop (reached from the edge)
    var state = new Uint8Array(n);
    for (i = 0; i < n; i++) state[i] = l[i] >= 100 && closed[i] - l[i] <= 34 ? 1 : 0;
    var stack = new Int32Array(n), top = 0;
    function seed(p) { if (state[p] === 1) { state[p] = 2; stack[top++] = p; } }
    for (x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
    for (y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }
    while (top) {
      var p = stack[--top]; x = p % w;
      if (x > 0) seed(p - 1);
      if (x < w - 1) seed(p + 1);
      if (p >= w) seed(p - w);
      if (p < n - w) seed(p + w);
    }

    // Group what the fill did not reach into connected blobs (8-connected).
    var label = new Int32Array(n), blobs = [null];
    for (i = 0; i < n; i++) {
      if (state[i] === 2 || label[i]) continue;
      var id = blobs.length, b = { area: 0, x0: w, y0: h, x1: 0, y1: 0 };
      label[i] = id; stack[0] = i; top = 1;
      while (top) {
        var q = stack[--top], qx = q % w, qy = (q - qx) / w;
        b.area++;
        if (qx < b.x0) b.x0 = qx; if (qx > b.x1) b.x1 = qx; if (qy < b.y0) b.y0 = qy; if (qy > b.y1) b.y1 = qy;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var nx = qx + dx, ny = qy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          var t = ny * w + nx;
          if (state[t] !== 2 && !label[t]) { label[t] = id; stack[top++] = t; }
        }
      }
      blobs.push(b);
    }
    var main = 0;
    for (i = 1; i < blobs.length; i++) if (!main || blobs[i].area > blobs[main].area) main = i;
    if (!main) return null;
    var scale2 = (W / 1179) * (W / 1179), M = blobs[main];
    var keep = new Uint8Array(blobs.length);
    keep[main] = 1;
    for (i = 1; i < blobs.length; i++) {
      var c = blobs[i];
      if (i === main || c.area < 40 * scale2) continue;
      if (layout === 'card') { keep[i] = 1; continue; }
      // On the own-character screen the pet is a big separate blob: keep only small floating ornaments near the character.
      var cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
      if (c.area <= M.area * 0.06 && cx >= M.x0 && cx <= M.x1 && cy >= M.y0 && cy <= M.y1) keep[i] = 1;
    }
    var mask = new Uint8Array(n);
    for (i = 0; i < n; i++) mask[i] = keep[label[i]] ? 1 : 0;

    // Soften the edge: the outermost ring of the blob where the backdrop shows through, and the ring just outside it,
    // become a partly transparent outline colour instead of a hard step.
    var out = new Uint8ClampedArray(n * 4);
    var lo = OUTLINE[0] * 0.299 + OUTLINE[1] * 0.587 + OUTLINE[2] * 0.114;
    function near(p, want) {         // is any of the 8 neighbours (in the mask) equal to `want`?
      var qx = p % w, qy = (p - qx) / w;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) { if (want === 0) return true; continue; }
        if (mask[ny * w + nx] === want) return true;
      }
      return false;
    }
    function backdropLum(p) {        // brightest backdrop pixel within two pixels
      var qx = p % w, qy = (p - qx) / w, best = -1;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) {
        var nx = qx + dx, ny = qy + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var t = ny * w + nx;
        if (!mask[t] && state[t] === 2 && l[t] > best) best = l[t];
      }
      return best < 0 ? 235 : best;
    }
    var bx0 = w, by0 = h, bx1 = -1, by1 = -1;
    for (i = 0; i < n; i++) {
      var inside = mask[i] === 1, edge = false;
      if (inside) edge = l[i] > 95 && near(i, 0);
      else if (!near(i, 1)) continue;
      var a = 255;
      if (!inside || edge) {
        var bl = backdropLum(i);
        a = Math.round(Math.max(0, Math.min(1, (bl - l[i]) / Math.max(bl - lo, 1))) * 255);
        if (a < 51) continue;
        out[i * 4] = OUTLINE[0]; out[i * 4 + 1] = OUTLINE[1]; out[i * 4 + 2] = OUTLINE[2];
      } else {
        out[i * 4] = px[i * 4]; out[i * 4 + 1] = px[i * 4 + 1]; out[i * 4 + 2] = px[i * 4 + 2];
      }
      out[i * 4 + 3] = a;
      x = i % w; y = (i - x) / w;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
    }
    if (bx1 < 0) return null;

    var cw = bx1 - bx0 + 1, ch = by1 - by0 + 1;
    var tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    tmp.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
    var canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    canvas.getContext('2d').drawImage(tmp, -bx0, -by0);

    // A first guess at where the face is; the form lets the member correct it with a tap.
    var fromX = layout === 'card' ? 0.42 : 0.25, toX = layout === 'card' ? 1 : 0.85;
    var xs = [];
    for (y = by0 + Math.round(ch * 0.1); y < by0 + Math.round(ch * 0.42); y++)
      for (x = bx0 + Math.round(cw * fromX); x < bx0 + Math.round(cw * toX); x++) if (mask[y * w + x]) xs.push(x - bx0);
    xs.sort(function (p, q) { return p - q; });
    var face = { x: xs.length ? xs[xs.length >> 1] : cw / 2, y: Math.round(ch * (layout === 'card' ? 0.32 : 0.24)), r: Math.round(ch * 0.19) };
    return { canvas: canvas, face: face, layout: layout };
  }

  // A square crop around the face, for the round portraits in lists.
  function faceCanvas(charCanvas, face, size) {
    var c = document.createElement('canvas');
    c.width = c.height = size || 120;
    c.getContext('2d').drawImage(charCanvas, face.x - face.r, face.y - face.r, face.r * 2, face.r * 2, 0, 0, c.width, c.height);
    return c;
  }

  // The top of the screenshot (nickname, level, power, class) at full size, and a small copy of the whole thing.
  function crops(source) {
    var W = source.naturalWidth || source.width, H = source.naturalHeight || source.height;
    var head = document.createElement('canvas');
    var s = Math.min(1, 1200 / W);
    head.width = Math.round(W * s); head.height = Math.round(H * 0.3 * s);
    head.getContext('2d').drawImage(source, 0, 0, W, H * 0.3, 0, 0, head.width, head.height);
    var shot = document.createElement('canvas');
    var t = Math.min(1, 1280 / H);
    shot.width = Math.round(W * t); shot.height = Math.round(H * t);
    shot.getContext('2d').drawImage(source, 0, 0, shot.width, shot.height);
    return { head: head, shot: shot };
  }

  function toBlob(canvas, type, quality) {
    return new Promise(function (resolve) { canvas.toBlob(resolve, type, quality); });
  }
  // WebP where the browser can write it (smaller); PNG otherwise. Both keep transparency.
  function pictureBlob(canvas) {
    return toBlob(canvas, 'image/webp', 0.92).then(function (b) {
      return b && b.type === 'image/webp' ? b : toBlob(canvas, 'image/png');
    });
  }

  global.GuildCutout = { cut: cut, faceCanvas: faceCanvas, crops: crops, toBlob: toBlob, pictureBlob: pictureBlob };
})(window);
