// app/models/timelog.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
        name: { type : Schema.Types.String , unique : true, required : true, dropDups: true },
        address: Schema.Types.String,
        vatNumber:{ type : Schema.Types.String , required : true },
        currency: { type : Schema.Types.String , required : true }
    }),
    ProjectSchema = new Schema({
        _cstId: {type: Schema.Types.ObjectId, ref: 'Customer', required : true},
        name: { type : Schema.Types.String , unique : true, required : true, dropDups: true },
        rate: Schema.Types.Number
    }),
    TimeLogSchema = new Schema({
        _cstId: {type: Schema.Types.ObjectId, ref: 'Customer', required : true},
        _prjId: {type: Schema.Types.ObjectId, ref: 'Project', required : true},
        memo: { type : Schema.Types.String , required : true },
        date:Schema.Types.Date,
        duration: {
            type: Schema.Types.Number, required : true, min: 0, max: 24
        }
    });

module.exports = {
    Customer: mongoose.model('Customer', CustomerSchema),
    Project: mongoose.model('Project', ProjectSchema),
    TimeLog: mongoose.model('TimeLog', TimeLogSchema)
};

