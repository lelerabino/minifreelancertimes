TimeLog = require('../../models/models').TimeLog;

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = {
    collection:{
        doGet:function(req, res){
            var query = TimeLog.find().sort({date: 'desc'});
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
        },
        doPost:function (req, res) {
            var timelog = new TimeLog(req.body);
            timelog.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new timelog.");
                } else {
                    res.status(201).location('/api/timelogs/' + timelog.id).json(timelog);
                }
            });
        },
        doDelete:function (req, res) {
            TimeLog.remove({}, function (err) {
                res.json(200, {msg: 'OK'});
            });
        }
    },
    single:{
        doGet:function (req, res) {
            TimeLog.findById(req.params.id, function (err, timelog) {
                res.json(200, timelog);
            });
        },
        doPost:function (req, res) {
            TimeLog.findById(req.body._id, function (err, timelog) {
                timelog._cstId = req.body._cstId;
                timelog._prjId = req.body._prjId;
                timelog.date = req.body.date;
                timelog.duration = parseFloat(req.body.duration);
                timelog.memo = req.body.memo;
                timelog.save(function (err, timelog) {
                    res.json(200, timelog);
                });
            });
        },
        doDelete:function (req, res) {
            TimeLog.findById(req.params.id, function (err, timelog) {
                timelog.remove(function (err, timelog) {
                    res.json(200, {msg: 'OK'});
                });
            });
        }
    }
};
