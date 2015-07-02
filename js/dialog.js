'use strict';
(function (PW, $) {

  function Dialog(type) {
    this.type = type;
    this.lines = [];
  }

  Dialog.fromJson = function Dialog_fromJson(o) {
    var dialog = new Dialog(Dialog.Types[o.type]);
    for (var i = 0; i < o.lines.length; i++) {
      dialog.lines.push(DialogLine.fromJson(dialog, o.lines[i]));
    }
    return dialog;
  }

  $.extend(Dialog.prototype, {
    addLine:
      function addLine(speaker, content) {
        var newLine = new DialogLine(this, speaker, content);
        this.lines.push(newLine);
        return newLine;
      },

    getLineCount:
      function getLineCount() {
        return this.lines.length;
      },

    getPreviousSpeaker:
      function getPreviousSpeaker(priorToLine) {
        var previousSpeaker = null;
        var currentSpeaker = null;
        for (var i = 0; i < this.lines.length; i++) {
          var line = this.lines[i];
          if (line.speaker != currentSpeaker) {
            previousSpeaker = currentSpeaker;
            currentSpeaker = line.speaker;
          }
          if (line == priorToLine) {
            break;
          }
        }

        return previousSpeaker;
      },

    toJson:
      function toJson() {
        var lines = this.lines.map(function (line) { return line.toJson(); });
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
    this.content = content || '';
  }

  DialogLine.fromJson = function DialogLine_fromJson(dialog, o) {
    return new DialogLine(dialog, PW.Speakers[o.speaker], o.content);
  };

  $.extend(DialogLine.prototype, {
    getNext:
      function getNext() {
        for (var i = 0; i < this.dialog.lines.length - 1; i++) {
          if (this.dialog.lines[i] == this) {
            return this.dialog.lines[i + 1];
          }
        }

        return null;
      },

    getPrevious:
      function getPrevious() {
        for (var i = 1; i < this.dialog.lines.length; i++) {
          if (this.dialog.lines[i] == this) {
            return this.dialog.lines[i - 1];
          }
        }

        return null;
      },

    getSpeakerName:
      function getSpeakerName() {
        return this.dialog.type.getNameFor(this.speaker);
      },

    toJson:
      function toJson() {
        return { speaker: this.speaker.id, content: this.content };
      }
  });

  PW.Dialog = Dialog;
})(window.PesterWriter, jQuery);
