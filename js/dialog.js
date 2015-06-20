'use strict';
(function (PW, $) {

  function Dialog(name, speakerNameField) {
    this.name = name;
    this.speakerNameField = speakerNameField;
  }

  $.extend(Dialog.prototype, {
    getNameFor:
      function getNameFor(speaker) {
        return speaker[this.speakerNameField];
      }
  });

  PW.Dialogs = {
    Pesterlog: new Dialog('Pesterlog', 'shortHandle')
  };
})(window.PesterWriter, jQuery);
