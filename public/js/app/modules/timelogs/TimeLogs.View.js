// TimeLogs.View.js
// -------------------
// Handles the related view
define('TimeLogs.View', function () {
    'use strict';


    return Backbone.View.extend({

        template: 'time_logs'

        , title: _('TimeLogs').translate()

        , page_header: _('TimeLogs.View').translate()

        , initialize: function (options) {
            this.application = options.application;
        }

        , showContent: function () {
            this.application.getLayout().showContent(this).then(function () {
                $('.timetext').editable({
                    success: function() {
                        //TODO
                    }
                });
            });
        }
    });
});