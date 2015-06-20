'use strict';
(function (PW, $) {
  var editor;
  var speakerSelector;
  var currentSpeaker;
  var lastSpeaker = null;
  var activeLine = null;
  var dialog = PW.Dialogs.Pesterlog;

  function editor_onKeyDown(ev) {
    console.log('KeyDown: [' + ev.charCode + '] [' + ev.which + '] [' + (ev.altKey ? 'A' : ' ') + (ev.ctrlKey ? 'C' : ' ') + (ev.metaKey ? 'M' : ' ') + (ev.shiftKey ? 'S' : ' ') + ']');
    // Block bold/italics command hotkeys.
    if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && (ev.which == 66 || ev.which == 73)) {
      console.log('Blocking Meta+' + ev.which);
      ev.preventDefault();
    } else if (ev.which == 37) {
      var position = findCursorPosition();
      console.log(position);
      if (position.start == 0) {
        console.log('Blocking left move.');
        showSpeakerSelector($(ev.target).closest('.dialog-line'));
        ev.preventDefault();
      }
    }
  }

  function speakerId_mouseenter(ev) {
    showSpeakerSelector($(ev.target).closest('.dialog-line'));
  }

  function speakerSelector_mouseleave(ev) {
    console.log('Hiding speaker selector after leaving it');
    speakerSelector.addClass('inactive');
  }

  function speakerId_mouseleave(ev) {
    if ($(ev.relatedTarget).hasClass('speaker-selector')) {
      console.log('Ignoring leave due to speaker-selector');
      return;
    }
    console.log('Hiding speaker selector');
    speakerSelector.addClass('inactive');
  }

  function speakerId_click(ev) {
    ev.preventDefault();
  }

  function speakerSelector_change(ev) {
    console.log('Speaker changed.');
    if (activeLine == null) {
      console.log('No active line.');
      return;
    }

    var newSpeaker = PW.Speakers[speakerSelector.val()];
    var lineContent = activeLine.children('.dialog-line-editor').text();
    var updatedLine = renderDialogLine(newSpeaker, lineContent, activeLine);
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
    var speaker = dialogLine.data().speaker;
    var speakerId = dialogLine.children('.speaker-id')[0]
    speakerSelector.val(speaker.id);
    var offset = resolveRelativeOffset(speakerId, speakerSelector.parent()[0]);
    speakerSelector.removeClass('inactive').css({
      top: offset.top,
      left: offset.left + speakerId.offsetWidth - speakerSelector.width()
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

  function renderDialogLine(speaker, content, replace) {
    var speakerId = $('<div class="speaker-id"></div>')
      .text(dialog.getNameFor(speaker) + ': ')
      .css({ color: '#' + speaker.handleColor });
    var lineEditor = $('<p class="dialog-line-editor" contentEditable="true"></p>')
      .text(content);
    var line = $('<div class="dialog-line" />')
      .data({ speaker: speaker })
      .css({ color: '#' + speaker.textColor })
      .append(speakerId)
      .append(lineEditor);
    if (replace == null) {
      editor.append(line);
    } else {
      replace.replaceWith(line);
    }
    lineEditor.css({ 'text-indent': speakerId.width() });
    return line;
  }

  function startNewLine(keepSpeaker) {
    if (!keepSpeaker && lastSpeaker != null) {
      currentSpeaker = lastSpeaker;
    }

    renderDialogLine(currentSpeaker, '');
  }

  $(function () {
    editor = $('.editor');
    editor.on('keydown', editor_onKeyDown);
    editor.on('mouseenter', '.speaker-id', speakerId_mouseenter);
    editor.on('mouseleave', '.speaker-id', speakerId_mouseleave);
    editor.on('click', '.speaker-id', speakerId_click);

    speakerSelector = createSpeakerSelector();
    speakerSelector.insertAfter(editor);
    speakerSelector.on('mouseleave', speakerSelector_mouseleave);
    speakerSelector.on('change', speakerSelector_change);

    currentSpeaker = PW.Speakers.John;
    startNewLine();

    //editor[0].focus();
    //focusOnLine(editor.children('.dialog-line'));
  });
})(window.PesterWriter, jQuery);
