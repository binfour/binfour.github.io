var globalObject = (function () {
	var obj = {};

	obj.sprite = {
		sourceX: 0,
		sourceY: 0,
		sourceWidth: 32,
		sourceHeight: 32,
		width: 32,
		height: 32,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		visible: true,
		ready: true, // one missile only, ready|true, available to shoot
		
		accelerationX: 0, 
		accelerationY: 0, 
		speedLimit: 5,	
		friction: 0.96,
		bounce: -1, //-.07
		gravity: 0.3,

		//changeDirection: function() { this.speed*=-1; },
		centerX: function() { return this.x + (this.width / 2); },
		centerY: function() { return this.y + (this.height / 2); },
		halfWidth: function() { return this.width / 2; },
		halfHeight: function() { return this.height / 2; },
		build: function(data) {
			var sprite = this, keys = Object.keys(data);
			
			keys.forEach(function(key) {
				switch(key) {
					case 'sourceX':
						sprite.sourceX = data[key];
						break;
					case 'sourceY':
						sprite.sourceY = data[key];
						break;
					case 'sourceWidth':
						sprite.sourceWidth = data[key];
						break;
					case 'sourceHeight':
						sprite.sourceHeight = data[key];
						break;
					case 'width':
						sprite.width = data[key];
						break;
					case 'height':
						sprite.height = data[key];
						break;
					case 'x':
						sprite.x = data[key];
						break;
					case 'y':
						sprite.y = data[key];
						break;
					case 'vx':
						sprite.vx = data[key];
						break;
					case 'vy':
						sprite.vy = data[key];
						break;
				}
			});
		}
	};
	
	obj.hitTestRectangle = function(r1, r2) {
		//A variable to determine whether there's a collision
		var hit = false;

		//Calculate the distance vector
		var vx = r1.centerX() - r2.centerX();
		var vy = r1.centerY() - r2.centerY();

		//Figure out the combined half-widths and half-heights
		var combinedHalfWidths = r1.halfWidth() + r2.halfWidth();
		var combinedHalfHeights = r1.halfHeight() + r2.halfHeight();

		//Check for a collision on the x axis
		if(Math.abs(vx) < combinedHalfWidths) {
			//A collision might be occuring. Check for a collision on the y axis
			if(Math.abs(vy) < combinedHalfHeights) {
				//There's definitely a collision happening
				hit = true;
			} else {
				//There's no collision on the y axis
				hit = false;
			}   
		} else {
			//There's no collision on the x axis
			hit = false;
		}

		return hit;
	};
	
	obj.draw = function(drawingSurface, canvas, sprites, img) {

		// drawingSurface.clearRect(0, 0, canvas.width, canvas.height);
		
		//Display the sprites
		if(sprites.length !== 0) {
			for(var i = 0; i < sprites.length; i++) {
				var sprite = sprites[i];
				if(sprite.visible) {
					drawingSurface.drawImage
					(
						img, 
						sprite.sourceX, sprite.sourceY, 
						sprite.sourceWidth, sprite.sourceHeight,
						Math.floor(sprite.x), Math.floor(sprite.y), 
						sprite.width, sprite.height
					);
				}		
			}
		}
	};
	
	obj.fpsCounter = { // by time
		count: 0, // count frames per second
		interval: 1000, // call every 1 second
		previous: null,
		elapses: [],
		fps: 0,
		last: null,
		update: function(time) {
			if (!this.last) {
				this.last = time.stamp;
			}
				
			this.count++; // increment frame count
			
			this.elapses.push(time.stamp-this.previous);
			// console.log(this.elapses)
			
			this.previous = time.stamp;
			
			var delta = time.stamp - this.last;
			if(delta >= this.interval) {

				var initValue = 0;
				var sum = this.elapses.reduce(
					function(accumulator, currentValue) {
						return 	accumulator + currentValue
					}, initValue);
				
				this.fps = (1000/(sum/this.count)).toPrecision(5);
				this.count = 0;
				this.last = null;
				this.elapses = [];
			}
		},
		start: function() {
			//this.last = performance.now();
		}
	};	
	
	obj.timer = {
		name: 'default',
		duration: 1000, //default 1 sec
		last: null,
		complete: false,
		state: 'end',
		count: 0,
		point: 0,
		update: function(time) { 
			if(this.state === 'start') {
				if (!this.last) {
					this.last = time.stamp;
				}
				var delta = time.stamp - this.last;
				if( delta >= this.duration) {
					this.complete = true;
				}
				this.count = delta*.001;
			}
		},
		start: function() {
			this.state = 'start';
		},
		end: function() {
			this.state = 'end';
			this.complete = false;
			this.last = null;
			this.count = 0;
			this.point = 0;
		},
		getCount: function() {
			if(Math.trunc(this.count) > this.point) {
				this.point = Math.trunc(this.count);
				return this.point;
			}
			return -1;
		}
	};
	
	obj.loop = { // by interval
		aId: null,
		last: null,
		fpsInterval: 1000/30.39, // fix -time lag. later in game. call every 33.33 ms
		callBacks: null,
		timers: null,
		setFps: function(fps) { 
			this.fpsInterval = 1000/fps;
		},
		update: function(timeStamp) {
			this.aId = requestAnimationFrame(this.update.bind(this));
			
			if (!this.last) {
				this.last = timeStamp;
			}
			
			var delta = timeStamp - this.last;
			
			// *** fix this	
			var tObj = {delta:delta*.001, stamp:timeStamp};
			
			// timers
			this.timers.forEach(function(cb) {cb(tObj)});
			
			if(delta >= this.fpsInterval) {
				
				// inactive tab
				var maxFps = 51;
				delta = Math.min(delta, maxFps);
				
				this.last = timeStamp - (delta % this.fpsInterval);
				
				// DRAW(delta in seconds)
				// UPDATE(delta in seconds)
				// var tObj = {delta:delta*.001, stamp:timeStamp};
				var tObj = {delta:.033, stamp:timeStamp};
				this.callBacks.forEach(function(cb) {cb(tObj)});
			}
		},
		start: function() {
			this.callBacks = [];
			this.timers = [];
			//this.last = Date.now();
			this.aId = requestAnimationFrame(this.update.bind(this));
		},
		end: function() {
			cancelAnimationFrame(this.aId);
			this.aId = null;
		}
	};
	
	obj.gui = {
		component: null,
		gtext: 'default text',
		gclass: '',
		gstyle: '',
		gwidth: 0,
		gheight: 0,
		gloaded: false,
		addStyle: function(data) {
			var gui = this, keys = Object.keys(data);

			keys.forEach(function(key) {
				switch(key) {
					case 'gclass': 
						gui.component.className+=data[key]; 
						gui.gclass+=data[key];
						break; 
					case 'gstyle': 
						gui.component.style.cssText+=data[key]; 
						gui.gstyle+=data[key];
						break;
					case 'gwidth':
						gui.component.width=data[key];
						gui.gwidth=data[key]; 
						break;
					case 'gheight':
						gui.component.height=data[key];
						gui.gheight=data[key];
						break;
				};
			});
		},
		addComp: function(elem) {
			this.component.appendChild(elem.component);
		},
		removeStyle: function(data) {
			var gui = this, keys = Object.keys(data);

			keys.forEach(function(key) {
				switch(key) {
					case 'rclass':
						var values = data[key].split(' ');
						values.forEach(function(value) {
							gui.gclass = gui.gclass.replace(' '+value, ''); 
						});
						gui.component.className=gui.gclass;
						break;
					case 'rstyle':
						var values = data[key].split(';');
						values.forEach(function(value) {
							gui.gstyle = gui.gstyle.replace(' '+value, ''); 
						});
						gui.component.style=gui.gstyle;
						break;
				}
			});
		},
		updateText: function(txt) {
			this.gtext=txt;
			this.component.innerHTML = this.gtext;
		},
		build: function(elem, data) {
			this.component = document.createElement(elem);
			this.addStyle(data);
		},
		buildImg: function(elem, data, src) {
			var gui = this;
			var loaded = function() {
				gui.component.removeEventListener('load', loaded, false);
				gui.gloaded = true;
			};
			gui.build(elem, data);
			gui.component.addEventListener('load', loaded, false);
			gui.component.src = src;
		},
		create: function(data) {	
			// var gui = Object.create(this);
			var gui = Object.create(this);
			gui.build(data.elem, data.style);
			if(data.txt) gui.updateText(data.txt);
			if(data.parentHolder) data.parentHolder.component.appendChild(gui.component);
			return gui;
		},
		connect: function(data) {	
			var gui = Object.create(this);
			gui.build(data.elem, data.style);
			if(data.txt) gui.updateText(data.txt);
			data.parentHolder.component.appendChild(gui.component);
		}
	};
	
	/*
	* (append to local.row)
	* col
	*	card
	*		contentHolder
	*			-(addComp)content
	*/
	obj.cardBase = {
		col: null,
		card: null,
		contentHolder: null,
		btn: null,
		addBtn: function(data,cb) {
			this.btn = Object.create(obj.gui);
			this.btn.build('div', data);
			this.btn.updateText('Reset');
			this.btn.component.addEventListener('click', cb, false);
			this.card.addComp(this.btn);
		},
		build: function(data) {
			this.col = Object.create(obj.gui);
			this.col.build('div', data.col);
			this.card = Object.create(obj.gui);
			this.card.build('div', data.card);
			this.contentHolder = Object.create(obj.gui);
			this.contentHolder.build('div', data.contentHolder);
			
			// assemble
			this.col.addComp(this.card);
			this.card.addComp(this.contentHolder);
		}
	},
	
	obj.burst = {
		burst: false,
		last: null,
		duration: 3000, //default
		amount: 0, //integer
		lStamp: null,
		income: 0,
		point: 0,
		callBack: null,
		update: function(time) {
			
			if (!this.last) { this.last = time.stamp; }
			
			var delta = time.stamp-this.last;
			
			if (!this.lStamp) { this.lStamp = delta/this.duration; }
			
			if(delta <= this.duration) {
				this.amount+=this.income*(delta/this.duration-this.lStamp);
				if(Math.trunc(this.amount) > this.point) {
					this.callBack(Math.trunc(this.amount)-this.point);
					this.point = Math.trunc(this.amount);
				}
				this.lStamp=delta/this.duration;
			} else {
				this.callBack(this.income-this.point); 
				this.burst = false;
			}
		},
		clear: function() {		
			this.last = null;
			this.amount = 0;
			this.point = 0;
			this.lStamp = null;
		}
	},
		
	obj.coin = {
		total: 0,
		active: false,
		gui: null,
		delay: Object.create(obj.timer),
		controller: Object.create(obj.burst),
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
		build: function(holder, localTimers, income) {
			this.gui = Object.create(obj.gui);
			this.gui.build('span', {gstyle: 'color: #212529'});
			this.updateGui();
			
			// ** FIX THIS
			holder.addComp(this.gui);
			
			this.controller.income = income
			this.controller.callBack = this.callBack.bind(this);
			
			this.delay.duration = 1000;
			localTimers.push(this.delay.update.bind(this.delay));
		}
	}

	return obj;
}());