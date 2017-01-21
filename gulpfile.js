var gulp = require('gulp'),
gutil = require('gulp-util'),
    util = require('util'),
    gs = require('glob-stream'),
    fs = require('fs'),
    path = require('path');

function compileTemplates(cb) {
    var objResult = {
            macros: []
        };

    gs.create('public/templates/**/*.*')
        .on('data', function (file) {
            var fileContent = '',
                filename = path.basename(file.path, '.txt'),
                dirname = path.dirname(file.path);
            //warning: if the absolute path contains the string "\macros" in some other part this will fail!!!
            if (dirname.indexOf('\\macros') >= 0) {
                fileContent = fs.readFileSync(pres('public', file.path)).toString('utf8');
                objResult.macros.push(fileContent);
            }
            else {
                fileContent = fs.readFileSync(pres('public', file.path)).toString('utf8');
                objResult[format('%s_tmpl', filename)] = fileContent;
            }
        })
        .on('end', function () {
            var buffer = '';
            buffer = 'SPA.templates' + ' = ' + JSON.stringify(objResult, null, 4) + ';';
            fs.writeFile(pres('public', format('%s%s', 'js/', 'templates.__bundle.js')), buffer, {},
                function () {
                    cb();
                });
        });
}

function pres(path1, path2) {
    if (path2) {
        return path.resolve(path1, path2);
    }
    return path.resolve('./', path1);
}

function format() {
    return util.format.apply(this, arguments);
}

gulp.task('default',function () {
    compileTemplates(function(){

    });
});
