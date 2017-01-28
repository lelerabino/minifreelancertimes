// ApplicationSkeleton.js
// --------------------
// Testing Core
define(['Application', 'jasmineTypeCheck'], function ()
{

	'use strict';

	describe('SPA (Name Space)', function () {

		it('#1 should be named SPA and it should be an object', function ()
		{
			expect(SPA).toBeAnObject();
		});

		it('#2 should provide an application creation method called SPA.Application', function ()
		{
			expect(SPA.Application).toBeA(Function);
		});

		it('#4 should provide a SPA.Singleton class', function ()
		{
			expect(SPA.Singleton).toBeAnObject();
		});

		it('#5 should provide a SPA.template method', function ()
		{
			expect(SPA.template).toBeA(Function);
		});

		it('#6 should provide a SPA.macros object', function ()
		{
			SPA.compileMacros([]);
			expect(SPA.macros).toBeAnObject();
		});

	});

	describe('SPA.Application', function () {

		var application;

		beforeEach(function () {
			// Defines a Class
			application = SPA.Application('Application');
		});

		it('#1 should create an instance of SPA.ApplicationSkeleton', function ()
		{
			expect(application).toBeA(SPA.ApplicationSkeleton);
		});

		it('#2 should return the same instance for different calls with the same application name', function ()
		{
			application.prop = 1;
			var application2 = SPA.Application('Application');

			expect(application2.prop).toEqual(application.prop);
		});

		it('#3 require should be a function', function ()
		{
			expect(require).toBeA(Function);
		});

		it('#4 should provide a configuration object', function ()
		{
			expect(application.getConfig()).toBeAnObject();
		});

		it('#5 should provide a configuration object that is extendable', function ()
		{
			_.extend(application.Configuration, {
				prop: 1
			});

			expect(application.getConfig('prop')).toEqual(1);
		});

		it('#6 should be an event emiter (on, trigger)', function ()
		{
			var cb = jasmine.createSpy();

			application.on('event', cb);
			application.trigger('event');

			expect(cb).toHaveBeenCalled();
		});

		it('#7 should provide a getLayout method that returns the a layout object', function ()
		{
			expect(application.getLayout).toBeA(Function);
			expect(application.getLayout()).toBeAnObject();
			expect(application.getLayout()).toBeA(application.Layout);
		});

		it('#8 should provide a configuration value, if the attribute is not present in the configuration file return null', function ()
		{
			expect(application.getConfig('no-attr')).toEqual(null);
		});
		it('#9 should provide a configuration value, if the attribute is not present in the configuration file return default option', function ()
		{
			expect(application.getConfig('no-attr','default-option')).toEqual('default-option');
		});

		it('#10 configuration should support nested object easy access', function ()
		{
			_.extend(application.Configuration, {
				foo: {bar: {goo: 3.14}}
			});

			expect(application.getConfig('foo.bar.goo')).toEqual(3.14);
		});

		it('#11 Application.getUser()', function ()
		{
			expect(application.getUser).toBeA(Function);
			expect(application.getUser()).toBeA(Object);
		});

	});



	describe('SPA.Application.getLayout', function ()
	{
		var application;

		beforeEach(function () {
			// Defines a Class
			application = SPA.Application('Application');
		});

		it('#1 should provide an appendToDom method', function ()
		{
			expect(application.getLayout().appendToDom).toBeA(Function);
		});

		it('#2 should provide an showContent method', function ()
		{
			expect(application.getLayout().showContent).toBeA(Function);
		});

		it('#3 should provide an showInModal method', function ()
		{
			expect(application.getLayout().showInModal).toBeA(Function);
		});

		it('#4 should provide an showError method', function ()
		{
			expect(application.getLayout().showError).toBeA(Function);
		});

	});

	describe('SPA.Singleton', function () {

		var test_class;

		beforeEach(function () {
			// Defines a Class
			test_class = function TestClass() { };
			// Extends it with the Singleton
			_.extend(test_class, SPA.Singleton);
		});

		it('#1 should provide getInstance method', function ()
		{
			expect(SPA.Singleton.getInstance).toBeA(Function);
		});

		it('#2 should be extendable by other Classes using _.extend(Class, SPA.Singleton)', function ()
		{
			expect(test_class.getInstance).toBeA(Function);
		});


		it('#3 should be extendable by a Backbone View by Calling Backbone.View.extend({}, SPA.Singleton)', function ()
		{
			var view = Backbone.View.extend({}, SPA.Singleton);
			expect(view.getInstance).toBeA(Function);
		});

		it('#4 should be extendable by a Backbone Model by Calling Backbone.Model.extend({}, SPA.Singleton)', function ()
		{
			var model = Backbone.Model.extend({}, SPA.Singleton);
			expect(model.getInstance).toBeA(Function);
		});

		it('#5 should be extendable by a Backbone Collection by Calling Backbone.Collection.extend({}, SPA.Singleton)', function ()
		{
			var collection = Backbone.Collection.extend({}, SPA.Singleton);
			expect(collection.getInstance).toBeA(Function);
		});

		it('#6 should be extendable by a Backbone Router by Calling Backbone.Router.extend({}, SPA.Singleton)', function ()
		{
			var router = Backbone.Router.extend({}, SPA.Singleton);
			expect(router.getInstance).toBeA(Function);
		});
	});
	describe('SPA.Singleton.getInstance', function () {

		var TestClass;

		beforeEach(function () {
			// Defines a Class
			TestClass = function TestClass() { };
			// Extends it with the Singleton
			_.extend(TestClass, SPA.Singleton);
		});


		it('#1 should return an instance from the extended class (Class.getInstance)', function ()
		{
			expect(TestClass.getInstance()).toBeA(TestClass);
		});

		it('#2 should return allways the same instance (Class.getInstance() === Class.getInstance())', function ()
		{
			expect(TestClass.getInstance()).toBe(TestClass.getInstance());
		});

		it('#3 should return allways the same instance (Class.getInstance().prop === Class.getInstance().prop)', function ()
		{
			var test1 = TestClass.getInstance(),
				test2 = TestClass.getInstance();

			test1.prop = 1;

			expect(test2.prop).toBe(1);
		});

		it('#4 should return a different instance than new Class (Class.getInstance().prop !== new Class().prop)', function ()
		{
			var test1 = TestClass.getInstance(),
				test2 = new TestClass();

			expect(test1).not.toBe(test2);
		});


	});


	describe('SPA.Application().start', function () {

		var application
		,	is_started = false
		,	callback = {
				beforeStartIsCalled: false
			,	afterStartIsCalled: false
			,	afterModulesLoadedIsCalled: false
			,	beforeStart : function(){ callback.beforeStartIsCalled = true; }
			,	afterStart : function(){ callback.afterStartIsCalled = true; }
			,	afterModulesLoaded : function(){ callback.afterModulesLoadedIsCalled = true; }
			};
		beforeEach(function () {
			// Create sapplication

			define('Dummy', function(){
				return {
					mountToApp: function () {
						var Router = Backbone.Router.extend({
							routes: {
								dummytest: function () {}
							}
						});

						return new Router();
					}
				};
			});

			application = SPA.Application('ApplicationTestStart');
			application.Configuration = {
				modules: [
					'Dummy'
				]
			,	siteSettings:{
				}
			};

			// Makes spy out of our applications booting functions

			application.on('beforeStart', callback.beforeStart);
			application.on('afterStart', callback.afterStart);
			application.on('afterModulesLoaded', callback.afterModulesLoaded);

			jQuery(application.start(function()
			{
				is_started = true;

			}));

			waitsFor( function(){
				return is_started && callback.afterStartIsCalled ;
			});

		});

		it('#1 it should fire a "beforeStart" event', function ()
		{
			expect(callback.beforeStartIsCalled).toBe(true);
		});

		it('#2 it should fire a "afterStart" event', function ()
		{
			expect(callback.afterStartIsCalled).toBe(true);
		});

		it('#3 it should fire a "afterModulesLoaded" event', function ()
		{
			expect(callback.afterModulesLoadedIsCalled).toBe(true);
		});
	});

});