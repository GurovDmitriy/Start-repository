const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const mjml = require('gulp-mjml');
const mjmlEngine = require('mjml');
const image = require('gulp-image');
const del = require('del');
const archiver = require('gulp-archiver2');

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
  gulp.watch('source/mjml/**/*.mjml', gulp.series('mjmlCompil'));
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
    .pipe(gulp.dest('source'))
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
    .pipe(gulp.dest('build'))
    .pipe(browserSync.stream());
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
  return gulp.src(['product/**', '!product/*.zip'])
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
  'mjmlBuildCompil',
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
  'mjmlBuildCompil',
  'copyProductImg',
  'copyProductFile',
  'addArchive'
);

/* console command: gulp testbuild */

exports.testbuild = gulp.series(
  'serverTest'
);
