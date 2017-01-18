// app/models/timelog.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TimeLogSchema   = new Schema({
    url: String,
    prj: String,
    comment: String
});

module.exports = mongoose.model('TimeLog', TimeLogSchema);
