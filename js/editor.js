'use strict';
(function (PW, $) {
  var editor;
  var dialog;
  var fileOpener;
  var fileSaver;
  var speakerSelector;
  var justSelectedSpeaker = false;
  var activeLine = null;
  var previousCursor = null;
  var loadingTimer = null;
  var loadingMask = null;
  var loadingIndicator = null;

  function editor_keydown(ev) {
    console.log('KeyDown: [' + ev.charCode + '] [' + ev.which + '] [' + (ev.altKey ? 'A' : ' ') + (ev.ctrlKey ? 'C' : ' ') + (ev.metaKey ? 'M' : ' ') + (ev.shiftKey ? 'S' : ' ') + ']');

    var lineEditorDom = $(ev.target);
    var dialogLineDom = lineEditorDom.closest('.dialog-line');
    var dialogLine = dialogLineDom.data().line;
    if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && (ev.which == 66 || ev.which == 73)) {
      // Block bold/italics command hotkeys.
      console.log('Blocking Meta+' + ev.which);
      ev.preventDefault();
    } else if (ev.which == 13) {
      // Enter key adds new dialog line.
      var speaker;
      var shouldSelectSpeaker = false;
      if (ev.shiftKey) {
        speaker = dialogLine.speaker;
      } else {
        speaker = dialog.getPreviousSpeaker(dialogLine) || dialogLine.speaker;
      }

      var nextLineText = '';
      var currentLineText = lineEditorDom.text();
      var cursor = getCursorPosition();
      lineEditorDom.text(currentLineText.substring(0, cursor.start));
      nextLineText = currentLineText.substring(cursor.end, currentLineText.length);
      startNewLine(speaker, nextLineText);
      ev.preventDefault();
    } else if (ev.which == 37) {
      var cursor = getCursorPosition();
      if (cursor && cursor.start == 0) {
        moveToPreviousLine(dialogLineDom);
        ev.preventDefault();
      }
    } else if (ev.which == 38) {
      moveToPreviousLine(dialogLineDom, getCursorPosition().start);
      ev.preventDefault();
    } else if (ev.which == 39) {
      var cursor = getCursorPosition();
      var text = dialogLineDom.children('.dialog-line-editor').text();
      if (cursor && cursor.start >= text.length) {
        moveToNextLine(dialogLineDom, { start: 0, end: 0, line: dialogLineDom });
        ev.preventDefault();
      }
    } else if (ev.which == 40) {
      moveToNextLine(dialogLineDom, getCursorPosition());
      ev.preventDefault();
    } else if (!ev.metaKey && !ev.altKey && !ev.ctrlKey && ev.which >= 65 && ev.which <= 90) {
      var cursor = getCursorPosition();
      var editor = dialogLineDom.children('.dialog-line-editor');
      var text = editor.text();
      var input = String.fromCharCode(ev.which + (ev.shiftKey ? 0 : 32));
      var quirkedInput = dialogLine.speaker.quirkLetterFilter(input, cursor, text);
      if (quirkedInput != input) {
        editor.text(text.substring(0, cursor.start) + quirkedInput + text.substring(cursor.end, text.length));
        ev.preventDefault();

        var newCursorStart = cursor.start + quirkedInput.length;
        setCursorPosition(dialogLineDom, { start: newCursorStart, end: newCursorStart, line: dialogLineDom });
      }
    }
  }

  function dialogLineEditor_blur(ev) {
    var lineEditor = $(ev.target);
    lineEditor.parent().data().line.content = lineEditor.text();
  }

  function speakerLabel_mouseenter(ev) {
    var dialogLineDom = $(ev.target).closest('.dialog-line');
    console.log('mouseenter: ' + dialogLineDom.data().line.speaker.name);
    if (justSelectedSpeaker) {
      console.log('\tIgnoring, just selected speaker.');
    } else {
      var currentCursor = getCursorPosition();
      if (currentCursor) {
        previousCursor = currentCursor;
      }
      showSpeakerSelector(dialogLineDom);
    }
  }

  function speakerSelector_mouseleave(ev) {
    console.log('mouseleave: speakerSelector');
    console.log('\tHiding speaker selector after leaving it');
    speakerSelector.addClass('inactive');
  }

  function speakerLabel_mouseleave(ev) {
    var dialogLineDom = $(ev.target).closest('.dialog-line');
    console.log('mouseleave: ' + dialogLineDom.data().line.speaker.name);
    if ($(ev.relatedTarget).hasClass('speaker-selector')) {
      console.log('\tIgnoring leave due to speaker-selector');
      return;
    }
    console.log('\tHiding speaker selector');
    speakerSelector.addClass('inactive');
    justSelectedSpeaker = false;
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

    var wasLineSelected = (previousCursor && activeLine[0] == previousCursor.line[0]);
    activeLine.get(0).blur();
    var updatedLine = renderDialogLine(dialogLine, activeLine);
    speakerSelector.addClass('inactive');
    justSelectedSpeaker = true;
    setCursorPosition(updatedLine, wasLineSelected ? previousCursor : null);
    activeLine = null;
  }

  function btnNew_click(ev) {
    createNewDialog();
  }

  function btnOpen_click(ev) {
    fileOpener.click();
  }

  function fileOpener_change(ev) {
    var file = fileOpener.get(0).files[0];
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        console.log('Loaded: ' + ev.target.result);
        var o;
        try {
          o = JSON.parse(ev.target.result);
        } catch (ex) {
          console.log(ex);
          alert('An error occurred opening the file "' + file.name + '"; it does not appear to be a valid pesterlogWriter file.');
          return;
        }

        var dialog = PW.Dialog.fromJson(o);
        console.log('Deserialized: ' + JSON.stringify(dialog.toJson()));
        renderDialog(dialog);
      } finally {
        stopLoading();
      }
    };
    startLoading();
    reader.readAsText(file);
  }

  function btnSave_click(ev) {
    var json = JSON.stringify(dialog.toJson());
    console.log('Saving: ' + json);
    var dialogUrl = 'data:text/plain,' + json;
    fileSaver.attr('href', dialogUrl);
    fileSaver.get(0).click();
  }

  function startLoading() {
    if (!loadingTimer) {
      console.log('Starting loading');
      loadingMask.addClass('is-loading');
      loadingTimer = setInterval(function () {
        var text = loadingIndicator.text();
        if (text.length == 3) {
          text = '.';
        } else {
          text = text + '.';
        }
        loadingIndicator.text(text);
      }, 500);
    } else {
      console.log('loadingTimer is true?');
    }
  }

  function stopLoading() {
    if (loadingTimer) {
      console.log('Stopping loading');
      clearTimeout(loadingTimer);
      loadingMask.removeClass('is-loading');
    } else {
      console.log('loadingTimer is false?');
    }
  }

  function setCursorPosition(dialogLine, cursor) {
    setTimeout(function () {
      console.log('Setting cursor');
      var lineEditor = dialogLine.children('.dialog-line-editor')[0];
      var textNode = lineEditor.childNodes[0];

      if (cursor == null) {
        cursor = {
          start: textNode.length,
          end: textNode.length,
          line: dialogLine
        };
      }

      var range = document.createRange();
      range.selectNodeContents(lineEditor);
      range.setStart(textNode, Math.min(textNode.length, cursor.start));
      range.setEnd(textNode, Math.min(textNode.length, cursor.end));

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      previousCursor = null;
    }, 0);
  }

  function moveToNextLine(currentLineDom, cursor) {
    var nextLineDom = currentLineDom.next('.dialog-line');
    if (nextLineDom.length > 0) {
      setCursorPosition(nextLineDom, cursor);
    }
  }

  function moveToPreviousLine(currentLineDom, position) {
    var previousLineDom = currentLineDom.prev('.dialog-line');
    if (previousLineDom.length > 0) {
      if (position == null) {
        position = previousLineDom.children('.dialog-line-editor').text().length;
      }
      setCursorPosition(previousLineDom, { start: position, end: position, previousLineDom });
    }
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
    justSelectedSpeaker = false;
    console.log('\tShowing speaker selector');
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

  function getCursorPosition() {
    var selection = document.getSelection();
    if (selection.rangeCount == 1) {
      var range = selection.getRangeAt(0);
      return {
        start: range.startOffset,
        end: range.endOffset,
        line: $(range.commonAncestorContainer).closest('.dialog-line')
      };
    }

    return null;
  }

  function createSpeakerSelector() {
    var selector = $('<select class="speaker-selector inactive"></select>');
    PW.Speakers.forEach(function (key, speaker) {
      selector.append($('<option />').text(speaker.name).val(key));
    });

    return selector;
  }

  function createNewDialog() {
    dialog = new PW.Dialog(PW.Dialog.Types.Pesterlog);
    renderDialog(dialog);
  }

  function renderDialog(dialog) {
    editor.empty();
    var lastLineDom = null;
    for (var i = 0; i < dialog.lines.length; i++) {
      lastLineDom = renderDialogLine(dialog.lines[i]);
    }

    if (lastLineDom == null) {
      startNewLine(PW.Speakers.John, '');
    }
  }

  function renderDialogLine(line, replace) {
    var speakerLabel = $('<div class="speaker-label"></div>')
      .text(line.getSpeakerName() + ': ')
      .css({ color: '#' + line.speaker.handleColor });
    var lineEditor = $('<p class="dialog-line-editor" contentEditable="true"></p>')
      .append(document.createTextNode(line.content));
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

  function startNewLine(speaker, lineContent) {
    var dialogLine = dialog.addLine(speaker, lineContent);
    var lineDom = renderDialogLine(dialogLine);
    var cursor = { start: 0, end: 0, line: lineDom };
    setCursorPosition(lineDom, cursor);
    return lineDom;
  }

  $(function () {
    loadingMask = $('.loading-mask');
    loadingIndicator = loadingMask.children('.loading-indicator');

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

    $('#btnNew').on('click', btnNew_click);

    fileOpener = $('#fileOpener');
    fileOpener.on('change', fileOpener_change);
    $('#btnOpen').on('click', btnOpen_click);

    fileSaver = $('#fileSaver');
    $('#btnSave').on('click', btnSave_click);

    createNewDialog();
  });
})(window.PesterWriter, jQuery);
