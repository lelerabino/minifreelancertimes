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
            var that = this, coll = TLCollection.getInstance();

            coll.fetch({data: {populate: true}}).then(function () {
                var view = new View({
                    application: that.application,
                    coll: coll,
                    filter:new Backbone.Model({filter:{cst:'-'}})
                });

                view.showContent();
            });

        }
    });
});