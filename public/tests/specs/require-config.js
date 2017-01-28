/*jshint laxcomma:true*/
require.config({
    baseUrl: '../../../../../'
    , urlArgs: ''
    , waitSeconds: 200 //for correctly running the tests on the real website
    , paths: {
        'jasmine': 'tests/jasmine/jasmine'
        , 'jasmineHtml': 'tests/jasmine/jasmine-html'
        , 'jasmineTypeCheck': 'tests/jasmine/typechecking-matchers'
        , 'jasmineAjax': 'tests/jasmine/mock-ajax'
        , 'blanket': 'tests/blanket/blanket_custom'
        , 'underscore': 'js/libs/underscore.min'
        , 'Backbone': 'js/libs/backbone'
        , 'BackboneValidation': 'js/libs/backbone.validation'
        , 'jQuery': 'js/libs/jquery-2.2.3.min'
        , 'BigNumber': 'js/libs/bignumber'
        , 'jquery.cookie': 'js/libs/jquery.cookie'
        , 'jquery.bxslider': 'js/libs/bxslider/jquery.bxslider'
        , 'jquery.keyboard': 'js/libs/jquery.keyboard'
        , 'jquery.ui.position': 'js/libs/jquery.ui.position'
        , 'Bootstrap': 'js/libs/bootstrap.min'
        , 'moment': 'js/libs/moment'
        // Application Core
        , 'Main': 'js/src/core/Main'
        , 'ApplicationSkeleton': 'js/src/core/ApplicationSkeleton'
        , 'Application': 'js/app/Application'
        , 'ApplicationSkeleton': 'js/core/ApplicationSkeleton'
        , 'Main': 'js/core/Main'
        , 'Utils': 'js/core/Utils'
        , 'StringFormat': 'js/core/extras/String.format'
        , 'ExtrasUnderscoreTemplates': 'js/core/extras/Underscore.templates'
        , 'ExtrasApplicationSkeletonLayout.showContent': 'js/core/extras/ApplicationSkeleton.Layout.showContent'
        , 'ExtrasApplicationSkeletonLayout.showInModal': 'js/core/extras/ApplicationSkeleton.Layout.showInModal'
        , 'ExtrasBackboneView': 'js/core/extras/Backbone.View'
        , 'ExtrasBackboneView.render': 'js/core/extras/Backbone.View.render'
        , 'ExtrasBackbone.cachedSync': 'js/core/extras/Backbone.cachedSync'
        , 'ExtrasBackboneModel': 'js/core/extras/Backbone.Model'
        , 'ExtrasBackboneSync': 'js/core/extras/Backbone.Sync'
        , 'jquery.serializeObject': 'js/core/extras/jQuery.serializeObject'
        , 'jquery.ajaxSetup': 'js/core/extras/jQuery.ajaxSetup'
        , 'SPA': 'tests/specs/SPA'
        , 'WeeklyTimeLogs': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs'
        , 'WeeklyTimeLogs.Router': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs.Router'
        , 'WeeklyTimeLogs.View': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs.View'
        , 'Customers.Collection':'js/app/modules/timelogs/Customers.Collection'
        , 'Customers.Model':'js/app/modules/timelogs/Customers.Model'
        , 'Projects.Collection':'js/app/modules/timelogs/Projects.Collection'
        , 'Projects.Model':'js/app/modules/timelogs/Projects.Model'
        , 'TimeLogs.Collection':'js/app/modules/timelogs/Customers.Model'
        , 'TimeLogs.Model':'js/app/modules/timelogs/Customers.Model'
        , 'WRow.Collection':'js/app/modules/weeklytimelogs/WeeklyTimeLogs.DisplayModels'
        , 'WRow.Model': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs.DisplayModels'
        , 'WCell.Collection': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs.DisplayModels'
        , 'WCell.Model': 'js/app/modules/weeklytimelogs/WeeklyTimeLogs.DisplayModels'
    }
    , shim: {
        'jasmine': {
            exports: 'jasmine'
        }
        , 'jasmineHtml': {
            deps: ['jasmine', 'jQuery'] //jQuery is not a real dependency but we want jquery to always be present in our specs.
            , exports: 'jasmine'
        }
        , 'jasmineTypeCheck': {
            deps: ['jasmine']
            , exports: 'jasmine'
        }
        , 'jasmineAjax': {
            deps: ['jasmine']
            , exports: 'jasmine'
        }
        , 'blanket': {
            deps: ['jasmine']
            , exports: 'blanket'
        }
        , 'underscore': {
            exports: 'underscore'
        }
        , 'jQuery': {
            exports: 'jQuery'
        }
        , 'BigNumber': {
            exports: 'BigNumber'
        }
        , 'Backbone': {
            deps: ['underscore', 'jQuery']
            , exports: 'Backbone'
        }
        , 'BackboneValidation': {
            deps: ['Backbone']
        }
        , 'jquery.cookie': {
            deps: ['jQuery']
        }
        , 'jquery.bxslider': {
            deps: ['jQuery']
        }
        , 'jquery.keyboard': {
            deps: ['jQuery', 'jquery.ui.position']
        }
        , 'jquery.ui.position': {
            deps: ['jQuery']
        }
        , 'Bootstrap': {
            deps: ['jQuery']
        }
        // Application Core
        , 'Main': {
            deps: ['Backbone']
            , exports: 'SPA'
        }
        , 'ApplicationSkeleton': {
            deps: ['Main']
            , exports: 'ApplicationSkeleton'
        }
        , 'Main': {
            deps: ['SPA', 'Backbone']
        }
        , 'ApplicationSkeleton': {
            deps: ['Backbone', 'Utils']
        }
        , 'Utils': {
            deps: ['underscore', 'jQuery', 'StringFormat', 'Backbone', 'BackboneValidation']
        }
        , 'Application': {
            deps: ['ApplicationSkeleton', 'Main', 'Backbone', 'ExtrasApplicationSkeletonLayout.showContent',
                'ExtrasBackboneView.render', 'ExtrasApplicationSkeletonLayout.showInModal', 'ExtrasBackboneView',
                'ExtrasUnderscoreTemplates']
        }
        , 'ExtrasApplicationSkeletonLayout.showInModal': {
            deps: ['ApplicationSkeleton', 'Bootstrap']
        }
        , 'jquery.ajaxSetup': {
            deps: ['Utils']
        }
        , 'ExtrasBackboneModel': {
            deps: ['Backbone']
        }
        , 'Backbone.View.saveForm': {
            deps: ['ErrorManagement', 'jquery.serializeObject']
        }
        , 'ExtrasBackboneValidationCallbacks': {
            deps: ['BackboneValidation', 'Backbone']
        }
        , 'ExtrasBackboneSync': {
            deps: ['Backbone']
        }
        , 'ExtrasBackbone.cachedSync': {
            deps: ['Backbone']
        }
        , 'ExtrasApplicationSkeletonLayout.showContent': {
            deps: ['ApplicationSkeleton', 'Backbone']
        }
        , 'ExtrasUnderscoreTemplates': {
            deps: ['Main'] //important !
        }
        , 'ExtrasBackboneView.render': {
            deps: ['ExtrasBackboneView', 'ExtrasUnderscoreTemplates', 'BackboneValidation']
        }
        , 'ExtrasBackboneView': {
            deps: ['Backbone']
        }
        , 'WeeklyTimeLogs': {
            deps: ['WeeklyTimeLogs.Router']
        }
        , 'WeeklyTimeLogs.Router': {
            deps: ['Backbone','Customers.Collection', 'Projects.Collection', 'TimeLogs.Collection', 'WeeklyTimeLogs.View']
        }
        , 'WeeklyTimeLogs.View': {
            deps: ['Backbone','WCell.Model', 'WCell.Collection', 'WRow.Model', 'WRow.Collection']
        }
        , 'Customers.Collection': {
            deps: ['Backbone','Customers.Model','SPA']
        }
        , 'Customers.Model': {
            deps: ['Backbone']
        }
        , 'Projects.Collection': {
            deps: ['Backbone','Projects.Model','SPA']
        }
        , 'Projects.Model': {
            deps: ['Backbone']
        }
        , 'TimeLogs.Model': {
            deps: ['Backbone']
        }
        , 'TimeLogs.Collection': {
            deps: ['Backbone','TimeLogs.Model']
        }
        , 'WRow.Collection': {
            deps: ['Backbone','WRow.Model']
        }
        , 'WRow.Model': {
            deps: ['Backbone','WCell.Model', 'WCell.Collection']
        }
        , 'WCell.Collection': {
            deps: ['Backbone','WCell.Model']
        }
        , 'WCell.Model': {
            deps: ['Backbone','TimeLogs.Model']
        }
    }
});