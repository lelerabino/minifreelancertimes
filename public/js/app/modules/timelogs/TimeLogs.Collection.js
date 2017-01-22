// TimeLogs.Collection.js
// -----------------------
// Model for handling TimeLogs.Collection (CRUD)
define('TimeLogs.Collection', ['TimeLogs.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model: Model,
            url: '/api/timelogs',
            getCustomers: function () {
                return _.sortBy(_.uniq(this.map(function (tl) {
                    return tl.get('_cstId');
                }), function (cst) {
                    return cst._id;
                }), function(cst){
                    return cst.name;
                });
            },

            getProjects: function () {
                return _.sortBy(_.uniq(this.map(function (tl) {
                    return tl.get('_prjId');
                }), function (prj) {
                    return prj._id;
                }), function(prj){
                    return prj.name;
                });
            }

        }, SPA.Singleton);
});
