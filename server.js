// https://devcenter.heroku.com/articles/mongolab
// http://timelogmvc.com/examples/angularjs/#/
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    basicAuth = require('basic-auth-connect'),
    TimeLog = require('./app/models/timelog');

/*
 * I’m sharing my credential here.
 * Feel free to use it while you’re learning.
 * After that, create and use your own credential.
 * Thanks.
 *
 * MONGOLAB_URI=mongodb://example:example@ds053312.mongolab.com:53312/timeloglist
 * 'mongodb://example:example@ds053312.mongolab.com:53312/timeloglist'
 */
mongoose.connect(process.env.MONGOLAB_URI, function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

express()
// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
    .use(bodyParser.json()) // support json encoded bodies
    .use(bodyParser.urlencoded({extended: true})) // support encoded bodies

    .get('/api', function (req, res) {
        res.json(200, {msg: 'API is responding!'});
    })

    .get('/api/timelogs', function (req, res) {
        // http://mongoosejs.com/docs/api.html#query_Query-find
        TimeLog.find(function (err, timelogs) {
            res.json(200, timelogs);
        });
    })

    .post('/api/timelogs', function (req, res) {
        var timelog = new TimeLog(req.body);
        // http://mongoosejs.com/docs/api.html#model_Model-save
        timelog.save(function (err) {
            if (err) {
                handleError(res, err.message, "Failed to create new contact.");
            } else {
                res.status(201).json(timelog);
            }
        });
    })

    .delete('/api/timelogs', function (req, res) {
        // http://mongoosejs.com/docs/api.html#query_Query-remove
        TimeLog.remove({}, function (err) {
            res.json(200, {msg: 'OK'});
        });
    })

    .get('/api/timelogs/:id', function (req, res) {
        // http://mongoosejs.com/docs/api.html#model_Model.findById
        TimeLog.findById(req.params.id, function (err, timelog) {
            res.json(200, timelog);
        });
    })

    .put('/api/timelogs/:id', function (req, res) {        // http://mongoosejs.com/docs/api.html#model_Model.findById
        TimeLog.findById(req.params.id, function (err, timelog) {
            timelog.comment = req.body.comment;
            timelog.prj = req.body.prj;
            // http://mongoosejs.com/docs/api.html#model_Model-save
            timelog.save(function (err, timelog) {
                res.json(200, timelog);
            });
        });
    })

    .delete('/api/timelogs/:id', function (req, res) {
        // http://mongoosejs.com/docs/api.html#model_Model.findById
        TimeLog.findById(req.params.id, function (err, timelog) {
            // http://mongoosejs.com/docs/api.html#model_Model.remove
            timelog.remove(function (err, timelog) {
                res.json(200, {msg: 'OK'});
            });
        });
    })

    .use(basicAuth('guest', 'guest'))
    .use(express.static(__dirname + '/public'))
    .use(bodyParser())
    .use(favicon('public/favicon.ico'))
    .listen(process.env.PORT || 5000);
