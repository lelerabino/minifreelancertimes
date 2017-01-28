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
            'change #filter_cst': 'filterCustomer'
        }

        , initialize: function (options) {
            var that = this;
            that.application = options.application;
            that.coll = options.coll;
            that.filter = options.filter;
            that.filter.on('change', that.onFilterChange, that);
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

                selectCurrentFilter:function(){
                  this.$('#filter_cst').val(that.filter.get('filter').cst);
                },

                activateViewScripts: function () {
                    var that = this;
                }
            };
        }

        , onFilterChange: function () {
            var that = this;
            that.render();
        }

        , filterCustomer: function (e) {
            var that = this,
                cstFilter = that.$('#filter_cst').val();
            Backbone.history.navigate('browse?filter=' + cstFilter, {trigger: false});
            that.filter.set('filter', {cst: cstFilter});
        }

        , getFilteredTimeLogs: function () {
            var that = this;
            if (that.filter.get('filter').cst != '-') {
                return _.filter(that.coll.toJSON(), function (tl) {
                    return tl._cstId._id === that.filter.get('filter').cst
                });
            }
            else {
                return that.coll.toJSON();
            }
        }

        , render: function () {
            var that = this;
            Backbone.View.prototype.render.apply(this, arguments);
            that.DOM._cacheEls();
            that.DOM.activateViewScripts();
            that.DOM.selectCurrentFilter();
            return that;
        }

        , showContent: function () {
            this.application.getLayout().showContent(this).then(function () {

            });
        }

        , destroy: function () {
            var that = this;
            //console.log('destroy view');
            that._destroy();
        }
    });
});