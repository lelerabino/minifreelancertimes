define('WCell.Model', ['TimeLogs.Model'], function (TLModel) {
    'use strict';

    return Backbone.Model.extend(
        {
            idAttribute: 'id',
            defaults: {
                originalValue: '',
                value: ''
            },
            initialize: function (attributes, options) {
                var that = this;
            },

            bindTimeLog: function (tl, options) {
                var that = this;
                if (tl) {
                    that.tlog = tl;
                    that.set({
                        originalValue: tl.get('duration'),
                        value: tl.get('duration'),
                        date: tl.get('date')
                    }, {silent: options && options.silent});
                }
                else {
                    that.set(that.defaults, {silent: options && options.silent});
                }
            },

            getClass: function () {
                var that = this;
                return that.isDirty() ? 'dirty' : '';
            },

            isDirty: function () {
                var that = this;
                return (that.get('value') != that.get('originalValue'));
            },

            hasTL: function () {
                var that = this;
                return that.tlog;
            },

            hasValue: function () {
                var that = this;
                return that.get('value') && parseFloat(that.get('value')) > 0;
            },

            clean: function () {
                var that = this;
                that.bindTimeLog(that.tlog);
            },

            sync: function (headers) {
                var that = this;
                if (that.isDirty()) {
                    if (!that.hasTL()) {
                        that.tlog = new TLModel({
                            _cstId: headers.cst,
                            _prjId: headers.prj,
                            memo: headers.memo,
                            date: that.get('date'),
                            duration: that.get('value')
                        });
                    }
                    else {
                        if (that.hasValue()) {
                            that.tlog.set({duration: that.get('value')});
                        }
                        else {
                            return that.tlog.destroy().then(function () {
                                delete that.tlog;
                                that.clean();
                            });
                        }
                    }
                    return that.tlog.save().then(function () {
                        that.clean();
                    });
                }
                else {
                    return Q.resolve(that);
                }
            },

            toJSON: function () {
                return _.extend(Backbone.Model.prototype.toJSON.apply(this, arguments), {id: this.cid});
            }
        });
});

define('WCell.Collection', ['WCell.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model: Model,
            initializeWeekDays: function (startDate) {
                var that = this;
                for (var i = 0; i < 7; i++) {
                    that.add(new Model({id: i, date: (startDate.clone().add(i, 'days'))}));
                }
            },

            isDirty: function () {
                var that = this;
                return _.find(that.models, function (cell) {
                    return cell.isDirty();
                })
            },

            sync: function (headers) {
                var that = this;
                return Q.all(_.map(that.models, function (cell) {
                    return cell.sync(headers);
                }));
            }
        });
});

define('WRow.Model', ['WCell.Model', 'WCell.Collection'],
    function (WCell, WCellCollection) {
        'use strict';

        return Backbone.Model.extend(
            {
                initialize: function (attributes, options) {
                    var that = this;
                    that.cst = options.cst;
                    that.prj = options.prj;
                    that.cells = new WCellCollection();
                    that.cells.initializeWeekDays(options.startDate);
                    that.cells.on('change', that.onCellsChanged, that);
                },

                onCellsChanged: function (model, options) {
                    var that = this;
                    that.trigger('cellChanged', model, _.extend(options, {
                        row: that.cid
                    }));
                },

                matchTLog: function (cstId, prjId, memo) {
                    var that = this;
                    return that.cst.id === cstId &&
                        that.prj.id === prjId &&
                        that.get('memo') === memo;
                },

                isDirty: function (cstId, prjId, memo) {
                    var that = this;
                    return that.cells.isDirty();
                },

                toDTO: function () {
                    var dto = {
                        isTotal: this.id === 'total',
                        id: this.cid,
                        cst: this.cst ? this.cst.toJSON() : null,
                        prj: this.prj ? this.prj.toJSON() : null,
                        memo: this.get('memo'),
                        cells: this.cells.models
                    };
                    return dto;
                },

                bindTimeLog: function (tl, options) {
                    var that = this,
                        tlDate = moment(tl.get('date')),
                        cellIndex = tlDate.clone().startOf('day').diff(tlDate.clone().startOf('isoweek'), 'day');
                    (that.cells.get(cellIndex)).bindTimeLog(tl, options);
                },

                getDirtyCells: function () {
                    var that = this;
                    return _.filter(that.cells.models, function (cell) {
                        return cell.isDirty();
                    });
                },

                sync: function () {
                    var that = this;
                    return that.cells.sync({
                        cst: that.cst.id,
                        prj: that.prj.id,
                        memo: that.get('memo')
                    });
                }
            });
    });

define('WRow.Collection', ['WRow.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model: Model,

            anyMatchTLog: function (cstId, prjId, memo) {
                var that = this;
                return _.find(that.nonTotalRows(), function (row) {
                    return row.matchTLog(cstId, prjId, memo);
                })
            },

            isDirty: function () {
                var that = this;
                return _.find(that.nonTotalRows(), function (row) {
                    return row.isDirty();
                })
            },

            nonTotalRows: function () {
                var that = this;
                return _.filter(that.models, function (row) {
                    return row.id != 'total';
                });
            },

            sync: function () {
                var that = this;
                return Q.all(_.map(that.nonTotalRows(), function (row) {
                    return row.sync();
                }));
            }
        });
});