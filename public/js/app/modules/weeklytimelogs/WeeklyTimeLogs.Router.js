// WeeklyTimeLogs.Router.js
// -----------------------
// Router for handling ...
define('WeeklyTimeLogs.Router', ['Customers.Collection', 'Projects.Collection', 'TimeLogs.Collection', 'WeeklyTimeLogs.View'],
    function (CSTCollection, PRJCollection, TLCollection, View) {
        'use strict';

        return Backbone.Router.extend({

            routes: {
                'log?w=*w': 'index'
            }

            , initialize: function (application) {
                this.application = application;
                this.cstColl = CSTCollection.getInstance();
                this.prjColl = PRJCollection.getInstance();
                this._fetchedCstAndPrjPromise = this.getFetchPromise();
                this.tlColl = TLCollection.getInstance();
            }

            , getFetchPromise: function () {
                var that = this,
                    dfd = Q.defer();
                Q.all([that.cstColl.fetch(), that.prjColl.fetch()]).then(function () {
                    dfd.resolve(true);
                });

                return dfd.promise;
            }

            , index: function (w) {
                var that = this;

                that._fetchedCstAndPrjPromise.then(function(){
                    w = w ? w.toLowerCase() : 'current';
                    w = (w === 'current') ? SPA.getCurrentWeek() : w;

                    var view = new View({
                        application: that.application,
                        weekModel: new Backbone.Model({week: w}),
                        cstColl: that.cstColl,
                        prjColl: that.prjColl,
                        tlColl: that.tlColl
                    });
                    view.showContent();
                });
            }
        });
    });