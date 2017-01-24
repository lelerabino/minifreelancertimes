Customer = require('../../models/models').Customer;

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = function (app) {
    app
        .get('/api/customers', function (req, res) {
            // http://mongoosejs.com/docs/api.html#query_Query-find
            Customer.find(function (err, customers) {
                res.json(200, customers);
            });
        })
        .post('/api/customers', function (req, res) {
            var customer = new Customer(req.body);
            // http://mongoosejs.com/docs/api.html#model_Model-save
            customer.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new customer.");
                } else {
                    res.status(201).location('/api/customers/' + timelog.id).json(customer);
                }
            });
        })
}