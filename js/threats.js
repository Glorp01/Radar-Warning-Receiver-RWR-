// Threat data model. A "threat" is a plain object, not a class — simulation.js
// and display.js just read/mutate its fields directly.
window.RWR = window.RWR || {};

(function () {
  let _id = 0;

  // typeKey must be a key in RWR.THREAT_TYPES (see symbols.js).
  RWR.createThreat = function createThreat(typeKey, opts) {
    opts = opts || {};
    return {
      id: 't' + (++_id),
      type: typeKey,
      bearing: opts.bearing != null ? opts.bearing : Math.floor(Math.random() * 360),
      range: opts.range != null ? opts.range : 8 + Math.random() * 27, // nm, cosmetic
      state: 'search', // search -> track -> launch -> track -> search
      stateTimer: 4 + Math.random() * 5,
      isNew: true,
      newTimer: 4,
      _driftSeed: Math.random() * Math.PI * 2,
    };
  };
})();
