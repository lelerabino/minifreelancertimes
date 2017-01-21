
// Main.js
// -------
// Defines
//  Namespace
//  a model for spaSettings (used on the Applications)
//  methods to:
//   create and get applications
//   create singletons
//   get the spaSettings
// Relinquish jQuery's control of the $ variable.
(function ()
{
    'use strict';

    // Global Name Space CLU, stands for Clustin.
    var SPA = window.SPA = _.extend(window.SPA || {}, Backbone.Events);

    // Make jQuery not use the $ alias
    //jQuery.noConflict();

    // Application Creation:
    // Applications will provide by default: Layout (So your views can talk to)
    // and a Router (so you can extend them with some nice defaults)
    // If you like to create extensions to the Skeleton you should extend SPA.ApplicationSkeleton
    SPA._applications = {};
    SPA.Application = function (application_name)
    {
        SPA._applications[application_name] = SPA._applications[application_name] || new SPA.ApplicationSkeleton(application_name);
        return SPA._applications[application_name];
    };

    // SPA.Singleton:
    // Defines a simple getInstance method for:
    // models, collections, views or any other object to use to be used as singletons
    // How to use:
    // Backbone.[Collection, Model, View].extend({Your code}, SPA.Singleton);
    // or _.extend({Object literal}, SPA.Singleton);
    SPA.Singleton = {
        getInstance: function ()
        {
            var This = this;
            this.instance = this.instance || new This();
            return this.instance;
        }
    };

    // Defines the template function as a noop, so it needs to be implemented by an extension
    SPA.template = jQuery.noop;

})();

