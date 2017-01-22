// TimeBrowser.Router.js
// -----------------------
// Router for handling ...
define('TimeBrowser.Router', ['TimeBrowser.View'], function (View) {
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
            var view = new View({
                application: this.application,
                weekModel : new Backbone.Model({week:w})
            });

            view.showContent();
        }
    });
});