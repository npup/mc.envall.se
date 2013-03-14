// Instantiation
var express = require("express")
  , app = express();

// Setup
app.configure(function () {
  app.use(express.bodyParser());
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.locals.pretty = true;
  app.use(require("stylus").middleware({ src: __dirname + "/public" }));
  app.use(express["static"](__dirname + "/public"));
});


// Read conf from file
var conf = (function () {
  var confFile = "./conf", conf = {};
  if (require("fs").existsSync(confFile+".js")) {
    conf = require(confFile);
  }
  else {
    console.warn("\nNo configuration file '%s' found!\nUsing defaults: %s", confFile, JSON.stringify(conf, null, 2));
  }
  return conf;
})();


var APP_PORT = conf.DEVMODE ? 3000 : 80
  , mapsPath = conf.DEVMODE ? "//mc.envall.se:"+APP_PORT+"/servers" : "/servers";


// View helpers
app.locals({
  "bodyClass": "unknown"
  , "nav": "unknown"
  , "mapsPath": mapsPath
  , "util":  {
    "foo": 42
  }
  , "cssAll": ["base"]
  , "cssCustom": []
});


// Routes
app.get("/", function (req, res) {
  res.render("index", {
    "pageTitle": "mc.envall.se | Hem"
    , "nav": "home"
    , "cssCustom": []
  });
});

app.get("/maps", function (req, res) {
  renderMap("npup", req, res);
});

app.get("/maps/h1", function (req, res) {
  renderMap("h1", req, res);
});

app.get("/maps/npup", function (req, res) {
  renderMap("npup", req, res);
});

app.get("/game-of-life", function (req, res) {
  res.render("game-of-life", {
    "pageTitle": "mc.envall.se | Game Of Life"
    , "nav": "game-of-life"
    , "cssCustom": ["eggs", "game-of-life"]
  });
});

app.get("/math-game", function (req, res) {
  res.render("math-game", {
    "pageTitle": "mc.envall.se | Matematik"
    , "nav": "math-game"
    , "cssCustom": ["eggs", "math-game"]
  });
});

/*
var dao = require("./code/redis-dao");
var conn = require("redis").createClient();
var modelKey = "math-game-player";
var uid = require("./code/uid").uid(modelKey);

function getNextScore(cb) {
  var next = uid.next();
  cb(next);
}

function savePlayer(item, cb, isUpdate) {
  isUpdate || (item.created = Date.now());
  conn.hset(modelKey, item.name.toLowerCase(), JSON.stringify(item), function (err, result) {
    cb(err);
  });
}

function updatePlayer(item, cb) {
  removePlayer(item, function (err, result) {
    if (err) {return cb(err);}
    savePlayer(item, cb, true);
  });
}


function removePlayer(item, cb) {
  var name = "string" == typeof item ? item : item.name;
  conn.hdel(modelKey, name.toLowerCase(), function (err, result) {
    cb(err);
  });
}

function getAllPlayers(cb) {
  conn.hgetall(modelKey, function (err, result) {
    var items = [];
    console.log("err: %s, result: %s", err, JSON.stringify(result));
    if (!err) {
      for (var key in result) {
        items.push(JSON.parse(result[key]));
      }
    }
    cb(items.sort(function (v0, v1) {
      return v0.name.toLowerCase() > v1.name.toLowerCase();
    }), err);
  });
}

function getPlayer(name, cb) {
  conn.hget(modelKey, name.toLowerCase(), function (err, result) {
    var item = err ? void 0 : JSON.parse(result);
    cb(item, err);
  });
}


app.get("/math-game/player", function (req, res) {
  var name = req.param("name")
    , pass = req.param("pass");
  console.log("%s :: NU SÅ, GET, [%s / %s]", new Date, name, pass);
  getPlayer(name, function (item, err) {
    var json = {
      "error": true
      , "msg": "No such player"
    };
    if (item) {
      if (item.pass == pass) {
        json = item;
      }
      else {
        json.msg = "Wrong password";
      }
      res.json(200, json);
      return;
    }
    json = {"name": name, "pass": pass};
    savePlayer(json, function (err) {
      if (err) {
        json = {"error": JSON.stringify(err)}
      }
      else {
        json.created = true;
      }
      res.json(err?500:200, json);
    });
  });
});




// delete or update player
app.post("/math-game/player", function (req, res) {
  var name = req.param("name")
    , admin = "admin" == req.param("admin")
    , json = {"access-denied": true};
  console.log("remove by name: [%s], admin: %s", name, admin);
  if (!admin) {
    return res.json(200, json);
  }
  if ("true" == req.param("delete")) {
    removePlayer(name, function (err) {
      json = err ? {"error": JSON.stringify(err)} : {"removed": name};
      res.json(err?500:200, json);
    });
    return;
  }
  var item = JSON.parse(JSON.stringify(req.params, ["name", "data", "achievments", "pass", "created"]));
  updatePlayer(item, function (err) {
    json = err ? {"error": JSON.stringify(err)} : item;
    res.json(err?500:200, json);
  });
});

// list players
app.get("/math-game/players", function (req, res) {
  getAllPlayers(function (items, err) {
    res.json(err?500:200, err?[]:items);
  });

});
*/
// Redirects to cater for legacy urls from old php site
app.get("/maps/mc_npup", doLegacyUrls);
app.get("/maps/mc_npup*", doLegacyUrls);


function doLegacyUrls(req, res) {
  res.redirect(301, "/");
}


function renderMap(map, req, res) {
  res.render("maps", {
    "pageTitle": "mc.envall.se | Kartor - " + map
    , "map": map
    , "nav": "maps"
    , "cssCustom": []
  });
}


// Run application
app.listen(APP_PORT);
