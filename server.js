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
    app = express(), router = express.Router();

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://admin:admin@ds117189.mlab.com:17189/minifreelancerstore', function (error) {
    if (error) console.error(error);
    else console.log('mongo connected');
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}


app.use(bodyParser.json()) // support json encoded bodies
    .use(bodyParser.urlencoded({extended: true})); // support encoded bodies

router.get('/api', function (req, res) {
    res.status(200).json({msg: 'API is responding!'});
});

router.get('/api/timelogs', timeLogsRoutes.collection.doGet);
router.post('/api/timelogs', timeLogsRoutes.collection.doPost);
router.delete('/api/timelogs', timeLogsRoutes.collection.doDelete);
router.get('/api/timelogs/:id', timeLogsRoutes.single.doGet);
router.put('/api/timelogs/:id', timeLogsRoutes.single.doPut);
router.delete('/api/timelogs/:id', timeLogsRoutes.single.doDelete);

router.get('/api/customers', customersRoutes.collection.doGet);
router.post('/api/customers', customersRoutes.collection.doPost);

router.get('/api/projects', projectsRoutes.collection.doGet);
router.post('/api/projects', projectsRoutes.collection.doPost);

app.use('/', router)
    .use(basicAuth('guest', 'guest'))
    .use(express.static(__dirname + '/public'))
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(favicon('public/favicon.ico'))
    .listen(process.env.PORT || 8000);

module.exports = app;