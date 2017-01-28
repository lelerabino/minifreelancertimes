define(['WeeklyTimeLogs', 'WeeklyTimeLogs.Router','WeeklyTimeLogs.View','Bootstrap'], function (WeeklyTimeLogs, WeeklyTimeLogsRouter, WeeklyTimeLogsView)
{
	'use strict';

	describe('WeeklyTimeLogs module', function () {
        var is_started = false
            ,	application;

        beforeEach(function ()
        {
            if (!is_started)
            {
                debugger;
                // Here is the appliaction we will be using for this tests
                application = SC.Application('WeeklyTimeLogsTests');
                application.Configuration = {
                    modules: [['WeeklyTimeLogs']]
                };
                // Starts the application
                jQuery(application.start(function () { is_started = true; }));

                Backbone.history.start();

                // Makes sure the application is started before
                waitsFor(function() { return is_started; });
            }
        });

        afterEach(function()
        {
            delete SC._applications.WeeklyTimeLogsTests;
            try
            {
                Backbone.history.navigate('', {trigger: false});
                Backbone.history.stop();
            }
            catch(ex)
            { }
        });

		it('#1 the router must be working after module has been mounted', function ()
		{
            Backbone.history.navigate('#log?w=2', {trigger: true});
            expect(application.getLayout().currentView instanceof WeeklyTimeLogsView).toBe(true);
		});
	});

});