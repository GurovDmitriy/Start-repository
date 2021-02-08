const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const mjmlEngine = require('mjml');
const mjml = require('gulp-mjml');
const del = require('del');
const mustache = require("gulp-mustache");
const typograf = require('gulp-typograf');
const archiver = require('gulp-archiver2');
const image = require('gulp-image');

/*----------------------------------------*/
/* tasks for development on source folder */
/*----------------------------------------*/

/* server and watcher for dev */

gulp.task('serverDev', function(done) {
  browserSync.init({
    server: {
       baseDir: 'source'
    },
  });
  done();
  gulp.watch(['source/mjml/**/*.mjml', 'source/content/**/*.json'], gulp.series(['mjmlCompil', 'mustacheFile']));
  gulp.watch('source/*.html').on('change', browserSync.reload);
});

/* mjml compil */

gulp.task('mjmlCompil', function () {
  return gulp.src('source/mjml/*.mjml')
    .pipe(mjml(mjmlEngine, {
      minify: false,
      validationLevel: 'strict',
      beautify: true
    }))
    .pipe(gulp.dest('source'));
});

/* mustache */

gulp.task('mustacheFile', function(done) {
  return gulp.src("source/*")
    .pipe(mustache('source/content/content.json',{},{}))
    .pipe(gulp.dest("source"))
    .pipe(browserSync.stream());
});

/*----------------------------------------*/
/* tasks for production on build folder   */
/*----------------------------------------*/

/* mjml compil and minify */

gulp.task('mjmlBuildCompil', function () {
  return gulp.src('source/mjml/*.mjml')
    .pipe(mjml(mjmlEngine, {
      minify: true,
      validationLevel: 'strict'
    }))
    .pipe(gulp.dest('build'));
});

/* mustache */

gulp.task('mustacheFileBuild', function(done) {
  return gulp.src("build/*")
    .pipe(mustache('source/content/content.json',{},{}))
    .pipe(gulp.dest("build"));
});

/* image minify */

gulp.task('imageMin', function() {
  return gulp.src('build/image/**/*.{jpg,png,svg,gif}')
    .pipe(image({
      optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
      pngquant: ['--speed=1', '--force', 256],
      zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
      jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
      mozjpeg: ['-optimize', '-progressive'],
      gifsicle: ['--optimize'],
      svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']
    }))
    .pipe(gulp.dest('build/image'));
});

/* delete all build folder */

gulp.task('cleanFullBuild', function() {
  return del('build');
});

gulp.task('cleanFullProduct', function() {
  return del('product');
});

gulp.task('addArchive', function () {
  return gulp.src(['product/*', '!product/*.zip'])
    .pipe(archiver.create('archive.zip'))
    .pipe(gulp.dest('product'));
});

/* delete build folder without image  */

gulp.task('cleanBuild', function() {
  return del(['build/*', '!build/image']);
});

/* copy all files for build without image */

gulp.task('copyBuildImg', function() {
  return gulp.src([
    'source/image/**/*',
    ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

gulp.task('copyProductImg', function() {
  return gulp.src([
    'build/image/**/*',
    ], {base: 'build'})
    .pipe(gulp.dest('product'));
});

gulp.task('copyProductFile', function() {
  return gulp.src([
    'source/index.html',
    ], {base: 'source'})
    .pipe(gulp.dest('product'));
});

/* typograf */

gulp.task('typograf', function() {
    return gulp.src(['source/mjml/**/*.mjml',
                      '!source/mjml/**/attributes.mjml',
                      '!source/mjml/**/style-inline.mjml',
                      '!source/mjml/**/style.mjml' ])
        .pipe(typograf({ locale: ['ru', 'en-US'],
                         htmlEntity: {type: 'name'} }))
        .pipe(gulp.dest('source/mjml'));
});

/* server for test only product version */

gulp.task('serverTest', function() {
  browserSync.init({
    server: {
       baseDir: 'build'
    },
  });
});

/*----------------------------------------*/
/* config commands for development        */
/*----------------------------------------*/

/* console command: gulp start */

exports.start = gulp.series(
  'mjmlCompil',
  'mustacheFile',
  'serverDev'
);

/*----------------------------------------*/
/* config commands for production         */
/*----------------------------------------*/

/* console command: gulp fullbuild */

exports.fullbuild = gulp.series(
  'cleanFullBuild',
  'cleanFullProduct',
  'mjmlCompil',
  'mustacheFile',
  'mjmlBuildCompil',
  'mustacheFileBuild',
  'copyBuildImg',
  'imageMin',
  'copyProductImg',
  'copyProductFile',
  'addArchive'
);

/* console command: gulp build */

exports.build = gulp.series(
  'cleanBuild',
  'cleanFullProduct',
  'mjmlCompil',
  'mustacheFile',
  'mjmlBuildCompil',
  'mustacheFileBuild',
  'copyProductImg',
  'copyProductFile',
  'addArchive'
);

/* console command: gulp testbuild */

exports.testbuild = gulp.series(
  'serverTest'
);
