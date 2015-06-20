'use strict';
(function (PW, $) {
  var editor;
  var dialog;
  var speakerSelector;
  var currentSpeaker;
  var lastSpeaker = null;
  var activeLine = null;

  function editor_keydown(ev) {
    console.log('KeyDown: [' + ev.charCode + '] [' + ev.which + '] [' + (ev.altKey ? 'A' : ' ') + (ev.ctrlKey ? 'C' : ' ') + (ev.metaKey ? 'M' : ' ') + (ev.shiftKey ? 'S' : ' ') + ']');
    if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && (ev.which == 66 || ev.which == 73)) {
      // Block bold/italics command hotkeys.
      console.log('Blocking Meta+' + ev.which);
      ev.preventDefault();
    } else if (ev.which == 13) {
      // Enter key adds new dialog line.
      startNewLine(false);
      ev.preventDefault();
    } else if (ev.which == 37) {
      // Left arrow at beginning should set focus on speaker selector.
      var position = findCursorPosition();
      console.log(position);
      if (position.start == 0) {
        console.log('Blocking left move.');
        showSpeakerSelector($(ev.target).closest('.dialog-line'));
        ev.preventDefault();
      }
    }
  }

  function dialogLineEditor_blur(ev) {
    var lineEditor = $(ev.target);
    lineEditor.parent().data().line.content = lineEditor.text();
  }

  function speakerLabel_mouseenter(ev) {
    showSpeakerSelector($(ev.target).closest('.dialog-line'));
  }

  function speakerSelector_mouseleave(ev) {
    console.log('Hiding speaker selector after leaving it');
    speakerSelector.addClass('inactive');
  }

  function speakerLabel_mouseleave(ev) {
    if ($(ev.relatedTarget).hasClass('speaker-selector')) {
      console.log('Ignoring leave due to speaker-selector');
      return;
    }
    console.log('Hiding speaker selector');
    speakerSelector.addClass('inactive');
  }

  function speakerLabel_click(ev) {
    ev.preventDefault();
  }

  function speakerSelector_change(ev) {
    console.log('Speaker changed.');
    if (activeLine == null) {
      console.log('No active line.');
      return;
    }

    var dialogLine = activeLine.data().line;
    dialogLine.speaker = PW.Speakers[speakerSelector.val()];
    var updatedLine = renderDialogLine(dialogLine, activeLine);
    speakerSelector.addClass('inactive');
    updatedLine[0].focus();
    activeLine = null;
  }

  function resolveRelativeOffset(target, commonParent) {
    var offset = { top: 0, left: 0 };
    do {
      offset.top += target.offsetTop;
      offset.left += target.offsetLeft;
      target = target.offsetParent;
    } while (target != null && target != commonParent);
    return offset;
  }

  function showSpeakerSelector(dialogLine) {
    console.log('Showing speaker selector');
    activeLine = dialogLine;
    var speaker = dialogLine.data().line.speaker;
    var speakerLabel = dialogLine.children('.speaker-label')[0]
    speakerSelector.val(speaker.id);
    var offset = resolveRelativeOffset(speakerLabel, speakerSelector.parent()[0]);
    speakerSelector.removeClass('inactive').css({
      top: offset.top,
      left: offset.left + speakerLabel.offsetWidth - speakerSelector.width()
    });
    speakerSelector[0].focus();
  }

  function focusOnLine(line) {
    var range = document.createRange();
    range.setStart(line.children('.dialog-line-contents')[0], 0);
    range.collapse(true);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function findCursorPosition() {
    var selection = window.getSelection();
    if (selection.rangeCount) {
      var range = selection.getRangeAt(0);
      return {
        start: range.startOffset,
        end: range.endOffset,
        container: range.startContainer
      };
    }
  }

  function createSpeakerSelector() {
    var selector = $('<select class="speaker-selector inactive"></select>');
    PW.Speakers.forEach(function (key, speaker) {
      selector.append($('<option />').text(speaker.name).val(key));
    });

    return selector;
  }

  function renderDialogLine(line, replace) {
    var speakerLabel = $('<div class="speaker-label"></div>')
      .text(line.getSpeakerName() + ': ')
      .css({ color: '#' + line.speaker.handleColor });
    var lineEditor = $('<p class="dialog-line-editor" contentEditable="true"></p>')
      .text(line.content);
    var lineDom = $('<div class="dialog-line" />')
      .data({ line: line })
      .css({ color: '#' + line.speaker.textColor })
      .append(speakerLabel)
      .append(lineEditor);
    if (replace == null) {
      editor.append(lineDom);
    } else {
      replace.replaceWith(lineDom);
    }
    lineEditor.css({ 'text-indent': speakerLabel.width() });
    return lineDom;
  }

  function startNewLine(keepSpeaker) {
    if (!keepSpeaker && lastSpeaker != null) {
      currentSpeaker = lastSpeaker;
    }

    var lineDom = renderDialogLine(dialog.addLine(currentSpeaker));
    lineDom.children('.dialog-line-editor')[0].focus();
  }

  $(function () {
    editor = $('.editor');
    editor.on('keydown', editor_keydown);
    editor.on('blur', '.dialog-line-editor', dialogLineEditor_blur);
    editor.on('mouseenter', '.speaker-label', speakerLabel_mouseenter);
    editor.on('mouseleave', '.speaker-label', speakerLabel_mouseleave);
    editor.on('click', '.speaker-label', speakerLabel_click);

    speakerSelector = createSpeakerSelector();
    speakerSelector.insertAfter(editor);
    speakerSelector.on('mouseleave', speakerSelector_mouseleave);
    speakerSelector.on('change', speakerSelector_change);

    currentSpeaker = PW.Speakers.John;
    dialog = new PW.Dialog(PW.Dialog.Types.Pesterlog);
    startNewLine();
  });
})(window.PesterWriter, jQuery);
