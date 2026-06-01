(function () {
  var CODES = [
    ['71427321893', 'Abundancia eterna'],
    ['289 471 314917', 'Prosperidad en negocios'],
    ['91688', 'Remover obstáculos'],
    ['4987123184991', 'Rentabilidad máxima'],
    ['318 612 518 714', 'Flujo constante de dinero'],
    ['520', 'Dinero inesperado'],
    ['741', 'Resultados inmediatos'],
    ['8888', 'Protección divina'],
    ['777', 'Suerte universal'],
    ['5207418', 'Dinero viene fácil'],
    ['819 419 714', 'Independencia económica'],
    ['918197185', 'Éxito absoluto'],
    ['719 481 71', 'Materializar planes'],
    ['419 488 71', 'Atraer circunstancias favorables'],
    ['318719 819', 'Auto realización'],
    ['14111963', 'Armonía en el trabajo'],
    ['518 617219 71', 'Rendimiento efectivo']
  ];

  function buildCodesRow() {
    var wrap = document.createElement('div');
    wrap.className = 'grabovoi-codes';
    CODES.forEach(function (item, i) {
      if (i > 0) {
        var sep = document.createElement('div');
        sep.className = 'grab-sep';
        sep.textContent = '\u00b7';
        wrap.appendChild(sep);
      }
      var code = document.createElement('div');
      code.className = 'grab-code';
      var num = document.createElement('span');
      num.className = 'grab-num';
      num.textContent = item[0];
      var desc = document.createElement('span');
      desc.className = 'grab-desc';
      desc.textContent = item[1];
      code.appendChild(num);
      code.appendChild(desc);
      wrap.appendChild(code);
    });
    return wrap;
  }

  var track = document.getElementById('grabovoiTrack');
  if (!track) return;
  track.appendChild(buildCodesRow());
  track.appendChild(buildCodesRow());
})();
