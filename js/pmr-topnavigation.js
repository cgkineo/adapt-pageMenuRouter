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
		},

		events: {
			'click': 'onRouteClicked'
		},

		render: function() {
	        var template = Handlebars.templates["pmr-topnavigation"];
	        $('.navigation-drawer-toggle-button').after(this.$el.html(template(this.options)));
	        return this; 
		},

		onRouteClicked: function(event) {
			event.preventDefault();
		}

	});

	return PMRTopNavigation;

});