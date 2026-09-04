// Threat catalog + glyph drawing.
// Every symbol is drawn procedurally (numerals/letters + simple vector shapes),
// mirroring how the real ALR-67 azimuth indicator encodes threats: a label for
// the emitter, plus shape/decoration for its class (airborne, naval, unknown).
window.RWR = window.RWR || {};

RWR.THREAT_TYPES = {
  SA2:   { label: '2',  name: 'SA-2 Guideline (SAM)',      kind: 'sam',     lethality: 3 },
  SA3:   { label: '3',  name: 'SA-3 Goa (SAM)',            kind: 'sam',     lethality: 3 },
  SA6:   { label: '6',  name: 'SA-6 Gainful (SAM)',        kind: 'sam',     lethality: 4 },
  SA8:   { label: '8',  name: 'SA-8 Gecko (SAM)',          kind: 'sam',     lethality: 3 },
  SA10:  { label: '10', name: 'SA-10 Grumble (SAM)',       kind: 'sam',     lethality: 5 },
  SA11:  { label: '11', name: 'SA-11 Gadfly (SAM)',        kind: 'sam',     lethality: 4 },
  SA15:  { label: '15', name: 'SA-15 Gauntlet (SAM)',      kind: 'sam',     lethality: 4 },
  AAA:   { label: '23', name: 'ZSU-23-4 Shilka (AAA)',     kind: 'aaa',     lethality: 2 },
  MIG:   { label: 'MG', name: 'MiG (airborne intercept)',  kind: 'ai',      lethality: 3 },
  SU:    { label: 'SU', name: 'Su (airborne intercept)',   kind: 'ai',      lethality: 3 },
  NAVAL: { label: 'N',  name: 'Naval search radar',        kind: 'naval',   lethality: 1 },
  UNK:   { label: 'U',  name: 'Unknown emitter',           kind: 'unknown', lethality: 1 },
};

// Draws one threat glyph centered at (x, y). `scale` is roughly the font size in px.
RWR.drawSymbol = function drawSymbol(ctx, typeKey, x, y, scale, color) {
  const def = RWR.THREAT_TYPES[typeKey] || RWR.THREAT_TYPES.UNK;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${scale}px "Courier New", monospace`;

  if (def.kind === 'ai') {
    // small delta/wedge above the label marks it as airborne
    ctx.beginPath();
    ctx.moveTo(0, -scale * 0.9);
    ctx.lineTo(scale * 0.5, -scale * 0.15);
    ctx.lineTo(-scale * 0.5, -scale * 0.15);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText(def.label, 0, scale * 0.55);
  } else if (def.kind === 'naval') {
    ctx.fillText(def.label, 0, 0);
    ctx.beginPath();
    ctx.moveTo(-scale * 0.5, scale * 0.6);
    ctx.lineTo(scale * 0.5, scale * 0.6);
    ctx.stroke();
  } else if (def.kind === 'unknown') {
    ctx.fillText(def.label, 0, 0);
    ctx.beginPath();
    ctx.setLineDash([2, 3]);
    ctx.arc(0, 0, scale * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // sam / aaa -> plain numeral, matching the real display's convention
    ctx.fillText(def.label, 0, 0);
  }

  ctx.restore();
};
