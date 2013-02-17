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
    , "cssCustom": ["game-of-life"]
  });
});

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
