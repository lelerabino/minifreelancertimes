// TimeBrowser.View.js
// -------------------
// Handles the related view
define('TimeBrowser.View', function () {
    'use strict';


    return Backbone.View.extend({

        template: 'time_logs'

        , title: _('TimeBrowser').translate()

        , page_header: _('TimeBrowser.View').translate()

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
            var wn = this.getWeekNumber();
            return moment().day(0).week(wn).format('MMM DD YY') + ' - ' + moment().day(6).week(wn).format('MMM DD YY');
        }

        , moveWeek: function (e) {
            var that = this,
                incr = jQuery(e.target).closest('button').data('incr');

            that.weekModel.set('week',(that.getWeekNumber() + parseInt(incr)));
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
    });
});