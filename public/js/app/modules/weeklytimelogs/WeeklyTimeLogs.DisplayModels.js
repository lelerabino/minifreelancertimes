define('WCell.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            initialize:function (attributes, options) {
                var that=this;
                that.tlog = options.tlog;
                that.set('value',options.tlog ? options.tlog.get('duration'):null);
            }
        });
});

define('WCell.Collection',['WCell.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model:Model
        });
});

define('WRow.Model', function () {
    'use strict';

    return Backbone.Model.extend(
        {
            initialize:function (attributes, options) {
                var that=this;
                that.cst = options.cst;
                that.prj = options.prj;
                that.set('memo',options.memo);
            }
        });
});

define('WRow.Collection',['WRow.Model'], function (Model) {
    'use strict';

    return Backbone.Collection.extend(
        {
            model:Model
        });
});