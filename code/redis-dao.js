  var uid = require("./uid").uid;
// Redis calls
//
//  This module should be mixed into a a handler like object with:
//    a redis connection "conn"
//    a "factory" property (the model)
//
//  Models should have fromJSON and serializeToJSON methods
//
var conn = require("redis").createClient()
  , key = "mul-player"
  , model = require("./mul-player");

module.exports = {
  "save": function (item, cb) {
    var instance = this;
    getNextScore(key, function (score) {
      item.id = score;
      conn.zadd([key, item.id, item.serializeToJSON()], function (err, result) {
        cb(err);
      });
    });
  }
  , "update": function (item, cb) {
    var instance = this;
    instance.remove(item.id, function (err, result) {
      if (err) {return cb(err);}
      conn.zadd([key, item.id, item.serializeToJSON()], function (err, result) {
        cb(err);
      });
    });
  }
  , "remove": function (id, cb) {
    var instance = this;
    conn.zremrangebyscore([key, id, id], function (err, result) {
      cb(err);
    });
  }
  , "getAll": function (cb) {
    var instance = this;
    conn.zrange([key, 0, -1], function (err, result) {
      var items = result ? result.map(function (json) {
        return model.fromJSON(json);
      }) : [];
      cb(items, err);
    });
  }
  , "getById": function (id, cb) {
    var instance = this;
    conn.zrangebyscore([key, id, id], function (err, result) {
      var item = err ? void 0 : model.fromJSON(result[0]);
      cb(item, err);
    });
  }

};

function getNextScore(key, cb) {
  var next = uid(key).next();
  cb(next);
};


