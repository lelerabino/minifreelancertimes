// WeeklyTimeLogs.View.js
// -------------------
// Handles the related view
define('WeeklyTimeLogs.View', function () {
    'use strict';


    return Backbone.View.extend({

        template: 'weekly_time_logs'

        , title: _('WeeklyTimeLogs').translate()

        , page_header: _('WeeklyTimeLogs.View').translate()

        , events: {
            'click [data-action="wmove"]': 'moveWeek',
        }

        , initialize: function (options) {
            var that = this;
            that.application = options.application;
            that.weekModel = options.weekModel;
            that.weekModel.on('change',that.onWeekChange, that);
            that.DOM = {
                _view: that,
                _fxDelay: 200,
                $: function (selector) {
                    return this._view.$(selector);
                },

                _cacheEls: function () {
                    _.extend(this, {
                        root: this._view.$el,

                    });
                },

                activateViewScripts: function () {
                    var that = this;
                    $('.timetext').editable({
                        success: function () {
                            //TODO
                        },
                        showbuttons: true,
                        send: 'never',
                        emptytext: '-',
                        display: function (value) {
                            if (value) {
                                $(this).text(value + 'h');
                            }
                            else {
                                $(this).empty();
                            }
                        }
                    });
                }
            };
        }

        , onWeekChange:function () {
            Backbone.history.navigate('log?w=' + this.getWeekNumber(), {trigger:true});
        }

        , getWeekNumber: function () {
            return parseInt(this.weekModel.get('week'));
        }

        , formatWeek: function () {
            var wn = this.getWeekNumber(),
                mStartDate = SPA.getDateFromRelWeek(wn).add(1,'days');
            return mStartDate.format('MMM DD YY') + ' - ' + mStartDate.add(6,'days').format('MMM DD YY');
        }

        , moveWeek: function (e) {
            var that = this,
                incr = jQuery(e.target).closest('button').data('incr');
            that.weekModel.set('week', (incr === 'current') ? SPA.getCurrentWeek() : (that.getWeekNumber() + parseInt(incr)));
        }

        , render: function () {
            var that = this;
            that.dirty = false;
            Backbone.View.prototype.render.apply(this, arguments);
            that.DOM._cacheEls();
            that.DOM.activateViewScripts();
            return that;
        }

        , showContent: function () {
            this.application.getLayout().showContent(this).then(function () {

            });
        }

        , destroy: function () {
            var that = this;
            that.weekModel.off('change',that.onWeekChange);
            console.log('destroy view');
            that._destroy();
        }
    });
});