// WeeklyTimeLogs.Router.js
// -----------------------
// Router for handling ...
define('WeeklyTimeLogs.Router', ['Customers.Collection','Projects.Collection', 'TimeLogs.Collection', 'WeeklyTimeLogs.View'],
    function (CSTCollection, PRJCollection, TLCollection, View) {
    'use strict';

    return Backbone.Router.extend({

        routes: {
            'log?w=*w': 'index'
        }

        , initialize: function (application) {
            this.application = application;
        }

        , index: function (w) {
            var that = this,
                tlColl = TLCollection.getInstance(),
                cstColl = CSTCollection.getInstance(),
                prjColl = PRJCollection.getInstance();

            Q.all([cstColl.fetch(), prjColl.fetch()]).then(function () {
                w = w ? w.toLowerCase() : 'current';
                w = (w === 'current') ? SPA.getCurrentWeek() : w;

                var view = new View({
                    application: that.application,
                    weekModel: new Backbone.Model({week: w}),
                    cstColl: cstColl,
                    prjColl:prjColl,
                    tlColl: tlColl
                });

                view.showContent();
            })
        }
    });
});