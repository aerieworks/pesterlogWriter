'use strict';
(function (PW, $) {

  function Dialog(type) {
    this.type = type;
    this.lines = [];
  }

  $.extend(Dialog.prototype, {
    addLine:
      function addLine(speaker) {
        var newLine = new DialogLine(this, speaker);
        this.lines.push(newLine);
        return newLine;
      },

    serialize:
      function serialize() {
        var lines = this.lines.map(function (line) { return line.serialize(); });
        return { type: this.type.id, lines: lines };
      }
  });

  function DialogType(id, name, speakerNameField) {
    this.id = id;
    this.name = name;
    this.speakerNameField = speakerNameField;
  }

  $.extend(DialogType.prototype, {
    getNameFor:
      function getNameFor(speaker) {
        return speaker[this.speakerNameField];
      }
  });

  Dialog.Types = {
    Pesterlog: new DialogType('Pesterlog', 'Pesterlog', 'shortHandle'),
    Dialoglog: new DialogType('Dialoglog', 'Dialoglog', 'dialogName')
  };

  function DialogLine(dialog, speaker, content) {
    this.dialog = dialog;
    this.speaker = speaker;
    this.content = (typeof content == 'string' ? content : '');
  }

  $.extend(DialogLine.prototype, {
    getSpeakerName:
      function getSpeakerName() {
        return this.dialog.type.getNameFor(this.speaker);
      },

    serialize:
      function serialize() {
        return { speaker: this.speaker.id, content: this.content };
      }
  });

  PW.Dialog = Dialog;
})(window.PesterWriter, jQuery);
