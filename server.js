// https://devcenter.heroku.com/articles/mongolab
// http://timelogmvc.com/examples/angularjs/#/
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    basicAuth = require('basic-auth-connect'),
    Customer = require('./app/models/models').Customer,
    Project = require('./app/models/models').Project,
    timeLogsRoutes = require('./app/routes/api/timelogs'),
    customersRoutes = require('./app/routes/api/customers'),
    projectsRoutes = require('./app/routes/api/projects'),
    app = express();

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

timeLogsRoutes(app);
customersRoutes(app);
projectsRoutes(app);
// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
app.use(bodyParser.json()) // support json encoded bodies
    .use(bodyParser.urlencoded({extended: true})) // support encoded bodies

    .get('/api', function (req, res) {
        res.json(200, {msg: 'API is responding!'});
    })


    .use(basicAuth('guest', 'guest'))
    .use(express.static(__dirname + '/public'))
    .use(bodyParser())
    .use(favicon('public/favicon.ico'))
    .listen(process.env.PORT || 5000);
