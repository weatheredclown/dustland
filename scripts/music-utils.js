(function(){
  function clampMidiToScale(midi, key, scaleName){
    var base = { 'C':60, 'D':62, 'E':64, 'F':65, 'G':67, 'A':69, 'B':71 }[key] || 60;
    var scales = {
      major: [0,2,4,5,7,9,11],
      minor: [0,2,3,5,7,8,10],
      dorian: [0,2,3,5,7,9,10],
      phrygian: [0,1,3,5,7,8,10]
    };
    var scale = scales[scaleName] || scales.minor;
    var rel = midi - base;
    var oct = Math.floor(rel / 12);
    var sem = rel - oct * 12;
    var best = scale[0];
    var minDiff = Math.abs(sem - best);
    for (var i = 1; i < scale.length; i++){
      var diff = Math.abs(sem - scale[i]);
      if (diff < minDiff){
        minDiff = diff;
        best = scale[i];
      }
    }
    return base + oct * 12 + best;
  }
  globalThis.clampMidiToScale = clampMidiToScale;
})();
