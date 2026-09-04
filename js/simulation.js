// Threat state machine + scenario presets.
window.RWR = window.RWR || {};

RWR.Simulation = class Simulation {
  constructor(audio) {
    this.audio = audio;
    this.threats = [];
    this.paused = false;
  }

  add(typeKey, opts) {
    const t = RWR.createThreat(typeKey, opts);
    this.threats.push(t);
    if (this.audio) this.audio.playSearchBlip(t.id, t.bearing);
    return t;
  }

  remove(id) {
    this.threats = this.threats.filter((t) => t.id !== id);
    if (this.audio) this.audio.stop(id);
  }

  clear() {
    this.threats.forEach((t) => this.audio && this.audio.stop(t.id));
    this.threats = [];
  }

  update(dt) {
    if (this.paused) return;

    this.threats.forEach((t) => {
      // slow bearing drift so the picture feels alive, not static
      t.bearing = (t.bearing + Math.sin(t._driftSeed + performance.now() / 4000) * 6 * dt + 360) % 360;

      if (t.isNew) {
        t.newTimer -= dt;
        if (t.newTimer <= 0) t.isNew = false;
      }

      t.stateTimer -= dt;
      if (t.stateTimer <= 0) this._advanceState(t);

      if (this.audio) this.audio.updateBearing(t.id, t.bearing);
    });
  }

  _advanceState(t) {
    if (t.state === 'search') {
      t.state = 'track';
      t.stateTimer = 5 + Math.random() * 6;
      this.audio && this.audio.playTrackTone(t.id, t.bearing);
    } else if (t.state === 'track') {
      if (Math.random() < 0.35) {
        t.state = 'launch';
        t.stateTimer = 4 + Math.random() * 3;
        this.audio && this.audio.playLaunchWarble(t.id, t.bearing);
      } else {
        t.state = 'search';
        t.stateTimer = 4 + Math.random() * 5;
        this.audio && this.audio.playSearchBlip(t.id, t.bearing);
      }
    } else if (t.state === 'launch') {
      t.state = 'track';
      t.stateTimer = 5 + Math.random() * 5;
      this.audio && this.audio.playTrackTone(t.id, t.bearing);
    }
  }
};

RWR.SCENARIOS = {
  quiet: [
    { type: 'UNK', bearing: 40 },
  ],
  sam_ambush: [
    { type: 'SA6', bearing: 300 },
    { type: 'SA6', bearing: 340 },
    { type: 'AAA', bearing: 320 },
  ],
  strike_package: [
    { type: 'SA10', bearing: 10 },
    { type: 'SA8', bearing: 60 },
    { type: 'MIG', bearing: 250 },
    { type: 'SU', bearing: 270 },
    { type: 'AAA', bearing: 200 },
    { type: 'NAVAL', bearing: 150 },
  ],
};
