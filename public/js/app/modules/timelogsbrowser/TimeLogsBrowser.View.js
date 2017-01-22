// TimeLogsBrowser.View.js
// -------------------
// Handles the related view
define('TimeLogsBrowser.View', function () {
    'use strict';


    return Backbone.View.extend({

        template: 'timelogs_browser'

        , title: _('TimeLogsBrowser').translate()

        , page_header: _('TimeLogsBrowser.View').translate()

        , events: {
            'click [data-action="wmove"]': 'moveWeek',
        }

        , initialize: function (options) {
            var that = this;
            that.application = options.application;
            that.coll = options.coll;
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

        , render: function () {
            var that = this;
            that.dirty = false;
            Backbone.View.prototype.render.apply(this, arguments);
            that.DOM._cacheEls();
            that.DOM.activateViewScripts();
            return that;
        }

        , showContent: function () {
            this.application.getLayout().showContent(this).then(function () {

            });
        }

        , destroy: function () {
            var that = this;
            console.log('destroy view');
            that._destroy();
        }
    });
});