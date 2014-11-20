/*
* adapt-pageMenuRouter
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {
	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var PMRTopNavigation = Backbone.View.extend({

		tagName: 'a',

		className: 'pmr-topnavigation',

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
			this.$el.attr('href', '#');
            this.altText = '';
			this.render();
			this.options._isShown = true;
		},

		events: {
			'click': 'onRouteClicked'
		},

		render: function() {
	        var template = Handlebars.templates["pmr-topnavigation"];
	        this.$el.attr("role", "button");
	        this.$el.attr("aria-label", this.options.ariaLabel);
	        this.$el.html(template(this.options))
	        $('.navigation-drawer-toggle-button').after(this.$el);
	        return this; 
		},

		postRender: function() {
			Adapt.trigger("pageMenuRouter:topNavigationView:postRender", this);
		},

		onRouteClicked: function(event) {
			event.preventDefault();
		},

		remove: function() {
			if (this.options !== undefined) this.options._isShown = false;
			delete this.options._currentView;
			this.$el.remove();
			this.stopListening();
		}

	});

	return PMRTopNavigation;

});