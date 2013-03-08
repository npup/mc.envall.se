var collections = {}
  , MAX_UID = 1e9;

exports.uid = function uid(collection) {
  return {
    "next": function () {
      var current = this.current();
      if (current == MAX_UID) {
        throw new Error("Collection '"+collection+"' reached max uid ("+MAX_UID+")");
      }
      return (collections[collection] = ++current);
    }
    , "current": function () {
      return ("undefined"==typeof collections[collection]) ? 0 : collections[collection];
    }
    , "set": function (current) {
      collections[collection] = current;
    }
  };
};
