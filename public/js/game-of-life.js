// requires:
//	querySelectorAll, Function#bind
var gameOfLife = (function () {

	var win = this, doc = win.document;

	var defaultOptions = {
		"width": 40
		, "height": 40
	};

	function Game(options) {
		var instance = this;
		instance.options = options;
		var grid = new Grid(instance);
		instance.frag = grid.frag;
		instance.table = instance.frag.querySelector("table");
		instance.table.onselectstart = function () {return false;};
		instance.table.onclick = handleCellactivation.bind(instance);
		instance.table.onmouseover = handleCellactivation.bind(instance);
		var buttons = instance.frag.querySelectorAll("button");
		instance.buttonRunStop = buttons[0];
		instance.buttonRunStop.onclick = handleRunStop.bind(instance);
		instance.buttonTick = buttons[1];
		instance.buttonTick.onclick = handleTick.bind(instance);
		instance.running = false;
		instance.timer = void 0;
	}
	Game.prototype = {
		"constructor": Game
			, "put": function (node) {
			var instance = this;
			node.appendChild(instance.frag);
			instance.buttonRunStop.focus();
		}
		, "start": function () {
			var instance = this;
			instance.timer = setInterval(instance.tick.bind(instance), 200);
			instance.running = true;

		}
		, "stop": function () {
			var instance = this;
			instance.timer = clearInterval(instance.timer);
			instance.running = false;
		}
		, "tick": function () {
			var instance = this;
		
			loopCells(instance.map, instance.options, function (map, pos) {
				var cell = map[pos.str].cell;
				map[pos.str].liveNext = liveNext(cell, map[pos.str].neighbours);
			});
		
			loopCells(instance.map, instance.options, function (map, pos) {
				var cell = map[pos.str].cell;
				cell.className = map[pos.str].liveNext ? "on" : "";
				delete map[pos.str].liveNext;
			});
			
		}
	};

	function loopCells(map, options, action) {
		var rows = options.height, cols, x, y;
		do {
			cols = options.width;
			do {
				x = Math.abs(cols-options.width);
				y = Math.abs(rows-options.height);
				action(map, getPos(cols, rows, options));
			} while (--cols);
		} while (--rows);
	}

	function getPos(revX, revY, options) {
		var x = Math.abs(revX-options.width)
			, y = Math.abs(revY-options.height);
		return {
			"str": "x"+x+"y"+y
			, "x": x
			, "y": y
		};
	}

	function handleCellactivation(e) {
		var eventType = e.type, cell = e.target || e.srcElement;
		if (!cell || cell.nodeName!="TD") {return;}
		if (cell.parentNode.className=="controls") {return;}
		if (eventType=="click") {
			cell.className = cell.className ? "" : "on";
			return;
		}
		if (eventType=="mouseover") {
			if (e.metaKey) {
				cell.className = "on";
			}
			else if (e.shiftKey) {
				cell.className = "";
			}
		}
	}
	function handleRunStop() {
		var instance = this;
		instance[instance.running?"stop":"start"]();
	}
	function handleTick() {
		var instance = this;
		instance[instance.running?"stop":"tick"]();
	}

	/*
		Any live cell with fewer than two live neighbours dies, as if caused by under-population.
		Any live cell with two or three live neighbours lives on to the next generation.
		Any live cell with more than three live neighbours dies, as if by overcrowding.
		Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/
	function liveNext(cell, neighbours) {
		var count = 0, isLive = cell.className == "on";
		for (var idx=0, len=neighbours.length; idx<len; ++idx) {
			count += neighbours[idx].className.indexOf("on")>-1 ? 1 : 0;
		}
		return isLive ? (count == 2 || count == 3) : count == 3;
	}
	
	function Grid(game) {
		var options = game.options;
		game.map = {};
		var instance = this
			, frag = doc.createDocumentFragment()
			, cols, rows = options.height;
		var table = doc.createElement("table"), row, cell, pos;
		table.className = "grid";
		do {
			row = table.insertRow(-1);
			cols = options.width;
			do {
				cell = row.insertCell(-1);
				pos = getPos(cols, rows, options).str;
				game.map[pos] = {"cell": cell, "neighbours": []};
				cell.setAttribute("data-pos", pos);
			} while (--cols);
		} while (--rows);

		var maxX = options.width-1
			, maxY = options.height-1;

		loopCells(game.map, options, function (map, pos) {
			var posStr = pos.str, x = pos.x, y = pos.y;
			doCells({"clause": y>0, "x":x, "y": y-1}, {"clause": x<maxX, "x": x+1, "y": y-1}, map, posStr);
			doCells({"clause": x<maxX, "x": x+1, "y": y}, {"clause": y<maxY, "x": x+1, "y": y+1}, map, posStr);
			doCells({"clause": y<maxY, "x": x, "y": y+1}, {"clause": x>0, "x": x-1, "y": y+1}, map, posStr);
			doCells({"clause": x>0, "x": x-1, "y": y}, {"clause": y>0, "x": x-1, "y": y-1}, map, posStr);
		});
		
		row = table.insertRow(-1);
		row.className = "controls";
		cell = row.insertCell(-1);
		cell.colSpan = options.width;
		var button = doc.createElement("button");
		button.className = "run-stop";
		button.innerHTML = "RUN/STOP";
		cell.appendChild(button);
		button = doc.createElement("button");
		button.className = "tick";
		button.innerHTML = "Step";
		cell.appendChild(button);
		frag.appendChild(table);
		instance.frag = frag;
	}
	function doCells(a, b, map, posStr) {
		if (a.clause) {
			doCell(a.x, a.y, map, posStr);
			b.clause && doCell(b.x, b.y, map, posStr);
		}
	}
	function doCell(x, y, map, posStr) {
		map[posStr].neighbours.push(map["x"+x+"y"+y].cell);
	}
	return {
		"create": function (options) {
			"[object Object]" == {}.toString.call(options) || (options = defaultOptions);
			return new Game(options);
		}
	};
})();