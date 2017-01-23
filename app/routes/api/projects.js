Project = require('../../models/models').Project;

module.exports = function (app) {
    app
        .get('/api/projects', function (req, res) {
            // http://mongoosejs.com/docs/api.html#query_Query-find
            Project.find(function (err, projects) {
                res.json(200, projects);
            });
        })

        .post('/api/projects', function (req, res) {
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