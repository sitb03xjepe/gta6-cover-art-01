// Palm Shores Cover Studio — cover render engine.
// Draws GTA-poster-style multi-panel cover art onto any 2D canvas context.
// Pure functions, no DOM, no network, no randomness outside a seeded PRNG,
// so the same state always exports the same PNG bytes.
export const SIZES = {
  square: { label: '1080 × 1080 · square post', w: 1080, h: 1080 },
  portrait: { label: '1080 × 1350 · portrait post', w: 1080, h: 1350 },
  wide: { label: '1920 × 1080 · story / banner', w: 1920, h: 1080 },
};

export const LAYOUTS = {
  classic: {
    label: 'Classic five',
    hint: 'One hero shot, four supporting panels',
    panels: [
      { x: 0, y: 0, w: 0.6, h: 0.62 },
      { x: 0.6, y: 0, w: 0.4, h: 0.31 },
      { x: 0.6, y: 0.31, w: 0.4, h: 0.31 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ],
  },
  comic: {
    label: 'Comic strip',
    hint: 'Four panels in a two-by-two grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  trio: {
    label: 'Triple bill',
    hint: 'Three tall panels side by side',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  hero: {
    label: 'One big shot',
    hint: 'A single full-bleed photo, caption on top',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
};

export const GRADES = {
  sunset: {
    label: 'Vice sunset',
    hint: 'Orange-pink golden hour',
    sky: ['#2b1055', '#7597de'],
    wash: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,64,129,0.20)');
      g.addColorStop(0.55, 'rgba(255,122,26,0.10)');
      g.addColorStop(1, 'rgba(255,170,0,0.30)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = ctx.createRadialGradient(w * 0.72, h * 0.3, 0, w * 0.72, h * 0.3, w * 0.6);
      r.addColorStop(0, 'rgba(255,214,120,0.28)');
      r.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
    },
  },
  neon: {
    label: 'Neon nights',
    hint: 'Magenta and cyan after dark',
    sky: ['#0b0620', '#1b2a6b'],
    wash: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(255,0,128,0.26)');
      g.addColorStop(0.5, 'rgba(90,0,160,0.10)');
      g.addColorStop(1, 'rgba(0,229,255,0.24)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(5,0,20,0.45)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    },
  },
  gold: {
    label: 'Palm gold',
    hint: 'Warm late-afternoon gold',
    sky: ['#3d1e00', '#7a4d12'],
    wash: (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,196,0,0.12)');
      g.addColorStop(1, 'rgba(255,140,0,0.30)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    },
  },
  noir: {
    label: 'Noir',
    hint: 'High-contrast black and white',
    sky: ['#111111', '#333333'],
    wash: (ctx, w, h) => {
      ctx.save();
      ctx.globalCompositeOperation = 'saturation';
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.8);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    },
  },
};

export const TITLE_COLORS = ['#ffffff', '#ffd60a', '#ff5da2', '#4de8ff', '#111111'];

// Deterministic PRNG: the same seed draws the same grain every time.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultState() {
  return {
    layout: 'classic',
    grade: 'sunset',
    size: 'wide',
    title: 'PALM SHORES',
    subtitle: 'A SUNSET STORY IN FIVE PANELS',
    badge: 'PALM SHORES',
    titleColor: '#ffffff',
    accent: '#ff5da2',
    halftone: true,
    sunburst: true,
    grain: true,
    gutters: true,
    selected: 0,
    // one slot per panel of the widest layout; a panel shows photos[slot.photo]
    slots: Array.from({ length: 5 }, () => ({ photo: null, zoom: 1, ox: 0, oy: 0, flip: false })),
  };
}

export function panelRects(state, W, H) {
  const g = state.gutters ? Math.max(4, Math.round(Math.min(W, H) * 0.008)) : 0;
  return LAYOUTS[state.layout].panels.map((p) => ({
    x: p.x * W + g / 2,
    y: p.y * H + g / 2,
    w: p.w * W - g,
    h: p.h * H - g,
  }));
}

// Cover-fit draw of one photo into a panel rect, with zoom / pan / flip.
export function drawPhotoInto(ctx, img, rect, slot) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(w / iw, h / ih) * (slot?.zoom ?? 1);
  const dw = iw * base, dh = ih * base;
  const dx = x + (w - dw) / 2 + (slot?.ox ?? 0) * w * 0.5;
  const dy = y + (h - dh) / 2 + (slot?.oy ?? 0) * h * 0.5;
  if (slot?.flip) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(img, dx - (x + w / 2), dy - (y + h / 2), dw, dh);
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, i, accent) {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#241536');
  g.addColorStop(1, '#120a20');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = Math.max(2, w * 0.004);
  ctx.setLineDash([w * 0.02, w * 0.015]);
  ctx.strokeRect(x + w * 0.05, y + h * 0.08, w * 0.9, h * 0.84);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 ${Math.round(Math.min(w, h) * 0.09)}px "Cover Bold", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+ PHOTO ${i + 1}`, x + w / 2, y + h / 2 - h * 0.06);
  ctx.font = `400 ${Math.round(Math.min(w, h) * 0.05)}px "Cover Regular", sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('click a photo below', x + w / 2, y + h / 2 + h * 0.1);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.16, Math.max(4, w * 0.012), 0, Math.PI * 2);
  ctx.fill();
}

function drawSunburst(ctx, W, H, accent) {
  const cx = W * 0.86, cy = -H * 0.06;
  const rays = 14;
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffd76a';
  for (let i = 0; i < rays; i++) {
    const a0 = (Math.PI / 2) * (i / rays) + Math.PI / 2;
    const a1 = a0 + (Math.PI / 2 / rays) * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, Math.max(W, H) * 1.1, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHalftone(ctx, W, H, seed) {
  const rnd = mulberry32(seed);
  const step = Math.max(10, Math.round(W / 130));
  ctx.save();
  for (let y = H * 0.62; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const t = (y - H * 0.62) / (H * 0.38);
      const r = step * 0.32 * t;
      if (r < 0.6) continue;
      ctx.fillStyle = `rgba(0,0,0,${(0.16 * t).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  void rnd;
}

function drawGrain(ctx, W, H) {
  const rnd = mulberry32(20261120);
  ctx.save();
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < Math.round((W * H) / 900); i++) {
    const v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(rnd() * W, rnd() * H, 1.6, 1.6);
  }
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

function drawCaption(ctx, state, W, H) {
  const pad = W * 0.035;
  const bandH = H * 0.24;
  const bandY = H - bandH;
  // scrim so lettering reads over any photo
  const scrim = ctx.createLinearGradient(0, bandY - H * 0.06, 0, H);
  scrim.addColorStop(0, 'rgba(10,4,24,0)');
  scrim.addColorStop(0.45, 'rgba(10,4,24,0.55)');
  scrim.addColorStop(1, 'rgba(10,4,24,0.82)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandY - H * 0.06, W, bandH + H * 0.06);

  const title = (state.title || 'UNTITLED').toUpperCase();
  const maxW = W - pad * 2;
  ctx.save();
  ctx.translate(pad, H - pad - bandH * 0.42);
  ctx.rotate(-0.028);
  const px = fitFont(ctx, title, maxW, Math.round(H * 0.115), '"Cover Black", sans-serif', 900);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  try { ctx.letterSpacing = `${Math.round(px * 0.015)}px`; } catch { /* older canvas: no letterSpacing */ }
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = Math.round(px * 0.08);
  ctx.shadowOffsetY = Math.round(px * 0.045);
  ctx.strokeStyle = '#14081f';
  ctx.lineWidth = Math.round(px * 0.085);
  ctx.strokeText(title, 0, 0);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = state.titleColor;
  ctx.fillText(title, 0, 0);
  // accent underline sweep
  const tw = ctx.measureText(title).width;
  ctx.fillStyle = state.accent;
  ctx.fillRect(0, px * 0.16, Math.min(tw, maxW), Math.max(4, px * 0.055));
  ctx.restore();

  // subtitle
  if (state.subtitle) {
    ctx.save();
    ctx.font = `700 ${Math.round(H * 0.028)}px "Cover Bold", sans-serif`;
    try { ctx.letterSpacing = `${Math.round(H * 0.004)}px`; } catch { /* noop */ }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fillText(state.subtitle.toUpperCase(), pad, H - pad * 0.55);
    ctx.restore();
  }

  // badge pill, top-left
  if (state.badge) {
    const label = `★ ${state.badge.toUpperCase()}`;
    ctx.save();
    ctx.font = `700 ${Math.round(H * 0.024)}px "Cover Bold", sans-serif`;
    const tw = ctx.measureText(label).width;
    const bw = tw + H * 0.05, bh = H * 0.052;
    const bx = pad, by = pad;
    ctx.fillStyle = 'rgba(12,5,26,0.78)';
    ctx.strokeStyle = state.accent;
    ctx.lineWidth = Math.max(2, H * 0.003);
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, bh / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + H * 0.025, by + bh / 2 + 1);
    ctx.restore();
  }
}

// The whole cover. photos: array of HTMLImageElement (or null) in tray order.
// state.slots[i].photo is an index into photos, or null.
export function renderCover(ctx, state, photos, W, H) {
  ctx.clearRect(0, 0, W, H);
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grade.sky[0]);
  bg.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const rects = panelRects(state, W, H);
  rects.forEach((rect, i) => {
    const slot = state.slots[i];
    const img = slot && slot.photo != null ? photos[slot.photo] : null;
    if (img) drawPhotoInto(ctx, img, rect, slot);
    else drawEmptyPanel(ctx, rect, i, state.accent);
  });

  // grade wash over the whole poster
  ctx.save();
  grade.wash(ctx, W, H);
  ctx.restore();

  if (state.sunburst) drawSunburst(ctx, W, H, state.accent);
  if (state.halftone) drawHalftone(ctx, W, H, 7);

  // panel gutters: crisp white frame lines
  if (state.gutters) {
    const g = Math.max(4, Math.round(Math.min(W, H) * 0.008));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = g;
    ctx.strokeRect(g / 2, g / 2, W - g, H - g);
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = Math.max(2, g * 0.28);
    rects.forEach((r) => ctx.strokeRect(r.x, r.y, r.w, r.h));
  }

  if (state.grain) drawGrain(ctx, W, H);
  drawCaption(ctx, state, W, H);
}
