/*
* adapt-pageMenuRouter
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var PMRTopNavigation = require('extensions/adapt-pageMenuRouter/js/pmr-topnavigation');
	var PMRButton = require('extensions/adapt-pageMenuRouter/js/pmr-button');
	var Emmet = require('extensions/adapt-pageMenuRouter/js/emmet.min');

	var _config = undefined;
	var _screenSize = undefined;

	var DOMAttrs = function(object) {
        //GET DOM ELEMENT ATTRIBUTES AS {KEY: VALUE}
        var a = {};
        if (object) {
            var atts = object.attributes;
            for (var i in atts) {
                var p = atts[i];
                if (p === null) continue;
                if (typeof p.value !== 'undefined') a[p.nodeName] = p.value;
            }
        }
        return a;
    };

    var parseAlterations = function(_instance) {
    	var alterations = $(emmet.expandAbbreviation(_instance,"plain"))[0];
		var attributes = DOMAttrs(alterations);
		var content = undefined;
		if ($(alterations).html() > "") content = $(alterations).html();
		return { attributes:attributes, content:content };
    }

    var applyAlterations = function($element, alterations) {
    	_.each(alterations.attributes, function(value, key) {
			if (key == "class") {
				$element.addClass(value);
			} else {
				$element.attr(key, value);
			}
		});
		if ($element.html() !== "") $element.html(alterations.content);
    }

    //TODO: make dependency on adapt-ratioRestrict to use html.small etc
    var getScreenSize = function() {
		var height = $(window).height();
		var width = $(window).width();

		var ratio = Math.floor(width/height*100)/100;

		console.log(ratio);

		var aspectratio = 
			(ratio > (16/9))
				? "extrawidescreen"
				: (ratio > (4/3))
					? "widescreen"
					: "screen";

		var devicesize = (
			(width <= 520 || height <= 520 / ratio) 
				? "small" 
				: (width <= 760 || height <= 760 / ratio) 
					? "medium"
					: (width > 1024 || height > 1024 / ratio ) 
						? "extralarge"  
						: (width > 760 || height > 760 / ratio)
							? "large" 
							: "large"

			);

		return { 
			height:height, 
			width:width, 
			ratio: ratio, 
			aspectratio: aspectratio,
			devicesize:devicesize
		};
	}

	var isMatchingScreenSize = function(screenSize, arr) {
		if (arr.indexOf(screenSize.devicesize) > -1 &&
			( ( arr.indexOf("notouch") > -1 && !Modernizr.touch ) ||  ( arr.indexOf("notouch") == -1 ) ) &&
			( ( arr.indexOf("touch") > -1 && Modernizr.touch ) ||  ( arr.indexOf("touch") == -1 ) ) ) {
			return true;
		}
		return false;
	}

	var onRouteTo = function (to,event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (to.substr(0,1) == "#") {
			Backbone.history.navigate(to, {trigger: true, replace: true});
		} else if (to == "") {
			Backbone.history.navigate("#/", {trigger: true, replace: true});
		} else {
			Adapt.navigateToElement("." + to);
		}
	}

	Adapt.once('app:dataReady', function() {
		_config = Adapt.course.get("_pageMenuRouter");
		if (_config === undefined) {
			console.log("No _pageMenuRouter configuration found");
			return;
		}
		_screenSize = getScreenSize();

		setupEvents();
	});

	Adapt.on('device:changed device:resize', function() {
		_screenSize = getScreenSize();
	});

	Adapt.on('router:page router:menu', function() { 
		if (_config._hideBackButton) $(".navigation-back-button").css("display","none");
	});

	Adapt.on("pageView:postRender", function(view) {
		if (_config._buttons) setupButtons(view, "pages");
		if (_config._selectors) setupSelectors(view, "pages");
		if (_config._topnavigations) setupTopNavigations(view, "pages");
	});
	Adapt.on("menuView:postRender", function(view) {
		if (_config._buttons) setupButtons(view, "menus");
		if (_config._selectors) setupSelectors(view, "menus");
		if (_config._topnavigations) setupTopNavigations(view, "menus");
	});
	 
	Adapt.on("articleView:postRender", function(view) {
		if (_config._buttons) setupButtons(view, "articles");
		if (_config._selectors) setupSelectors(view, "articles");
	});
	Adapt.on("blockView:postRender", function(view) {
		if (_config._buttons) setupButtons(view, "blocks");
		if (_config._selectors) setupSelectors(view, "blocks");
	});
	Adapt.on("componentView:postRender", function(view) {
		if (_config._buttons) setupButtons(view, "components");
		if (_config._selectors) setupSelectors(view, "components");
	});

	var setupTopNavigations = function(view, elementType) {
		var model = view.model.toJSON();
		var type = model._type;
		var items = [];

		_.each(_config._topnavigations, function (selector) {
			_.each( selector["_" + elementType] , function (element) {
				var answer = _.findWhere([model], element);
				if (answer === undefined) return;
				items.push(selector);
			});
		});

		if (items.length === 0) return;

		_.each(items, function(item) {
			var it = new PMRTopNavigation(item);
			applyAlterations(it.$el, parseAlterations(item._dom) );

			_.each(item._events, function(to, key) {

				var matches = key.split(" ");
				var eventName = matches.shift();

				if (isMatchingScreenSize(_screenSize, matches)) {
					_onRouteTo = _.bind(onRouteTo, item, to);
					it.$el.on(eventName, _onRouteTo);
				}

			});

		});
	};

	var setupButtons = function(view, elementType) {
		var model = view.model.toJSON();
		var type = model._type;
		var items = [];

		_.each(_config._buttons, function (button) {
			_.each( button["_" + elementType] , function (element) {
				var answer = _.findWhere([model], element);
				if (answer === undefined) return;
				items.push(button);
			});
		})

		if (items.length === 0) return;

		_.each(items, function(item) {
			var it = new PMRButton(item);

			applyAlterations(it.$el, parseAlterations(item._dom) );

			_.each(item._events, function(to, key) {

				var matches = key.split(" ");
				var eventName = matches.shift();

				if (isMatchingScreenSize(_screenSize, matches)) {
					_onRouteTo = _.bind(onRouteTo, item, to);
					it.$el.on(eventName, _onRouteTo);
				}

			});

			view.$el.append(it.$el);

		});
	};

	var setupSelectors = function(view, elementType) {
		var model = view.model.toJSON();
		var type = model._type;
		var items = [];

		_.each(_config._selectors, function (selector) {
			_.each( selector["_" + elementType] , function (element) {
				var answer = _.findWhere([model], element);
				if (answer === undefined) return;
				items.push(selector);
			});
		});

		if (items.length === 0) return;

		_.each(items, function(item) {
			var $el = view.$el.find(item._selector);
			if ($el.length === 0 ) return;

			applyAlterations($el, parseAlterations(item._dom) );

			_.each(item._events, function(to, key) {

				var matches = key.split(" ");
				var eventName = matches.shift();

				if (isMatchingScreenSize(_screenSize, matches)) {
					_onRouteTo = _.bind(onRouteTo, item, to);
					$el.off(eventName);
					$el.on(eventName, _onRouteTo);
				}

			});
		});
	};

	var setupEvents = function() {
		_.each(_config._events, function(to, key) {

			var matches = key.split(" ");
			var eventName = matches.shift();

			if (isMatchingScreenSize(_screenSize, matches)) {

				switch(eventName) {
				case "adapt:initialize":
					if (location.hash.substr(0,1) == "#" && location.hash.substr(0,2) == "#/" && location.hash > "#/") return;
					break;
				}

				_onRouteTo = _.bind(onRouteTo, Adapt, to);
				Adapt.on(eventName, _onRouteTo);
			}

		});
	};

})