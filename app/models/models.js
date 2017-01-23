// app/models/timelog.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
        name: { type : Schema.Types.String , unique : true, required : true, dropDups: true },
        address: Schema.Types.String,
        vatNumber:Schema.Types.String,
        currency: Schema.Types.String
    }),
    ProjectSchema = new Schema({
        _cstId: {type: Schema.Types.ObjectId, ref: 'Customer'},
        name: Schema.Types.String,
        rate: Schema.Types.Number
    }),
    TimeLogSchema = new Schema({
        _cstId: {type: Schema.Types.ObjectId, ref: 'Customer'},
        _prjId: {type: Schema.Types.ObjectId, ref: 'Project'},
        memo: Schema.Types.String,
        date:Schema.Types.Date,
        duration: {
            type: Schema.Types.Number, min: 0, max: 24, set: function (v) {
                return Math.round(v);
            }
        }
    });

module.exports = {
    Customer: mongoose.model('Customer', CustomerSchema),
    Project: mongoose.model('Project', ProjectSchema),
    TimeLog: mongoose.model('TimeLog', TimeLogSchema)
};

