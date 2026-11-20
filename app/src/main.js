// Palm Shores Cover Studio — editor UI.
// Wires the controls to the render engine in cover.js. Everything runs
// locally: photos are read on this machine and never uploaded.
import { SIZES, LAYOUTS, GRADES, TITLE_COLORS, defaultState, panelRects, renderCover } from './cover.js';

const $ = (id) => document.getElementById(id);
const state = defaultState();
const photos = []; // { img, name, sample } in tray order
let previewScale = 1;

const preview = $('preview');
const pctx = preview.getContext('2d');

function sizeWH() {
  const s = SIZES[state.size];
  return [s.w, s.h];
}

function drawPreview() {
  const [W, H] = sizeWH();
  const fitW = Math.min(760, document.querySelector('.stage').clientWidth - 8);
  const scale = Math.min(fitW / W, 620 / H);
  preview.width = Math.round(W * scale);
  preview.height = Math.round(H * scale);
  preview.style.width = `${preview.width}px`;
  preview.style.height = `${preview.height}px`;
  previewScale = scale;
  pctx.save();
  pctx.scale(scale, scale);
  renderCover(pctx, state, photos.map((p) => p.img), W, H);
  pctx.restore();
  // selected-panel outline on the preview
  if (state.selected != null) {
    const rects = panelRects(state, W, H);
    const r = rects[state.selected];
    if (r) {
      pctx.save();
      pctx.strokeStyle = '#ffd60a';
      pctx.lineWidth = 3;
      pctx.setLineDash([10, 6]);
      pctx.strokeRect(r.x * scale, r.y * scale, r.w * scale, r.h * scale);
      pctx.restore();
    }
  }
  updatePanelControls();
}

function thumbEl(photo, i) {
  const d = document.createElement('div');
  d.className = 'thumb';
  d.title = `${photo.name} — click to put it in the selected panel`;
  const im = document.createElement('img');
  im.src = photo.img.src;
  im.alt = photo.name;
  d.appendChild(im);
  const tag = document.createElement('span');
  tag.textContent = photo.sample ? 'SAMPLE' : 'YOUR PHOTO';
  d.appendChild(tag);
  d.addEventListener('click', () => {
    assignPhoto(i);
    d.classList.add('flash');
    setTimeout(() => d.classList.remove('flash'), 350);
  });
  return d;
}

function renderTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  photos.forEach((p, i) => tray.appendChild(thumbEl(p, i)));
  $('photoCount').textContent = photos.length === 0
    ? 'No photos yet — add yours or try a sample.'
    : `${photos.length} photo${photos.length > 1 ? 's' : ''} loaded. Click one to fill the selected panel.`;
}

function assignPhoto(i) {
  const slot = state.slots[state.selected];
  if (!slot) return;
  slot.photo = i;
  slot.zoom = 1; slot.ox = 0; slot.oy = 0; slot.flip = false;
  drawPreview();
}

function addPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { photos.push({ img, name: file.name, sample: false }); renderTray(); drawPreview(); resolve(); };
    img.onerror = () => reject(new Error(`could not read ${file.name}`));
    img.src = url;
  });
}

async function loadSample(name) {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error(`sample ${name} failed to load`));
    img.src = `samples/${name}`;
  });
  photos.push({ img, name, sample: true });
  renderTray();
  drawPreview();
}

async function loadSamplesIntoPanels() {
  // First run convenience: both samples in, spread across the panels.
  if (photos.length === 0) {
    await loadSample('sunset-boulevard.png');
    await loadSample('neon-pier.png');
  }
  state.slots.forEach((slot, i) => {
    if (slot.photo == null && photos.length > 0) slot.photo = i % photos.length;
  });
  drawPreview();
}

function buildButtons(container, entries, current, onPick) {
  const el = $(container);
  el.innerHTML = '';
  for (const [key, def] of entries) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pick' + (key === current ? ' active' : '');
    b.textContent = def.label;
    b.title = def.hint ?? def.label;
    b.addEventListener('click', () => {
      onPick(key);
      el.querySelectorAll('.pick').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      drawPreview();
    });
    el.appendChild(b);
  }
}

function buildSwatches() {
  const el = $('titleColors');
  el.innerHTML = '';
  for (const c of TITLE_COLORS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch' + (c === state.titleColor ? ' active' : '');
    b.style.background = c;
    b.title = c;
    b.setAttribute('aria-label', `title colour ${c}`);
    b.addEventListener('click', () => {
      state.titleColor = c;
      el.querySelectorAll('.swatch').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      drawPreview();
    });
    el.appendChild(b);
  }
  const accent = $('accentColor');
  accent.value = state.accent;
  accent.addEventListener('input', () => { state.accent = accent.value; drawPreview(); });
}

function updatePanelControls() {
  const slot = state.slots[state.selected];
  const n = panelRects(state, ...sizeWH()).length;
  $('panelLabel').textContent = `Panel ${state.selected + 1} of ${n}`;
  $('zoom').value = slot ? slot.zoom : 1;
  $('panX').value = slot ? slot.ox : 0;
  $('panY').value = slot ? slot.oy : 0;
  $('zoomVal').textContent = `${Math.round((slot ? slot.zoom : 1) * 100)}%`;
  $('flipBtn').textContent = slot && slot.flip ? '↔ Flipped — click to unflip' : '↔ Flip photo';
}

function bindPanelControls() {
  $('zoom').addEventListener('input', (e) => {
    const slot = state.slots[state.selected];
    if (slot) slot.zoom = parseFloat(e.target.value);
    drawPreview();
  });
  $('panX').addEventListener('input', (e) => {
    const slot = state.slots[state.selected];
    if (slot) slot.ox = parseFloat(e.target.value);
    drawPreview();
  });
  $('panY').addEventListener('input', (e) => {
    const slot = state.slots[state.selected];
    if (slot) slot.oy = parseFloat(e.target.value);
    drawPreview();
  });
  $('flipBtn').addEventListener('click', () => {
    const slot = state.slots[state.selected];
    if (slot) slot.flip = !slot.flip;
    drawPreview();
  });
  $('fillAllBtn').addEventListener('click', () => {
    const slot = state.slots[state.selected];
    if (!slot || slot.photo == null) return;
    state.slots.forEach((s) => { s.photo = slot.photo; });
    drawPreview();
  });
  $('clearPanelBtn').addEventListener('click', () => {
    const slot = state.slots[state.selected];
    if (slot) { slot.photo = null; slot.zoom = 1; slot.ox = 0; slot.oy = 0; slot.flip = false; }
    drawPreview();
  });
  preview.addEventListener('click', (e) => {
    const box = preview.getBoundingClientRect();
    const x = (e.clientX - box.left) / previewScale;
    const y = (e.clientY - box.top) / previewScale;
    const [W, H] = sizeWH();
    const rects = panelRects(state, W, H);
    const hit = rects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (hit >= 0) { state.selected = hit; drawPreview(); }
  });
}

function bindCaption() {
  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value; drawPreview(); });
  $('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; drawPreview(); });
  $('badgeInput').addEventListener('input', (e) => { state.badge = e.target.value; drawPreview(); });
}

function bindToggles() {
  for (const key of ['halftone', 'sunburst', 'grain', 'gutters']) {
    $(`toggle-${key}`).addEventListener('change', (e) => {
      state[key] = e.target.checked;
      drawPreview();
    });
  }
}

function bindUpload() {
  const input = $('fileInput');
  $('uploadBtn').addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    for (const f of input.files) {
      try { await addPhotoFile(f); } catch (err) { setStatus(err.message, true); }
    }
    input.value = '';
    if (state.slots.every((s) => s.photo == null) && photos.length > 0) {
      state.slots.forEach((s, i) => { s.photo = i % photos.length; });
      drawPreview();
    }
  });
  const drop = $('dropzone');
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', async (e) => {
    for (const f of e.dataTransfer.files) {
      if (!f.type.startsWith('image/')) continue;
      try { await addPhotoFile(f); } catch (err) { setStatus(err.message, true); }
    }
  });
  $('sampleSunset').addEventListener('click', async () => {
    try { await loadSample('sunset-boulevard.png'); } catch (err) { setStatus(err.message, true); }
  });
  $('samplePier').addEventListener('click', async () => {
    try { await loadSample('neon-pier.png'); } catch (err) { setStatus(err.message, true); }
  });
  $('autoFillBtn').addEventListener('click', loadSamplesIntoPanels);
}

function setStatus(msg, isError = false) {
  const el = $('status');
  el.textContent = msg;
  el.classList.toggle('error', isError);
}

// Export the cover at the exact post size. Returns the PNG blob.
export async function exportPNG() {
  const [W, H] = sizeWH();
  const off = document.createElement('canvas');
  off.width = W;
  off.height = H;
  renderCover(off.getContext('2d'), state, photos.map((p) => p.img), W, H);
  return new Promise((resolve, reject) => {
    off.toBlob((b) => (b ? resolve(b) : reject(new Error('export failed'))), 'image/png');
  });
}

function bindExport() {
  $('exportBtn').addEventListener('click', async () => {
    setStatus('Rendering PNG…');
    try {
      const blob = await exportPNG();
      const [W, H] = sizeWH();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `palm-shores-cover-${W}x${H}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
      setStatus(`Exported ${W} × ${H} PNG (${(blob.size / 1024).toFixed(0)} KB) — check your downloads.`);
    } catch (err) {
      setStatus(err.message, true);
    }
  });
}

// Test / automation hook: the screenshots and the determinism check drive
// the app through this, exactly as a user would through the buttons.
window.coverStudio = {
  state,
  photos,
  drawPreview,
  loadSample,
  loadSamplesIntoPanels,
  assignPhoto,
  async exportDataURL() {
    const blob = await exportPNG();
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  },
};

async function init() {
  buildButtons('layoutBtns', Object.entries(LAYOUTS), state.layout, (k) => {
    state.layout = k;
    state.selected = 0;
  });
  buildButtons('gradeBtns', Object.entries(GRADES), state.grade, (k) => { state.grade = k; });
  buildButtons('sizeBtns', Object.entries(SIZES).map(([k, v]) => [k, { label: v.label, hint: v.label }]), state.size, (k) => { state.size = k; });
  buildSwatches();
  bindPanelControls();
  bindCaption();
  bindToggles();
  bindUpload();
  bindExport();
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('badgeInput').value = state.badge;
  renderTray();
  try {
    await document.fonts.ready;
  } catch { /* fonts fall back to system sans */ }
  drawPreview();
  setStatus('Ready — pick a layout, add a photo, then export a PNG.');
  window.addEventListener('resize', drawPreview);
}

init();
