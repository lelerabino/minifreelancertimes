TimeLog = require('../../models/models').TimeLog;

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = {
    collection: {
        doGet: function (req, res) {
            var query = TimeLog.find().sort({date: 'desc'});
            if (req.query && req.query.populate) {
                query = query.populate([{path: '_cstId'}, {path: '_prjId'}]);
            }
            if (req.query && req.query.from) {
                query = query.find({date: {$gte: new Date(req.query.from)}});
            }
            if (req.query && req.query.to) {
                query = query.find({date: {$lte: new Date(req.query.to)}});
            }
            query.exec(function (err, timelogs) {
                if (err) {
                    handleError(res, err.message, "Failed to create new timelog.");
                } else {
                    res.status(200).json(timelogs);
                }
            });
        },
        doPost: function (req, res) {
            var timelog = new TimeLog(req.body);
            timelog.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new timelog.");
                } else {
                    res.status(201).location('/api/timelogs/' + timelog.id).json(timelog);
                }
            });
        },
        doDelete: function (req, res) {
            TimeLog.remove({}, function (err) {
                res.status(200).json({msg: 'OK'});
            });
        }
    },
    single: {
        doGet: function (req, res) {
            TimeLog.findById(req.params.id, function (err, timelog) {
                if (err) {
                    handleError(res, err.message, "Failed to get the timelog.");
                } else {
                    res.status(200).json(timelog);
                }
            });
        },
        doPut: function (req, res) {        // http://mongoosejs.com/docs/api.html#model_Model.findById
            TimeLog.findById(req.body._id, function (err, timelog) {
                if (err) {
                    handleError(res, err.message, "Failed to find the target timelog.");
                } else {
                    timelog._cstId = req.body._cstId;
                    timelog._prjId = req.body._prjId;
                    timelog.date = req.body.date;
                    timelog.duration = parseFloat(req.body.duration);
                    timelog.memo = req.body.memo;
                    // http://mongoosejs.com/docs/api.html#model_Model-save
                    timelog.save(function (err, timelog) {
                        if (err) {
                            handleError(res, err.message, "Failed to update the timelog.");
                        } else {
                            res.status(200).json(timelog);
                        }
                    });
                }

            });
        },
        doDelete: function (req, res) {
            TimeLog.findById(req.params.id, function (err, timelog) {
                if (err) {
                    handleError(res, err.message, "Failed to find the target timelog.");
                } else {
                    timelog.remove(function (err, timelog) {
                        if (err) {
                            handleError(res, err.message, "Failed to delete the timelog.");
                        } else {
                            res.status(200).json({msg: 'OK'});
                        }
                    });
                }
            });
        }
    }
};
