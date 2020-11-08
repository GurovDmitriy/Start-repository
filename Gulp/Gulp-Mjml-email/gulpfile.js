const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const mjml = require('gulp-mjml');
const mjmlEngine = require('mjml');
const image = require('gulp-image');
const del = require('del');
const mail = require("gulp-mailing");

const smtpInfo = {
  auth: {
    user: "exampleemail@gmail.com",
    pass: "examplepassword"
  },
  host: "smtp.gmail.com",
  secureConnection: true,
  port: 465
};

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
  return gulp.src('build/image/*')
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

gulp.task('cleanFull', function() {
  return del('build');
});

/* delete build folder without image  */

gulp.task('clean', function() {
  return del(['build/*', '!build/image']);
});

/* copy all files for build without image */

gulp.task('copy', function() {
  return gulp.src([
    'source/image/*',
    ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

/* server for test only product version */

gulp.task('serverTest', function() {
  browserSync.init({
    server: {
       baseDir: 'build'
    },
  });
});

/* send mail */

gulp.task('mail', function () {
  return gulp.src('build/index.html')
    .pipe(mail({
      subject: 'Example',
      to: [
        'example@gmail.com'
      ],
      from: 'Example <exampleemail@gmail.com>',
      smtp: smtpInfo
    }));
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
  'cleanFull',
  'copy',
  'mjmlBuildCompil',
  'imageMin'
);

/* console command: gulp build */

exports.build = gulp.series(
  'clean',
  'mjmlBuildCompil'
);

/* console command: gulp testbuild */

exports.testbuild = gulp.series(
  'serverTest'
);

/*
  Gulp

  for development

  first launch after download repository
  console command:

  - `npm i`          - install devDependencies
  - `npm run build`  - full update dev and build

  daily launch
  console command:

  - `gulp start`     - compilation html and live reload server

  for production

  Compressing images is a long task,
  it makes no sense to run it every time,
  when you update the build without changing
  the jpg png webp, so there are two commands - fullbuild and build

  console command:

  - `gulp fullbuild` - full build production version and min all files
  - `gulp build`     - update html for build
  - `gulp testbuild` - server for test only
  - `gulp mail`      - sand mail

  when developing:

  open the second tab in the browser
  http: // localhost: 3001 / (or the address that browsersync points for gui to the console)
  to open the server settings.
  You can turn on outline highlighting or grid for debugging
  in the debag section

  enjoy

*/

