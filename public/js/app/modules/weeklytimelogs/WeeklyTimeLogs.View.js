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
            'click [data-action="cstAdd"]': 'addCustomer',
            'click [data-action="prjAdd"]': 'addProject',
            'click [data-action="buildCstDialog"]': 'buildCstDialog',
            'click [data-action="buildPrjDialog"]': 'buildPrjDialog',
            'click [data-action="buildNewRowDialog"]': 'buildNewRowDialog'
        }

        , initialize: function (options) {
            var that = this;
            that.application = options.application;
            that.weekModel = options.weekModel;
            that.weekModel.on('change', that.onWeekChange, that);
            that.cstColl = options.cstColl;
            that.prjColl = options.prjColl;
            that.tlColl = options.tlColl;
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

        , onWeekChange: function () {
            Backbone.history.navigate('log?w=' + this.getWeekNumber(), {trigger: true});
        }

        , getWeekNumber: function () {
            return parseInt(this.weekModel.get('week'));
        }

        , formatWeek: function () {
            var wn = this.getWeekNumber(),
                mStartDate = SPA.getDateFromRelWeek(wn).add(1, 'days');
            return mStartDate.format('MMM DD YY') + ' - ' + mStartDate.add(6, 'days').format('MMM DD YY');
        }

        , moveWeek: function (e) {
            var that = this,
                incr = jQuery(e.target).closest('button').data('incr');
            that.weekModel.set('week', (incr === 'current') ? SPA.getCurrentWeek() : (that.getWeekNumber() + parseInt(incr)));
        }

        , addCustomer: function (e) {
            var that = this;
            that.cstColl.create({
                name: that.$('#newCstName').val(),
                address: that.$('#newCstAddress').val(),
                vatNumber: that.$('#newCstVat').val(),
                currency: that.$('#newCstCurrency').val()
            });
        }

        , buildCstDialog: function (e) {
            var that = this;
            that.$('[data-placeholder="cstModal"]').html(
                SPA.template('new_customer_tmpl', {view: that})
            );

            that.$('#newCstModal').modal();

        }

        , buildPrjDialog: function (e) {
            var that = this;
            that.$('[data-placeholder="prjModal"]').html(
                SPA.template('new_project_tmpl', {view: that})
            );

            that.$('#newPrjModal').modal();

        }

        , buildNewRowDialog: function (e) {
            var that = this;
            that.$('[data-placeholder="newRowModal"]').html(
                SPA.template('new_row_tmpl', {view: that})
            );

            that.$('#newRowModal').modal();
        }

        , addProject: function (e) {
            var that = this;
            that.prjColl.create({
                name: that.$('#newPrjName').val(),
                rate: that.$('#newPrjRate').val()
            });
        }

        , render: function () {
            var that = this;
            that.dirty = false;
            Backbone.View.prototype.render.apply(this, arguments);
            that.DOM._cacheEls();
            that.DOM.activateViewScripts();
            return that;
        }

        , getCustomers: function () {
            var that = this;
            return that.cstColl.toJSON();
        }

        , getProjects: function () {
            var that = this;
            return that.prjColl.toJSON();
        }

        , showContent: function () {
            this.application.getLayout().showContent(this).then(function () {

            });
        }

        , destroy: function () {
            var that = this;
            that.weekModel.off('change', that.onWeekChange);
            console.log('destroy view');
            that._destroy();
        }
    });
});