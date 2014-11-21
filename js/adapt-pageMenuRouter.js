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
	var _hideBackButton = false;
	var _attached = [];

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
		if ($(alterations).html() !== "") content = $(alterations).html();
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
		if ($element.html() === "") $element.html(alterations.content);
    }

    //TODO: make dependency on adapt-ratioRestrict to use html.small etc
    var getScreenSize = function() {
		var height = $(window).height();
		var width = $(window).width();

		var ratio = Math.floor(width/height*100)/100;

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


	var resolveType = function(_id, type) {
		var current = Adapt.findById(_id)
		var i = 0;
		while	(i < 10) {
			if (current.get("_type") == type) {
				return current;
			}
			current = current.getParent();
			i++;
		}
		throw new Error(type + " not found!");
	}

	var resolveItem = function(item, currentPage, currentModel, amount, type) {
		var func;
		if (amount === 0) return currentModel;

		var _id = currentModel.get("_id");
		var siblings = currentPage.findDescendants(type);
		var index;
		for (var i = 0; i < siblings.models.length; i++) {
			if (siblings.models[i].get("_id") == _id) {
				index = i
				break;
			}
		}
		if (index === undefined) return;

		var items = 0;
		if (amount < 0) {
			for (var i = index; i > -1; i--) {
				if (type === "components") {
					if (item !== undefined && item._ignoreComponents.indexOf(siblings.models[i].get("_component")) > -1) continue;
				} else if (type === "blocks" || type === "articles") {
					var components = siblings.models[i].findDescendants("components");
					var ignore = false;
					_.each(components.models, function(component) {
						if (item !== undefined && item._ignoreComponents.indexOf(component.get("_component")) > -1) ignore = true;
					});
					if (ignore) continue;
				}
				if (items == amount) {
					return siblings.models[i];
				}
				items--;
			}
		} else if (amount > 0) {
			for (var i = index; i < siblings.models.length; i++) {
				if (type === "components") {
					if (item !== undefined && item._ignoreComponents.indexOf(siblings.models[i].get("_component")) > -1) continue;
				} else if (type === "blocks" || type === "articles") {
					var components = siblings.models[i].findDescendants("components");
					var ignore = false;
					_.each(components.models, function(component) {
						if (item !== undefined && item._ignoreComponents.indexOf(component.get("_component")) > -1) ignore = true;
					});
					if (ignore) continue;
				}
				if (items == amount) {
					return siblings.models[i];
				}
				items++;
			}
		}
		return undefined;

	}


	var onRouteTo = function (item, to, replaceUrl, event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		if (to.substr(0,1) == "#") {
			Adapt.trigger("remove");
			Backbone.history.navigate(to, {trigger: true, replace: false});
		} else if (to == "") {
			Adapt.trigger("remove");
			Backbone.history.navigate("#/", {trigger: true, replace: false});
		} else if (to.substr(0,1) == "@") {
			var sections = to.substr(1).split(" ");
			var type = sections[0];
			var amount = eval( "0" + sections[1] + ";" );
			var currentId = this.model.get("_id");
			var currentType = this.model.get("_type");
			var currentPage = resolveType(currentId, "page");
			switch (type) {
			case "article":
				var currentArticle = resolveType(currentId, "article");
				var toItem = resolveItem(item, currentPage, currentArticle, amount, "articles");
				if (toItem === undefined) return;
				var next = $("." + toItem.get("_id"));
				if (next.length === 0) return;
				$.scrollTo(next.offset()['top'] - $('.navigation').height() - parseInt(next.css("margin-top")), {axis:'y', duration: 1000 });
				break;
			case "block":
				var currentBlock = resolveType(currentId, "block");
				var toItem = resolveItem(item, currentPage, currentBlock, amount, "blocks");
				if (toItem === undefined) return;
				var next = $("." + toItem.get("_id"));
				if (next.length === 0) return;
				Adapt.scrollTo(next.offset()['top'] - $('.navigation').height() - parseInt(next.css("margin-top")), {axis:'y', duration: 1000 });
				break;
			case "component":
				var currentComponent = resolveType(currentId, "component");
				var toItem = resolveItem(item, currentPage, currentComponent, amount, "components");
				if (toItem === undefined) return;
				var next = $("." + toItem.get("_id"));
				if (next.length === 0) return;
				Adapt.scrollTo(next.offset()['top'] - $('.navigation').height() - parseInt(next.css("margin-top")), {axis:'y', duration: 1000 });
				break;
			}
		} else {
			var model = Adapt.findById(to);
			if (model) {
				switch (model.get("_type")) {
				case "page": case "menu":
					Backbone.history.navigate("#/id/"+to, {trigger: true, replace: replaceUrl});
					break;
				default:
					Adapt.navigateToElement("." + to);		
					break;
				}
			}
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
		if (_config !== undefined) _screenSize = getScreenSize();
	});

	Adapt.on('router:page router:menu', function() { 
		
	});

	Adapt.on("pageView:ready", function(view) {
		_hideBackButton = false;
		if (_config !== undefined && _config._selectors) setupSelectors(view, "pages");
		if (_config !== undefined && _config._hideBackButton) setupHideBackButtons(view, "pages");
		if (_config !== undefined && _config._buttons) setupButtons(view, "pages");
		if (_config !== undefined && _config._topnavigations) setupTopNavigations(view, "pages");
	});

	Adapt.on("pageView:postRender", function(view) {
		removeEvents();
	});
	Adapt.on("menuView:postRender", function(view) {
		if (!view.$el.is(".menu")) return;
		removeEvents();
		if (_config !== undefined && _config._hideBackButton) setupHideBackButtons(view, "menus");
		if (_config !== undefined && _config._buttons) setupButtons(view, "menus");
		if (_config !== undefined && _config._selectors) setupSelectors(view, "menus");
		if (_config !== undefined && _config._topnavigations) setupTopNavigations(view, "menus");
	});
	 
	Adapt.on("articleView:postRender", function(view) {
		if (_config !== undefined && _config._buttons) setupButtons(view, "articles");
		if (_config !== undefined && _config._selectors) setupSelectors(view, "articles");
	});
	Adapt.on("blockView:postRender", function(view) {
		if (_config !== undefined && _config._buttons) setupButtons(view, "blocks");
		if (_config !== undefined && _config._selectors) setupSelectors(view, "blocks");
	});
	Adapt.on("componentView:postRender", function(view) {
		if (_config !== undefined && _config._buttons) setupButtons(view, "components");
		if (_config !== undefined && _config._selectors) setupSelectors(view, "components");
	});

	var removeEvents = function() {
		var itemCount = _attached.length;
		for (var i = 0; i < itemCount; i++) {
			var event = _attached.pop();
			event.$el.unbind(event.eventName, event.callback);
		}
	};

	var setupTopNavigations = function(view, elementType) {
		if (view.model.get("_id") !== Adapt.location._currentId) return;

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
			if (item._isShown) return;
			var it = new PMRTopNavigation(item);
			item._currentView = it;
			applyAlterations(it.$el, parseAlterations(item._dom) );
			it.postRender();
			_.each(item._events, function(to, key) {

				var matches = key.split(" ");
				var eventName = matches.shift();

				if (isMatchingScreenSize(_screenSize, matches)) {
					_onRouteTo = _.bind(onRouteTo, view, item, to, false);
					it.$el.on(eventName, _onRouteTo);
					_attached.push({
						$el: it.$el,
						eventName: eventName,
						callback: _onRouteTo
					});
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
					_onRouteTo = _.bind(onRouteTo, view, item, to, false);
					it.$el.on(eventName, _onRouteTo);
					_attached.push({
						$el: it.$el,
						eventName: eventName,
						callback: _onRouteTo
					});
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
			var $el;
			if (item._global === false ){
				$el = view.$(item._selector);	
			} else {
			 	$el = $(item._selector);
			}
			
			if ($el.length === 0 ) return;

			applyAlterations($el, parseAlterations(item._dom) );

			_.each(item._events, function(to, key) {

				var matches = key.split(" ");
				var eventName = matches.shift();

				if (isMatchingScreenSize(_screenSize, matches)) {
					_onRouteTo = _.bind(onRouteTo, view, item, to, false);
					$el.off(eventName);
					$el.on(eventName, _onRouteTo);
					_attached.push({
						$el: $el,
						eventName: eventName,
						callback: _onRouteTo
					});
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
					if (_.isArray(to)) {
						if (Adapt.findById(to[0]).get('_isComplete')) {
				                	console.info(to[0] + ' is complete so navigating to ' + to[1]);
				                	to = to[1];
				            	} else {
				            		to = to[0];
				            	}
			        	}
					break;
				}
				var replaceUrl = eventName == 'adapt:initialize';
				_onRouteTo = _.bind(onRouteTo, undefined, Adapt, to, replaceUrl);
				Adapt.on(eventName, _onRouteTo);
				_attached.push({
					$el: Adapt,
					eventName: eventName,
					callback: _onRouteTo
				});
			}

		});
	};

	var setupHideBackButtons = function(view, elementType) {
		var model = view.model.toJSON();
		var type = model._type;

		_hideBackButton = false;

		_.each( _config._hideBackButton["_" + elementType] , function (element) {
			var answer = _.findWhere([model], element);
			if (answer === undefined) return;
			_hideBackButton = true;
		});


		if (!_hideBackButton) $(".navigation-back-button").css("display","");
		else $(".navigation-back-button").css("display","none");
		
	};

	Adapt.pageMenuRouter = {
		routeTo: onRouteTo,
		getScreenSize: getScreenSize
	};

})
