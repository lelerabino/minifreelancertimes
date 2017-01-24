// TimeLogs.Model.js
// -----------------------
// Model for handling TimeLogs.Model (CRUD)
define('TimeLogs.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            idAttribute: '_id',
            url: function () {
                return '/api/timelogs/' + (this.id ? this.id : '');
            }
        });
});
