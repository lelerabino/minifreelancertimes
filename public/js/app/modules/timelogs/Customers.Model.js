// Customers.Model.js
// -----------------------
// Model for handling Customers.Model (CRUD)
define('Customers.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            idAttribute:'_id'
        });
});
