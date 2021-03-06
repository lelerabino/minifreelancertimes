SPA.startTimeLogs = function () {
    'use strict';

    SPA.dtRef = moment([2000, 0, 1]).startOf('isoweek');

    var application = SPA.Application('TimeLogs');

    application.getConfig().spaSettings = SPA.ENVIRONMENT.spaSettings || {};

    SPA.compileMacros(SPA.templates.macros);

    // Requires all dependencies so they are bootstrapped
    require([], function () {
        var crashFn = function (reason) {
            throw _.createError('APP_START', 'Can\'t start startTimeLogs', reason);
        };

        application.TM.start().then(
            function (director) {
                director.createTask(application, {type: 'APP:LOAD'}).then(
                    function (task) {
                        var taskCtx = task.ctx(),
                            startOp = taskCtx.newOp({type: 'APP:START'});

                        try {
                            taskCtx.notify(taskCtx.createInfo('Starting Application...'));
                            // When the document is ready we call the application.start, and once that's done we bootstrap and start backbone
                            application.start(function () {
                                ////////////////////////////
                                // Bootstrap some objects //
                                ////////////////////////////


                                // Checks for errors in the context
                                if (SPA.ENVIRONMENT.contextError) {
                                    // Hide the header and footer.
                                    application.getLayout().$('#site-header').hide();

                                    // Shows the error.
                                    application.getLayout().internalError(SPA.ENVIRONMENT.contextError.errorMessage, 'Error ' + SPA.ENVIRONMENT.contextError.errorStatusCode + ': ' + SPA.ENVIRONMENT.contextError.errorCode);
                                }
                                else {

                                    if (!document.location.hash) {
                                        document.location.hash = 'log?w=' + SPA.getCurrentWeek();
                                    }

                                    // Only do push state client side.
                                    Backbone.history.start({
                                        pushState: SPA.ENVIRONMENT.jsEnvironment === 'browser' && !SPA.preventPushState
                                    });
                                    startOp.resolve();
                                    task.resolve();
                                }
                            }, {operation: startOp});
                        }
                        catch (err) {
                            task.reject(taskCtx.createReason('JS_ERROR', err));
                        }
                    });
            },
            crashFn
        ).fail(crashFn);
    });
};

SPA.startTimeLogs();

var layout = SPA.Application('TimeLogs').getLayout();
layout.appendToDom();
layout.on('afterAppendToDom', function () {
    SPA.initializeContainerDashboard();
});

vex.defaultOptions.className = 'vex-theme-wireframe';

if (SPA.ENVIRONMENT.serverSettings.beforeUnloadConfirmation) {
    jQuery(window).on('beforeunload', function () {
        var currView = SPA._applications.TimeLogs.getLayout().currentView;
        if (currView.unsavedData && currView.unsavedData()) {
            return 'There is potential unsaved data. Continue and leave?';
        }
    })
}

