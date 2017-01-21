// ApplicationSkeleton.Layout.showContent.js
// -----------------------------------------
// Renders a View into the layout
// if the view needs to be rendered in a modal, it does so
// triggers a few different events on the layout
(function ()
{
	'use strict';

	SPA.ApplicationSkeleton.prototype.Layout.prototype.showError = function showError (options)
	{
		vex.open(options);
	};

})();
