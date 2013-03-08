var mathGame; // required module
(function () {

  mathGame.keys = (function () {
    if ("keys" in Object) {
      return Object.keys;
    }
    // somewhat naive polyfill, works here
    var hasOwn = {}.hasOwnProperty;
    return function (obj) {
      var arr = [];
      for (var prop in obj) {
        hasOwn.call(obj, prop) && arr.push(prop);
      }
      return arr;
    };
  })();
  
  if ("undefined" == typeof mathGame) {throw new Error("must define \"mathGame\" module first");}

  var storage = (function () {
    var storagePrefix = "mg-";
    function getKey(player) {
      return storagePrefix+player.name;
    }
    return {
      "getPlayerData": function (player) {
        var data = localStorage.getItem(getKey(player));
        return data ? JSON.parse(data) : void 0;
      }
      , "putPlayerData": function (player, data) {
        var stringData = JSON.stringify(data);
        localStorage.setItem(getKey(player), stringData);
      }
      , "deletePlayerData": function (player) {
        localStorage.removeItem(getKey(player));
      }
    };
  })();


  var achievments = (function () {
    function Achievment(name, descr, check) {
      var instance = this;
      instance.name = name;
      instance.descr = descr;
      instance.id = achievmentId.getNext();
      instance.check = check || function (game) {
        var instance = this, player = game.player;
        console.warn("unimplemented achievment check for '%s'", instance.name);
      };
      instance.done = void 0;
    }

    var maxSlots = 3;


    function Achievments() {
      var instance = this;
      instance.cursors = [0, 0, 0];
      instance.idMap = {};
      instance.data = [];
      instance.startCounting20SecJackpots = false;
      instance.startCounting10SecJackpots = false;
      for (var idx=0; idx<maxSlots; ++idx) {instance.data.push([]);}
      instance.add(new Achievment("Skicklighet", "En felfri runda", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getRoundStreakRecord()>0;
      }));
      instance.add(new Achievment("Pålitlighet", "Svit av 5 felfria rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getRoundStreakRecord()>=5;
      }));
      instance.add(new Achievment("Bergsäkerhet", "Svit av 10 felfria rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getRoundStreakRecord()>=10;
      }));
      instance.add(new Achievment("Perfektion", "Svit av 20 felfria rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getRoundStreakRecord()>=20;
      }));
      var achievment = new Achievment("Snabbhet", "En felfri runda under 20 sekunder", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.data.achievmentsData.jackpotsUnder20secs >= 1;
      });
      achievment.startCounting20SecJackpots = true;
      instance.add(achievment);

      achievment = new Achievment("Snabbhet 2", "5 felfria rundor under 20 sekunder", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.data.achievmentsData.jackpotsUnder20secs >= 5;
      });
      achievment.startCounting10SecJackpots = true;
      instance.add(achievment);

      instance.add(new Achievment("Extrem snabbhet", "En felfri runda under 10 sekunder", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.data.achievmentsData.jackpotsUnder10secs >= 1;
      }));
      instance.add(new Achievment("Extrem snabbhet 2", "5 felfria rundor under 10 sekunder", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.data.achievmentsData.jackpotsUnder10secs >= 5;
      }));

      instance.add(new Achievment("Mängd", "Uppnå 20 rätta svar", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getScore()>=20;
      }), 1);
      instance.add(new Achievment("Mängd 2", "Uppnå 50 rätta svar", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getScore()>=50;
      }), 1);
      instance.add(new Achievment("Mängd 3", "Uppnå 100 rätta svar", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getScore()>=100;
      }), 1);
      instance.add(new Achievment("Mängd 4", "Uppnå 200 rätta svar", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getScore()>=200;
      }), 1);

      instance.add(new Achievment("Hög nivå", "Uppnå över 80% säkerhet efter 10 rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getNrOfRounds() >= 10 && ((player.getScore()*100) / player.getNrOfQuestions() ) > 80;
      }), 2);
      instance.add(new Achievment("Hög nivå 2", "Uppnå över 80% säkerhet efter 20 rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getNrOfRounds() >= 20 && ((player.getScore()*100) / player.getNrOfQuestions() ) > 80;
      }), 2);
      instance.add(new Achievment("Hög nivå 3", "Uppnå över 80% säkerhet efter 50 rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getNrOfRounds() >= 50 && ((player.getScore()*100) / player.getNrOfQuestions() ) > 80;
      }), 2);
      instance.add(new Achievment("Hög nivå 4", "Uppnå över 80% säkerhet efter 100 rundor", function (game) {
        var instance = this, player = game.player;
        return instance.done = player.getNrOfRounds() >= 100 && ((player.getScore()*100) / player.getNrOfQuestions() ) > 80;
      }), 2);
      
    }
    var achievmentId = (function () {
      var nextId = 1;
      return {
        "getNext": function () {
          return nextId++;
        }
        , "getCurrent": function () {
          return nextId;
        }
      };
    })();
    Achievments.prototype = {
      "constructor": Achievments
      , "add": function (achievment, slot) {
        var instance = this;
        "number" == typeof slot || (slot = 0);
        instance.data[slot].push(achievment);
        instance.idMap[achievment.id] = achievment;
      }
      , "getCurrentSet": function () {
        var instance = this, shouldAdvance = 0, a;
        for (var slotIdx=0; slotIdx<maxSlots; ++slotIdx) {
          var slot = instance.data[slotIdx]
            , max = slot.length
            , a = instance.data[slotIdx][instance.cursors[slotIdx]];
          while (instance.cursors[slotIdx] < max-1 && !!a.done) {
            instance.cursors[slotIdx] += 1;
            a = instance.data[slotIdx][instance.cursors[slotIdx]];
          }
        }
        var result = [];
        for (var slotIdx=0; slotIdx<maxSlots; ++slotIdx) {
          a = instance.data[slotIdx][instance.cursors[slotIdx]];
          if (a.startCounting20SecJackpots) {
            instance.startCounting20SecJackpots = true;
          }
          if (a.startCounting10SecJackpots) {
            instance.startCounting10SecJackpots = true;
          }
          result.push(a);
        }
        return result;
      }
      , "getHTML": function () {
        var instance = this
          , lines = [
          "Uppdrag:"
          , "<ul class=achievments-list>"
        ].concat((function () {
          var arr = [], item, doneDateStr = "";
          for (var achievmentId in instance.idMap) {
            item = instance.idMap[achievmentId];
            
              doneDateStr = !!item.done ? " - Klarat " + (function (when) {
                var str = "%y-%m-%d, klockan %h:%M".replace(/%y/, when.getFullYear());
                var month = when.getMonth()+1
                  , day = when.getDate()
                  , hours = when.getHours()
                  , minutes = when.getMinutes();
                month = month>9 ? month : "0"+month;
                day = day>9 ? day : "0"+day;
                hours = hours>9 ? hours : "0"+hours;
                minutes = minutes>9 ? minutes : "0"+minutes;
                return str.replace(/%m/, month).replace(/%d/, day).replace(/%h/, hours).replace(/%M/, minutes);
              })(new Date(item.done)) : "";
            
            arr.push("<li title=\""+item.descr+doneDateStr+"\" class=\"achievment-"+item.id+" "+(item.done?"done":"")+"\">"+item.name+"</li>");
          }
          return arr;
        })()).concat([
          "</ul>"
        ]);
        return lines.join("\n");
      }
    };

    return {
      "create": function (player) {
        var achievments = new Achievments();
        if (!player) {return achievments;}
        var achievmentsDone = player.data.achievmentsDone || {}, achievment;
        for (var achievmentId in achievmentsDone) {
          achievment = achievments.idMap[achievmentId];
          achievment.done = achievmentsDone[achievmentId];
        }
        return achievments;
      }
    };

  })();

  mathGame.player = (function () {
    function Player(name) {
      var instance = this;
      instance.name = name;
      instance.data = getDefaultData();
    }
    function getDefaultData() {
      return {
        "score": 0
        , "nrOfQuestions": 0
        , "level": 1
        , "nrOfRounds": 0
        , "roundStreak": 0
        , "roundStreakRecord": 0
        , "achievmentsDone": {} // id => ts
        , "fastestCorrectRound": {
          "seconds": null
          , "asString": "-"
        }
        , "achievmentsData": {
          "jackpotsUnder20secs": 0
          , "jackpotsUnder10secs": 0  
        }
      };
    }
    Player.prototype = {
      "constructor": Player
      , "loadData": function () {
        var instance = this
          , loadedData = storage.getPlayerData(instance);
        instance.data = getDefaultData();
        for (var prop in loadedData) {
          instance.data[prop] = loadedData[prop];
        }
        return instance.data;
      }
      , "saveData": function () {
        var instance = this, data = instance.data;
        storage.putPlayerData(instance, data);
      }
      , "delete": function () {
        var instance = this;
        instance.data = getDefaultData();
        storage.deletePlayerData(instance);
      }
      , "toString": function () {
        var instance = this;
        return instance.name + ":\n" + JSON.stringify(instance.data, null, 2);
      }
      , "getScore": function () {
        return this.data.score;
      }
      , "addScore": function (points) {
        this.data.score += points;
      }
      , "getNrOfQuestions": function () {
        return this.data.nrOfQuestions; 
      }
      , "addNrOfQuestions": function (nr) {
        this.data.nrOfQuestions += nr;
      }
      , "getNrOfRounds": function () {
        return this.data.nrOfRounds; 
      }
      , "addNrOfRounds": function (nr) {
        this.data.nrOfRounds += nr;
      }
      , "getLevel": function () {
        return mathGame.keys(this.data.achievmentsDone).length;
      }
      , "getRoundStreak": function () {
        return this.data.roundStreak;
      }
      , "setRoundStreak": function (streak) {
        var instance = this;
        instance.data.roundStreak = streak;
        if (streak > instance.getRoundStreakRecord()) {
          instance.setRoundStreakRecord(streak);
        }
      }
      , "getRoundStreakRecord": function () {
        return this.data.roundStreakRecord;
      }
      , "setRoundStreakRecord": function (streak) {
        this.data.roundStreakRecord = streak;
      }
      , "updateAchievments": updateAchievments
    };

    function updateAchievments(game, data) { // 178 321 324 327 324 331
      var instance = this
        , currentTasks = instance.achievments.getCurrentSet(), task, anythingUpdated = false
        , now = +new Date;
      "object" == typeof data || (data = {});
      for (var idx=0, len=currentTasks.length; idx<len; ++idx) {
        task = currentTasks[idx];
        if (!task.done && task.check(game)) {
          instance.data.achievmentsDone[task.id] = now;
          task.done = now;
          anythingUpdated = true;
          data[task.id] = task;
        }
      }
      return anythingUpdated ? updateAchievments.call(instance, game, data) : data;
    }

    return {
      "create": function (nick) {
        return new Player(nick);
      }
      , "load": function (nick) {
        var player = new Player(nick);
        if (!player.loadData()) {return void 0;}
        player.achievments = achievments.create(player);
        return player;
      }
    };
  })();

}());
