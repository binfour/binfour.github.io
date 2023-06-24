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
		halfHeight: function() { return this.height / 2; }
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

		drawingSurface.clearRect(0, 0, canvas.width, canvas.height);
		
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
		fps: 0,
		last: null,
		update: function() {
					
			this.count++; // increment frame count
			
			var delta = Date.now() - this.last;
			if(delta >= this.interval) {
				this.fps = this.count;
				this.count = 0;
				this.start();
			}
		},
		start: function() {
			this.last = Date.now();
		}
	};	
	
	obj.loop = { // by interval
		aId: null,
		last: null,
		fpsInterval: parseInt(1000/30), // call every 33.33 ms
		callBacks: null,
		setFps: function(fps) { 
			this.fpsInterval = parseInt(1000/fps);
		},
		update: function() { // grab delta - for animation
			this.aId = requestAnimationFrame(this.update.bind(this));
			
			var delta = Date.now() - this.last;
			if(delta >= this.fpsInterval) {
				
				// inactive tab
				var maxFps = 51;
				delta = Math.min(delta, maxFps);
				
				this.last = Date.now() - (delta % this.fpsInterval);

				// DRAW(delta in seconds)
				// UPDATE(delta in seconds)
				this.callBacks.forEach(function(cb) { cb(delta*.001); });
			}
		},
		start: function() {
			this.callBacks = []
			this.last = Date.now();
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
				}
			});
		},
		updateText: function() {
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
			this.btn.gtext = 'Reset';
			this.btn.updateText();
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
	}
	
	return obj;
}());