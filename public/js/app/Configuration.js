// Configuration.js
// ----------------
// All of the applications configurable defaults
//test git
(function (application) {
    'use strict';

    var _getReasonContext = function _getReasonContext(task, reason) {
        var err_context = 'CLIENT_' + task.get('type');
        if (reason.code === 'SERVER_ERROR' && reason.inner && reason.inner.contextid) {
            err_context = reason.inner.contextid;
        }
        return err_context;
    };


    application.Configuration = {
        sync: {
            conventions: {
                events: {                },
                errors: {
                    OFFLINE: 'SPA_OFFLINE',
                    getFieldFromError: function (value) {
                        try {
                            var token = value.split('|')[1];
                            return token.split(':')[1];
                        }
                        catch (err) {
                            return 'unknown';
                        }
                    }
                },
                diagnostics: {
                    log: {
                        errors: {
                            getLogTitle: function (task, prefix, reason, userid, cvp_sessionid, sessionTokenId) {
                                try {
                                    return prefix + '|' + userid + '|' + _getReasonContext(task,
                                            reason);
                                }
                                catch (err) {
                                    return 'MISSING_TITLE';
                                }
                            }
                        }
                    },
                    getVisibleDetails: function (task, reason) {
                        return this.getVisibleReasonContext(task, reason);
                    },
                    getReasonContext: _getReasonContext,
                    getVisibleReasonContext: function (task, reason) {
                        var err_context = 'CLIENT_' + task.get('type');
                        if (reason.code === 'SERVER_ERROR' && reason.inner && reason.inner.contextid) {
                            err_context = 'SERVER_ERROR_' + reason.inner.contextid;
                        }
                        if (reason.code === 'SERVER_ERROR' && reason.inner && reason.inner.inner && reason.inner.inner.contextid) {
                            err_context = 'SERVER_ERROR_' + reason.inner.inner.contextid;
                        }
                        return err_context;
                    }
                },
                validation: {},
                needTaxWarning: function (countryCode) {
                    return true;//countryCode != '110';[#279]
                }
            },
            behaviors: {
                getErrorCode: function (error) {
                    return error.err;
                }
            }
        }
    };

    _.extend(application.Configuration, {
        modules: [
            'TimeLogs',
            'WeeklyTimeLogs',
            'TimeLogsBrowser'
        ]
    });

    var screen_width = window.screen ? window.screen.availWidth : window.outerWidth || window.innerWidth;

    SPA.ENVIRONMENT.screenWidth = screen_width;

})(SPA.Application('TimeLogs'));
