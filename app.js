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


// var dao = require("./code/redis-dao");
//var conn = require("redis").createClient();
// var modelKey = "math-game-player";
// var uid = require("./code/uid").uid(modelKey);

// function getNextScore(cb) {
//   var next = uid.next();
//   cb(next);
// }

// function savePlayer(item, cb) {
// //  getNextScore(function (score) {
//     item.id = item.name.toLowerCase();
//     conn.zadd([modelKey, item.id, JSON.stringify(item)], function (err, result) {
//       cb(err);
//     });
// //  });
// }

// function updatePlayer(item, cb) {
//   removePlayer(item, function (err, result) {
//     if (err) {return cb(err);}
//     conn.zadd([modelKey, item.id, JSON.stringify(item)], function (err, result) {
//       cb(err);
//     });
//   });
// }


// function removePlayer(item, cb) {
//   var id = item.id;
//   conn.zremrangebyscore([modelKey, id, id], function (err, result) {
//     cb(err);
//   });
// }

// function getAllPlayers(cb) {
//   conn.zrange([modelKey, 0, -1], function (err, result) {
//     var items = result ? result.map(function (json) {
//       return JSON.parse(json);
//     }) : [];
//     cb(items, err);
//   });
// }

// function getPlayer(name, cb) {
//   var id = name.toLowerCase();
//   conn.zrangebyscore([modelKey, id, id], function (err, result) {
//     var item = err ? void 0 : JSON.parse(result[0]);
//     cb(item, err);
//   });
// }

// app.get("/math-game/player/:name", function (req, res) {
//   console.log("NU SÅ!, %s", req.param("name"));
//   getPlayer(req.param("name"), function (item, err) {
//     res.json(200, item);
//   });
// });

// app.post("/math-game/player", function (req, res) {
//   console.log("NU SÅ!, %s", req.param("id"));
//   removePlayer({"id": req.param("id")}, function (item, err) {
//     res.json(200, item);
//   });
// });

// app.get("/math-game/players/", function (req, res) {
//   getAllPlayers(function (items, err) {
//     console.log(items);
//     res.json(200, items);
//   });  
  
// });

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
