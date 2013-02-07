// node script.js > stdout.log 2> stderr.log &
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
var APP_PORT = 3000;

var DEVMODE = true;
var mapsPath = DEVMODE ? "//mc.envall.se:"+APP_PORT+"/servers" : "/servers";

// View helpers
app.locals({
  "bodyClass": "unknown"
  , "nav": "unknown"
  , "mapsPath": mapsPath
  , "util":  {
    "foo": 42
  }
  , "cssAll": ["base.css"]
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

// Redirect to cater for legacy url from old php site
app.get("/maps/mc_npup/", function (req, res) {
  res.redirect(301, "/")
});

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
