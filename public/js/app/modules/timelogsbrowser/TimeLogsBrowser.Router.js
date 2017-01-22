// TimeLogsBrowser.Router.js
// -----------------------
// Router for handling ...
define('TimeLogsBrowser.Router', ['TimeLogs.Collection', 'TimeLogsBrowser.View'], function (TLCollection, View) {
    'use strict';

    return Backbone.Router.extend({

        routes: {
            'browse': 'browse',
            'browse?filter=*filter': 'browse'
        }

        , initialize: function (application) {
            this.application = application;
        }

        , browse: function (filter) {
            var that=this, coll = TLCollection.getInstance();

            coll.fetch().then(function () {
                var view = new View({
                    application: that.application,
                    coll: coll
                });

                view.showContent();
            });

        }
    });
});