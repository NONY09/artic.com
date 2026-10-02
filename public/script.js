// Decorative geometry, never a real-time metric or a completion percentage.
const icons = {
  pix: '<path d="m12 3 4 4-4 4-4-4Zm0 10 4 4-4 4-4-4ZM3 12l4-4 4 4-4 4Zm10 0 4-4 4 4-4 4Z"/>',
  barcode: '<path d="M3 5v14M6 5v14M9 5v14M13 5v14M16 5v14M20 5v14"/>',
  document: '<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8M8 16h5"/>',
  pos: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 6h6v4H9ZM9 14h1m4 0h1m-6 3h1m4 0h1"/>',
  users: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-3-5"/>',
  coins: '<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v9c0 2 3 3 6 3M3 11c0 2 3 3 6 3M9 9v6"/><circle cx="16" cy="16" r="6"/><path d="M16 12v8m-2-6h3a1 1 0 0 1 0 2h-2a1 1 0 0 0 0 2h3"/>',
  chart: '<path d="M3 21h18M5 17v-4m5 4V9m5 8v-6m5 6V4M4 8l6-4 5 3 6-5m-4 0h4v4"/>',
  handshake: '<path d="m3 7 4-3 5 2 5-2 4 3-3 10-6 4-6-4ZM7 12l5-6m-5 6 3 2 4-3 5 5M3 7l4 5M21 7l-4 4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
};
document.querySelectorAll('[data-icon]').forEach((item) => {
  const target = item.querySelector('.service-icon');
  target.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[item.dataset.icon]}</svg>`;
});

const canvas = document.getElementById('connections');
const ctx = canvas.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let size = 0, rotation = 0, frame = 0, lastTime = 0, visible = true, paused = false;
let pointerX = 0, pointerY = 0;
function project(lat, lon, angle) {
  const x = Math.cos(lat) * Math.sin(lon + angle);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon + angle);
  const tilt = -.22;
  return { x: x * Math.cos(tilt) - y * Math.sin(tilt), y: x * Math.sin(tilt) + y * Math.cos(tilt), z };
}
function draw() {
  if (!size || !ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const c = size / 2, r = size * .35, a = rotation + pointerX;
  function line(points, alpha = .2) {
    ctx.beginPath();
    let started = false;
    for (const p of points) {
      if (p.z < -.1) { started = false; continue; }
      const x = c + p.x * r, y = c + p.y * r + pointerY;
      if (started) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      started = true;
    }
    ctx.strokeStyle = `rgba(75,221,232,${alpha})`; ctx.lineWidth = .7; ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const pts = [];
    for (let n = 0; n <= 120; n++) pts.push(project(lat * Math.PI / 180, n * Math.PI / 60, a));
    line(pts, .21);
  }
  for (let lon = 0; lon < 360; lon += 20) {
    const pts = [];
    for (let n = 0; n <= 60; n++) pts.push(project(-Math.PI / 2 + n * Math.PI / 60, lon * Math.PI / 180, a));
    line(pts, .16);
  }
  // Orbital paths around the sphere.
  ctx.save();ctx.translate(c, c);ctx.rotate(-.55);
  [1, 1.15].forEach((scale, index) => {ctx.beginPath();ctx.ellipse(0, 0, r * scale, r * (.55 + index * .1), 0, 0, Math.PI * 2);ctx.strokeStyle = index ? '#32668a66' : '#4bdde888';ctx.lineWidth = .8;ctx.stroke();});ctx.restore();
  for (let n = 0; n < 80; n++) {
    const lat = Math.asin(1 - 2 * (n + .5) / 80), lon = n * 2.39996;
    const p = project(lat, lon, a);
    if (p.z < 0) continue;
    ctx.beginPath();ctx.arc(c + p.x * r, c + p.y * r + pointerY, 1 + p.z * .9, 0, Math.PI * 2);
    ctx.fillStyle = n % 9 === 0 ? '#ffd05a' : `rgba(111,230,244,${.3 + p.z * .6})`;ctx.fill();
  }
}
function tick(time) {
  frame = 0;
  if (!visible || document.hidden || reduced.matches || paused || !ctx) return;
  const delta = Math.min((time - lastTime) || 16, 40);lastTime = time;
  rotation += delta * .000055;draw();frame = requestAnimationFrame(tick);
}
function start() { if (!frame && visible && !document.hidden && !reduced.matches && !paused && ctx) {lastTime = 0;frame = requestAnimationFrame(tick);} }
function resize() {size = canvas.clientWidth;const dpr = Math.min(devicePixelRatio || 1, 2);canvas.width = Math.round(size * dpr);canvas.height = Math.round(size * dpr);draw();start();}
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;if (visible) start();else {cancelAnimationFrame(frame);frame = 0;} }).observe(canvas);
document.addEventListener('visibilitychange', () => {if (document.hidden) {cancelAnimationFrame(frame);frame = 0;} else start();});
const motionToggle = document.querySelector('.motion-toggle');
motionToggle.hidden = reduced.matches;
motionToggle.addEventListener('click', () => {
  paused = !paused;
  document.body.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = paused ? 'Retomar animação' : 'Pausar animação';
  cancelAnimationFrame(frame);frame = 0;start();
});
reduced.addEventListener('change', () => {motionToggle.hidden = reduced.matches;cancelAnimationFrame(frame);frame = 0;draw();start();});
canvas.parentElement.addEventListener('pointermove', (event) => {if(reduced.matches || event.pointerType === 'touch') return;const box = canvas.getBoundingClientRect();pointerX = ((event.clientX - box.left) / box.width - .5) * .15;pointerY = ((event.clientY - box.top) / box.height - .5) * 6;});
canvas.parentElement.addEventListener('pointerleave', () => {pointerX = 0;pointerY = 0;});
