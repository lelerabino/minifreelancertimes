define(['WeeklyTimeLogs', 'WeeklyTimeLogs.Router', 'WeeklyTimeLogs.View', 'Bootstrap', 'jasmineTypeCheck', 'Application'], function (WeeklyTimeLogs, WeeklyTimeLogsRouter, WeeklyTimeLogsView) {
    'use strict';
    describe('WeeklyTimeLogs module', function () {
        var is_started = false
            , application;

        beforeEach(function () {
            if (!is_started) {
                // Here is the appliaction we will be using for this tests
                application = SPA.Application('TimeLogs');
                application.Configuration = {
                    modules: ['WeeklyTimeLogs']
                };
                SPA.dtRef = moment([2000, 0, 1]).startOf('isoweek');
                SPA.templates = {
                    layout_tmpl: '<div>fake layout_tmpl template</div>',
                    weekly_time_logs_tmpl:'<div>fake weekly_time_logs_tmpl template</div>'
                };

                /*this.server = sinon.fakeServer.create();
                this.server.respondWith(
                    'GET',
                    '/api/customers',
                    '[{"_id":"cst-111111111111111","name":"Company A","address":"465 Andover Court  Gurnee, IL 60031","vatNumber":"1234567890","currency":"USD","__v":0}]'
                );
                this.server.respondWith(
                    'GET',
                    '/api/projects',
                    '[{"_id":"prj-111111111111111","_cstId":"cst-111111111111111","name":"Project A1","rate":40,"__v":0}]'
                );*/

                // Starts the application
                jQuery(application.start(function () {
                    is_started = true;
                }));

                Backbone.history.start({root: 'tests/specs/app/modules/weeklytimelogs/index.html'});

                // Makes sure the application is started before
                waitsFor(function () {
                    return is_started;
                });
            }
        });

        afterEach(function () {
            delete SPA._applications.TimeLogs;
            try {
                Backbone.history.navigate('', {trigger: false});
                //Backbone.history.stop();
            }
            catch (ex) {
            }
        });

        it('#1 the router must be working after module has been mounted', function () {
            var wlRouter = application.modulesMountToAppResult.WeeklyTimeLogs;
            this.routeSpy = sinon.spy();
            wlRouter.on('route:index', this.routeSpy);
            Backbone.history.navigate('#log?w=2', {trigger: true});
            expect(this.routeSpy.calledWith('2')).toBeTruthy();
        });

        it('#2 the weeklyLogs router must initialize the right view', function () {
            var wlRouter = application.modulesMountToAppResult.WeeklyTimeLogs;
            wlRouter._fetchedCstAndPrjPromise = {
                then: function (cb) {
                    return cb(true);
                }
            };
            Backbone.history.navigate('#log?w=4', {trigger: true});
            expect(application.getLayout().currentView instanceof WeeklyTimeLogsView).toBeTruthy();
        });
    });

});