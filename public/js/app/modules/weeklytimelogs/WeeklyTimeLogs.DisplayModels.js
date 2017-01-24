define('WCell.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            idAttribute: 'id',
            defaults:{
                originalValue:'',
                value:''
            },
            initialize: function (attributes, options) {
                var that = this;
                //that.tlog = options.tlog;
                //that.set('value', options.tlog ? options.tlog.get('duration') : null);
            },

            bindTimeLog: function (tl) {
                var that = this;
                that.tlog = tl;
                that.set({
                    originalValue: tl.get('duration'),
                    value: tl.get('duration'),
                    hasTL: true
                }, {silent: true});
            },

            getClass:function () {
                var that=this;
                return that.isDirty() ? 'dirty' : '';
            },

            isDirty:function () {
                var that=this;
                return (that.get('value') != that.get('originalValue'));
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
            initializeWeekDays: function () {
                var that = this;
                for (var i = 1; i <= 7; i++) {
                    that.add(new Model({id: i}));
                }
            },

            isDirty:function(){
                var that=this;
                return _.find(that.models, function (cell) {
                    return cell.isDirty();
                })
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
                    that.cells.initializeWeekDays();
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
                        id: this.cid,
                        cst: this.cst.toJSON(),
                        prj: this.prj.toJSON(),
                        memo: this.get('memo'),
                        cells: this.cells.models
                    };
                    return dto;
                },

                bindTimeLog: function (tl) {
                    var that = this;
                    (that.cells.get(moment(tl.get('date')).day())).bindTimeLog(tl);
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
                return _.find(that.models, function (row) {
                    return row.matchTLog(cstId, prjId, memo);
                })
            },

            isDirty:function(){
                var that=this;
                return _.find(that.models, function (row) {
                    return row.isDirty();
                })
            }
        });
});