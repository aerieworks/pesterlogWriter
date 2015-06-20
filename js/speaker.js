'use strict';
(function (PW, $) {
  var CLIENT_PESTER = 'Pesterchum';
  var CLIENT_TROLLIAN = 'Trollian';

  function Speaker(name, color, handle, shortHandle, client) {
    this.name = name;
    this.shortName = name.toUpperCase();
    this.handle = handle;
    this.shortHandle = shortHandle;
    this.handleColor = color;
    this.textColor = color;
    this.client = client;
  }

  $.extend(Speaker.prototype, {
    withShortName:
      function withShortName(shortName) {
        this.shortName = shortName;
        return this;
      },

    withTextColor:
      function withTextColor(textColor) {
        this.textColor = textColor;
        return this;
      }
  });

  var speakers = {
    John: new Speaker('John', '0715cd', 'ectoBiologist', 'EB', CLIENT_PESTER),
    Rose: new Speaker('Rose', 'b536da', 'tentacleTherapist', 'TT', CLIENT_PESTER),
    Dave: new Speaker('Dave', 'e00707', 'turntechGodhead', 'TG', CLIENT_PESTER),
    Jade: new Speaker('Jade', '4ac925', 'gardenGnostic', 'GG', CLIENT_PESTER),

    Aradia: new Speaker('Aradia', 'a10000', 'apocalypseArisen', 'AA', CLIENT_TROLLIAN),
    Tavros: new Speaker('Tavros', 'a15000', 'adiosToreador', 'AT', CLIENT_TROLLIAN),
    Sollux: new Speaker('Sollux', 'a1a100', 'twinArmegeddons', 'TA', CLIENT_TROLLIAN),
    Karkat: new Speaker('Karkat', '626262', 'carcinoGeneticist', 'CG', CLIENT_TROLLIAN),
    Nepeta: new Speaker('Nepeta', '416600', 'arsenicCatnip', 'AC', CLIENT_TROLLIAN),
    Kanaya: new Speaker('Kanaya', '008141', 'grimAuxilliatrix', 'GA', CLIENT_TROLLIAN),
    Terezi: new Speaker('Terezi', '008282', 'gallowsCalibrator', 'GC', CLIENT_TROLLIAN),
    Vriska: new Speaker('Vriska', '005682', 'arachnidsGrip', 'AG', CLIENT_TROLLIAN),
    Equius: new Speaker('Equius', '000056', 'centaursTesticle', 'CT', CLIENT_TROLLIAN),
    Gamzee: new Speaker('Gamzee', '2b0057', 'terminallyCapricious', 'TC', CLIENT_TROLLIAN),
    Eridan: new Speaker('Eridan', '6a006a', 'caligulasAquarium', 'CA', CLIENT_TROLLIAN),
    Feferi: new Speaker('Feferi', '77003c', 'cuttlefishCuller', 'CC', CLIENT_TROLLIAN),

    GO_Vriska: new Speaker('Vriska (Game Over)', '005682', 'arachnidsGrip', 'AG', CLIENT_TROLLIAN)
      .withShortName('(VRISKA)'),

    Jasprosesprite: new Speaker('Jasprosesprite^2', 'f141ef').withTextColor('b536da')
  };

  var speakerNames = [];
  for (var name in speakers) {
    if (speakers.hasOwnProperty(name)) {
      speakerNames.push(name);
    }
  }

  speakers.forEach = function forEach(fn) {
    for (var i = 0; i < speakerNames.length; i++) {
      var name = speakerNames[i];
      fn(name, speakers[name]);
    }
  };
  speakers.forEach(function (id, speaker) {
    speaker.id = id;
  });

  PW.Speakers = speakers;
})(window.PesterWriter, jQuery);
