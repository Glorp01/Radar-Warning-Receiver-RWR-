// Wires the DOM controls to Renderer / RwrAudio / Simulation and runs the
// animation loop.
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('scope');
  const renderer = new RWR.Renderer(canvas);
  const audio = new RWR.RwrAudio();
  const sim = new RWR.Simulation(audio);

  let systest = false;
  let lastTime = performance.now();

  // populate the threat-type select + legend from the catalog in symbols.js
  const sel = document.getElementById('selThreatType');
  const legend = document.getElementById('legend');
  Object.entries(RWR.THREAT_TYPES).forEach(([key, def]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${def.label} - ${def.name}`;
    sel.appendChild(opt);

    const row = document.createElement('div');
    row.className = 'legend-row';
    row.textContent = `${def.label}  ${def.name}`;
    legend.appendChild(row);
  });

  document.getElementById('btnAddThreat').addEventListener('click', () => {
    sim.add(sel.value);
  });

  document.getElementById('btnClear').addEventListener('click', () => {
    sim.clear();
  });

  document.getElementById('btnSysTest').addEventListener('click', (e) => {
    systest = !systest;
    e.target.classList.toggle('active', systest);
  });

  document.getElementById('btnDimBrt').addEventListener('click', () => {
    renderer.bright = !renderer.bright;
  });

  document.getElementById('btnPause').addEventListener('click', (e) => {
    sim.paused = !sim.paused;
    e.target.textContent = sim.paused ? 'RESUME' : 'PAUSE';
  });

  document.getElementById('chkAudio').addEventListener('change', (e) => {
    audio.setMuted(!e.target.checked);
  });

  document.getElementById('rngVolume').addEventListener('input', (e) => {
    audio.setVolume(parseFloat(e.target.value));
  });

  document.getElementById('btnLoadScenario').addEventListener('click', () => {
    const key = document.getElementById('selScenario').value;
    if (!key) return;
    sim.clear();
    (RWR.SCENARIOS[key] || []).forEach((entry) => sim.add(entry.type, entry));
  });

  function loop(now) {
    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    sim.update(dt);
    renderer.draw(sim.threats, { systest });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});
