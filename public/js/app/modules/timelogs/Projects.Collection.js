// Projects.Collection.js
// -----------------------
// Model for handling Projects.Collection (CRUD)
define('Projects.Collection',['Projects.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model:Model,
            url: '/api/projects',

        }, SPA.Singleton);
});
