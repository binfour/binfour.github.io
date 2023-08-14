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
		if(local.game.list[game].on) {
			local.game.list[game].play();
		}	
	});	
};

local.game.list.banner = {
	on: false,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.card.addStyle(local.goe.banner.card);

		var h3 = Object.create(globalObject.gui);
		h3.build('h3', local.goe.h3);
		h3.updateText('Bin Four');

		cardBase.contentHolder.addComp(h3);
		local.row.addComp(cardBase.col);
	}
};

local.game.list.updgrade = {
	on: true,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.contentHolder.removeStyle(local.goe.shootMissile.contentHolder);
		// cardBase.card.addStyle(local.goe.shootAlien.card);
		
		local.row.addComp(cardBase.col);

		var canvas = {
			gui: globalObject.gui.create({elem: 'canvas', style: local.goe.canvasBase}),
			drawingSurface: function() {
				return this.gui.component.getContext('2d'); 
			},
			attach: function(cb) {
				this.gui.component.addEventListener('click', cb, false);
				cardBase.contentHolder.addComp(this.gui);
			}
		};
		
		var background = function() {
			return globalObject.sprite.create({sourceY:32, sourceWidth:480, sourceHeight:320, width:480, height:320});
		};
		
		var alien = function() {
			return globalObject.sprite.create({sourceX:32, y:32, width:56, height:56, health:5, currentHealth:5});
		};
		
		var cannon = function() {
			return globalObject.sprite.create({y:280, width:24, height:24});
		};
		
		var missile = function() {
			var obj = globalObject.sprite.create({sourceX:96, sourceWidth:16, sourceHeight:16, width:10, height:10, vy:-110, damage:1});
			
			obj.interval = Object.create(globalObject.timer);
			obj.interval.name= 'interval';
			obj.interval.duration = 5000;
			
			obj.upgradeInterval = function() {
				this.inverval.duration = 1000;
			};
			
			return obj;
		};
		
		var shootMissile = function(cannonCenterX, cannonY) {
			var obj =  globalObject.sprite.create({sourceX:96, sourceWidth:16, sourceHeight:16, width:10, height:10, vy:-110, damage:1});
			
			obj.x = cannonCenterX - obj.halfWidth();
			obj.y = cannonY - obj.height;
			
			return obj;
		};
		
		var coin = {
			holder: { 
				gui: null,
				build: function(holder) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gclass: 'rounded-1 p-2 mb-1', gstyle: 'background: #e6e6e6; font-size: 0.875rem;'}, parentHolder: holder});
				}
			},
			income: {
				value: 0,
				gui: null,
				build: function(holder, value) {
					
					// *** FIX THIS
					// this.value=value
					
					var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'color: #4fc24f;'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value.toString(), style: {}, parentHolder: label});
				},
				update: function() {
					this.gui.updateText(this.value);
				},
				add: function(value) {
					this.value+=value;
					this.update();
				},
				subtract: function(value) {
					this.value-=value;
					this.update();
				}
			},
			build: function() {
				this.holder.build(cardBase.contentHolder);
				this.income.build(this.holder.gui);
			}
		};
		
		var upgradeData = [
			{type: 'Speed',},
			{type: 'Power',}
		];
		
		var btnContainer = function(holder) {
			return globalObject.gui.create({elem: 'div', style: {gclass: 'mt-1'}, parentHolder: holder});
		};
		
		var btnHolder = function(holder) {
			return globalObject.gui.create({elem: 'div', style: {gclass: 'mb-1 p-2 rounded-1', gstyle: 'background: #e6e6e6; font-size: 0.875rem;'}, parentHolder: holder});
		};
		
		var btnTitle = function(holder, value) {
			var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'text-align: center;'}, parentHolder: holder});
			return globalObject.gui.create({elem: 'div', txt: value, style: {}, parentHolder: label});
		};
		
		var upgrades = function() {
			var obj = {};
			var upData = null;
			var list = [];
			
			obj.init = function(data) {
				upData = JSON.parse(JSON.stringify(data));
			};
			
			obj.build = function(pHolder) {

				upData.forEach(function(upg, index) {
					
					var bHolder = btnHolder(pHolder);
					
					var upgradeObj = {ID:index}; 
					
					var keys = Object.keys(upg);
					keys.forEach(function(key) {
						
						upgradeObj.title = {
							value: upg[key],
							gui: btnTitle(bHolder, upg[key])
						};
						// console.log(key);
						
					});
				});
			};
			
			return Object.create(obj);
		};
		
		var game = {
			// drawingSurface: canvas.component.getContext('2d'),
			drawingSurface: null,
			cannon: null,
			alien: null,
			missile: null,
			hmMeter: null,
			state: 'loading',
			imgs: [],
			sprites: [],
			// spritesHm: [],
			shootMissileList: [],
			coin: null,
			upgrades: null,
			canvasClick: function() {
	
				game.shootMissileList.push(shootMissile(game.cannon.centerX(), game.cannon.y));
				// console.log(game.shootMissileList);
			},
			
			init: function() {
				var imgs = ['alien', 'meter'];
				imgs.forEach(function(img) {
					var obj = Object.create(globalObject.gui);
					obj.buildImg('img', {}, local.goe.imgSrc.getFile(img));
					game.imgs.push(obj);
				});
				game.coin = Object.create(coin);
				
				game.alien = alien();
				game.cannon = cannon();
				game.missile = missile();
				
				game.upgrades = upgrades();
				game.upgrades.init(upgradeData);
				
				local.loop.callBacks.push(game.update);

			},
			load: function() {
				
				// *** Fix this -setting state=build before load complete
				game.state = 'build';
				game.imgs.forEach(function(gui) { 
					if (!gui.gloaded) { game.state = 'loading'; }
				});
			},
			build: function() {
				game.coin.build();
				
				canvas.attach(game.canvasClick);
				game.drawingSurface = canvas.drawingSurface();
				
				game.sprites.push(background());
				
				game.alien.x = canvas.gui.gwidth / 2 - game.alien.halfWidth();
				game.sprites.push(game.alien);
				
				game.cannon.x = canvas.gui.gwidth / 2 - game.cannon.halfWidth();
				game.sprites.push(game.cannon);
				
				game.missile.x = game.cannon.centerX() - game.missile.halfWidth();
				game.missile.y = game.cannon.y - game.missile.height; 
				local.loop.timers.push(game.missile.interval.update.bind(game.missile.interval));
				game.sprites.push(game.missile);
				
				game.upgrades.build(btnContainer(cardBase.contentHolder));
				
				game.state = 'play';
			},
			render: function() {
				game.drawingSurface.clearRect(0, 0, canvas.gwidth, canvas.gheight);
				
				// draw background, ship, alien
				globalObject.draw(game.drawingSurface, canvas.component, game.sprites, game.imgs[0].component);
				
				// missiles
				globalObject.draw(game.drawingSurface, canvas.component, game.shootMissileList, game.imgs[0].component);
				
			},
			play: function(time) {
				
				if(globalObject.hitTestRectangle(game.missile, game.alien)) { 
					
					game.coin.income.add(1);
			
					game.alien.currentHealth-=game.missile.damage;
					if(game.alien.currentHealth == 0) {
						
						//game.alien.sourceX = 64;
					
						game.missile.vy = 0;
						game.missile.x = game.cannon.centerX() - game.missile.halfWidth();
						game.missile.y = game.cannon.y - game.missile.height;
						game.missile.visible = false;
						/*
						game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
						game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
						*/
						// respawn
						//game.missile.respawn.start();
						
						game.missile.interval.start();
						
					} else {
						
						game.missile.vy = 0;
						game.missile.x = game.cannon.centerX() - game.missile.halfWidth();
						game.missile.y = game.cannon.y - game.missile.height;
						game.missile.visible = false;
						/*
						game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
						game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
						*/
						game.missile.interval.start();
					}
				}

				// move missile -on interval
				if(game.missile.interval.complete) {
					game.missile.interval.end();
					game.missile.visible = true;
					game.missile.vy = -110;
				}
				
				/*
				// respawn
				if(game.missile.respawn.complete) {
					game.missile.respawn.end();
					
					game.alien.currentHealth = 5;
					game.alien.sourceX = 32;
					
					game.hmMeter.width = game.alien.currentHealth/game.alien.health * 128;
					game.hmMeter.sourceWidth = game.alien.currentHealth/game.alien.health * 128;
					
					game.missile.interval.start();
				}
				*/
				
				// move missile
				if(game.missile.vy < 0) {
					game.missile.y+=game.missile.vy*time.delta;
				}
				
				if(game.shootMissileList.length > 0) {
					game.shootMissileList.forEach(function(missile, index, array){
						if(globalObject.hitTestRectangle(missile, game.alien)) {
							
							/*
							check collision 
							-increment coin
							-remove object from array
							*/
							game.coin.income.add(1);
							array.splice(index,1);
						}
						
						// move shoot missile
						missile.y+=missile.vy*time.delta;
					});
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
	}
};

local.game.list.incomeExpense = {
	on: false,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.contentHolder.removeStyle(local.goe.buttons.contentHolder);
		local.row.addComp(cardBase.col);
		
		var jobBtn = {
			callBack: null,
			data: null,
			holder: { 
				gui: null,
				build: function(holder) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gclass: 'rounded-1 p-2 mb-1', gstyle: 'background: #e6e6e6; font-size: 0.875rem;'}, parentHolder: holder});
				}
			},
			title: {
				gui: null,
				build: function(holder, value) {
					var label = globalObject.gui.create({elem: 'div', style: {}, parentHolder: holder});
					this.gui = globalObject.gui.create({elem: 'div', txt: value, style: {}, parentHolder: label});
				}
			},
			incRange: {
				guiStart: null,
				guiEnd: null,
				build: function(holder, data) {
					var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'color: #4fc24f;'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					this.guiStart = globalObject.gui.create({elem: 'span', txt: data.start, style: {}, parentHolder: label});
					globalObject.gui.connect({elem: 'span', txt: '-', style: {gclass: 'mx-1'}, parentHolder: label});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					this.guiEnd = globalObject.gui.create({elem: 'span', txt: data.end, style: {}, parentHolder: label});
				}
			},
			reqPart: {
				gui: null,
				//data: null,
				build: function(holder, data) {
					//this.data = data;
					var label = globalObject.gui.create({elem: 'div', style: {gclass: 'ms-2'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: data.title, style: {}, parentHolder: label});
					globalObject.gui.connect({elem: 'span', txt: 'x', style: {gclass: 'ms-2'}, parentHolder: label});
					globalObject.gui.connect({elem: 'span', txt: data.qty, style: {}, parentHolder: label});
					
					// *** loop through inventory, qty bg color -ready
				}
			},
			required: {
				gui: null,
				build: function(holder, data) { // data:array
					var label = globalObject.gui.create({elem: 'div', style: {gclass: 'mt-3'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: 'Required:', style: {gclass: 'mb-2'}, parentHolder: label});
				
					data.forEach(function(part){
						jobBtn.reqPart.build(label, part);
					});
				}
			},
			handler: function() {
				if(this.callBack) this.callBack();
			},
			btn: {
				gui: null,
				build: function(holder, value) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gstyle: 'cursor: pointer; text-align: center; background: #abceee;'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: value, style: {gclass: ''}, parentHolder: this.gui});
				}
			},
			build: function(holder, data, cb) {
				this.data=data;
				this.callBack=cb;
				this.holder.build(holder); // parent
				this.title.build(this.holder.gui, data.title);
				this.incRange.build(this.holder.gui, data.income);
				this.required.build(this.holder.gui, data.required);
				this.btn.build(this.holder.gui, data.btn);
				this.btn.gui.component.addEventListener('click', this.handler.bind(this), false);  
			},
			create: function(holder, data, cb) {
				var job = Object.create(this);
				job.build(holder, data, cb);
			}
		};
		
		var investmentData = [
			{type: 'House', income: 50, cost: 3000},
			{type: 'Repair Shop', income: 100, cost: 8000}
		];
		
		var inventoryData = [
			{title: 'Item One', cost: 300, qty: 1},
			{title: 'Item Two', cost: 800, qty: 0}
		];
		
		var buildInventory = function(data, holder, cb) {
			var obj = {};
			
			var inventory = JSON.parse(JSON.stringify(data));
			
			var inventoryList = []; //dataObj, dataObj
			
			inventory.forEach(function(inv, index) {

				var dataObj = {ID:index};
				
				var h = globalObject.gui.create({elem: 'div', style: {gclass: 'me-1 p-1 rounded-1', gstyle: 'background: #e6e6e6; font-size: 0.875rem; width: max-content; float: left'}, parentHolder: holder});
				
				var keys = Object.keys(inv);
				keys.forEach(function(key) {
					switch(key) {
						case 'title':
							var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'text-align: center;'}, parentHolder: h});
							
							dataObj.title = {
								value: inv[key],
								gui: globalObject.gui.create({elem: 'div', txt: inv[key], style: {}, parentHolder: label})
							};
							break;
						case 'cost':
							var label = globalObject.gui.create({elem: 'div', style: {gclass: 'd-inline', gstyle: 'color: #4fc24f;'}, parentHolder: h});
							globalObject.gui.connect({elem: 'span', txt: '$', style: {}, parentHolder: label});
							
							dataObj.cost = {
								value: inv[key],
								gui: globalObject.gui.create({elem: 'span', txt: inv[key], style: {}, parentHolder: label})
							};
							break;
						case 'qty':
							var label = globalObject.gui.create({elem: 'div', style: {gclass: 'd-inline ms-4'}, parentHolder: h});
							globalObject.gui.connect({elem: 'span', txt: 'x', style: {}, parentHolder: label});
							
							dataObj.qty = {
								value: inv[key],
								gui: globalObject.gui.create({elem: 'span', txt: inv[key].toString(), style: {}, parentHolder: label})
							};
							break;
					}
				});
				
				var btn = globalObject.gui.create({elem: 'div', style: {gstyle: 'cursor: pointer; text-align: center; background: #abceee;' }, parentHolder: h});
				globalObject.gui.connect({elem: 'span', txt: 'Buy', style: {gclass: ''}, parentHolder: btn});
				
				dataObj.btn = {
					gui: btn	
				};
				
				btn.component.addEventListener('click', cb.bind(dataObj), false);
				
				//add to inventory list
				inventoryList.push(dataObj);
				// console.log(inventoryList);
			});
			
			obj.getTitle = function(ID) {
				return inventoryList[ID].title.value;
			};
			obj.getCost = function(ID) {
				return inventoryList[ID].cost.value;
			};
			obj.getQty = function(ID) {
				return inventoryList[ID].qty.value;
			};
			obj.updateQty = function(ID) {
				inventoryList[ID].qty.value++;
			};
			obj.updateGuiQty = function(ID) {
				inventoryList[ID].qty.gui.updateText(inventoryList[ID].qty.value);
			};
			return Object.create(obj);
		};
		
		var jobs = [
			{title: 'Enter Order', msg: 'Task Complete!', btn: 'Enter', income: {start: 100, end: 200}, required: [{ID:0, qty:1}]},
			{title: 'Pick Ticket', msg: 'Order Filled!', btn: 'Pull',income: {start: 150, end: 250}, required: [{ID:0, qty:3}, {ID:1, qty:1}]}
		];
		
		var getRandomInt = function(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		};
		
		var requirementsMet = function(inventory, requirements) {
			var job = true;
			for (var i = 0; i < requirements.length; i++) {
				var req = requirements[i];
				//console.log('game callback inventory', inventory.getQty(req.ID));
				//console.log('game callback jobBtn data', req.qty);
				if(inventory.getQty(req.ID) < req.qty) {
					job = false;
					break;
				}
			}
			//console.log(job);
			return job;	
		};
		
		var msgCenter = {
			holder: { 
				gui: null,
				build: function(holder) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gclass: 'rounded-1 p-2 mb-1 d-none', gstyle: 'background: #e6e6e6; font-size: 0.875rem;'}, parentHolder: holder});
				},
				show: function() {
					this.gui.removeStyle({gclass: 'd-none'});
					this.gui.addStyle({gclass: 'd-block'});
				},
				hide: function() {
					this.gui.removeStyle({gclass: 'd-block'});
					this.gui.addStyle({gclass: 'd-none'});
				}
			},
			affirmation: {
				gui: null,
				build: function() {
					var label = globalObject.gui.create({elem: 'div', style: {}, parentHolder: msgCenter.holder.gui});
					this.gui = globalObject.gui.create({elem: 'div', style: {}, parentHolder: label});
				},
				update: function(txt) {
					this.gui.updateText(txt);
				}
			},
			job: {
				gui: null,
				build: function() {
					var label = globalObject.gui.create({elem: 'div', style: {}, parentHolder: msgCenter.holder.gui});
					this.gui = globalObject.gui.create({elem: 'div', style: {}, parentHolder: label});
				},
				update: function(txt) {
					this.gui.updateText(txt);
				}
			},
			income: {
				gui: null,
				build: function() {
					var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'color: #4fc24f;'}, parentHolder: msgCenter.holder.gui});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					this.gui = globalObject.gui.create({elem: 'span', style: {}, parentHolder: label});
				},
				update: function(txt) {
					this.gui.updateText(txt);
				}
			},
			show: function(data, income) {
				this.holder.show();
				this.affirmation.update(data.msg);
				this.job.update(data.title);
				this.income.update(income);
			},
			build: function() {
				this.holder.build(cardBase.contentHolder);
				this.affirmation.build();
				this.job.build();
				this.income.build();
			}
		};
		
		var coin = {
			
			holder: { 
				gui: null,
				build: function(holder) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gclass: 'rounded-1 p-2 mb-1', gstyle: 'background: #e6e6e6; font-size: 0.875rem;'}, parentHolder: holder});
				}
			},
			income: {
				value: 0,
				gui: null,
				build: function(holder, value) {
					
					// *** FIX THIS
					// this.value=value
					
					var label = globalObject.gui.create({elem: 'div', style: {gstyle: 'color: #4fc24f;'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value.toString(), style: {}, parentHolder: label});
				},
				update: function() {
					this.gui.updateText(this.value);
				},
				add: function(value) {
					this.value+=value;
					this.update();
				},
				subtract: function(value) {
					this.value-=value;
					this.update();
				}
				
			},
			build: function() {
				this.holder.build(cardBase.contentHolder);
				this.income.build(this.holder.gui);
			}
		};
		
		var game = {
			coin: null,
			msg: null,
			inventory: null,
			jobs: null,
			state: 'init',
			init: function() {
				local.loop.callBacks.push(game.update);
				
				this.coin = Object.create(coin);
				
				this.msg = Object.create(msgCenter);
				
				this.jobs = JSON.parse(JSON.stringify(jobs));

				this.state = 'build';
			},
			load: function() {
				
			},
			jobCallBack: function() {
				//console.log(this.data)
				if(requirementsMet(game.inventory, this.data.required)) {
					var income = getRandomInt(this.data.income.start, this.data.income.end);
					//console.log('do job', income); // do job
					game.msg.show(this.data, income);
					
					game.coin.income.add(income);
					 
					
				} else {
					//console.log('need requirements'); // need requirements message
					
					
				}
				
			},
			partCallBack: function() {
				
				//console.log(this)
				//console.log('part cost', game.inventory.getCost(this.ID), 'income', game.coin.income.value)
				
				
				if(game.coin.income.value >= game.inventory.getCost(this.ID)) {
					//console.log('your money is good here');
					
					// update inventory
					game.inventory.updateQty(this.ID);
					
					// update gui
					game.inventory.updateGuiQty(this.ID);
					
					// update coin
					game.coin.income.subtract(game.inventory.getCost(this.ID));
				} else {
					//console.log('sorry you suck');
					

					
				}
			
			},
			build: function() {
				
				this.coin.build();
				
				this.msg.build();
				
				var jobHolder = globalObject.gui.create({elem: 'div', style: {}, parentHolder: cardBase.contentHolder});
				globalObject.gui.connect({elem: 'span', txt: 'Jobs', style: {gclass: ''}, parentHolder: jobHolder});
				
				
				var invHolder = globalObject.gui.create({elem: 'div', style: {}, parentHolder: cardBase.contentHolder});
				globalObject.gui.connect({elem: 'span', txt: 'Inventory', style: {gclass: 'd-block'}, parentHolder: invHolder});
				
				this.inventory = buildInventory(inventoryData, invHolder, game.partCallBack);
				
				this.jobs.forEach(function(jobData) {
					jobData.required.forEach(function(req) {
						req.title=game.inventory.getTitle(req.ID);
					});
					jobBtn.create(jobHolder, jobData, game.jobCallBack);
				});
				
				this.state = 'play';
			},
			play: function(time) {
				// this.coin.update(time);
			},
			update: function(time) {
				switch(game.state) {
					case 'init': game.init(); break;
					case 'build': game.build(); break;
					case 'play': game.play(time); break;
				}
			}
		};
		game.init();
	}
};

local.game.list.buttons = {
	on: true,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.contentHolder.removeStyle(local.goe.buttons.contentHolder);

		local.row.addComp(cardBase.col);
			
		// income per second
		var incomePerSecs = {
			income: {
				gui: null,
				value: 0,
				update: function(value) {
					this.value+=value;
					this.gui.updateText(this.value);
				},
				build: function(holder, value) {
					this.value=value;
					
					var label = globalObject.gui.create({elem: 'div', style: {gclass: 'd-inline'}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: '+', style: {gclass: ''}, parentHolder: label});
					
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value, style: {gstyle: 'margin-left: -2px;'}, parentHolder: label});
				}
			},
			secs: {
				gui: null,
				value: 0,
				update: function(count) {
					if(count > -1) { 
						if(count < this.value+1) {
							var ct = this.value-count;
							if(ct < 10) {
								this.gui.updateText('0'+ct);
							} else {
								this.gui.updateText(ct);	
							}
						}
					}
				},
				build: function(holder, value) {
					this.value=value;
					
					var label = globalObject.gui.create({elem: 'div', style: {gclass: 'd-inline ms-2'}, parentHolder: holder});
					
					globalObject.gui.connect({elem: 'span', txt: 'in ', style: {gclass: ''}, parentHolder: label});
					
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value, style: {gclass: 'ms-1'}, parentHolder: label});
					
					globalObject.gui.connect({elem: 'span', txt: 'secs', style: {gclass: ''}, parentHolder: label});
				}
			},
			build: function(income, interval) {
				var holder = globalObject.gui.create({elem: 'div', style: {gclass: 'mt-1 mb-5'}, parentHolder: cardBase.contentHolder});
				
				this.income.build(holder, income);
				
				// ***FIX THIS -hard coded
				this.secs.build(holder, interval/1000);  
			}
		};
		
		// timer second until next income
		
		// upgrade button
		var upgradeBtn = {
			active: false,
			
			// main callback
			callBack: null,
			
			// parent
			holder: { 
				gui: null,
				bgBlue: function() {
					this.gui.removeStyle({rstyle: 'background: #e6e6e6;'});
					this.gui.addStyle({gstyle: 'background: #abceee;'});
				},
				bgGrey: function() {
					this.gui.removeStyle({rstyle: 'background: #abceee;'});
					this.gui.addStyle({gstyle: 'background: #e6e6e6;'});
				},
				build: function(holder) {
					this.gui = globalObject.gui.create({elem: 'div', style: {gclass: 'rounded-1 p-1 ps-3', gstyle: 'cursor: pointer; background: #e6e6e6;'}, parentHolder: holder});
				}
			},
			income: {
				gui: null,
				value: 0,
				update: function() {
					
				},
				build: function(holder, value) {
					this.value=value;
					
					var label = globalObject.gui.create({elem: 'div', style: {}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: 'Income', style: {gclass: 'me-3'}, parentHolder: label});
					globalObject.gui.connect({elem: 'span', txt: '+', style: {gclass: ''}, parentHolder: label});
					
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value, style: {gstyle: 'margin-left: -2px;'}, parentHolder: label});
				}
			},
			cost: {
				value: 0,
				update: function() {
				
				},
				build: function(holder, value) {
					this.value=value;
					
					var label = globalObject.gui.create({elem: 'div', style: {}, parentHolder: holder});
					globalObject.gui.connect({elem: 'span', txt: '$', style: {gclass: ''}, parentHolder: label});
					
					this.gui = globalObject.gui.create({elem: 'span', txt: this.value, style: {gstyle: 'margin-left: 0px;'}, parentHolder: label});
				}
			},

			// leave here -need access to all objects
			handler: function(e) {
				e.preventDefault();
				this.callBack();
			},
			build: function(investment, cb) {
				
				// parent
				this.holder.build(cardBase.contentHolder);
				
				// main callback
				this.callBack = cb;
				
				// move outside -call all updates
				this.holder.gui.component.addEventListener('click', this.handler.bind(this), false);
				
				this.income.build(this.holder.gui, investment.income);
				this.cost.build(this.holder.gui, investment.cost);
			}
		};
			
		var coin = {
			total: 0,
			active: false,
			gui: null,
			delay: Object.create(globalObject.timer),
			controller: Object.create(globalObject.burst),
			set: function(income) {
				this.controller.clear();
				this.controller.burst = true;
				
				// ** FIX THIS
				this.controller.income = income;
			},
			add: function(t) {
				this.total+=t;
			},
			subtract: function(t) {
				this.total-=t;
			},
			updateGui: function() {	
				this.gui.updateText('$'+this.total);
			},
			
			// main loop
			update: function(time) {
				
				if(this.controller.burst && !this.active) {
			
					this.gui.removeStyle({rstyle: 'color: #212529;'});
					this.gui.addStyle({gstyle: 'color: #4fc24f;'}); 
					this.active = true;
				} else if(!this.controller.burst && this.active){
					this.delay.start();
				}
				
				if(this.delay.complete) {
					this.delay.end();
					this.gui.removeStyle({rstyle: 'color: #4fc24f;'});
					this.gui.addStyle({gstyle: 'color: #212529;'});
					this.active = false;
				}
				
				if(this.controller.burst) {
					this.controller.update(time);
				}
			},
			
			// controller callback
			callBack: function(increment) {
				this.add(increment);
				this.updateGui();
			},
			build: function(income) {
				this.gui = Object.create(globalObject.gui);
				this.gui.build('span', {gstyle: 'color: #212529'});
				this.updateGui();
				
				// ** FIX THIS
				cardBase.contentHolder.addComp(this.gui);
				
				this.controller.income = income
				this.controller.callBack = this.callBack.bind(this);
				
				this.delay.duration = 1000;
				local.loop.timers.push(this.delay.update.bind(this.delay));
			}
		};

		var game = {
			income: 1, // income per interval
			interval: 20000, // 10 secs
			investment: {type: 'House', income: 1, cost: 20, update: function() {}},
			init: function() {

			},
			load: function() {
				
			},
			callBack: function() {
				if(coin.total >= upgradeBtn.cost.value) {

					coin.subtract(upgradeBtn.cost.value);
					coin.updateGui();

					incomePerSecs.income.update(upgradeBtn.income.value);
				}
			},
			build: function() {
				
				coin.build(game.income);
				incomePerSecs.build(game.income, game.interval);
				upgradeBtn.build(game.investment, game.callBack);
				
				
				var timer = Object.create(globalObject.timer);
				timer.duration = game.interval;
				timer.start();
				local.loop.timers.push(timer.update.bind(timer));
				
				local.loop.callBacks.push(function(time) {

					incomePerSecs.secs.update(timer.getCount());
					
					// increment
					if(timer.complete) {
						timer.end();
						coin.set(incomePerSecs.income.value);
						timer.start();
					}
					
					coin.update(time);
					
					if((coin.total >= upgradeBtn.cost.value) && !upgradeBtn.active) {
						upgradeBtn.active = true;
						upgradeBtn.holder.bgBlue(); 
					} else if((coin.total < upgradeBtn.cost.value) && upgradeBtn.active){
						upgradeBtn.active = false;
						upgradeBtn.holder.bgGrey();
					}
				});
				
						
			},
			play: function() {
				
			}
		};
		game.build();
	}
};

local.game.list.increment = {
	on: false,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.card.addStyle(local.goe.increment.card);

		var h3 = Object.create(globalObject.gui);
		h3.build('h3', local.goe.h3);
		h3.gtext = 0;
		h3.updateText();

		cardBase.contentHolder.addComp(h3);
		local.row.addComp(cardBase.col);
		
		var inc = 10; // per second
		var total = 0
		var count = 0;
		setInterval(function(){
			count+=10;
		},1000);
		
		local.loop.callBacks.push(function(time) {
			var t = inc*time.delta;
			total += t;
			// h3.updateText((total).toFixed());
			h3.updateText((total).toFixed() + '   ' + count);
		});
	}
};

local.game.list.shootMissile = {
	on: false,
	play: function() {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.contentHolder.removeStyle(local.goe.shootMissile.contentHolder);
		// cardBase.card.addStyle(local.goe.shootAlien.card);
		
		local.row.addComp(cardBase.col);

		var canvas = Object.create(globalObject.gui);
		canvas.build('canvas', local.goe.canvasBase);
		cardBase.contentHolder.addComp(canvas);
		
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
				background.build({sourceY:32, sourceWidth:480, sourceHeight:320, width:480, height:320});
				game.sprites.push(background);
				
				var alien = Object.create(globalObject.sprite);
				alien.build({sourceX:32, y:32});
				alien.x = canvas.gwidth / 2 - alien.halfWidth();
				alien.health = 5;
				alien.currentHealth = 5; 
				game.sprites.push(alien);
				game.alien = alien;
				
				var cannon = Object.create(globalObject.sprite);
				cannon.build({y:280});
				cannon.x = canvas.gwidth / 2 - cannon.halfWidth();
				game.sprites.push(cannon);
				game.cannon = cannon;
				
				var missile = Object.create(globalObject.sprite);
				missile.build({sourceX:96, sourceWidth:16, sourceHeight:16, width:16, height:16, vy:-110});
				missile.x = cannon.centerX() - missile.halfWidth();
				missile.y = cannon.y - missile.height; 
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
				hmBorder.build({sourceWidth:128, sourceHeight:14, width:128, height:14, y:10});
				 hmBorder.x = canvas.gwidth / 2 - hmBorder.halfWidth();
				game.spritesHm.push(hmBorder);
				
				var hmMeter = Object.create(hmBorder);
				hmMeter.sourceY = 14;
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
	}
};

local.game.list.walkAnim = {
	on: false,
	play: function () {
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
	}
};

local.game.list.framesPerSecond = {
	on: false,
	play: function () {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.card.addStyle(local.goe.framesPerSecond.card);

		var h3 = Object.create(globalObject.gui);
		h3.build('h3', local.goe.h3);
		h3.updateText(0);

		cardBase.contentHolder.addComp(h3);
		local.row.addComp(cardBase.col);

		var counter = Object.create(globalObject.fpsCounter);

		local.loop.callBacks.push(function(time) {
													counter.update(time);
													h3.updateText(counter.fps);
												});
	}											
};

local.game.list.moveHorizontal = {
	on: false,
	play: function () {
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
	}
};

local.game.list.match = {
	on: false,
	play: function() {
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
	}
};

local.game.list.clickAddRect = {
	on: false,
	play: function() {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.card.removeStyle(local.goe.clickAddRect.card);
		
		var canvas = Object.create(globalObject.gui);
		canvas.build('canvas', local.goe.canvasBase);
		canvas.addStyle(local.goe.clickAddRect.canvas);
		
		cardBase.contentHolder.addComp(canvas);
		local.row.addComp(cardBase.col);
		
		var ctx = canvas.component.getContext('2d');

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
	}
};

local.game.list.clickCount = {
	on: false,
	play: function() {
		var cardBase = Object.create(globalObject.cardBase);
		cardBase.build(local.goe.cardBase);
		cardBase.card.addStyle(local.goe.clickCount.card);
		
		var h3 = Object.create(globalObject.gui);
		h3.build('h3', local.goe.h3);
		h3.updateText(0);
		
		cardBase.contentHolder.addComp(h3);
		local.row.addComp(cardBase.col);
		
		var count = 0;
		var boxClick = function(e) {
			e.preventDefault();
			h3.updateText(++count);
		};
		cardBase.card.component.addEventListener('click', boxClick, false);
	}
};

local.game.list.moveShip = {
	on: false,
	play: function() {
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
	}
};

local.game.list.changeFont = {
	on: false,
	play: function() {
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
		h3.updateText('Change Font');
		
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
	}
};

local.game.list.shootAlien = {
	on: false,
	play: function() {
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
	}
};

local.game.list.changeImg = {
	on: false,
	play: function() {
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
	}
};

local.game.list.buildMap = {
	on: false,
	play: function() {
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
	}
};

init();

})();

