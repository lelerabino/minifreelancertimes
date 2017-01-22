// TimeLogs.Collection.js
// -----------------------
// Model for handling TimeLogs.Collection (CRUD)
define('TimeLogs.Collection',['TimeLogs.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model:Model,
            url: '/api/timelogs'

        }, SPA.Singleton);
});
