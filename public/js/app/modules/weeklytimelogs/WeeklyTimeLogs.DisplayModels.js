define('WCell.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            initialize: function (attributes, options) {
                var that = this;
                that.tlog = options.tlog;
                that.set('value', options.tlog ? options.tlog.get('duration') : null);
            }
        });
});

define('WCell.Collection', ['WCell.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model: Model
        });
});

define('WRow.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            initialize: function (attributes, options) {
                var that = this;
                that.cst = options.cst;
                that.prj = options.prj;
                that.set('memo', options.memo);
            },

            matchTLog: function (tl) {
                var that = this;
                return that.cst.id === tl.get('_cstId') &&
                    that.prj.id === tl.get('_prjId') &&
                    that.get('memo') === tl.get('memo');
            },

            toDTO: function () {
                return {
                    cst: this.cst.toJSON(),
                    prj: this.prj.toJSON(),
                    memo: this.get('memo')
                }
            }
        });
});

define('WRow.Collection', ['WRow.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model: Model,

            anyMatchTLog: function (tl) {
                var that = this;
                return _.findWhere(that.models, function (row) {
                    return row.matchTLog(tl);
                })
            }
        });
});