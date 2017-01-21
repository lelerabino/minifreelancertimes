// timelogs.js
// -----------------
// Defines the timelogs module (Model, Collection, Views, Router)
define('TimeLogs'
    , ['TimeLogs.Router']
    , function (Router) {
        'use strict';

        return {
            Router: Router
            , mountToApp: function (application) {
                // default behaviour for mount to app
                return new Router(application);
            }
        };
    });
