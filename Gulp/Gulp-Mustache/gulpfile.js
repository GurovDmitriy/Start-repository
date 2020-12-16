const gulp = require('gulp');
const mustache = require("gulp-mustache");
const rename = require("gulp-rename");


gulp.task('mustacheFile', function(done) {
  return gulp.src("source/template/*")
    .pipe(mustache('source/content/content.json',{},{}))
    .pipe(rename(function (path) {
      path.extname = ".html";
    }))
    .pipe(gulp.dest("source"));
});


exports.content = gulp.series(
  'mustacheFile'
);
