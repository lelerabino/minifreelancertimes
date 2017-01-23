// WeeklyTimeLogs.View.js
// -------------------
// Handles the related view
define('WeeklyTimeLogs.View', ['WCell.Model', 'WCell.Collection', 'WRow.Model', 'WRow.Collection'],
    function (WCell, WCellCollection, WRow, WRowCollection) {
        'use strict';


        return Backbone.View.extend({

            template: 'weekly_time_logs'

            , title: _('WeeklyTimeLogs').translate()

            , page_header: _('WeeklyTimeLogs.View').translate()

            , events: {
                'click [data-action="wmove"]': 'moveWeek',
                'click [data-action="cstAdd"]': 'addCustomer',
                'click [data-action="prjAdd"]': 'addProject',
                'click [data-action="newCst"]': 'onNewCustomer',
                'click [data-action="newPrj"]': 'onNewProject',
                'click [data-action="newRow"]': 'onNewRow'
            }

            , initialize: function (options) {
                var that = this;
                that.application = options.application;
                that.weekModel = options.weekModel;
                that.weekModel.on('change', that.onWeekChange, that);
                that.cstColl = options.cstColl;
                that.prjColl = options.prjColl;
                that.tlColl = options.tlColl;
                that.test();
                that.DOM = {
                    _view: that,
                    _fxDelay: 200,
                    $: function (selector) {
                        return this._view.$(selector);
                    },

                    _cacheEls: function () {
                        _.extend(this, {
                            root: this._view.$el,
                            newWRowModalPH:that.$('div[data-placeholder="newRowModal"]'),
                            newWRowModal:that.$('#newRowModal'),
                            newCstModalPH:that.$('div[data-placeholder="cstModal"]'),
                            newCstModal:that.$('#newCstModal'),
                            newPrjModalPH:that.$('div[data-placeholder="prjModal"]'),
                            newPrjModal:that.$('#newPrjModal')
                        });
                    },

                    buildNewRowDialog: function () {
                        this.newWRowModalPH.html(
                            SPA.template('new_row_tmpl', {view: that})
                        );
                        this.newWRowModal.modal();
                    },

                    buildNewCstDialog:function () {
                        this.newCstModalPH.html(
                            SPA.template('new_customer_tmpl', {view: that})
                        );
                        this.newCstModal.modal();
                    },

                    buildNewPrjDialog:function () {
                        this.newPrjModalPH.html(
                            SPA.template('new_project_tmpl', {view: that})
                        );
                        this.newPrjModal.modal();
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
                    },


                };
            }

            , test: function () {
                var that = this,
                    cells = new WCellCollection();

                that.tlColl.fetch().then(
                    function () {
                        _.each(that.tlColl.models, function (tl) {
                            cells.add(new WCell(null, {tlog: tl}));
                        });
                    }
                );
            }

            , fetchCstAndPrj: function () {
                var that = this;
                return Q.all([that.cstColl.fetch(), that.prjColl.fetch()]);
            }

            , onWeekChange: function () {
                var that = this;
                var fn = function () {
                    Backbone.history.navigate('log?w=' + that.getWeekNumber(), {trigger: true});
                };

                if (that.unsavedData()) {
                    that.confirm({
                        message: 'Unsaved data. Continue?',
                        callback: function (confirmation) {
                            if (confirmation) {
                                fn();
                            }
                        }
                    });
                }
                else {
                    fn();
                }
            }

            , unsavedData: function () {
                var that = this;
                return false;
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

            , onNewCustomer: function (e) {
                var that = this;
                that.DOM.buildNewCstDialog();
            }

            , onNewProject: function (e) {
                var that = this;
                that.DOM.buildNewPrjDialog();
            }

            , onNewRow: function (e) {
                var that = this;
                that.DOM.buildNewRowDialog();
            }

            , addProject: function (e) {
                var that = this;
                that.prjColl.create({
                    name: that.$('#newPrjName').val(),
                    rate: that.$('#newPrjRate').val()
                });
            }

            , getCustomers: function () {
                var that = this;
                return that.cstColl.toJSON();
            }

            , getProjects: function () {
                var that = this;
                return that.prjColl.toJSON();
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
                var that = this;

                return that.fetchCstAndPrj().then(function () {
                    return that.application.getLayout().showContent(that);
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