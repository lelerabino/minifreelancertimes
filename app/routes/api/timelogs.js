TimeLog = require('../../models/models').TimeLog;

module.exports = function (app) {

    app
        .get('/api/timelogs', function (req, res) {
            // http://mongoosejs.com/docs/api.html#query_Query-find

            var query = TimeLog.find();
            if (req.query.populate) {
                query = query.populate([{path: '_cstId'}, {path: '_prjId'}]);
            }
            if (req.query.from) {
                query = query.find({date: {$gte: new Date(req.query.from)}});
            }
            if (req.query.to) {
                query = query.find({date: {$lte: new Date(req.query.to)}});
            }
            query.exec(function (err, timelogs) {
                res.json(200, timelogs);
            });
        })

        .post('/api/timelogs', function (req, res) {
            var timelog = new TimeLog(req.body);
            // http://mongoosejs.com/docs/api.html#model_Model-save
            timelog.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new timelog.");
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

}


