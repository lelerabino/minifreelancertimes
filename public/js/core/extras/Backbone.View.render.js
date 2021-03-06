// Backbone.View.render.js
// -----------------------
// Extends native Backbone.View with a custom rendering method
(function ()
{
	'use strict';

	_.extend(Backbone.View.prototype, {

		_render: function ()
		{
			// http://backbonejs.org/#View-undelegateEvents
			this.undelegateEvents();

			// if there is a collection or a model, we
			(this.model || this.collection) && Backbone.Validation.bind(this);


			// Renders the template
			var tmpl = SPA.template(this.template+'_tmpl', {view: this});

			// Workaround for internet explorer 7. href is overwritten with the absolute path so we save the original href
			// in data-href (only if we are in IE7)
			// IE7 detection courtesy of Backbone
			// More info: http://www.glennjones.net/2006/02/getattribute-href-bug/
			var isExplorer = /msie [\w.]+/
			,	docMode = document.documentMode
			,	oldIE = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

			if (oldIE)
			{
				tmpl = tmpl.replace(/href="(.+?)(?=")/g,'$&" data-href="$1');
			}

			//Apply permissions
			var $tmpl = jQuery(tmpl);

			this.$el.empty();

			this.trigger('beforeViewRender', this);

			// appends the content to the view's element
			if (SPA.ENVIRONMENT.jsEnvironment === 'server')
			{
				// in SEO we append the content this way because of a envjs bug.
				this.$el[0].innerHTML = $tmpl[0].innerHTML;
			}
			else
			{
				this.$el.append($tmpl);
			}


			this.trigger('afterViewRender', this);

			// http://backbonejs.org/#View-delegateEvents
			this.delegateEvents();

			return this;
		}

		// Given an HTML template string, removes the elements from the DOM that
		// do not comply with the list of permissions level
		// The permission level is specified by using the data-permissions attribute and data-permissions-operator (the latter is optional)
		// on any html tag in the following format:
		// <permission_category>.<permission_name>.<minimum_level>
		// permission_category and permission_name come from SPA.ENVIRONMENT.permissions. (See commons.js)
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1"></div>
		// Notice several permissions can be separated by space or comma, by default (in case that data-permissions-operator is missing) all permission will be evaluates
		// as AND, otherwise data-permissions-operator should have the value OR
		// e.g:
		//     <div data-permissions="transactions.tranFind.1"></div>
		//     <div data-permissions="transactions.tranCustDep.3,transactions.tranDepAppl.1 lists.tranFind.1" data-permissions-operator="OR" ></div>


	,	render: function ()
		{
			return this._render();
		}
	});
})();