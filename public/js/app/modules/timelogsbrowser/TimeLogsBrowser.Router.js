// TimeLogsBrowser.Router.js
// -----------------------
// Router for handling ...
define('TimeLogsBrowser.Router', ['TimeLogsBrowser.View'], function (View) {
    'use strict';

    return Backbone.Router.extend({

        routes: {
            'browse': 'browse',
            'browse?filter=*filter':'browse'
        }

        , initialize: function (application) {
            this.application = application;
        }

        , browse: function (filter) {
            return;
            var view = new View({
                application: this.application,
                weekModel : new Backbone.Model({week:w})
            });

            view.showContent();
        }
    });
});