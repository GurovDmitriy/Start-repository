const gulp = require('gulp');
const mustache = require("gulp-mustache");


gulp.task('mustacheFile', function(done) {
  return gulp.src("source/template/*")
    .pipe(mustache('source/content/content.json',{},{}))
    .pipe(gulp.dest("source"));
});


exports.content = gulp.series(
  'mustacheFile'
);
