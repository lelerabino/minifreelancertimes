var mongoose = require('mongoose'),
    timeLogsRoutes = require('./app/routes/api/timelogs');

exports.setUp = function(callback) {
  try {
        //db.connection.on('open', function() {
        mongoose.connection.on('open', function() {
            console.log('Opened connection');
            callback();
        });

        db = mongoose.connect('mongodb://admin:admin@ds117189.mlab.com:17189/minifreelancerstore');
        console.log('Started connection, waiting for it to open');
    }

    catch (err) {
        console.log('Setting up failed:', err.message);
    }

};

exports.tearDown = function(callback) {
    console.log('In tearDown');
    try {
        console.log('Closing connection');
        db.disconnect();
        callback();
    }

    catch (err) {
        console.log('Tearing down failed:', err.message);
    }
};

exports.Test1 = {
    'Customer name required' : function(test) {
        console.log('starting Test1');
        test.throws(
            function() {
                var cst = new Customer({x:2});
                console.log('before save cst...');
                cst.save({ validateBeforeSave: true });
                console.log('after save cst...');
            }
        );
    }
};
