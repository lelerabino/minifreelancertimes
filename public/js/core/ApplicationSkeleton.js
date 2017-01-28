// ApplicationSkeleton.js
// ----------------------
// Defines the top level components of an application
// like the name, layout, or the start function
(function () {
    'use strict';

    function ApplicationSkeleton(name) {
        // Enforces new object to be created even if you do ApplicationSkeleton() (without new)
        if (!(this instanceof ApplicationSkeleton)) {
            return new ApplicationSkeleton();
        }

        // Application Default settings:
        this.Configuration = {};

        this.name = name;
    }

    // Layout:
    // This View will be created and added to the dom as soon as the app starts.
    // All module's views will get into the dom through this view by calling
    // either showContent, showInModal, showError or other application specific method
    ApplicationSkeleton.prototype.Layout = Backbone.View.extend({
        // this is the tag asociated to the .txt file
        template: 'layout'
        // where it will be appended
        , container_element: '#main'
        // where the content (views) will be apended
        , content_element: '#content'

        , key_elements: {}

        , events: {}

        , initialize: function (Application) {
            this.events =
            {};
            this.application = Application;

            this.afterAppendViewPromise = jQuery.Deferred();
            var self = this;
            this.once('afterAppendView', function () {
                self.afterAppendViewPromise.resolve();
            });
        }

        , render: function () {
            this.trigger('beforeRender', this);

            Backbone.View.prototype.render.call(this);

            this.updateUI();

            this.trigger('afterRender', this);
        }

        , updateHeader: function () {

            this.$('.site-header').html(SPA.macros.header(this));
            this.updateUI(); //notify the layout we have change its internal DOM
        }

        , updateFooter: function () {
            this.$('.site-footer').html(SPA.macros.footer(this));
            this.updateUI(); //notify the layout we have change its internal DOM
        }

        // update the internal dom references (this.key_elements) . Since this method (should) is called when important markup is updated/added dynamically it is wrapped by those modules who need to enrich the content like the Content Delivery module.
        , updateUI: function () {
            var self = this;

            // Re-usable Layout Dom elements
            // We will generate an association to the jQuery version of the elements in the key_elements obj
            _.each(this.key_elements, function (element_selector, element_name) {
                self['$' + element_name] = self.$(element_selector);
            });

            // We need to ensure the content element is this.content_element
            // if you wish to change the selector do it directly to this prop
            this.$content = this.$(this.content_element);
            this.trigger('afterRender', this);
        }

        , appendToDom: function () {
            var self = this;
            this.afterAppendViewPromise.done(function () {

                self.trigger('beforeAppendToDom', self);

                jQuery(self.container_element).html(self.$el);

                self.trigger('afterAppendToDom', self);
            });

        }

        , getApplication: function () {
            return this.application;
        }


        // Defining the interface for this class
        // All modules will interact with the layout trough this methods
        // some others may be added as well
        , showContent: jQuery.noop
        , showInModal: jQuery.noop
        , showError: jQuery.noop
        , showSuccess: jQuery.noop

    });

    ApplicationSkeleton.prototype.getLayout = function getLayout() {
        this._layoutInstance = this._layoutInstance || new this.Layout(this);
        return this._layoutInstance;
    };


    // ApplicationSkeleton.getConfig:
    // returns the configuration object of the aplication
    // if a path is applied, it returns that attribute of the config
    // if nothing is found, it returns the default value
    ApplicationSkeleton.prototype.getConfig = function getConfig(path, default_value) {
        return _.getPathFromObject(this.Configuration, path, default_value);
    };

    ApplicationSkeleton.prototype.UserModel = Backbone.Model.extend({});

    ApplicationSkeleton.prototype.getUser = function () {

        if (!this.user_instance) {
            this.user_instance = new this.UserModel();
        }
        return this.user_instance;
    };

    // Because the application MAY load the user's profile asynchronous some modules may want to register when the profile is ready
    // to be used application.getUser(). Note: from views is OK to call getUser() directly, but for mountToApp(), please call getUserPromise() first!
    // the profile itself it is responsible of resolving the SPA.PROFILE_PROMISE global promise (like in sc.user.environment.ssp)
    ApplicationSkeleton.prototype.getUserPromise = function () {
        var self = this;
        if (!SPA.PROFILE_PROMISE) {
            SPA.PROFILE_PROMISE = jQuery.Deferred().done(function (profile) {
                self.getUser().set(profile);
            });
        }

        if (SPA.ENVIRONMENT.PROFILE && SPA.PROFILE_PROMISE.state() !== 'resolved') {
            SPA.PROFILE_PROMISE.resolve(SPA.ENVIRONMENT.PROFILE);
        }
        return SPA.PROFILE_PROMISE;
    };

    ApplicationSkeleton.prototype.start = function start(done_fn, options) {

        // trigger beforeStart before loading modules so users have a chance to include new modules at this point.
        this.trigger('beforeStart', self);

        var self = this
        // Here we will store
            , module_options = {}
        // we get the list of modules from the config file
            , modules_list = _.map(self.getConfig('modules', []), function (module) {
            // we check all the options are strings
            if (_.isString(module)) {
                return module;
            }
            // for the ones that are the expectation is that it's an array,
            // where the 1st index is the name of the modules and
            // the rest are options for the mountToApp function
            else if (_.isArray(module)) {
                module_options[module[0]] = module.slice(1);
                return module[0];
            }
        });
        if(options && options.operation) {
            notifyOnOperation(options.operation, 'Loading modules...');
        }
        // we use require.js to load the modules
        // require.js takes care of the dependencies between modules
        require(modules_list, function () {
            // then we set the modules to the aplication
            // the keys are the modules_list (names)
            // and the values are the loaded modules returned in the arguments by require.js
            self.modules = _.object(modules_list, arguments);

            self.modulesMountToAppResult = {};

            // we mount each module to our application
            _.each(self.modules, function (module, module_name) {
                // We pass the application and the arguments from the config file to the mount to app function
                var mount_to_app_arguments = _.union([self], module_options[module_name] || []);
                if (module && _.isFunction(module.mountToApp)) {
                    self.modulesMountToAppResult[module_name] = module.mountToApp.apply(module, mount_to_app_arguments);
                }
            });

            // This checks if you have registered modules
            if (!Backbone.history) {
                throw new Error('No Backbone.Router has been initialized (Hint: Are your modules properly set?).');
            }

            self.trigger('afterModulesLoaded', self);

            done_fn && _.isFunction(done_fn) && done_fn(self);

            self.trigger('afterStart', self);
        });
    };

    function notifyOnOperation(operation, msg){
        if(operation) {
            operation.notify(taskCtx.createInfo(msg, false));
        }
    }

    // We allow ApplicationSkeleton to listen and trigger custom events
    // http://backbonejs.org/#Events
    _.extend(ApplicationSkeleton.prototype, Backbone.Events);

    SPA.ApplicationSkeleton = ApplicationSkeleton;

})();

