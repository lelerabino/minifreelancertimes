// TimeLogs.Router.js
// -----------------------
// Router for handling ...
define('TimeLogs.Router', ['TimeLogs.View'], function (View) {
    'use strict';

    return Backbone.Router.extend({

        routes: {
            'log?w=*w': 'index'
        }

        , initialize: function (application) {
            this.application = application;
        }

        , index: function (w) {
            w = w ? w.toLowerCase() : 'current';
            w = (w === 'current') ? SPA.getCurrentWeek() : w;

            var view = new View({
                application: this.application,
                weekModel : new Backbone.Model({week:w})
            });

            view.showContent();
        }
    });
});