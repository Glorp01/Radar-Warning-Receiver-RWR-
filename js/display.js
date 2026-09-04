// Scope renderer -- draws the circular azimuth display to a canvas every frame.
window.RWR = window.RWR || {};

RWR.Renderer = class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.bright = true;
    this.maxRange = 40; // nm, mapped to the outer edge of the scope
  }

  // Converts bearing (deg, 0 = nose, clockwise) + range (nm) into canvas x/y.
  // Standard sin/cos would put 0deg to the right and go counter-clockwise --
  // flipped here so 0deg is straight up and increases clockwise, like a compass.
  polar(bearingDeg, rangeNm, cx, cy, R) {
    const clamped = Math.min(rangeNm, this.maxRange);
    const r = (clamped / this.maxRange) * (R - 30) + 14;
    const rad = bearingDeg * (Math.PI / 180);
    return {
      x: cx + r * Math.sin(rad),
      y: cy - r * Math.cos(rad),
    };
  }

  draw(threats, opts) {
    opts = opts || {};
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) / 2 - 8;
    const dim = this.bright ? 1 : 0.5;
    const color = `rgba(80, 255, 120, ${dim})`;
    const dimColor = `rgba(80, 255, 120, ${dim * 0.35})`;

    ctx.clearRect(0, 0, w, h);

    // scope background
    ctx.fillStyle = 'rgba(4, 10, 6, 1)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // range rings
    ctx.lineWidth = 1;
    ctx.strokeStyle = dimColor;
    [0.4, 0.75].forEach((f) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // degree ticks every 30deg, longer every 90deg
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = deg * (Math.PI / 180);
      const outer = R;
      const inner = R - (deg % 90 === 0 ? 14 : 8);
      ctx.beginPath();
      ctx.moveTo(cx + outer * Math.sin(rad), cy - outer * Math.cos(rad));
      ctx.lineTo(cx + inner * Math.sin(rad), cy - inner * Math.cos(rad));
      ctx.strokeStyle = color;
      ctx.stroke();
    }

    // ownship chevron at center
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx - 7, cy + 6);
    ctx.lineTo(cx, cy + 2);
    ctx.lineTo(cx + 7, cy + 6);
    ctx.closePath();
    ctx.stroke();

    if (opts.systest) {
      this._drawSysTest(cx, cy, R, color);
      return;
    }

    threats.forEach((t) => {
      const { x, y } = this.polar(t.bearing, t.range, cx, cy, R);

      // new contacts and active launches blink at ~2.5Hz
      if (t.isNew || t.state === 'launch') {
        const flashOn = Math.floor(performance.now() / 200) % 2 === 0;
        if (!flashOn) return;
      }

      RWR.drawSymbol(ctx, t.type, x, y, 16, color);

      if (t.state === 'track' || t.state === 'launch') {
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (t.state === 'launch') {
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('L', x + 14, y - 12);
      }
    });
  }

  _drawSysTest(cx, cy, R, color) {
    const ctx = this.ctx;
    const keys = Object.keys(RWR.THREAT_TYPES);
    keys.forEach((k, i) => {
      const bearing = (360 / keys.length) * i;
      const { x, y } = this.polar(bearing, 20, cx, cy, R);
      RWR.drawSymbol(ctx, k, x, y, 16, color);
    });
  }
};
