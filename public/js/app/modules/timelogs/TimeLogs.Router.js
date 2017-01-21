// TimeLogs.Router.js
// -----------------------
// Router for handling ...
define('TimeLogs.Router', ['TimeLogs.View'], function (View) {
    'use strict';

    return Backbone.Router.extend({

        routes: {
            '*path': 'index'
        }

        , initialize: function (application) {
            this.application = application;
        }

        , index: function (path, options)
        {

            var view = new View({
                application: this.application
            });

            view.showContent();
        }
    });
});