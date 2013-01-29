// Instantiation
var express = require("express")
  , app = express();

// Setup
app.configure(function () {
  app.use(express.bodyParser());
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(require("stylus").middleware({ src: __dirname + "/public" }));
  app.use(express["static"](__dirname + "/public"));
});

// View helpers
app.locals({
  "bodyClass": "unknown"
  , "nav": "unknown"
  , "util":  {
    "foo": 42
  }
  , "cssAll": ["base.css"]
  , "cssCustom": []
});


// Routes
app.get("/", function (req, res) {
  res.render("index", {
    "pt": "Home"
    , "nav": "home"
    , "cssCustom": []
  });
});


app.get("/maps", function (req, res) {
  renderMap("h1", req, res);
});

app.get("/maps/h1", function (req, res) {
  renderMap("h1", req, res);
});

app.get("/maps/npup", function (req, res) {
  renderMap("npup", req, res);
});

function renderMap(map, req, res) {
  res.render("maps", {
    "pt": "Maps - " + map
    , "map": map
    , "nav": "maps"
    , "cssCustom": []
  });
}



// Run application
app.listen(3000);
