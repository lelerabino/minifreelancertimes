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
                events: {
                    SALES_ORDER_CHANGED: 'CVP__SALESORDER__EVENTS__SALES_ORDER_CHANGED'
                },
                errors: {
                    OFFLINE: 'SPA_GEF_CGUI_INSTANCE_OFFLINE',
                    DISABLED_USER: 'SPA_GEF_USER_DISABLED',
                    DUPLICATED_ITEM_CODE: 'SPA_GEF_DUP_CODE',
                    CANT_DELETE_CSTM_RCRD_ENTRY: 'SPA_GEF_CANT_DELETE_CSTM_RCRD_ENTRY',
                    FIELD_CONTAINS_MORE_THAN_MAX_CHARS: 'SPA_GEF_CONTAINS_MORE_THAN_FIELD_MAX_CHARS',
                    FIELD_CONTAINS_LESS_THAN_MIN_CHARS: 'SPA_GEF_CONTAINS_LESS_THAN_FIELD_MIN_CHARS',
                    FIELD_VALUE_IS_TOO_HIGH: 'SPA_GEF_CONTAINS_VALUE_IS_TOO_HIGH',
                    MISSING_MANDATORY_FIELD: 'SPA_GEF_MANDATORY_FIELD_NOT_SPECIFIED',
                    NULL_FIELD_NOT_ALLOWED: 'SPA_GEF_NULL_FIELD_NOT_ALLOWED',
                    FIELDS_INVALID_DATA_RANGE: 'SPA_GEF_INVALID_DATA_RANGE',
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
            'TimeLogs'
        ]
    });

    var screen_width = window.screen ? window.screen.availWidth : window.outerWidth || window.innerWidth;

    SPA.ENVIRONMENT.screenWidth = screen_width;

})(SPA.Application('TimeLogs'));
