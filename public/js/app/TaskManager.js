(function (application) {
    'use strict';

    var _logModel = Backbone.Model.extend({
        initialize: function (attrs, options) {
            _logModel.__super__.initialize.apply(this, arguments);

            if (options.userid === void(0)) {
                throw _.createError('MISSING_USER_ID', 'missing user id');
            }

            if (options.sessionid === void(0)) {
                throw _.createError('MISSING_SESSION_ID', 'missing session id');
            }

            this.userid = options.userid;
            this.sessionid = options.sessionid;
        },

        url: SPA.ENVIRONMENT.spaSettings.touchpoints.router_rest,

        saveDiagnostic: function () {
            var that = this;
            var diagnosticUrl = SPA.ENVIRONMENT.spaSettings.touchpoints.router_rest,
                postData = _.extend({p: 'diagnostic'}, that.toJSON());

            Q(jQuery.ajax({
                url: diagnosticUrl,
                method: 'POST',
                dataType: 'json',
                headers: {
                    Accept: "application/json; charset=utf-8",
                    "Content-Type": "application/json; charset=utf-8"
                },
                data: JSON.stringify(postData)
            })).then(function (pvalue) {
                if (!pvalue.success) {
                    dfd.reject('Diagnostic communication error.');
                }
                dfd.resolve(events);
            }, function (reason) {
                dfd.reject('Diagnostic communication error.');
            }).fail(function (reason) {
                dfd.reject('Diagnostic communication error.');
            });
        }

    });

    var _operationBase = Backbone.Model.extend({
        defaults: {
            'enabled': true
        },

        initialize: function (attrs, options) {
            var that = this;
            _operationBase.__super__.initialize.apply(that, arguments);
            that.dfd = Q.defer();
            that.promise = that.dfd.promise;
            that.promise['finally'](function () {
                that.doFinally();
            });
        },

        generateId: function () {
            return SPA.Utils.guid();
        },

        resolve: function (value) {
            var that = this;
            //console.log(that.identify() + ' resolve.');
            that.onResolve(value);
            return that.dfd.resolve.apply(that, arguments);
        },

        reject: function (reason) {
            var that = this;
            console.log(that.identify() + ' fail.');
            console.log(reason);
            that.onReject(reason);
            return that.dfd.reject.apply(that, arguments);
        },

        notify: function (progressInfo) {
            var that = this;
            //console.log(that.identify() + ' notify: ' + progressInfo);
            that.dfd.notify.apply(that, arguments);
            return that.onNotify(progressInfo);
        },

        doFinally: function () {
            var that = this;
            that.onFinally();
        }
    }, {objType: "OperationBase"});

    var _operation = _operationBase.extend({

        idAttribute: 'opid',

        initialize: function (attrs, options) {
            var that = this;
            _operation.__super__.initialize.apply(that, arguments);
            if (!options.owner) {
                that.reject(taskCtx.createReason('MISSING_OPERATION_OWNER'));
                return false;
            }
            that.owner = options.owner;
            that.set({opid: that.generateId()}, {silent: true});
        },

        validate: function (attrs) {
            if (!attrs || !attrs.opid) {
                return 'Invalid anonymous operation';
            }
        },

        identify: function () {
            return 'SPA Operation [type:' + this.get('type') + ',type: ' + this.id + ']';
        },

        onResolve: function (pvalue) {

        },

        onReject: function (reason) {

        },

        onNotify: function (progressInfo) {
            this.owner.notify(progressInfo);
        },

        onFinally: function () {

        }

    }, {objType: "Operation"});

    var _task = _operationBase.extend({

        idAttribute: 'tid',

        initialize: function (attrs, options) {
            var that = this;
            _task.__super__.initialize.apply(that, arguments);
            that.set({tid: that.generateId()}, {silent: true});
            if (!options.manager) {
                throw _.createError('MISSING_MANAGER');
            }
            that.manager = options.manager;
            if (!options.client) {
                throw _.createError('MISSING_CLIENT');
            }
            that._client = options.client;
            that.operations = [];
            that.context = that._buildContext();
        },

        getClient: function () {
            return this._client;
        },

        validate: function (attrs) {
            if (!attrs || !attrs.type) {
                return 'Invalid task';
            }
        },

        identify: function () {
            return 'SPA Task [type:' + this.get('type') + ', tid: ' + this.id + ']';
        },

        createOp: function (attrs, options) {
            var that = this;
            var operation = new _operation(attrs, _.extendObj(options, {owner: that}));
            that.operations.push(operation);
            return operation;
        },

        ctx: function () {
            return this.context;
        },

        _buildContext: function () {
            var that = this;
            return {
                tid: that.id,

                type: that.get('type'),

                promise: that.promise,

                notify: function (progressInfo) {
                    that.notify(progressInfo);
                },

                newOp: function (attrs, options) {
                    return that.createOp(attrs, options);
                },

                createReason: function (code, inner) {
                    return that.manager.createReason(code, inner);
                },

                createInfo: function (token, needLoc) {
                    return that.manager.createInfo(token, needLoc);
                }
            }
        },

        onResolve: function (pvalue) {

        },

        onReject: function (reason) {
            console.log('ft', reason);
            this.manager.notifyRejection(this, reason);
        },

        onNotify: function (progressInfo) {
            this.manager.notifyProgress(this, progressInfo);
        },

        onFinally: function () {
            var that = this;
            that.trigger('end', that);
        },

        fix: function (reason) {
            var that = this;
            return that.manager.fixReason(reason);
        },

        handled: function (obj) {
            var that = this;
            return that.manager.markAsHandled(obj);
        }

    }, {objType: "Task"});


    var TM = function (application, options) {
        var that = this;
        that.application = application;
        that._currentSequenceTask = null;
        that._progressTask = null;
        that.sessionid = options.sessionid;
        that._loadRef = 0;
    };

    _.extend(TM.prototype, {
        exec: function (client, ttype, fn) {
            var that = this;
            return that.createTask(client, {type: ttype}).then(
                function (task) {
                    try {
                        var ret = fn(task.ctx());
                        if (ret && ret.then) {
                            ret.then(
                                function (pvalue) {
                                    task.resolve(pvalue);
                                },
                                _.taskReject(task)
                            );
                        }
                        else {
                            task.resolve(ret);
                        }
                    }
                    catch (err) {
                        task.reject(that.createReason('EXEC_ERROR', err));
                    }
                });
        },

        createTask: function (client, attrs, options) {
            var that = this;
            if (!that.isStarted()) {
                throw that.createReason('TASKS_STOPPED', 'task manager not started.');
            }
            if (!client || !attrs || !attrs.type) {
                throw that.createReason('TASK_CREATE_ERROR', 'missing arguments.');
            }

            return that.onCreateTask.apply(that, arguments);
        },

        onCreateTask: function (client, attrs, options) {
            var that = this;
            var ttype = attrs.type;
            var dfdTaskCreate = that.createDefer();
            dfdTaskCreate.promise.fail(function (reason) {
                that.handleError(that.getMandate(), reason);
            });

            try {
                switch (ttype) {
                    case  'SESSION':
                        that._createSessionTask(client, dfdTaskCreate, attrs, _.extend(options || {}, {
                            manager: that,
                            system: true
                        }));
                    case 'TASK_MANAGER':
                        that._createTaskManager(client, dfdTaskCreate, attrs, _.extend(options || {}, {
                            manager: that,
                            system: true
                        }));
                        break;
                    case 'SURROGATE':
                        return that._createTaskModel(client, attrs, _.extend(options || {}, {
                            manager: that,
                            system: true
                        }));
                        break;
                    default:
                        that._createSimpleSequentialTask(client, dfdTaskCreate, attrs, options);
                        break;
                }
            }
            catch (err) {
                dfdTaskCreate.reject(that.createReason('TASK_CREATE_ERROR', err));
            }

            return dfdTaskCreate.promise;
        },

        _createSimpleSequentialTask: function (client, dfdTaskCreate, attrs, options) {
            var that = this;
            var opt = _.extend(options || {}, {manager: that});
            if (that._currentSequenceTask) {
                that._currentSequenceTask.promise.then(function (pvalue) { //.delay(3000) before .then
                        that._currentSequenceTask = that._createTaskModel(client, attrs, opt);
                        return dfdTaskCreate.resolve(that._currentSequenceTask);
                    },
                    function (reason) {
                        if (that.isSequenceStarted()) {
                            dfdTaskCreate.resolve(that._currentSequenceTask = that._createTaskModel(client, attrs, opt));
                        }
                        else {
                            dfdTaskCreate.reject(that.createReason('TASKS_STOPPED', reason));
                        }
                    });
            }
            else {
                dfdTaskCreate.resolve(that._currentSequenceTask = that._createTaskModel(client, attrs, opt));
            }
        },

        _createSimpleSequentialProgressTask: function (client, dfdTaskCreate, attrs, options) {
            var that = this;
            var opt = _.extend(options || {}, {manager: that});
            if (that._progressTask) {
                that._progressTask.promise.then(function (pvalue) { //.delay(3000) before .then
                        that._progressTask = that._createTaskModel(client, attrs, opt);
                        return dfdTaskCreate.resolve(that._progressTask);
                    },
                    function (reason) {
                        if (that.isSequenceStarted()) {
                            dfdTaskCreate.resolve(that._progressTask = that._createTaskModel(client, attrs, opt));
                        }
                        else {
                            dfdTaskCreate.reject(that.createReason('TASKS_STOPPED', reason));
                        }
                    });
            }
            else {
                dfdTaskCreate.resolve(that._progressTask = that._createTaskModel(client, attrs, opt));
            }
        },

        isSequenceStarted: function () {
            var that = this;
            return true;
        },

        _createTaskManager: function (client, dfdTaskCreate, attrs, options) {
            var that = this;
            if (client.getRoles() === 'TASK_MANAGER') {
                dfdTaskCreate.resolve(that._createTaskModel(client, attrs, options));
            }
            else {
                dfdTaskCreate.reject(that.createReason('UNAUTHORIZED_TASK'));
            }
        },

        _createSessionTask: function (client, dfdTaskCreate, attrs, options) {
            var that = this;
            if (!that._sessionTask) {
                that.sessionTask = that._createTaskModel(client, attrs, options);
                dfdTaskCreate.resolve(that.sessionTask);
            }
            else {
                dfdTaskCreate.reject(that.createReason('DUPLICATED_SESSION'));
            }
        },

        _createTaskModel: function (client, attrs, options) {
            var that = this;
            var opt = _.extend(options || {}, {client: client});
            var newTask = new _task(attrs, opt);
            if (!options.system) {
                that.onTaskBegin(newTask, options);
                newTask.on('end', that.onTaskEnd, that, options);
            }
            return newTask;
        },

        createReason: function (code, inner) {
            var tm = this;
            return {
                isReason: true,
                code: code,
                inner: inner,
                toString: function () {
                    return code;
                },
                match: function () {
                    return tm.matchReason.bind(tm, this).apply(this, arguments);
                }
            }
        },

        createInfo: function (token, needLocalization) {
            var loc = true;
            var msg = token;
            if (needLocalization === false) {
                loc = false;
            }
            else {
                msg = token;
            }

            return {
                toLocalize: loc,
                msg: msg
            }
        },

        getIdentifier: function () {
            return 'SIMPLE_MANAGER';
        },

        getRoles: function () {
            return 'TASK_MANAGER';
        },

        createDefer: function () {
            return Q.defer();
        },

        start: function (superior) {
            var that = this;
            if (!that.isDirector()) {
                if (!superior) {
                    throw that.createReason('MISSING_MANAGER');
                }
                that._superior = superior;
                return that._superior.createTask(that, {type: 'TASK_MANAGER'}).then(
                    function (mandate) {
                        that._mandate = mandate;
                        that._mandate.promise.fail(function (reason) {
                            that.stopManager();
                            delete this._mandate;
                        });
                        that.onStart();
                        return that;
                    }
                );
            }
            else {
                that._mandate = that.createDefer();//TODO ?
                that._mandate.promise.fail(function (reason) {
                    that.stopManager();
                    delete that._mandate;
                });
                that._surrogateTask = that.createTask(that, {type: 'SURROGATE'});
                window.onerror = function (err, url, lineNumber) {
                    alert(err.toString());
                    that._surrogateTask.reject(that.createReason('WINDOW_ONERROR', {
                        error: err,
                        url: url,
                        line: lineNumber
                    }));
                };
                that.onStart();
                return Q.resolve(that);
            }
        },

        notifyRejection: function (task, reason) {
            var that = this;
            that.onNotifyRejection.apply(that, arguments);
        },

        onNotifyRejection: function (task, reason) {
            var that = this;
            var msg;
            if (msg = that._preFilterNotifiedRejection(task, reason)) {
                that._showErrorAndStopManager(msg);
                return false;
            }

            task.promise.fail(function (reason) {
                try {
                    if (!that.isFixed(reason) && !that.handleRejection(reason)) {
                        that.handleError(task, reason);
                    }
                }
                catch (err) {
                    that._unhandled(err);
                }
                return reason;
            });
        },

        _preFilterNotifiedRejection: function (task, reason) {
            var msg;
            if (task.get('type') === 'SESSION') {
                msg = 'invalid session';
            }
            /*if (SPA.Config.policies.isDisabledUser(reason)) {
             var locObj = SPA.Utils.tryLoc('SPA.errors:DISABLED_USER', {
             MSG: 'Sorry, your account appears to be inactive.',
             SUPPORT: 'Please contact the <a target=\'_blank\' href=\'mailto: {MAIL}\'>support</a>'
             });
             msg = locObj.MSG + '<br/>' + locObj.SUPPORT.replace('{MAIL}', SPA.Config.support.contacts);
             }*/

            return msg;
        },

        _showErrorAndStopManager: function (msg) {
            var that = this;
            _.delay(function () {
                that.showMessage('error', msg, {closable: false});
            }, 0);
            that.stopManager();
            SPA.disposed = true;
        },

        notifyProgress: function (task, progressInfo) {
            var that = this;
            that.onNotifyProgress.apply(that, arguments);
        },

        onNotifyProgress: function (task, progressInfo) {
            var that = this;
            if (progressInfo && !that.isHandled(progressInfo)) {
                that.handleProgress(task, progressInfo);
            }
        },

        handleProgress: function (task, progressInfo) {
            var that = this;
            var dfdProgressTaskCreate = that.createDefer();
            dfdProgressTaskCreate.promise.fail(function (reason) {
                that.handleError(that.getMandate(), reason);
            });
            try {
                that._createSimpleSequentialProgressTask(that, dfdProgressTaskCreate, {type: '__PROGRESS'});
            }
            catch (err) {
                dfdProgressTaskCreate.reject(that.createReason('PROGRESS_TASK_CREATE_ERROR', err));
            }

            dfdProgressTaskCreate.promise.then(
                function (progressTask) {
                    try {
                        return progressTask.resolve(that.onHandleProgress(progressInfo));
                    }
                    catch (err) {
                        return progressTask.reject(that.createReason('JS_ERROR', err));
                    }
                }
            );
        },

        onStart: function () {
        },

        stopManager: function () {
            this.onStopManager();
        },

        isStarted: function () {
            return this._mandate != void(0) && this._mandate.promise.isPending();
        },

        handleRejection: function (reason) {
            if (reason.isReason) {
                switch (reason.code) {
                    case 'TEST':
                        _.taskCriticalEscalation(reason);
                        return true;
                        break;
                    default:
                        return false;
                }
            }
            else {
                if (SPA.Utils.isXHR(reason)) {
                    return false;
                }
            }
        },

        isFixable: function (reason) {
            return true;
        },

        showMessage: function (type, message, options) {
            SPA.showInfo(type, null, message, options);
        },

        onHandleProgress: function (progressInfo) {
            return Q(this.application.getLayout().notifyProgress(progressInfo));
        },

        onTaskBegin: function (task, options) {
            var that = this;
            if (task.get('type') === '__PROGRESS') {
                return false;
            }
            if (options.hideLoading) {
                task.hideLoading = options.hideLoading;
                return false;
            }
            that._loadRef++;
            that._ensureLoading(task);
        },

        onTaskEnd: function (task) {
            var that = this;
            if (task.get('type') === '__PROGRESS' || task.hideLoading === true) {
                return false;
            }
            that._loadRef--;
            if (that._loadRef === 0) {
                that._stopLoading(task);
            }
        },

        _ensureLoading: function (task) {
            var that = this;
            that.application.getLayout().startLoading();
        },

        _stopLoading: function (task) {
            var that = this;
            that.application.getLayout().stopLoading();
        },

        onHandleError: function (task, reason) {
            var that = this;
            return Q.fcall(function () {
                if (!SPA.disposed) {
                    SPA.disposed = true;
                    var logMsg = that.buildLogMessage(task, reason);
                    that._showFatalError(task, reason, logMsg);
                    that.saveToLog(task, reason, logMsg);
                }
            });
        },

        _showFatalError: function (task, reason, logMsg) {
            var that = this;
            try {
                if (!that.template) {
                    var txtTpl = SPA.templates.critical_error_tmpl;
                    if (txtTpl.indexOf('{{-') >= 0) {
                        that.template = that.getSafeGuardTemplate();
                    }
                    else {
                        that.template = _.template(txtTpl);
                    }
                }
            }
            catch (err) {
                that.template = that.getSafeGuardTemplate();
            }
            var visibleDetails = JSON.stringify(that.getVisibleDetails(logMsg));
            var visible_diagnostics = that.application.getConfig().sync.conventions.diagnostics.getVisibleDetails(task, reason);
            var output = that.template({
                task: task,
                reason: reason,
                diagnostics: visible_diagnostics,
                details: visibleDetails
            });
            that.application.getLayout().showError({
                content: output,
                overlayClosesOnClick: false,
                appendLocation: '#critical_alert'
            });
        },

        getVisibleDetails: function (logMsg) {
            try {
                if (SPA.isDebug()) {
                    return logMsg;
                }
                return {errorCode: logMsg.id};
            }
            catch (err) {
                return {errorCode: 'unknown'};
            }
        },

        getSafeGuardTemplate: function () {
            return _.template('<div class=\"modal-header\">\r\n        <h4>Critical error<\/h4>\r\n        <p>Sorry, some critical error occurred and the application can\'t continue.<\/p>\r\n        <p><%=reason.code%><\/p>\r\n    <\/div>\r\n    <div class=\"modal-body\">\r\n        <h2>Please, what are you doing when the error occurred ?<\/h2>\r\n        <textarea rows=\"3\" cols=\"175\" placeholder=\"Error description\"><\/textarea>\r\n        <br\/>\r\n        <div><a href=\"#\" id=\"btnSend\">Send<\/a><\/div>\r\n    <\/div>\r\n    <div class=\"modal-footer\">\r\n        <div class=\"details\">\r\n            <a href=\"javascript:void(0)\" onclick=\"jQuery(\'#modal_view_details\').show();\" class=\"btn btn-primary btn-circle\"><\/a>\r\n            Details\r\n        <\/div>\r\n        <div class=\"reload\">\r\n            <a href=\"#\" class=\"btn btn-reload\"  id=\"btnReload\">\r\n                Reload\r\n            <\/a>\r\n            <a href=\"#\" id=\"btnHome\" data-dismiss=\"modal\" class=\"btn btn-reload\">Home<\/a>\r\n        <\/div>\r\n    <\/div>\r\n    <div id=\"modal_view_details\" class=\"modal-footer view-details\">\r\n        <textarea rows=\"5\" cols=\"175\"><%=details%><\/textarea>\r\n    <\/div>');
        },

        saveToLog: function (task, reason, logMsg) {
            var that = this;
            var id = (logMsg && logMsg.id) ? logMsg.id : SPA.Utils.guid();
            var userid = SPA.getProfile().user;
            var title = that.application.getConfig().sync.conventions.diagnostics.log.errors.getLogTitle(task, 'SPA_FATAL_ERROR', reason, userid, 'TODO_SPA_sessionid', that._shortenizeToken(that.sessionid));
            var log = new _logModel({
                    logid: id,
                    type: 'ERROR',
                    title: title,
                    details: logMsg || that.buildLogMessage(task, reason)
                },
                {
                    userid: userid, sessionid: that.sessionid
                }
            );
            return Q(log.saveDiagnostic());
        },

        _shortenizeToken: function (cc) {
            if (cc.length > 10) {
                return cc.slice(0, 5) + '...' + cc.slice(cc.length - 5, cc.length)
            }
            else {
                return cc;
            }
        },

        buildLogMessage: function (task, reason) {
            var that = this;
            var userid = SPA.getProfile().user;
            return {
                id: SPA.Utils.guid(),
                ctx: {
                    env: 'TODO',
                    isDev: SPA.ENVIRONMENT.serverSettings.isDevEnvironment,
                    mode: 'BUILD_MODE',
                    userid: userid,
                    sessionid: that.sessionid,
                    agent: navigator.userAgent,
                    href: document.location.href,
                    error_time: (new Date()).toString('yyyy-MM-ddTHH:mm:ss')
                },
                details: {
                    tid: task.id,
                    type: task.get('type'),
                    code: reason.code || '-',
                    stack: that.buildStackTrace(reason)
                }
            };
        },

        buildStackTrace: function (reason) {
            var that = this;
            var stack = [], currErr = reason, stop = false;
            while (!stop) {
                if (currErr) {
                    stack.push(that.formatStackEntry(currErr));
                    if (currErr.isReason) {
                        currErr = currErr.inner;
                    }
                    else {
                        stop = true;
                    }
                }
                else {
                    stop = true;
                }
            }
            return stack;
        },

        formatStackEntry: function (err) {
            if (err.isReason) {
                var st = err.stack;
                return st || err.toString();
            }
            else if (SPA.Utils.isXHR(err)) {
                return {
                    failedUrl: err.failedUrl,
                    readyState: err.readyState,
                    status: err.status,
                    statusText: err.statusText
                }
            }
            else {
                var st = err.stack;
                return st || err;
            }
        },

        errRestart: function (e) {
            window.location.hash = 'home';
            window.location.reload();
        },

        errReload: function (e) {
            window.location.reload();
        },

        sendErrorFeedback: function (e) {
            var that = this;
            var subject = _.template(SPA.Config.support.errorFeedback.subjectTemplate, {});
            var body = _.template(SPA.Config.support.errorFeedback.bodyTemplate, {
                userid: SPA.getProfile().user,
                etime: (new Date()).toString('u'),
                feedback: $(that.$('textarea')[0]).val(),
                trace: $(that.$('textarea')[1]).val()
            });
            //SPA.Utils.prepareEmail(SPA.Config.support.contacts, subject, body);
            that._fakeSend();
        },

        _fakeSend: function () {
            var that = this;
            var origText = that.$('#btnSend').text();
            that.$('#btnSend').text('Sending feedback...');
            _.delay(function () {
                that.$('#btnSend').text(origText);
                $(that.$('textarea')[0]).val('');
            }, 2000);
        },

        fixReason: function (reason) {
            var that = this;
            try {
                if (that.isFixable(reason)) {
                    reason.__fixed__ = true;
                    that.application.getLayout().stopLoading();
                    return Q.resolve(that);
                }
                else {
                    return Q.reject(reason);
                }
            }
            catch (err) {
                return Q.reject(err);
            }
        },

        markAsHandled: function (obj) {
            obj.__handled = true;
        },

        isHandled: function (obj) {
            return obj && obj.__handled === true;
        },

        isFixed: function (reason) {
            return reason && reason.__fixed__ === true;
        },

        isDirector: function () {
            return true;
        },

        getSuperior: function () {
            return this._superior;
        },

        getMandate: function () {
            return this._mandate;
        },

        matchReason: function (reason, tokens) {
            var that = this;
            var routeItems = [];
            var currErrObj = reason;
            var lastMatched;
            if (_.isString(tokens)) {
                routeItems.push(tokens);
            }
            else {
                routeItems = _.clone(tokens);
            }

            for (var n = 0; n < routeItems.length && currErrObj; n++) {
                var token = routeItems[n];
                if (!that.matchErrorCode(currErrObj, token)) {
                    return false;
                }
                else {
                    lastMatched = currErrObj;
                    currErrObj = currErrObj.inner;
                }
            }

            return lastMatched;
        },

        matchErrorCode: function (errObj, code) {
            return errObj && errObj.code === code;
        },

        handleError: function (task, reason) {
            var that = this;
            if (task && task.getClient) {
                var client = task.getClient();
                if (client && client.safeGuard) {
                    try {
                        client.safeGuard();
                    }
                    catch (err) {
                        console.log('Some error during safeGuard of client : ' + client);
                        //silent for security reason!
                    }
                }
            }

            var currTask = task || that._surrogateTask;

            that.onHandleError(currTask, reason).then(
                function (pvalue) {
                    that.onAfterHandleError(reason);
                },
                function (reason) {
                    that.onUnhandledError(reason);
                }
            );
        },

        onAfterHandleError: function (reason) {
            var that = this;
            that.getMandate().reject(reason);
        },

        onUnhandledError: function (reason) {
            var that = this;
            that._unhandled(reason);
        },

        _unhandled: function (err) {
            //alert(JSON.stringify(err));
        },

        onStopManager: function () {
            Backbone.history.stop();
        },

        onClose: function () {
        }
    });

    application.TM = new TM(application, {sessionid: _.getSessionId()});

})(SPA.Application('TimeLogs'));