$('#user-input').click(function () {
  $(".input-container").slideToggle();
});
var language = {};

language['Pseudo'] = 'algorithm power_calculation\n' +
  'variables\n' +
  '\treal x\n' +
  '\tinteger n\n' +
  'functions_and_procedures\n' +
  '\tfunction power(real x, integer n) returns real\n' +
  '\tvariables\n' +
  '\t\treal result\n' +
  '\t\tinteger i\n' +
  '\tbegin\n' +
  '\t\tif n = 0 then\n' +
  '\t\t\treturn 1\n' +
  '\t\tendif\n' +
  '\t\ti := 0\n' +
  '\t\tresult := 1\n' +
  '\t\twhile i < n do\n' +
  '\t\t\tresult := x * result\n' +
  '\t\t\ti := i + 1\n' +
  '\t\tendwhile\n' +
  '\t\treturn result\n' +
  '\n' +
  '\tend\t/* end function */\n' +
  '\n' +
  'begin\n' +
  '\twrite("2^5 = ", power(2, 5))\n' +
  '\n' +
  'end';

//------From Ace Documentation on inserting the editor------//
ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");


editor.setOptions({
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: true
});
var ongoing = false;
var selectedLang = "Pseudo";
editor.setTheme("ace/theme/solarized_light");
editor.session.setMode("ace/mode/pascal");
var langTools = ace.require("ace/ext/language_tools");
var staticWordCompleter = {
  getCompletions: function (editor, session, pos, prefix, callback) {
    var wordlist = ["algorithm", "begin", "end", "variables", "constants", "functions_and_procedures", "function", "returns", "return", "else", "if", "endif", "endwhile", "else if", "endfor", "for", "break", "do", "or", "print", "true", "false", "and", "integer", "string", "real", "array_of_integer", "array_of_string", "array_of_real", "repeat", "until", "step"];
    callback(null, wordlist.map(function (word) {
      return {
        caption: word,
        value: word,
        meta: "static"
      };
    }));
  }
}
langTools.addCompleter(staticWordCompleter);
editor.getSession().setTabSize(5);
var source_code = editor.getValue();
editor.setFontSize(14);
editor.setValue(language[selectedLang], -1);
var StatusBar = ace.require("ace/ext/statusbar").StatusBar;
var statusBar = new StatusBar(editor, document.getElementById("editor-statusbar"));



editor.getSession().on('change', function (e) {
  updateContent();
  if (source_code == "") {
    $('#runcode').prop('disabled', true);
    $('#runcode').prop('title', "Editor is Empty! Please write some code.");
  } else {
    $("#runcode").prop('disabled', false);
    $('#runcode').prop('title', "Compile");
  }
});
editor.session.getSelection().clearSelection();
$("#theme").change(function () {
  themeSelected = $("#theme").val();
  if (themeSelected == "Light") {
    editor.setTheme("ace/theme/dawn");
  } else if (themeSelected == "Monokai") {
    editor.setTheme("ace/theme/monokai");
  } else if (themeSelected == "Solarised Light") {
    editor.setTheme("ace/theme/solarized_light");
  } else if (themeSelected == "Twilight") {
    editor.setTheme("ace/theme/twilight");
  }
});

$("#lang").change(function () {
  langSelected = $("#lang").val();
  if (langSelected == "C") {
    editor.session.setMode("ace/mode/c_cpp");
    var langTools = ace.require("ace/ext/language_tools");
  } else {
    editor.session.setMode("ace/mode/pascal");
    var langTools = ace.require("ace/ext/language_tools");
    var staticWordCompleter = {
      getCompletions: function (editor, session, pos, prefix, callback) {
        var wordlist = ["algorithm", "begin", "end", "variables", "constants", "functions_and_procedures", "function", "returns", "return", "else", "if", "endif", "endwhile", "else if", "endfor", "for", "break", "do", "or", "print", "true", "false", "and", "integer", "string", "real", "array_of_integer", "array_of_string", "array_of_real", "repeat", "until", "step"];
        callback(null, wordlist.map(function (word) {
          return {
            caption: word,
            value: word,
            meta: "static"
          };
        }));
      }
    }
    langTools.addCompleter(staticWordCompleter);
  }
  editor.setValue(language[langSelected], -1);
});

function download(content, lang) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
  if (lang == "C") {
    element.setAttribute('download', "file.c");
  } else {
    element.setAttribute('download', "file.algo");
  }
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

$("#download").click(function () {
  updateContent();
  download(source_code, $("#lang").val());

});

function updateContent() {
  source_code = editor.getValue();
}

function runcode() {
  console.log(editor.getValue());

  $.ajax({
    url: "/run",
    type: "POST",
    dataType: "json",
    data: JSON.stringify({
      'sourceCode': editor.getValue(),
      'lang': $('#lang').val()
    }),
    contentType: "application/json",
    timeout: 10000,
    cache: false,
    success: function (message) {
      $("html, body").delay(150).animate({
        scrollTop: $('#showres').offset().top
      }, 1000);
      $(".outputbox").show();
      $(".io-show").show();
      $("#runcode").prop('disabled', false);
      if (message.compilestatus) {
        if (message.runstatus) {
          $(".outputerror").hide();
          $(".outputo").show();
          $(".outputo").html(message.data).css("color", "#000");
          $(".compilestat").children(".value").html("OK").css("color", "green");
          $(".runstat").children(".value").html("OK").css("color", "green");
        } else {
          $(".outputerror").show();
          $(".errorkey").html("Run Error");
          $(".errormessage").html(message.data);
          $(".outputo").hide();
          $(".compilestat").children(".value").html("OK").css("color", "red");
          $(".runstat").children(".value").html("Error").css("color", "red");
        }
      } else {
        $(".outputerror").show();
        $(".errorkey").html("Compile Error");
        $(".errormessage").html(message.data);
        $(".outputo").hide();
        $(".compilestat").children(".value").html("ERROR").css("color", "red");
        $(".runstat").children(".value").html("ERROR").css("color", "red");
      }
      $(".outputi").html("Standard input is empty").css("color", "#a6a6a6");
    },
    error: function (jqXHR, textStatus, err) {
      console.log("process error");
      $(".outputerror").show();
      $(".outputo").hide();
      $(".outputerror").html('text status ' + textStatus + ', err ' + err).css("color", "red");
    }
  });
}

$("#runcode").click(function () {
  runcode();
});

$("#newfile").click(function () {
  editor.setValue(language['Pseudo'], -1);
});

$("#download").click(function () {
  var data = {};
  data.title = "title";
  data.message = "message";

  $.ajax({
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(data),
    contentType: 'application/json',
    url: '/test',
    timeout: 10000,
    success: function (data) {
      console.log(JSON.stringify(data));
    }
  });
});

$("#openfile").on('click', function () {
  $("#upload-input").click();
});

$("#upload-input").on('change', function () {
  var files = $(this).get(0).files;

  if (files.length > 0) {
    var formData = new FormData();
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: '/openfile',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      timeout: 10000,
      complete: function () { },
      success: function (data) {
        editor.setValue(data, -1);
      },
      error: function (jqXHR, textStatus, err) { }
    });
  }
});

$('#compiler').click(function () {
  runcode();
});

$(document).keydown(function (e) {
  if (e.altKey && e.keyCode == 82) {
    runcode();
  }
  if (e.altKey && e.keyCode == 78) {
    editor.setValue('#include <stdio.h>\n\nint main(void) \n{\n	printf("Hello World!\\n");\n	return 0;\n}\n', -1);
  }
  if (e.altKey && e.keyCode == 80) {
    $("#upload-input").click();
  }
  if (e.altKey && e.keyCode == 68) {
    updateContent();
    download(source_code, $("#lang").val());
  }
});

$(".btn-up").click(() => {
  $(".outputbox").hide(1000);
});