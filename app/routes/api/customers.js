Customer = require('../../models/models').Customer;

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = {
    collection: {
        doGet: function (req, res) {
            Customer.find(function (err, customers) {
                if (err) {
                    handleError(res, err.message, "Failed to get the customer.");
                } else {
                    res.status(200).json(customers);
                }
            });
        },
        doPost: function (req, res) {
            var customer = new Customer(req.body);
            customer.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new customer.");
                } else {
                    res.status(201).location('/api/customers/' + customer.id).json(customer);
                }
            });
        }
    }
};