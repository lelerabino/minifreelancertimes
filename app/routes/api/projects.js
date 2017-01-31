Project = require('../../models/models').Project;

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

module.exports = {
    collection:{
        doGet:function(req, res){
            Project.find(function (err, projects) {
                res.json(200, projects);
            });
        },
        doPost:function (req, res) {
            var project = new Project(req.body);
            project.save(function (err) {
                if (err) {
                    handleError(res, err.message, "Failed to create new project.");
                } else {
                    res.status(201).location('/api/projects/' + project.id).json(project);
                }
            });
        }
    }
};