// Customers.Collection.js
// -----------------------
// Model for handling Customers.Collection (CRUD)
define('Customers.Collection',['Customers.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model:Model,
            url: '/api/customers',

        }, SPA.Singleton);
});
