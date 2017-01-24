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
                'click [data-action="rowAdd"]': 'addRow',
                'click [data-action="newCst"]': 'onNewCustomer',
                'click [data-action="newPrj"]': 'onNewProject',
                'click [data-action="newRow"]': 'onNewRow',
                'change #newRowCustomer' : 'onNewRowCstSelect',
                'change .newRow':'onChangeNewRowControl',
                'keyup #newRowMemo':'onChangeNewRowControl'
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
                            newWRowModalPH: that.$('div[data-placeholder="newRowModal"]'),
                            newWRowModal: that.$('#newRowModal'),
                            newCstModalPH: that.$('div[data-placeholder="cstModal"]'),
                            newCstModal: that.$('#newCstModal'),
                            newPrjModalPH: that.$('div[data-placeholder="prjModal"]'),
                            newPrjModal: that.$('#newPrjModal'),
                            navDates: that.$('#navDates'),
                            newRowModal: {
                                el: that.$('#newRowModal'),
                                customers: function () {
                                    return that.$('#newRowCustomer');
                                },
                                projects: function () {
                                    return that.$('#newRowProject');
                                },
                                memo: function () {
                                    return that.$('#newRowMemo');
                                },
                                newRowSubmit: function () {
                                    return that.$('#newRowSubmit');
                                },
                                addProjectsOption: function(value, text){
                                    $('<option/>').val(value).html(text).appendTo(this.projects());
                                },
                                resetProjectsOption: function(){
                                    this.projects().find('option').remove();
                                }
                            }
                        });
                    },

                    buildNewRowDialog: function () {
                        this.newWRowModalPH.html(
                            SPA.template('new_row_tmpl', {view: that})
                        );
                        this.newWRowModal.modal();
                    },

                    buildNewCstDialog: function () {
                        this.newCstModalPH.html(
                            SPA.template('new_customer_tmpl', {view: that})
                        );
                        this.newCstModal.modal();
                    },

                    buildNewPrjDialog: function () {
                        this.newPrjModalPH.html(
                            SPA.template('new_project_tmpl', {view: that})
                        );
                        this.newPrjModal.modal();
                    },

                    resetRows: function () {
                        this.$('table > tbody').empty();
                    },

                    appendRow: function (rowObj) {
                        return this.$('table > tbody:last-child').append($(SPA.template('wrow_tmpl', {row: rowObj})));
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

            , onWeekChange: function () {
                var that = this;
                var fn = function () {
                    Backbone.history.navigate('log?w=' + that.getWeekNumber(), {trigger: false});
                    that.drawNewWeek();
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
                    mStartDate = SPA.getDateFromRelWeek(wn);
                return mStartDate.format('MMM DD YYYY') + ' - ' + mStartDate.clone().add(6, 'days').format('MMM DD YYYY');
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

            , addRow: function (e) {
                var that = this, currRow;

                var cstId = that.DOM.newRowModal.customers().val(),
                    prjId = that.DOM.newRowModal.projects().val(),
                    memo = that.DOM.newRowModal.memo().val(),
                    cst = that.cstColl.get(cstId),
                    prj = that.prjColl.get(prjId);
                if (cst && prj) {
                    currRow = that.rowsColl.anyMatchTLog(cstId, prjId, memo);
                    if (!currRow) {
                        that.rowsColl.add(currRow = new WRow({memo: memo}, {
                            cst: that.cstColl.get(cstId),
                            prj: that.prjColl.get(prjId)
                        }))
                    }
                    else {
                        that.alert('You already have this entry on the board. Please use it!')
                    }
                }
            }

            , onNewRowCstSelect: function (e) {
                var that=this;
                that.DOM.newRowModal.resetProjectsOption();
                _.each(that.prjColl.where({_cstId:that.DOM.newRowModal.customers().val()}), function(prj, index){
                    that.DOM.newRowModal.addProjectsOption(prj.id, prj.get('name'));
                });
                that.DOM.newRowModal.projects().prop('disabled', false);
            },

            onChangeNewRowControl:function (e) {
                var that=this;
                that.DOM.newRowModal.newRowSubmit().prop('disabled', !(that.DOM.newRowModal.customers().val() && that.DOM.newRowModal.projects().val() && that.DOM.newRowModal.memo().val()));
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

            , fetchTLogs: function () {
                var that = this;
                var wn = this.getWeekNumber(),
                    mStartDate = SPA.getDateFromRelWeek(wn);
                return that.tlColl.fetch({
                    data: {
                        from: mStartDate.toString(),
                        to: mStartDate.clone().add(6, 'days').toString()
                    }
                });
            }

            , unsubscribeWRows: function () {
                var that = this;
                return;
            }
            , prepareWRows: function () {
                var that = this,
                    rows = new WRowCollection();
                _.each(that.tlColl.models, function (tl) {
                    var currRow, cstId = tl.get('_cstId'), prjId = tl.get('_prjId'), memo = tl.get('memo'),
                        cst = that.cstColl.get(cstId),
                        prj = that.prjColl.get(prjId);
                    if (cst && prj) {
                        currRow = rows.anyMatchTLog(tl.get('_cstId'), tl.get('_prjId'), tl.get('memo'));
                        if (currRow) {

                        }
                        else {
                            currRow = new WRow({
                                memo: memo
                            }, {
                                cst: that.cstColl.get(cstId),
                                prj: that.prjColl.get(prjId)
                            });
                            rows.add(currRow);
                        }
                        currRow.bindCell(tl);
                    }
                });
                that.rowsColl = rows;
                return rows;
            }

            , subscribeWRows: function () {
                var that = this;
                that.rowsColl.on('add remove', that.onRowsCollectionChange, that);
            }
            , onRowsCollectionChange: function (newRow, coll, options) {
                var that = this;
                that.DOM.appendRow(newRow.toDTO());
            }


            , drawRows: function () {
                var that = this;
                that.DOM.resetRows();

                _.each(that.rowsColl.models, function (row) {
                    that.DOM.appendRow(row.toDTO());
                });
            }

            , drawWBoard: function () {
                var that = this;
                return that.fetchTLogs().then(function () {
                    that.prepareWRows();
                    that.subscribeWRows();
                    that.drawRows();
                });
            }

            , drawDates: function () {
                var that = this;

                that.DOM.navDates.text(that.formatWeek());

                return Q.resolve(true);
            }

            , drawNewWeek: function () {
                var that = this;
                that.unsubscribeWRows();
                return that.drawDates().then(function () {
                    that.drawWBoard();
                });
            }

            , render: function () {
                var that = this;
                Backbone.View.prototype.render.apply(that, arguments);
                that.DOM._cacheEls();
                that.DOM.activateViewScripts();
                return that.drawNewWeek();
            }

            , showContent: function () {
                var that = this;
                return that.application.getLayout().showContent(that);
            }

            , destroy: function () {
                var that = this;
                that.weekModel.off('change', that.onWeekChange);
                console.log('destroy view');
                that._destroy();
            }
        });
    });