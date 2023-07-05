(function () {
var local = { //local object
	main: document.querySelector('main'),
	row: null,
	goe: Object.create(globalElement),
	loop: null,
	game:{
			list:{}
	}
};

var init = function () { 
	//container-row
	var container = Object.create(globalObject.gui);
	container.build('div', local.goe.container);
	local.main.appendChild(container.component);

	local.row = Object.create(globalObject.gui);
	local.row.build('div', local.goe.row);
	container.addComp(local.row);

	// global game loop
	local.loop = Object.create(globalObject.loop);
	local.loop.start();
	
	// render
	var games = Object.keys(local.game.list);
	games.forEach(function(game) {
		local.game.list[game]();
	});	
};

local.game.list.banner = function () {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.banner.card);

	var h3 = Object.create(globalObject.gui);
	h3.build('h3', local.goe.h3);
	h3.gtext = 'Bin Four';
	h3.updateText();

	cardBase.contentHolder.addComp(h3);
	local.row.addComp(cardBase.col);
};

local.game.list.increment = function () {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.increment.card);

	var h3 = Object.create(globalObject.gui);
	h3.build('h3', local.goe.h3);
	h3.gtext = 0;
	h3.updateText();

	cardBase.contentHolder.addComp(h3);
	local.row.addComp(cardBase.col);
	
	var inc = 5; // per second
	var total = 0
	
	var timer = Object.create(globalObject.timer);
	timer.duration = 1000;
	local.loop.timers.push(timer.update.bind(timer));
	timer.start();
	
	var count = 0;
	setInterval(function(){
		count+=5;
	},1000);
	
	local.loop.callBacks.push(function(time) {
		var t = inc*time.delta;
		total += t;
		h3.gtext = (total).toFixed() + '   ' + count;
		h3.updateText();
	});
};

local.game.list.shootMissile = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.contentHolder.removeStyle(local.goe.shootMissile.contentHolder);
	// cardBase.card.addStyle(local.goe.shootAlien.card);
	
	local.row.addComp(cardBase.col);

	var canvas = Object.create(globalObject.gui);
	canvas.build('canvas', local.goe.canvasBase);
	cardBase.contentHolder.addComp(canvas);
	
	/*
	var btnHolder = Object.create(globalObject.gui);
	btnHolder.build('div', {});
	cardBase.contentHolder.addComp(btnHolder);
	
	var title = Object.create(globalObject.gui);
	title.build('p', {});
	title.gtext = 'Missile';
	title.updateText();
	btnHolder.addComp(title);

	var damage = Object.create(globalObject.gui);
	damage.build('span', {});
	damage.gtext = 'Damage';
	damage.updateText();
	btnHolder.addComp(damage);

	var dpoint = Object.create(globalObject.gui);
	dpoint.build('span', {});
	dpoint.gtext = 1;
	dpoint.updateText();
	damage.addComp(dpoint);
	
	var upgrade = function(e) {
		e.preventDefault();
		
		console.log('upgrade func');
		
	};
	
	// upgrade btn
	var btn = Object.create(globalObject.gui);
	btn.build('div', {gclass: 'border border-black border-2', gstyle: 'cursor: pointer;'});
	btnHolder.addComp(btn);
	btnHolder.component.addEventListener('click', upgrade, false);
	
	var cicon = Object.create(globalObject.gui);
	cicon.build('i', {gclass: 'bi bi-coin', gstyle: 'color: orange'});
	btn.addComp(cicon);
	
	var cost = Object.create(globalObject.gui);
	cost.build('span', {});
	cost.gtext = 100;
	cost.updateText();
	btn.addComp(cost);
	*/
	
	var game = {
		drawingSurface: canvas.component.getContext('2d'),
		cannon: null,
		alien: null,
		missile: null,
		hmMeter: null,
		state: 'loading',
		imgs: [],
		sprites: [],
		spritesHm: [],
		init: function() {
			var imgs = ['alien', 'meter'];
			imgs.forEach(function(img) {
				var obj = Object.create(globalObject.gui);
				obj.buildImg('img', {}, local.goe.imgSrc.getFile(img));
				game.imgs.push(obj);
			});
			local.loop.callBacks.push(game.update);

		},
		load: function() {
			game.state = 'build';
			game.imgs.forEach(function(gui) { 
				if (!gui.gloaded) { game.state = 'loading'; }
			});
		},
		build: function() {
			var background = Object.create(globalObject.sprite);
			background.x = 0;
			background.y = 0;
			background.sourceY = 32;
			background.sourceWidth = 480;
			background.sourceHeight = 320;
			background.width = 480;
			background.height = 320;
			game.sprites.push(background);
			
			var alien = Object.create(globalObject.sprite);
			alien.sourceX = 32;
			alien.y = 32;
			// alien.x = Math.floor(Math.random() * 15) * alien.width;
			alien.x = canvas.gwidth / 2 - alien.width / 2;
			alien.health = 5;
			alien.currentHealth = 5;
			game.sprites.push(alien);
			game.alien = alien;
			
			//Create the cannon and center it
			var cannon = Object.create(globalObject.sprite);
			cannon.x = canvas.gwidth / 2 - cannon.width / 2;
			cannon.y = 280;
			game.sprites.push(cannon);
			game.cannon = cannon;
			
			var missile = Object.create(globalObject.sprite);
			missile.sourceX = 96;
			missile.sourceWidth = 16;
			missile.sourceHeight = 16;
			missile.width = 16;
			missile.height = 16;
			// missile.visible = false;
			// missile.ready = true;
			missile.x = cannon.centerX() - missile.halfWidth();
			missile.y = cannon.y - missile.height;
			missile.vy = -110;
			missile.damage = 1;
			
			missile.interval = Object.create(globalObject.timer);
			missile.interval.name= 'interval';
			missile.interval.duration = 3000;
			local.loop.timers.push(missile.interval.update.bind(missile.interval));
			
			missile.respawn = Object.create(globalObject.timer);
			missile.respawn.name = 'respawn';
			missile.respawn.duration = 1500;
			local.loop.timers.push(missile.respawn.update.bind(missile.respawn));
			
			game.sprites.push(missile);
			game.missile = missile;
			
			var hmBorder = Object.create(globalObject.sprite);
			hmBorder.sourceWidth = 128;
			hmBorder.sourceHeight = 14;
			hmBorder.width = 128;
			hmBorder.height = 14;
			hmBorder.x = canvas.gwidth / 2 - hmBorder.width /2;
			hmBorder.y = 10;
			game.spritesHm.push(hmBorder);
			
			var hmMeter = Object.create(globalObject.sprite);
			hmMeter.sourceY = 14;
			hmMeter.sourceWidth = 128;
			hmMeter.sourceHeight = 14;
			hmMeter.width = 128;
			hmMeter.height = 14;
			hmMeter.x = canvas.gwidth / 2 - hmMeter.width /2;
			hmMeter.y = 10;
			game.spritesHm.push(hmMeter);
			game.hmMeter = hmMeter;
			
			game.state = 'play';
		},
		render: function() {
			game.drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
			
			// draw background, ship, alien
			globalObject.draw(game.drawingSurface, canvas.component, game.sprites, game.imgs[0].component);
			
			// draw health meter
			globalObject.draw(game.drawingSurface, canvas.component, game.spritesHm, game.imgs[1].component);
		},
		play: function(time) {
			
			if(globalObject.hitTestRectangle(game.missile, game.alien)) { 
		
				game.alien.currentHealth-=game.missile.damage;
				if(game.alien.currentHealth == 0) {
					
					game.alien.sourceX = 64;
				
					game.missile.vy = 0;
					game.missile.x = game.cannon.centerX() - game.missile.halfWidth();
					game.missile.y = game.cannon.y - game.missile.height;
					game.missile.visible = false;
					
					game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
					game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
					
					// respawn
					game.missile.respawn.start();
					
				} else {
					
					game.missile.vy = 0;
					game.missile.x = game.cannon.centerX() - game.missile.halfWidth();
					game.missile.y = game.cannon.y - game.missile.height;
					game.missile.visible = false;
					
					game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
					game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
					
					game.missile.interval.start();
				
				}
				
			}

			// shoot missile
			if(game.missile.interval.complete) {
				game.missile.interval.end();
				game.missile.visible = true;
				game.missile.vy = -110;
			}
			
			// respawn
			if(game.missile.respawn.complete) {
				game.missile.respawn.end();
				
				game.alien.currentHealth = 5;
				game.alien.sourceX = 32;

				game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
				game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
					
				game.missile.interval.start();
				
			}
			
			// move missile
			if(game.missile.vy < 0) {
				game.missile.y+=game.missile.vy*time.delta;
			}

			game.render();

		},
		update: function(time) {
			switch(game.state) {
				case 'loading': game.load(); break;
				case 'build': game.build(); break;
				case 'play': game.play(time); break;
			}
		}
	};
	game.init();
};

local.game.list.walkAnim = function () {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.moveHorizontal.card);
	
	var canvas = Object.create(globalObject.gui);
	canvas.build('canvas', local.goe.canvasBase);
	
	cardBase.contentHolder.addComp(canvas);
	local.row.addComp(cardBase.col);

	var game = {
		drawingSurface: null,
		walkImgs: [],
		sprites: [],
		state: 'loading',
		ship: Object.create(globalObject.sprite),
		draw: globalObject.draw,
		count: 0,
		load: function() {
			game.state = 'build';
			game.walkImgs.forEach(function(gui) { 
				if (!gui.gloaded) { game.state = 'loading'; }
			});			
		},
		init: function() {
			game.drawingSurface = canvas.component.getContext('2d');

			local.goe.imgSrc.walkAnim.forEach(function(img) {
				var wImg = Object.create(globalObject.gui);
				wImg.buildImg('img', {}, local.goe.imgSrc.getAnimFilePath(img));
				game.walkImgs.push(wImg);
			});
			
			local.loop.callBacks.push(game.update);
		},
		build: function() {
			game.ship.sourceWidth = 96;
			game.ship.sourceHeight = 96;
			game.ship.width = 96;
			game.ship.height = 96;
			game.ship.accelerationY = 2
			
			game.ship.x = canvas.gwidth / 2 - game.ship.halfWidth();
			game.ship.y = canvas.gheight / 2 - game.ship.halfHeight();
			game.sprites.push(game.ship);

			game.state = 'play';
		},
		play: function(time) {

			if(game.ship.y > canvas.gheight) {
				game.ship.y = -game.ship.height;
			}
			
			game.ship.vy = game.ship.accelerationY;
			game.ship.y += game.ship.vy*time.delta;
			
			game.count+=3*time.delta;
			if(game.count > game.walkImgs.length-1) game.count = 0;
			
			game.drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
			
			game.draw(game.drawingSurface, canvas.component, game.sprites, game.walkImgs[Math.floor(game.count)].component);
		},
		update: function(time) {
			switch(game.state) {
				case 'loading': game.load(); break;
				case 'build': game.build(); break;
				case 'play': game.play(time); break;
			}
		}
	};	
		
	game.init();
};

local.game.list.framesPerSecond = function () {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.framesPerSecond.card);

	var h3 = Object.create(globalObject.gui);
	h3.build('h3', local.goe.h3);
	h3.gtext = 0;
	h3.updateText();

	cardBase.contentHolder.addComp(h3);
	local.row.addComp(cardBase.col);

	var counter = Object.create(globalObject.fpsCounter);

	local.loop.callBacks.push(function(time) {
												counter.update(time);
												h3.gtext = counter.fps;
												h3.updateText();
											});
};

local.game.list.moveHorizontal = function () {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.moveHorizontal.card);
	
	var canvas = Object.create(globalObject.gui);
	canvas.build('canvas', local.goe.canvasBase);
	
	cardBase.contentHolder.addComp(canvas);
	local.row.addComp(cardBase.col);

	var game = {
		drawingSurface: null,
		img: new Image(),
		sprites: [],
		ship: Object.create(globalObject.sprite),
		draw: globalObject.draw,
		init: function() {
			game.img.removeEventListener('load', game.init, false);
		
			game.drawingSurface = canvas.component.getContext('2d');

			game.ship.sourceWidth = 96;
			game.ship.sourceHeight = 96;
			game.ship.width = 96;
			game.ship.height = 96;
			game.ship.accelerationX = 30;
			
			game.ship.x = canvas.gwidth / 2 - game.ship.halfWidth();
			game.ship.y = canvas.gheight / 2 - game.ship.halfHeight();
			game.sprites.push(game.ship);
			
			game.draw(game.drawingSurface, canvas.component, game.sprites, game.img);
			
			local.loop.callBacks.push(game.start);
		},
		start: function(time) {
			
			if(game.ship.x < 0) {
				game.ship.accelerationX *= game.ship.bounce;
				game.ship.vx = game.ship.accelerationX;
			}
					
			if(game.ship.x + game.ship.width > canvas.gwidth) {
				game.ship.accelerationX *= game.ship.bounce;
				game.ship.vx = game.ship.accelerationX;
			}
			
			game.ship.vx = game.ship.accelerationX;
			game.ship.x += game.ship.vx*time.delta;
			
			game.drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
			
			game.draw(game.drawingSurface, canvas.component, game.sprites, game.img);
		}
	};	

	game.img.addEventListener('load', game.init, false);
	game.img.src = local.goe.imgSrc.getFile('boss');
};

local.game.list.match = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.match.card);
	cardBase.contentHolder.removeStyle(local.goe.match.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.match.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.treasureBase.contentHolder);
	
	local.row.addComp(cardBase.col);
	
	var game = {
		box: document.getElementById('ex-eight-box'),
		map: [
				[0, 0, 1, 0, 0],
				[0, 1, 0, 1, 0],
				[1, 0, 0, 0, 1],
				[0, 1, 0, 1, 0],
				[0, 0, 1, 0, 0]
			],
		deck: [],
		cardCount: 0,
		to: null, // timeout
		currentCard: null,
		checking: false,
		shuffle: function() {
			var cards = ['home', 'island', 'pirate', 'ship'];
			var pair = 2;
			cards.forEach(function(value) { 
				for(var i = 0; i < pair; i++) {
					game.deck.push({name: value, id: i});
				}
			});		
			for(var i = game.deck.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * i);
				var temp = game.deck[i];
				game.deck[i] = game.deck[j];
				game.deck[j] = temp;
			}
		},	
		ul: function() {
			var ul = document.createElement('ul');
			ul.className = "list-group list-group-horizontal list-unstyled";
			cardBase.contentHolder.component.appendChild(ul);
			return ul;
		},
		li: function() {
			return document.createElement('li');
			
		},
		blankCell: function() {
			var li = this.li();
			li.style.cssText = 'width: 64px;';
			li.className = 'img-fluid';
			return li;
		},
		cell: function() {
			var obj = {};
			var li = this.li();
			
			var img = document.createElement('img');
			img.style.cssText = 'cursor: pointer;';
			img.className = 'img-fluid';
			img.src = 'images/water.png';
			li.appendChild(img);
			
			obj.elem = img;
			obj.name = game.deck[game.cardCount].name;
			obj.id = game.deck[game.cardCount].id;
			
			game.cardCount++;
			
			img.addEventListener('click', this.cellClick.bind(obj), false);
			
			return li;
		},
		checkCards: function(obj1, obj2) {
			var r = 'none'; // no match
			if(obj1['name'] == obj2['name'] && obj1['id'] == obj2['id']) r = 'same'; // do nothing
			if(obj1['name'] == obj2['name'] && obj1['id'] != obj2['id']) r = 'match'; // match
			return r;
		},
		cellClick: function() {
			var card = this; 
			if(game.currentCard && !game.checking) {
				card.elem.src = 'images/' + card.name + '.png';
				switch(game.checkCards(card, game.currentCard)) {
					case 'match':
						game.checking = true;
						game.to = setTimeout(function() {
							card.elem.className += ' invisible';
							game.currentCard.elem.className += ' invisible';
							clearTimeout(game.to);
							game.to = null;
							game.currentCard = null;
							game.checking = false;
						}, 1000);
						break;
					case 'none':
						game.checking = true;
						game.to = setTimeout(function() {
							card.elem.src = 'images/water.png';
							game.currentCard.elem.src = 'images/water.png';
							clearTimeout(game.to);
							game.to = null;
							game.currentCard = null;
							game.checking = false;
						},1000);
						break;
				}										
			}
			if(!game.checking && !game.currentCard) {
				card.elem.src = 'images/' + card.name + '.png';
				game.currentCard = card;	
			}	
		}
	};

	var buildMap = function(name) {
		var ul = game.ul();
		name.forEach(function(name) {
			switch(name) {
				case 0: ul.appendChild(game.blankCell()); break;
				case 1: ul.appendChild(game.cell()); break;
			};
		});
	};

	game.shuffle();
	game.map.forEach(buildMap);
	
	var resetClick = function() {
		while (cardBase.contentHolder.component.firstChild) {
		  cardBase.contentHolder.component.removeChild(cardBase.contentHolder.component.firstChild);
		}
		clearTimeout(game.to);
		game.to = null;
		game.currentCard = null;
		game.checking = false;
		game.deck = [];
		game.cardCount = 0;
		game.shuffle();
		game.map.forEach(buildMap);
	};
	
	cardBase.addBtn(local.goe.cardBase.btn, resetClick);
};

local.game.list.clickAddRect = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.clickAddRect.card);
	
	var canvas = Object.create(globalObject.gui);
	canvas.build('canvas', local.goe.canvasBase);
	canvas.addStyle(local.goe.clickAddRect.canvas);
	
	cardBase.contentHolder.addComp(canvas);
	local.row.addComp(cardBase.col);
	
	var ctx = canvas.component.getContext("2d");

	var boxClick = function(e) { 

		var rect = canvas.component.getBoundingClientRect();	
		var x = e.x - rect.left;
		var y = e.y - rect.top;
		
		x*=(canvas.gwidth/rect.width);
		y*=(canvas.gheight/rect.height);
		
		ctx.fillRect(x, y, 15, 15);
	};

	var resetClick = function() {
		ctx.clearRect(0, 0, canvas.gwidth, canvas.gheight);
	};

	canvas.component.addEventListener('click', boxClick, false);
	cardBase.addBtn(local.goe.cardBase.btn, resetClick);
};

local.game.list.clickCount = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.clickCount.card);
	
	var h3 = Object.create(globalObject.gui);
	h3.build('h3', local.goe.h3);
	h3.gtext = 0;
	h3.updateText();
	
	cardBase.contentHolder.addComp(h3);
	local.row.addComp(cardBase.col);
	
	var count = 0;
	var boxClick = function(e) {
		e.preventDefault();
		h3.gtext = ++count;
		h3.updateText();
	};
	cardBase.card.component.addEventListener('click', boxClick, false);
};

local.game.list.moveShip = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.moveShip.card);
	cardBase.contentHolder.removeStyle(local.goe.moveShip.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.treasureBase.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.moveShip.contentHolder);
	
	local.row.addComp(cardBase.col);
	
	var map = [
	  [0, 2, 0, 0, 0, 3],
	  [0, 0, 0, 1, 0, 0],
	  [0, 1, 0, 0, 0, 0],
	  [0, 0, 0, 0, 2, 0],
	  [0, 2, 0, 1, 0, 0],
	  [0, 0, 0, 0, 0, 0]
	];

	var gameObjects = [
	  [0, 0, 0, 0, 0, 0],
	  [0, 0, 0, 0, 0, 0],
	  [0, 0, 0, 0, 0, 0],
	  [0, 0, 0, 0, 0, 0],
	  [0, 0, 0, 0, 0, 0],
	  [4, 0, 0, 0, 0, 0]
	];

	var WATER = 0;
	var ISLAND = 1;
	var PIRATE = 2;
	var HOME = 3;
	var SHIP = 4;

	var SIZE = 64;

	var ROWS = map.length;
	var COLUMNS = map[0].length;	

	var ship = {
		row: 5,
		column: 0,
		src: "images/ship.png"
	};

	var getKey = function() {
		return 'cell'+ship.row+ship.column;
	};

	var setMapImg = function() {
		cells[getKey()].elem.src = cells[getKey()].src;
	};

	var setShipImg = function() {
		cells[getKey()].elem.src = ship.src;
	};

	var cells = {};

	var cellClick = function() {

		if(this.column == ship.column) { // check click same column as ship
			
			if(this.row < ship.row) { // up
				setMapImg();
				ship.row--;
				setShipImg();
			}

			if(this.row > ship.row) { // down
				setMapImg();
				ship.row++;
				setShipImg();
			}
		}
		
		if(this.row == ship.row) { // check click same row as ship
			
			if(this.column > ship.column) { // right
				setMapImg();
				ship.column++;
				setShipImg();
			}

			if(this.column < ship.column) { // left
				setMapImg();
				ship.column--;
				setShipImg();
			}
		}
	};

	for(var row = 0; row < ROWS; row++) {	
	  
		var ul = document.createElement("ul");
		ul.classList.add("list-group", "list-group-horizontal");
		cardBase.contentHolder.component.appendChild(ul);
		
		for(var column = 0; column < COLUMNS; column++) { 
		
			var li = document.createElement("li");
			li.style.listStyle = "none";
			ul.appendChild(li);
			
			var cell = {}
			
			var img = document.createElement("img");
			img.classList.add("img-fluid");
		  
			img.addEventListener('click', cellClick.bind(cell), false);
		  
			// img.width = SIZE;
			// img.height = SIZE;
			li.appendChild(img);
			
			cell.elem = img;
			cell.row = row;
			cell.column = column;
			
			cells['cell'+row+column] = cell;
		  
			switch(map[row][column]) {
				case WATER:
				  img.src = "images/water.png";
				  cell.src = "images/water.png";
				  break;

				case ISLAND:
				  img.src = "images/island.png";
				  cell.src = "images/island.png";
				  break; 

				case PIRATE:
				  img.src = "images/pirate.png";
				  cell.src = "images/pirate.png";
				  break; 

				case HOME:
				  img.src = "images/home.png";
				  cell.src = "images/home.png";
				  break;   
			} 
						  
			switch(gameObjects[row][column]) {
				case SHIP:
					img.src = ship.src;
					break;   
			}
		}
	}
};

local.game.list.changeFont = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.changeFont.card);
	cardBase.contentHolder.removeStyle(local.goe.changeFont.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.changeFont.contentHolder);
	
	var navHolder = Object.create(globalObject.gui);
	navHolder.build('div', local.goe.changeFont.navHolder);
	var nav = Object.create(globalObject.gui);
	nav.build('nav', local.goe.changeFont.nav);
	navHolder.addComp(nav);
	
	var h3 = Object.create(globalObject.gui);
	h3.build('h3', local.goe.h3);
	h3.gtext = 'Change Font';
	h3.updateText();
	
	cardBase.contentHolder.addComp(navHolder);
	cardBase.contentHolder.addComp(h3);
	local.row.addComp(cardBase.col);
	
	var types = ['Consolas', 'Courier New', 'Helvetica'];
	var aClick = function() {
		h3.component.style.fontFamily = this.font;
	};
	var linkElem = function(font) {
		var obj = {};
		var a = document.createElement('a');
		a.classList.add('p-2', 'link-dark');
		a.style.cursor = 'pointer';
		a.innerHTML = font;
		nav.component.appendChild(a);
		
		a.addEventListener('click', aClick.bind(obj), false);
		
		obj.elem = a;
		obj.font = font;
	};

	types.forEach(linkElem);
};

local.game.list.shootAlien = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.addStyle(local.goe.shootAlien.card);

	var canvas = Object.create(globalObject.gui);
	canvas.build('canvas', local.goe.canvasBase);
	
	cardBase.contentHolder.addComp(canvas);
	local.row.addComp(cardBase.col);
	
	var drawingSurface = canvas.component.getContext('2d');

	var sprites = [];
	var missiles = [];

	//Create the background
	// var background = Object.create(gObj.sprite);
	// background.x = 0;
	// background.y = 0;
	// background.sourceY = 32;
	// background.sourceWidth = 480;
	// background.sourceHeight = 320;
	// background.width = 480;
	// background.height = 320;
	// sprites.push(background);

	//Create a missile sprite
	var missile = Object.create(globalObject.sprite);
	missile.sourceX = 96;
	missile.sourceWidth = 16;
	missile.sourceHeight = 16;
	missile.width = 16;
	missile.height = 16;
	missile.visible = false;
	missile.ready = true;
	sprites.push(missile);

	var alien = Object.create(globalObject.sprite);
	alien.sourceX = 32;
	alien.y = 32;
	// alien.x = Math.floor(Math.random() * 15) * alien.width;
	alien.x = canvas.gwidth / 2 - alien.width / 2;
	sprites.push(alien);

	//Create the cannon and center it
	var cannon = Object.create(globalObject.sprite);
	cannon.x = canvas.gwidth / 2 - cannon.width / 2;
	cannon.y = 280;
	sprites.push(cannon);

	// var moveCannon = function() {
		// if(cannon.x < 0) cannon.changeDirection();
		// if(cannon.x + cannon.width > canvas.width) cannon.changeDirection();
		// cannon.vx = cannon.speed;
		// cannon.x+=cannon.vx;
	// };

	var moveMissile = function(time) {
		if(missile.vy < 0) missile.y+=missile.vy*time.delta;
	};

	var checkHit = function() {
		if(globalObject.hitTestRectangle(missile, alien)) { 
			alien.sourceX = 64;
			missile.vy = 0;
			missile.x = 0;
			missile.y = 0;
			missile.visible = false;
			
			var to = setTimeout(function() {
												alien.sourceX = 32;
												drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
												globalObject.draw(drawingSurface, canvas.component, sprites, img);
												clearTimeout(to); 
												to = null;
												missile.ready = true;
											}, 800);		
		}
	};

	var update = function(time) { 
	
		//moveCannon();
		
		if(!missile.ready) {
			moveMissile(time);
			checkHit();
			drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
			globalObject.draw(drawingSurface, canvas.component, sprites, img);
		}	
	};

	var loadHandler = function() {
		img.removeEventListener("load", loadHandler, false);
		globalObject.draw(drawingSurface, canvas.component, sprites, img);
		local.loop.callBacks.push(update);
	};

	var boxClick = function(e) {
		e.preventDefault();
		if (missile.ready) {
			missile.ready = false;
			missile.x = cannon.centerX() - missile.halfWidth();
			missile.y = cannon.y - missile.height;
			missile.visible = true;
			missile.vy = -110;
		}  
	};

	var img = new Image();
	img.addEventListener("load", loadHandler, false);
	img.src = local.goe.imgSrc.getFile('alien');

	cardBase.card.component.addEventListener('click', boxClick, false);
};

local.game.list.changeImg = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.card.removeStyle(local.goe.changeImg.card);
	cardBase.contentHolder.removeStyle(local.goe.changeImg.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.changeImg.contentHolder);
	
	local.row.addComp(cardBase.col);
	
	var btnHolder = Object.create(globalObject.gui);
	btnHolder.build('ul', local.goe.changeImg.btnHolder);
	cardBase.card.addComp(btnHolder);
	
	var imgs = ['linggo', 'martes', 'sabado'];
	var btns = [
					{ 
						pElem: 'li',
						pClasses: 'ms-auto me-1',
						elem: 'i',
						classes: 'bi bi-arrow-left px-2 border border-black border-2',
						styles: 'font-size: 2rem; background-color: #996633; cursor: pointer;',
						dir: -1
					},
					{
						pElem: 'li',
						pClasses: 'me-3',
						elem: 'i',
						classes: 'bi bi-arrow-right px-2 border border-black border-2',
						styles: 'font-size: 2rem; background-color: #996633; cursor: pointer;',
						dir: 1
					}
				];
	var SIZE = 280;
	var imgCount = 0;
	
	var imgElem = function(name, index) {
		var obj = {};
		var img = document.createElement('img');
		img.classList.add('rounded-4', 'img-fluid');
		img.width = SIZE;
		img.height = SIZE;
		img.src = 'images/' + name + '.png';
		
		obj.elem = img;
		obj.name = name;
		imgs[index] = obj;
	};
	
	var btnClick = function() {
		cardBase.contentHolder.component.removeChild(imgs[imgCount].elem);
		imgCount+=this.dir;
		if(imgCount < 0) imgCount = imgs.length-1;
		if(imgCount > imgs.length-1) imgCount = 0;
		cardBase.contentHolder.component.appendChild(imgs[imgCount].elem);	
	};	
	
	var btnElem = function(btn) {
		var li = document.createElement(btn.pElem);
		li.className = btn.pClasses;
		var i = document.createElement(btn.elem);
		i.className = btn.classes;
		i.style.cssText = btn.styles;
		li.appendChild(i);
		btnHolder.component.appendChild(li);
		i.addEventListener('click', btnClick.bind(btn), false);
	};

	imgs.forEach(imgElem);
	btns.forEach(btnElem);
	
	cardBase.contentHolder.component.appendChild(imgs[imgCount].elem);
};

local.game.list.buildMap = function() {
	var cardBase = Object.create(globalObject.cardBase);
	cardBase.build(local.goe.cardBase);
	cardBase.contentHolder.addStyle(local.goe.buildMap.contentHolder);
	cardBase.contentHolder.addStyle(local.goe.treasureBase.contentHolder);
	
	local.row.addComp(cardBase.col);
	
	var btnHolder = Object.create(globalObject.gui);
	btnHolder.build('ul', local.goe.buildMap.btnHolder);
	
	var game = {
		btnObjects: ['water', 'home', 'island', 'pirate', 'ship', 'blank'],
		mapObjects: [
						[0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0],
						[0, 0, 0, 0, 0, 0]
					],
		blankBtn: function() {
			var li = document.createElement('li');
			li.style.cssText = 'width: 64px;';
			li.className = 'img-fluid';
			btnHolder.component.appendChild(li);
		},
		btn: function(name) {
			var obj = {};
			var li = document.createElement('li');
			btnHolder.component.appendChild(li);
			
			var img = document.createElement('img');
			img.style.cssText = 'cursor: pointer;';
			img.className = 'img-fluid';
			img.src = 'images/' + name + '.png';
			li.appendChild(img);
			
			obj.elem = img;
			obj.name = name;
			
			img.addEventListener('click', btnClick.bind(obj), false);
		},
		activeBtn: null,
	};

	var btnClick = function() {
		if(game.activeBtn) {
			game.activeBtn.elem.style.background = '';
			if(game.activeBtn.name === this.name) {
				game.activeBtn = null;
			} else {
				game.activeBtn = this;
				this.elem.style.background = 'yellow';
			}	
		} else {
			game.activeBtn = this;
			this.elem.style.background = 'yellow';
		}
	};

	var buildBtns = function(name) {
		switch(name) {
			case 'blank':
				game.blankBtn();
				break;
			case 'water':
			case 'home':
			case 'island':
			case 'pirate':
			case 'ship':
				game.btn(name);
				break;
		}
	};	

	var mapClick = function() {
		if(game.activeBtn) this.elem.src = 'images/' + game.activeBtn.name + '.png';
	};

	var buildMap = function(name) {
		var ul = document.createElement('ul');
		ul.className = "list-group list-group-horizontal list-unstyled";
		cardBase.contentHolder.component.appendChild(ul);
		
		var cell = function() {
			var obj = {};
			var li = document.createElement('li');
			ul.appendChild(li);
			
			var img = document.createElement('img');
			img.classList.add('img-fluid');
			img.src = 'images/water.png';
			li.appendChild(img);

			obj.elem = img;
			obj.name = 'water';		
			
			img.addEventListener('click', mapClick.bind(obj), false);
		};
		
		name.forEach(cell);
	};
	
	var resetClick = function() {
		while (cardBase.contentHolder.component.firstChild) {
		  cardBase.contentHolder.component.removeChild(cardBase.contentHolder.component.firstChild);
		}
		game.mapObjects.forEach(buildMap);
		if(game.activeBtn) {
			game.activeBtn.elem.style.background = '';
			game.activeBtn = null;
		}
	};

	game.mapObjects.forEach(buildMap);
	game.btnObjects.forEach(buildBtns);
	cardBase.card.addComp(btnHolder);
	cardBase.addBtn(local.goe.cardBase.btn, resetClick);
};

init();

})();

