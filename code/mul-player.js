function MulPlayer(name) {
	this.name = name;
}
MulPlayer.prototype = {
	"constructor": MulPlayer
	, "serializeToJSON": function () {
		return JSON.stringify(this);
	}
	, "fromJSON": function (json) {
		for (var prop in json) {
			this[prop] = json[prop];
		}
	}
};

module.exports = {
	"create": function (name, data) {
		var player = new MulPlayer(name);
		for (var prop in data) {
			player[prop] = data[prop];
		}
		return player;
	}
};
