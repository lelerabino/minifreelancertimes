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
                'click #submitWeek': 'onSubmit',
                'click [data-action="removeRow"]': 'resetRow',
                'change #newRowCustomer': 'onNewRowCstSelect',
                'change .newRow': 'onChangeNewRowControl',
                'keyup #newRowMemo': 'onChangeNewRowControl',
                'change .newPrj': 'onChangeNewPrjControl',
                'keyup #newPrjName': 'onChangeNewPrjControl',
                'keyup #newPrjRate': 'onChangeNewPrjControl',
                'change .newCst': 'onChangeNewCstControl',
                'keyup #newCstName': 'onChangeNewCstControl',
                'keyup #newCstRate': 'onChangeNewCstControl',
                'change .duration': 'onCellEditorChange'
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
                            newCstModal: {
                                el:that.$('#newCstModal'),
                                name: function () {
                                    return that.$('#newCstName');
                                },
                                address: function () {
                                    return that.$('#newCstAddress');
                                },
                                vatNumber: function () {
                                    return that.$('#newCstVat');
                                },
                                currency: function () {
                                    return that.$('#newCstCurrency');
                                },
                                newCstSubmit: function () {
                                    return that.$('#newCstSubmit');
                                }
                            },
                            newPrjModalPH: that.$('div[data-placeholder="prjModal"]'),
                            newPrjModal: {
                                el:that.$('#newPrjModal'),
                                customers: function () {
                                    return that.$('#newPrjCustomer');
                                },
                                name: function () {
                                    return that.$('#newPrjName');
                                },
                                rate: function () {
                                    return that.$('#newPrjRate');
                                },
                                newPrjSubmit: function () {
                                    return that.$('#newPrjSubmit');
                                }
                            },
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
                                addProjectsOption: function (value, text) {
                                    $('<option/>').val(value).html(text).appendTo(this.projects());
                                },
                                resetProjectsOption: function () {
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
                        this.newCstModal.el.modal();
                    },

                    buildNewPrjDialog: function () {
                        this.newPrjModalPH.html(
                            SPA.template('new_project_tmpl', {view: that})
                        );
                        this.newPrjModal.el.modal();
                    },

                    resetRows: function () {
                        this.$('table > tbody').empty();
                    },

                    appendRow: function (rowObj) {
                        if (this.$('table > tbody >tr.totalRow').length == 0) {
                            return this.$('table > tbody').append($(SPA.template('wrow_tmpl', {row: rowObj})));
                        }
                        else {
                            return this.$('table > tbody >tr.totalRow').before($(SPA.template('wrow_tmpl', {row: rowObj})));
                        }
                    },

                    drawWeekDayHeaders: function (labels) {
                        this.$('.day_header').map(function (index, th) {
                            $(th).text(labels[index]);
                        });
                    },

                    toggleEmptyContent: function (empty) {
                        if (empty) {
                            that.$('#emptyContent').show();
                            that.$('.withContent').hide();
                        }
                        else {
                            that.$('#emptyContent').hide();
                            that.$('.withContent').show();
                        }
                    },

                    activateViewScripts: function () {
                        var that = this;
                    }
                };
            }

            , commandFailHandler: function (task) {
                var that = this;
                return function (reason) {
                    var matchedError;
                    if (matchedError = reason.match('FIXABLE_SERVER_MSG')) {
                        return task.fix(reason).then(
                            function (manager) {
                                that.alert(matchedError.inner);
                            });
                    }
                };
            }

            , onSubmit: function (e) {
                var that = this;
                e.preventDefault();

                return that.application.TM.createTask(that, {type: 'SUBMIT_WEEK'}).then(
                    function (task) {
                        var taskCtx = task.ctx();

                        // BFD: business flow definition!!!
                        task.promise.fail(that.commandFailHandler(task));
                        task.promise.then(function () {
                            that.notify('Saved successfully.');
                        });
                        //~BFD

                        try {
                            taskCtx.notify(taskCtx.createInfo('Saving Week...'));
                            that.rowsColl.sync().then(
                                function () {
                                    task.resolve(true);
                                },
                                _.taskReject(task)
                            );
                        }
                        catch (err) {
                            task.reject(_.reasonFromError(taskCtx, err));
                        }

                        return task.promise;
                    });
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
                return that.rowsColl.isDirty();
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

            , resetRow: function (e) {
                var that = this,
                    rowid = that.$(e.target).data('row');

                that.rowsColl.get(rowid).resetCells();
            }

            , addCustomer: function (e) {
                var that = this,
                    fldCstName = that.$('#newCstName').val(),
                    fldCstAddress = that.$('#newCstAddress').val(),
                    fldCstVat = that.$('#newCstVat').val(),
                    fldCurr = that.$('#newCstCurrency').val();
                //project form validation
                if (fldCstName && fldCstAddress && fldCstVat && fldCurr) {
                    that.cstColl.create({
                        name: fldCstName,
                        address: fldCstAddress,
                        vatNumber: fldCstVat,
                        currency: fldCurr
                    });
                }
            }

            , addRow: function (e) {
                var that = this, currRow;

                e.preventDefault();

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
                            prj: that.prjColl.get(prjId),
                            startDate: SPA.getDateFromRelWeek(that.getWeekNumber())
                        }), {at: that.rowsColl.models.length - 1})
                    }
                    else {
                        that.alert('You already have this entry on the board. Please use it!')
                    }
                }
            }

            , onNewRowCstSelect: function (e) {
                var that = this;
                that.DOM.newRowModal.resetProjectsOption();
                _.each(that.prjColl.where({_cstId: that.DOM.newRowModal.customers().val()}), function (prj, index) {
                    that.DOM.newRowModal.addProjectsOption(prj.id, prj.get('name'));
                });
                that.DOM.newRowModal.projects().prop('disabled', false);
            }

            , onChangeNewRowControl: function (e) {
                var that = this;
                that.DOM.newRowModal.newRowSubmit().prop('disabled', !(that.DOM.newRowModal.customers().val() && that.DOM.newRowModal.projects().val() && that.DOM.newRowModal.memo().val()));
            }

            , onChangeNewPrjControl: function (e) {
                var that = this;
                that.DOM.newPrjModal.newPrjSubmit().prop('disabled', !(that.DOM.newPrjModal.customers().val() && that.DOM.newPrjModal.name().val() && that.DOM.newPrjModal.rate().val()));
            }

            , onChangeNewCstControl: function (e) {
                var that = this;
                that.DOM.newCstModal.newCstSubmit().prop('disabled', !(that.DOM.newCstModal.name().val() && that.DOM.newCstModal.address().val() && that.DOM.newCstModal.vatNumber().val() && that.DOM.newCstModal.currency()));
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

            , onCellEditorChange: function (e) {
                var that = this,
                    rowCid = that.$(e.target).data('row'),
                    cellCid = that.$(e.target).data('cell'),
                    newValue = that.$(e.target).val();
                that.rowsColl.get({cid: rowCid}).cells.get({cid: cellCid}).set('value', newValue);
            }

            , addProject: function (e) {
                var that = this,
                    fldCst = that.$('#newPrjCustomer').val(),
                    fldPrjName = that.$('#newPrjName').val(),
                    fldRate = that.$('#newPrjRate').val();
                //project form validation
                if (fldPrjName && fldRate) {
                    that.prjColl.create({
                        _cstId: fldCst,
                        name: fldPrjName,
                        rate: fldRate
                    });
                }
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
                        from: mStartDate,
                        to: mStartDate.clone().add(6, 'days')
                    }
                });
            }

            , unsubscribeWRows: function () {
                var that = this;
                if (that.rowsColl) {
                    that.rowsColl.off('add remove', that.onRowsCollectionChange);
                    that.rowsColl.off('cellChanged', that.onCellChange);
                }
                return;
            }

            , prepareWRows: function () {
                var that = this,
                    rows = new WRowCollection(), startDate = SPA.getDateFromRelWeek(that.getWeekNumber())
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
                                prj: that.prjColl.get(prjId),
                                startDate: startDate
                            });
                            rows.add(currRow);
                        }
                        currRow.bindTimeLog(tl, {silent: true});
                    }
                });
                that.rowsColl = rows;
                return rows;
            }

            , subscribeWRows: function () {
                var that = this;
                that.rowsColl.on('add remove', that.onRowsCollectionChange, that);
                that.rowsColl.on('cellChanged', that.onCellChange, that);
            }

            , onRowsCollectionChange: function (newRow, coll, options) {
                var that = this;
                that.DOM.appendRow(newRow.toDTO());
                if (!that.rowsColl.get('total')) {
                    that.addTotals(true);
                }
                that.toggleMode();
            }

            , toggleMode: function () {
                var that = this;
                that.DOM.toggleEmptyContent(that.rowsColl.models.length === 0);
            }

            , onCellChange: function (cell, options) {
                var that = this,
                    dayTot = that.getDayTotal(cell.id),
                    rowCid = options.row,
                    cellCid = cell.cid;
                that.$('#' + rowCid + '_' + cellCid).parent().html(SPA.template('wcell_tmpl', {
                    data: {
                        row: rowCid,
                        isTotal: options.tot,
                        cell: cell
                    }
                }));
                if (!options || !options.tot) {
                    that.rowsColl.get('total').cells.get(cell.id).set({originalValue: dayTot, value: dayTot}, {tot: true});
                }
                that.toggleSubmit();
            }

            , toggleSubmit: function () {
                this.$('#submitWeek').prop('disabled', !this.unsavedData());
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
                    that.toggleMode();
                    that.addTotals();
                    that.drawRows();
                    that.toggleSubmit();
                });
            }

            , addTotals: function (trigger) {
                var that = this, totRow = that.rowsColl.get('total'), dayTot;
                if (that.rowsColl.models.length) {
                    totRow = totRow ? totRow : new WRow({
                            id: 'total',
                            memo: 'TOTAL'
                        }, {
                            cst: null,
                            prj: null,
                            startDate: SPA.getDateFromRelWeek(that.getWeekNumber())
                        });
                    for (var j = 0; j < 7; j++) {
                        dayTot = that.getDayTotal(j);
                        totRow.cells.at(j).set({originalValue: dayTot, value: dayTot}, {silent: true});
                    }
                    that.rowsColl.add(totRow, {silent: !trigger});
                }
            }

            , getDayTotal: function (nDay) {
                var that = this, currRow, currCell,
                    nTot = 0, rows = _.filter(that.rowsColl.models, function (row) {
                        return row.id != 'total';
                    });
                for (var i = 0; i < rows.length; i++) {
                    currRow = rows[i];
                    currCell = currRow.cells.at(nDay);
                    //console.log('nday:' + nDay + ' cell (' + i + '):' + currCell.get('value'));
                    nTot += currCell.hasValue() ? parseFloat(currCell.get('value')) : 0;
                }
                return nTot;
            }

            , drawDates: function () {
                var that = this, daysLabels = [], wn = this.getWeekNumber(),
                    mStartDate = SPA.getDateFromRelWeek(wn);

                for (var i = 0; i < 7; i++) {
                    daysLabels[i] = mStartDate.clone().add(i, 'days').format('ddd DD')
                }

                that.DOM.navDates.text(that.formatWeek());
                that.DOM.drawWeekDayHeaders(daysLabels);

                return Q.resolve(true);
            }

            , drawNewWeek: function () {
                var that = this;
                that.unsubscribeWRows();
                return that.drawDates().then(function () {
                    that.drawWBoard();
                });
            }

            , notify: function (msg) {
                _.defer(function () {
                    jQuery.blockUI({
                        message: msg,
                        fadeIn: 700,
                        fadeOut: 700,
                        timeout: 4000,
                        showOverlay: false,
                        centerY: false,
                        css: {
                            width: '350px',
                            top: jQuery('#tboard').offset().top - jQuery(window).scrollTop() + 50 + 'px',
                            right: '10px',
                            border: 'none',
                            padding: '5px',
                            backgroundColor: '#00aa00',
                            '-webkit-border-radius': '10px',
                            '-moz-border-radius': '10px',
                            opacity: .6,
                            color: '#fff'
                        }
                    });
                });
            }

            , render: function () {
                var that = this;
                Backbone.View.prototype.render.apply(that, arguments);
                that.DOM._cacheEls();
                that.DOM.activateViewScripts();
                return that.drawNewWeek();
            }

            ,
            showContent: function () {
                var that = this;
                return that.application.getLayout().showContent(that);
            }

            ,
            destroy: function () {
                var that = this;
                that.unsubscribeWRows();
                that.weekModel.off('change', that.onWeekChange);
                //console.log('destroy view');
                that._destroy();
            }
        });
    });