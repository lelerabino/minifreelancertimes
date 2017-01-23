define('WCell.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            idAttribute: 'id',
            initialize: function (attributes, options) {
                var that = this;
                //that.tlog = options.tlog;
                //that.set('value', options.tlog ? options.tlog.get('duration') : null);
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
                },

                matchTLog: function (cstId, prjId, memo) {
                    var that = this;
                    return that.cst.id === cstId &&
                        that.prj.id === prjId &&
                        that.get('memo') === memo;
                },

                toDTO: function () {
                    var dto = {
                        cst: this.cst.toJSON(),
                        prj: this.prj.toJSON(),
                        memo: this.get('memo'),
                        cells: this.cells.toJSON()
                    };
                    console.log(dto);
                    return dto;
                },

                bindCell: function (tl) {
                    var that = this;
                    (that.cells.get(moment(tl.get('date')).day())).set({value: tl.get('duration')});
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
            }
        });
});