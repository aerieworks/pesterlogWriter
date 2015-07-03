'use strict';
(function (PW, $) {
  var CLIENT_PESTER = 'Pesterchum';
  var CLIENT_TROLLIAN = 'Trollian';

  var vriskaQuirks = [
    { re: /(\w)at(?:e|(ed|ing|ion|ions|ioned|ioning))$/, replacement: '$18$2' },
    { re: /(\w)ates$/, replacement: '$18s' },
    { re: /(\w)ait(s|ed|ing)$/, replacement: '$18$2' },
    { re: /[bB]/, replacement: '8' }
  ];

  function noopQuirkFilter(input, cursor, text) {
    return input;
  }

  function Speaker(name, color, handle, shortHandle, client, quirkFilter) {
    this.name = name;
    this.dialogName = name.toUpperCase();
    this.handle = handle;
    this.shortHandle = shortHandle;
    this.handleColor = color;
    this.textColor = color;
    this.client = client;
    this.quirkFilter = quirkFilter || noopQuirkFilter;
  }

  $.extend(Speaker.prototype, {
    withDialogName:
      function withDialogName(dialogName) {
        this.dialogName = dialogName;
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

    Aradia: new Speaker('Aradia', 'a10000', 'apocalypseArisen', 'AA', CLIENT_TROLLIAN,
        function (input) {
          if (input == 'o' || input == 'O') {
            return '0';
          }
          return input;
        }),
    Tavros: new Speaker('Tavros', 'a15000', 'adiosToreador', 'AT', CLIENT_TROLLIAN,
        function (input, cursor, text) {
          var newText = text.substring(0, cursor.start) + input;
          console.log('Tavros: "' + newText + '"');
          if (/(^|[\.!?]\s+)\w$/.test(newText)) {
            return input.toLowerCase();
          }
          return input.toUpperCase();
        }),
    Sollux: new Speaker('Sollux', 'a1a100', 'twinArmegeddons', 'TA', CLIENT_TROLLIAN,
        function (input) {
          if (input == 'i' || input == 'I') {
            return input + input;
          }
          return input;
        }),
    Karkat: new Speaker('Karkat', '626262', 'carcinoGeneticist', 'CG', CLIENT_TROLLIAN,
        function (input) {
          return input.toUpperCase();
        }),
    Nepeta: new Speaker('Nepeta', '416600', 'arsenicCatnip', 'AC', CLIENT_TROLLIAN),
    Kanaya: new Speaker('Kanaya', '008141', 'grimAuxilliatrix', 'GA', CLIENT_TROLLIAN,
        function (input, cursor, text) {
          if (/^\W?\w$/.test(text.charAt(cursor.start - 1) + input)) {
            return input.toUpperCase();
          }
          return input;
        }),
    Terezi: new Speaker('Terezi', '008282', 'gallowsCalibrator', 'GC', CLIENT_TROLLIAN,
        function (input) {
          if (input == 'a' || input == 'A') {
            return '4';
          } else if (input == 'i' || input == 'I') {
            return '1';
          } else if (input == 'e' || input == 'E') {
            return '3';
          }
          return input.toUpperCase();
        }),
    Vriska: new Speaker('Vriska', '005682', 'arachnidsGrip', 'AG', CLIENT_TROLLIAN,
        function (input, cursor, text) {
          var newText = text.substring(0, cursor.start) + input + text.substring(cursor.end, text.length);
          for (var i = 0; i < vriskaQuirks.length; i++) {
            var quirk = vriskaQuirks[i];
            if (quirk.re.test(newText)) {
              //return newText.replace(quirk.re, quirk.replacement);
            }
          }
          return input;
        }),
    Equius: new Speaker('Equius', '000056', 'centaursTesticle', 'CT', CLIENT_TROLLIAN),
    Gamzee: new Speaker('Gamzee', '2b0057', 'terminallyCapricious', 'TC', CLIENT_TROLLIAN,
        function (input, cursor) {
          if (cursor.start % 2 == 0) {
            return input.toUpperCase();
          }
          return input.toLowerCase();
        }),
    Eridan: new Speaker('Eridan', '6a006a', 'caligulasAquarium', 'CA', CLIENT_TROLLIAN,
        function (input) {
          if (input == 'w' || input == 'W') {
            return input + input;
          }
          return input;
        }),
    Feferi: new Speaker('Feferi', '77003c', 'cuttlefishCuller', 'CC', CLIENT_TROLLIAN,
        function (input) {
          if (input == 'e' || input == 'E') {
            return '-E';
          }
          return input;
        }),

    GO_Vriska: new Speaker('Vriska (Game Over)', '005682', 'arachnidsGrip', 'AG', CLIENT_TROLLIAN)
      .withDialogName('(VRISKA)'),

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
