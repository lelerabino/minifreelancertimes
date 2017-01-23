Project = require('../../models/models').Project;

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = function (app) {
    app
        .get('/api/projects', function (req, res) {
            // http://mongoosejs.com/docs/api.html#query_Query-find
            Project.find(function (err, projects) {
                res.json(200, projects);
            });
        })

        .post('/api/projects', function (req, res) {
            console.log('proj body: ' + JSON.stringify(req.body));
            var project = new Project(req.body);
            // http://mongoosejs.com/docs/api.html#model_Model-save
            project.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new project.");
                } else {
                    res.status(201).json(project);
                }
            });
        });
}