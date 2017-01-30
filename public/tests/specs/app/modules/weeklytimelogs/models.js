define(['WeeklyTimeLogs', 'WeeklyTimeLogs.Router', 'WeeklyTimeLogs.View', 'Bootstrap', 'jasmineTypeCheck', 'Application'], function (WeeklyTimeLogs, WeeklyTimeLogsRouter, WeeklyTimeLogsView) {
    'use strict';
    describe('WeeklyTimeLogs module', function () {
        var is_started = false
            , application;

        beforeEach(function () {

        });

        afterEach(function () {

        });

        it('#1 should provide a SPA.Singleton class', function ()
        {
            expect(SPA.Singleton).toBeAnObject();
        });
    });

});