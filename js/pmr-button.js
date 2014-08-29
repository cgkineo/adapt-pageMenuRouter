/*
* adapt-pageMenuRouter
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {
	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var PMRButton = Backbone.View.extend({

		tagName: 'button',

		className: 'pmr-button',

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
            this.altText = '';
			this.render();
		},

		events: {
			'click': 'onRouteClicked'
		},

		render: function() {
	        var template = Handlebars.templates["pmr-button"];
	        this.$el.html(template(this.options));
	        return this; 
		},

		onRouteClicked: function(event) {
			event.preventDefault();
		}

	});

	return PMRButton;

});