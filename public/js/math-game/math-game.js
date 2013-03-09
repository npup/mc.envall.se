var mathGame = (function () {
  var win = this, doc = win.document;

  var SUPPORT = (function () {
    var doc = window.document;
    return "function" == typeof doc.addEventListener &&
      "function" == typeof [].map &&
      "function" == typeof [].forEach &&
      "function" == typeof doc.querySelector &&
      "function" == typeof doc.querySelectorAll;
  })();
  if (!SUPPORT) {
    return {
      "create": function (elem) {
        elem.innerHTML = [
          "<h4>Matematikspelet fungerar ännu inte med denna klient</h4>"
          , "Pröva med att använda en någorlunda modern webbläsare, som t.ex."
          , "<ul>"
          , "  <li>Firefox</li>"
          , "  <li>Google Chrome</li>"
          , "  <li>Opera</li>"
          , "  <li>Internet Explorer (version 9 eller högre)</li>"
          , "</ul>"
        ].join("");
      }
    };
  }

  var globalActions = {
    "show-achievments": function (elem) {
      this.showAchievments();
    }
    , "hide-msg": function (elem) {
      this.hideMsg();
    }
  };

  var Char = {
    "CROSS": "&#x2717;"
    , "EQUALS": "&#xff1d;"
    , "PLUS": "&#xff0b;"
    , "MINUS": "&#x2212;"
  };

  function MathGame(elem) {
    var instance = this;
    instance.elem = elem;
    instance.views = views.create();
    instance.post = {}; // data "posted" from previous view
    elem.addEventListener("submit", function (e) {
      e.preventDefault();
      var form = e.target;
      instance.process(form);
    }, true);
    elem.addEventListener("click", function (e) {
      var target = e.target, tmp, action
        , nodeName = target.nodeName.toLowerCase();
      if (nodeName=="a") {
        tmp = target.getAttribute("href");
        tmp && tmp.length>1 && (action = tmp.substring(1));
      }
      else if (nodeName=="button") {
        if (target.value = "hide-msg") {
          action = target.value;
        }
      }
      "function" == typeof globalActions[action] && (globalActions[action].call(instance, target));
    }, false);
    elem.addEventListener("keypress", function (e) {
      if (e.keyCode==27) {return instance.hideMsg();} // hide msg on ESC
      var target = e.target
        , nodeName = target.nodeName.toLowerCase();
      if (nodeName == "input" && target.className == "answer") {
        var charCode = e.keyCode || e.charCode;
        var ok = { // accepted keys in answer inputs:
            "8": "del"
          , "9": "tab"
          , "13": "enter"
          , "48": 0
          , "49": 1
          , "50": 2
          , "51": 3
          , "52": 4
          , "53": 5
          , "54": 6
          , "55": 7
          , "56": 8
          , "57": 9
          , "173": "-"
        };
        (charCode in ok)  || e.preventDefault();
      }
    }, false);
  }
  MathGame.nrOfQuestionsPerRound = 5;

  MathGame.prototype = {
    "constructor": MathGame
    , "start": function () {
      var instance = this;
      init(instance);
      return instance;
    }
    , "solve": function () {
      var items = [].slice.call(document.querySelectorAll(".questions > li[id]"), 0);
      items.forEach(function (item, idx) {
        var inp = item.querySelector(".answer");
        inp.value = item.getAttribute("data-answer");
      });
      return instance;
    }
    , "setPlayer": function (player) {
      var instance = this;
      instance.player = player;
    }
    , "showView": function (viewName, callback) {
      var instance = this
        , view = instance.views.get(viewName, instance);
      if (null!=view.dom) { // TODO: might never be false? make it possible to pass null/undef to here
        instance.elem.innerHTML = "";
        instance.elem.appendChild(view.dom);
      }
      if (view.handler.setup) {
        instance.post = {};
        view.handler.setup.call(instance, view);
      }
      instance.currentView = view;
      callback && callback.call(instance);
    }
    , "showMsg": function (msg, options) {
      var instance = this
        , msgContainer = instance.elem.getElementsByClassName("msg-container")[0];

      if (instance.showMsg._timer) {
        instance.showMsg._timer = clearTimeout(instance.showMsg._timer);
      }
      options || (options = {"fade": false, "type": "normal"});
      var fade = !!options.fade;

      msgContainer.className = "msg-container "+options.type;
      if ("size" in options) {
        if ("large" == options.size) {
          msgContainer.style.width = "90%";
          msgContainer.style.left = "5%";  
          msgContainer.style.height = "90%";
        }
      }
      else {
        msgContainer.style.width = "";
        msgContainer.style.left = "";  
        msgContainer.style.height = ""; 
      }

      msgContainer.innerHTML = msg;

      if (!fade) {
        var closer = doc.createElement("button");
        closer.value = "hide-msg";
        closer.innerHTML = Char.CROSS;
        closer.style.border = "0";
        closer.style.background = "transparent";
        closer.style.position = "absolute";
        closer.style.top = "0";
        closer.style.right = "0";
        closer.style.fontFamily = "Courier";
        closer.style.fontSize = "2em";
        closer.style.color = "#a22";
        closer.title = "Stäng";
        msgContainer.appendChild(closer);
      }

      msgContainer.style.display = "block";
      if (fade) {
        instance.showMsg._timer = setTimeout(function () {
          msgContainer.className += " fade";
          instance.showMsg._timer = setTimeout(function () {
            instance.hideMsg();
          }, 3000);
        }, 4000);
      }

    }
    , "hideMsg": function () {
      var msgContainer = this.elem.getElementsByClassName("msg-container")[0];
      msgContainer.style.display = "none";
      msgContainer.className = "msg-container";
    }
    , "showAchievments": function () {
      var instance = this
        , html = instance.player.achievments.getHTML();
      instance.showMsg(html, {"size": "large"});
    }
    , "process": function (form) {
      var instance = this
        , action = form.getAttribute("action")
        , viewName = action.replace("#", "")
        , view = instance.currentView;
      if (!view) {
        console.warn("got no view for %s", viewName);
        return;
      }
      instance.post = serialization.serialize(form, true);
      var next;
      if (view.handler.post) {
        try {
          next = view.handler.post.call(instance, view);
        } catch(err) {console.error(err.message);}
      }
      if (next===null) { // explicit null forward
        return;
      }
      if (!next) { // empty or undefined (etc) forward
        return;
      }
      delete instance.currentView;
      instance.showView(next.name, next.callback);
    }
  }; // 178 321 324 327 324 331
  
  function init(instance) {
    instance.elem.innerHTML = "";
    instance.showView("start");
  }


  var forward = (function () {
    function Forward(callback) {
      this.callback = callback;
    }
    function create(name, callback) {
      var forward = null;
      if (name!==null) {
        forward = new Forward(callback);
        forward.name = name;
      }
      return forward;
    }
    return {
      "create": create
      , "NULL": create(null)
    };
  })();


  var timer = (function () {
    function Timer(elem) {
      var instance = this;
      instance.elem = elem;
      instance.t0 = Math.floor((+new Date)/1000);
      instance.handle = null;
      instance.stopped = true;
    }
    Timer.prototype = {
      "constructor": Timer
      , "start": function () {
        var instance = this;
        if (instance.handle) {return;}
        instance.stopped = false;
        tick(instance);
      }
      , "stop": function () {
        this.stopped = true;
      }
      , "getSeconds": function () {
        return Math.floor((+new Date)/1000) - this.t0;
      }
      , "getMinutesAndSeconds": function () {
          var instance = this
            , minutes = 0, seconds = instance.getSeconds();
          if (seconds > 59) {
            minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
          }
          return {
            "minutes": minutes
            , "seconds": seconds
          };
      }
      , "getAsString": function () {
        var instance = this
          , minutesAndSeconds = instance.getMinutesAndSeconds()
          , minutes = minutesAndSeconds.minutes
          , seconds = minutesAndSeconds.seconds;
        if (minutes < 10) {
          minutes = "0"+minutes;
        }
        if (seconds < 10) {
          seconds = "0"+seconds;
        }
        return "%minutes%:%seconds%".replace(/%minutes%/, minutes).replace(/%seconds%/, seconds);
      }
    };
    function tick(_timer) {
      if (_timer.stopped) {return;}
      var minutesAndSeconds = _timer.getMinutesAndSeconds()
        ,str = _timer.getAsString();
      if (minutesAndSeconds.minutes>=59 && minutesAndSeconds.seconds>=59) {
        _timer.stop();
      }

      _timer.elem.value = _timer.getAsString();
      _timer.stopped || setTimeout(function () {tick(_timer);}, 1000);
    }
    return {
      "create": function (elem) {
        return new Timer(elem);
      }
    };
  })();

  /**
  * Views
  */
  var views = (function () {
    function build(view, game) {
      var frag = doc.createDocumentFragment()
        , div = doc.createElement("div")
        , html = view.html;
      frag.appendChild(div);
      div.innerHTML = html;
      return {
        "dom": frag
        , "handler": view.handler
      };
    }
    return {
      "create": function () {
        return {
          "get": function (which, game) {
            var view = templates[which] || ["--no view for '"+which+"'"];
            return build(view, game);
          }
        };
      }
    };
  })();

  /**
  * Templates
  */
  var templates = (function () {
    
    var result = {};

    function populateStatusTemplate(game, html) {
      if (!game.player) {return html;}
      "undefined" == typeof msg && (msg = "");
      html = html.replace(/%name%/, game.player.name);
      html = html.replace(/%level%/, game.player.getLevel());
      var nrOfQuestions = game.player.getNrOfQuestions();
      html = html.replace(/%nr_of_rounds%/, game.player.getNrOfRounds());
      html = html.replace(/%nr_of_questions%/, nrOfQuestions);
      var percent = "-", score = game.player.getScore();
      if (nrOfQuestions>0) {
        percent = ((score / nrOfQuestions) * 100).toFixed(1);
        if (Math.floor(percent) == percent) {
          percent = Math.floor(percent);
        }
        percent += " %";
      }
      html = html.replace(/%score%/, score);
      html = html.replace(/%percent_correct%/, percent);
      html = html.replace(/%round_streak%/, game.player.getRoundStreak());
      html = html.replace(/%round_streak_record%/, game.player.getRoundStreakRecord());
      html = html.replace(/%fastest_jackpot%/, game.player.data.fastestCorrectRound.asString);

      var currentTasks = game.player.achievments.getCurrentSet(), task
        , nrOfDone = 0;
      for (var idx=0, len=currentTasks.length; idx<len; ++idx) {
        task = currentTasks[idx];
        html = html.replace("%achievment"+idx+"_name%", task.name);
        html = html.replace("%achievment"+idx+"_descr%", task.descr);
        html = html.replace("%achievment_class"+idx+"%", ("achievment-"+task.id) + (!!task.done?" done":""));
        nrOfDone += !!task.done ? 1  : 0;
      }
      html = html.replace("%achievments_class%", nrOfDone==idx ? "done": "");
      return html;
    }

    var statusTemplate = [
      "<div class=status>"
      , "<dl class=stats>"
      , "  <dt>Nivå</dt><dd><a href=#show-achievments>%level%</a></dd>"
      , "  <dt>Antal rundor</dt><dd>%nr_of_rounds%</dd>"
      , "  <dt>Antal frågor</dt><dd>%nr_of_questions%</dd>"
      , "  <dt>Rätta svar</dt><dd>%score% (%percent_correct%)</dd>"
      , "  <dt>Felfria rundor i rad</dt><dd>%round_streak% (rekord: %round_streak_record%)</dd>"
      , "  <dt>Snabbaste felfria runda</dt><dd>%fastest_jackpot%</dd>"
      , "</dl>"
      ].concat((function () {
        // somehow rip this out to show only unfinished tasks, and "gratz" when no tasks left
        return [
          "<div class='achievments %achievments_class%'>"
          , "<h5>Uppdrag:</h5>"
          , "  <dl>"
          , "    <dt class='%achievment_class0%'>%achievment0_name% &dash;</dt>", "<dd>%achievment0_descr%</dd>"
          , "    <dt class='%achievment_class1%'>%achievment1_name% &dash;</dt>", "<dd>%achievment1_descr%</dd>"
          , "    <dt class='%achievment_class2%'>%achievment2_name% &dash;</dt>", "<dd>%achievment2_descr%</dd>"
          , "  </dl>"
          , "  <h3 class=gratz>Alla uppdrag utförda, grattis!</h3>"
          , "</div>"
        ];
      })())
      .concat([
        "</div>"
      ]).join("");

    put("start", "Skriv ditt namn", [
        "<input type=text name=nick id=nick autocomplete=off placeholder=?><br>"
        , "<p>Välj räknesätt:</p>"
        , ["multiplikation", "addition", "subtraction"].map(function (type) {
          var o = {
            "multiplikation": {"checked": true, "symbol": Char.CROSS}
            , "addition": {"symbol": Char.PLUS}
            , "subtraction": {"symbol": Char.MINUS}
          }
          var val = "<input type=radio id=game-type-"+type+" name=game-type value="+type+" "+(o[type].checked?"checked":"")+"> <label for=game-type-"+type+">"+(o[type].symbol)+"</label>";
          if (type == "addition" || type == "subtraction") {
            return val;
          }
        //   val += ["<select class=mul-options>"
        // , "  <option value=1_3>1 - 3</option>"
        // , "  <option value=4_6>4 - 6</option>"
        // , "  <option value=7_9>7 - 10</option>"
        // , "  <option value=all>Alla</option>"
        // , "</select>"].join("");
          return val;
        }).join("<br>")
        , "<br><input type=submit class=submit value=Starta >"
      ]
      , {
        "setup": function (view) {
          var game = this;
          (game.elem.getElementsByTagName("input")[0]).focus();
        }
        , "post": function (view) {
          var game = this
            , playerName = game.post.nick.toLowerCase().trim();
          if (playerName == "") {
            game.showMsg("Namn får ej vara blankt", {"fade": true, "type": "fail"});
            return forward.NULL;
          }
          var player = mathGame.player.load(playerName);
            /*
          npup.ajax.get("/multiplikation/player/"+playerName).ok(function (r) {
            console.log(r);
            var json = JSON.parse(r.responseText);
            console.log(json);
          }).send();
          */
          if (!player) {
            // well, create it then
            player = mathGame.player.create(playerName);
          }
          game.player = player;
          game.type = game.post["game-type"];
          return forward.create("round");
        }
      }
    );

    put("round", "Frågerunda %round_nr%", [
        "<ul class=questions>"
      ].concat(
        (function () {
          var items = [];
          for (var i=0; i<MathGame.nrOfQuestionsPerRound; ++i) {
            var html = "<li id=i"+i+" data-answer=%a"+i+"%> <label for=p"+i+">%p"+i+"f0% %typeChar% %p"+i+"f1% "+Char.EQUALS+" </label><input type=number class=answer name=p"+i+" size=2 maxlength=3 id=p"+i+" autocomplete=off placeholder=?>"  
            items.push(html);
          }
          items.push("<li><input type=submit class=submit value=Nästa></li>");
          return items;
        })()
      ).concat([
        , "</ul>"
        , statusTemplate
        , "<input type=text name=timer class=timer value='00:00' readonly tabindex=-1 onfocus='this.blur();'>"
      ])
      , {
      "setup": function (view) {
        var instance = this
          , html = instance.elem.innerHTML
          , f0, f1, p
          , isAddition = instance.type == "addition"
          , isSubtraction = instance.type == "subtraction";
        for (var i = 0; i<MathGame.nrOfQuestionsPerRound; ++i) {
          f0 = Math.ceil(Math.random()*10);
          f1 = Math.ceil(Math.random()*10);
          if (isAddition || isSubtraction) {
            f0 = f0 * Math.ceil(Math.random()*10);
            f1 = f1 * Math.ceil(Math.random()*10);
            if (isSubtraction && f1 > f0) {
              f0 = [f1, f1=f0][0];
            }
          }
          p = isAddition ? (f0 + f1) : isSubtraction ? (f0 - f1) : (f0 * f1);
          html = html.replace("%p"+i+"f0%", f0);
          html = html.replace("%p"+i+"f1%", f1);
          html = html.replace("%a"+i+"%", p);
        }
        html = html.replace(/%typeChar%/g, (isAddition ? Char.PLUS : isSubtraction ? Char.MINUS : Char.CROSS));
        html = html.replace(/%round_nr%/, instance.player.getNrOfRounds()+1);
        html = populateStatusTemplate(instance, html);
        instance.elem.innerHTML = html;
        view.uncheckedAnswers = true;
        (instance.elem.getElementsByTagName("input")[0]).focus();
        var timerElem = instance.elem.getElementsByClassName("timer")[0];
        instance.timer = timer.create(timerElem);
        instance.timer.start();
      }
      , "post": function (view) {
        var instance = this;
        var given, correct, item, point, item, status, points = 0;
        instance.timer && instance.timer.stop();
        if (view.uncheckedAnswers) {
          for (var i=0; i<MathGame.nrOfQuestionsPerRound; ++i) {
            item = doc.getElementById("i"+i);
            given = parseInt(instance.post["p"+i], 10);
            correct = parseInt(item.getAttribute("data-answer"), 10);
            point = given === correct ? 1 : 0;
            item.className = point ? "correct" : "error";
            instance.player.addScore(point);
            points += point;
            instance.player.addNrOfQuestions(1);
          }
          delete view.uncheckedAnswers;
          instance.player.addNrOfRounds(1);
          var previousRoundStreak = instance.player.getRoundStreak()
            , newRoundStreak = previousRoundStreak
            , brokenRoundStreak = false
            , previousRecordStreak = instance.player.getRoundStreakRecord()
            , jackpot = points == MathGame.nrOfQuestionsPerRound;

          (function (post) {
            var value = post.timer;
            if ("undefined" == typeof value) {return;}
            var match = /^(\d{2}):(\d{2})$/.exec(value);
            if (match) {
              post.minutes = parseInt(match[1], 10);
              post.seconds = parseInt(match[2], 10);
            }
          })(game.post);
          if (jackpot) {
            newRoundStreak += 1;
            instance.post.jackpot = true;
          }
          else {
            newRoundStreak = 0;
            brokenRoundStreak = true;
          }
          instance.player.setRoundStreak(newRoundStreak);
          
          var elapsedSeconds = instance.timer.getSeconds()
            , fastestCorrectRound = null;
          if (jackpot) {
            if (instance.player.data.fastestCorrectRound.seconds == null || (elapsedSeconds < instance.player.data.fastestCorrectRound.seconds)) {
              fastestCorrectRound = instance.player.data.fastestCorrectRound = {
                "seconds": elapsedSeconds
                , "asString": instance.timer.getAsString()
              };
            }
          }

          if (jackpot) {
            if (instance.player.achievments.startCounting20SecJackpots && elapsedSeconds < 20) {
              instance.player.data.achievmentsData.jackpotsUnder20secs += 1;
            }
            if (instance.player.achievments.startCounting20SecJackpots && elapsedSeconds < 10) {
              instance.player.data.achievmentsData.jackpotsUnder10secs += 1;
            }
          }

          var updatedAchievments = instance.player.updateAchievments(instance);

          /* player data saved here */
          instance.player.saveData();

          var hooray = points > 3, msg;
          if (previousRoundStreak>2 && brokenRoundStreak) {
            instance.showMsg("Synd... du tappade en serie på "+previousRoundStreak+" felfria rundor!", {"fade": true, "type": "fail"});
          }
          else if (jackpot) {
            msg = "Helt rätt, bra!";
            if (newRoundStreak>2 && (newRoundStreak > previousRecordStreak)) {
              msg = "Nytt rekord, "+newRoundStreak+" felfria rundor i rad - grattis!!";
            }
            if (fastestCorrectRound) {
              msg += "<p>GRATTIS - nytt tidsrekord för felfri runda: "+fastestCorrectRound.asString+" !</p>";
            }

            return forward.create("round", function () {
              var nrOfAchievmentsUpdated = mathGame.keys(updatedAchievments).length;
              if (nrOfAchievmentsUpdated > 0) {
                
                msg += "<p class=achievments-done>Uppdrag ";
                msg += nrOfAchievmentsUpdated==1 ? "avklarat" : "avklarade";
                msg += ":</p><ul>";
                for (var id in updatedAchievments) {
                  var i = updatedAchievments[id];
                  msg += "<li>"+i.name+": "+i.descr+"</li>";
                }
              }
              this.showMsg(msg, {"fade": true, "type": "win"});
            });
          }
          else if (hooray) {
            msg = "Bra!";
            instance.showMsg(msg, {"fade": true});
          }

          // disable inputs
          (function (form) {
            var inputs = [].slice.call(form.elements, 0), elem;
            for (var idx=0, len= inputs.length; idx<len; ++idx) {
              elem = inputs[idx];
              if (elem.type == "text") {
                elem.disabled = true;
                elem.className += " disabled";
              }
            }
          })(instance.elem.getElementsByTagName("form")[0]);

          instance.elem.getElementsByClassName("submit")[0].focus();
          // update status now since we stay in view
          status = instance.elem.getElementsByClassName("status")[0];
          status.outerHTML = populateStatusTemplate(instance, statusTemplate);
          return forward.NULL; // null => stay in view
        }
        return forward.create("round",function () {
          // Callback code for new round
        }); // go to a new view
      }
    });
  
    put("quit", "Hejdå!", []);

    function build(name, heading, formContent) {
      var lines = [
        "<div class=math-game-"+name+">"
        , heading ? ("<h3>"+heading+"</h3>") : ""
        , "<form action=#"+name+">"
      ]
      .concat(formContent)
      .concat(["</form>"
        , "<div class=msg-container></div>"
        , "</div>"
      ]);
      return lines.join("");
    }

    function put(name, heading, formContent, handlers) {
      result[name] = {
        "html": build(name, heading, formContent)
        , "handler": {
          "setup": (handlers && handlers.setup) || function () {console.warn("-- setup handler for view "+name+" is unimplemented");}
          , "post": (handlers && handlers.post) || function () {console.warn("-- post handler for view "+name+" is unimplemented");}
        }
      };
    }

    return result;
  })();


  // mathGame API
  return {
    "create": function (elem) {
      return new MathGame(elem);
    }
    , "getPlayer": function (name) {
      return mathGame.player.load(name);
    }
  };

}());
