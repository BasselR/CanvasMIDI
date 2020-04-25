// Full Blog Post: http://viget.com/extend/time-based-animation
// requestAnimationFrame() polyfill: https://gist.github.com/1579671

window.APP = window.APP || {};

APP.pause = function() {
	window.cancelAnimationFrame(APP.core.animationFrame);
};

APP.play = function() {
	APP.core.then = Date.now();
	APP.core.frame();
};


APP.core = {

	frame: function() {
		APP.core.setDelta();
		APP.core.update();
		APP.core.render();
		APP.core.animationFrame = window.requestAnimationFrame(APP.core.frame);
	},

	setDelta: function() {
		APP.core.now = Date.now();
		APP.core.delta = (APP.core.now - APP.core.then) / 1000; // seconds since last frame
		APP.core.then = APP.core.now;
	},

	update: function() {
		// Render updates to browser (draw to canvas, update css, etc.)
	},

	render: function() {
		// Update values
		// var distance = 100 * APP._delta;
		// APP.thing.x += 100 * APP._delta;
	}
};

APP.play();