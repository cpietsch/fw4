// var NodeUglifier = require("node-uglifier");

// new NodeUglifier("../js/list.js").uglify().exportToFile("../js/list.min.js");
// new NodeUglifier("../js/tags.js").uglify().exportToFile("../js/tags.min.js");


var uglify = require('gulp-uglify');
var gulp = require('gulp');
var rename = require("gulp-rename");


gulp.task('compress', function() {
	console.log("a")
  return gulp.src(["../js/list.js", "../js/tags.js"])
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist'));
});