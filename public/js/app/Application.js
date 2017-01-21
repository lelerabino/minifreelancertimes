// Application.js
// --------------
// Extends the application with TimeLogs specific core methods

/*global _:true, CLU:true, jQuery:true, Backbone:true*/

(function (app) {
    'use strict';

    // Get the layout from the application
    var Layout = app.getLayout();


    // Wraps the SPA.Utils.resizeImage and passes in the settings it needs
    _.extend(Layout, {
        notifyProgress: function (obj) {
            if (_.hasValue(obj)) {
                var tmsg = obj.msg;
                if (SPA.isLoading) {
                    jQuery('#loadingBox').find('p').text(tmsg);
                }
            }
            else {
                this.resetNotifyProgress();
            }
        },
        resetNotifyProgress: function () {
            if (SPA.isLoading) {
                jQuery('#loadingBox').find('p').empty();
            }
        },
        startLoading: function () {
            if (!SPA.isLoading) {
                var options = {
                    message: '<div id="loadingBox" class="loadingBox"><p>Loading...</p></div>',
                    css: {
                        height: '80px',
                        border: '3px solid #ccc',
                        color: '#337ab7'
                    },
                    overlayCSS: {
                        backgroundColor: '#eee',
                        opacity: 0.3,
                        cursor: 'standard'
                    },
                    ignoreIfBlocked: true
                };
                //jQuery('body').css('cursor', 'progress');
                if (SPA.blockedEl) {
                    SPA.blockedEl.block(options);
                }
                else {
                    jQuery.blockUI(options);
                }
                SPA.isLoading = true;
            }
        },
        stopLoading: function () {
            //jQuery('body').css('cursor', 'default');
            if (SPA.blockedEl) {
                jQuery.unblockUI();
                SPA.blockedEl.unblock(options);
            }
            else {
                jQuery.unblockUI();
            }

            this.resetNotifyProgress('');
            SPA.isLoading = false;
        },
        confirm: function (taskType, options) {
            var that = this;
            if (SPA.noconfirm) {
                return options.callback(true);
            }

            return vex.dialog.confirm(_.extend(options, {
                buttons: {
                    YES: {
                        text: 'No',
                        type: 'button',
                        className: 'vex-dialog-button-secondary',
                        click: function ($vexContent, event) {
                            $vexContent.data().vex.value = false;
                            return vex.close($vexContent.data().vex.id);
                        }
                    },
                    NO: {
                        text: 'OK',
                        type: 'button',
                        className: 'vex-dialog-button-primary',
                        click: function ($vexContent, event) {
                            $vexContent.data().vex.value = true;
                            return vex.close($vexContent.data().vex.id);
                        }
                    }
                }
            }));

            return options.callback(true);
        },
        alert: function (options) {
            return vex.dialog.alert(options);
        },
        getCurrentWeek: function(){
            return SPA.getCurrentWeek();
        }
    });


    // Setup global cache for this application
    jQuery.ajaxSetup({cache: true});

    jQuery.ajaxPrefilter(function (options) {
        if (options.url) {
            if (options.type === 'GET' && options.data) {
                var join_string = ~options.url.indexOf('?') ? '&' : '?';
                options.url = options.url + join_string + options.data;
                options.data = '';
            }

            options.url = SPA.Utils.reorderUrlParams(options.url);
        }

        if (options.pageGeneratorPreload && SPA.ENVIRONMENT.jsEnvironment === 'server') {
            jQuery('<img />', {src: options.url}).prependTo('head').hide();
        }
    });

    app.checkLastInvoiceDate = function checkLastInvoiceDate() {
        var that = this;
        return Q(jQuery.ajax({
            url: that.Configuration.spaSettings.touchpoints.router_rest + '&p=invoices/lastdate',
            method: 'GET',
            headers: {
                Accept: "application/json; charset=utf-8",
                "Content-Type": "application/json; charset=utf-8"
            }
        })).then(function (pvalue) {
            if (!pvalue.success || !pvalue.data || !pvalue.data.lastdate) {
                throw _.createError('LAST_INVOICES_DATE_SERVER_ERROR', pvalue);
            }
            return pvalue.data.lastdate;
        }, function (reason) {
            throw _.createError('LAST_INVOICES_DATE_SERVER_ERROR', '', reason);
        }).fail(function (reason) {
            throw _.createError('LAST_INVOICES_DATE_SERVER_ERROR', '', reason);
        });
    };

    app.setRunningCommands = function (commands) {
        this.runningCommands = commands;
    };

    app.getRunningCommands = function () {
        return this.runningCommands;
    };

    //It triggers main nav collapse when any navigation occurs
    Backbone.history.on('all', function () {
        //TODO
    });


})(SPA.Application('TimeLogs'));

