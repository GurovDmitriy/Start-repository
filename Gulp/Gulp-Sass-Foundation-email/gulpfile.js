const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const inlineCss = require('gulp-inline-css');
const htmlmin = require('gulp-htmlmin');
const image = require('gulp-image');
const del = require('del');
const mail = require("gulp-mailing");
const inky = require('inky');

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
  gulp.watch('source/sass/**/*.scss', gulp.series('cssCompil'));
  gulp.watch('source/inky/**/*.html', gulp.series('htmlCompil'));
  gulp.watch('source/*.html').on('change', browserSync.reload);
});

/* style css compile, autoprefixer, source map */

gulp.task('cssCompil', function() {
  return gulp.src('source/sass/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

/* html inky */

gulp.task('htmlCompil', function() {
  return gulp.src('source/inky/*.html')
    .pipe(inky())
    .pipe(gulp.dest('source'));
});

/*----------------------------------------*/
/* tasks for production on build folder   */
/*----------------------------------------*/

gulp.task('inlineStyle', function() {
  return gulp.src('source/*.html')
    .pipe(inlineCss())
    .pipe(gulp.dest('build'));
});

/* html minify */

gulp.task('htmlMin', function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    }))
    .pipe(gulp.dest('build'));
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

/* copy image */

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
  'htmlCompil',
  'cssCompil',
  'serverDev'
);

/*----------------------------------------*/
/* config commands for production         */
/*----------------------------------------*/

/* console command: gulp fullbuild */

exports.fullbuild = gulp.series(
  gulp.parallel(
  'htmlCompil',
  'cssCompil',
  'cleanFull'
  ),
  'copy',
  gulp.parallel(
  'imageMin',
  'inlineStyle'
  ),
  'htmlMin'
);

/* console command: gulp build */

exports.build = gulp.series(
  'clean',
  'inlineStyle',
  'htmlMin'
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

  - `gulp start`     - compilation of styles and live reload server

  for production

  Compressing images is a long task,
  it makes no sense to run it every time,
  when you update the build without changing
  the jpg png webp, so there are two commands - fullbuild and build

  console command:

  - `gulp fullbuild` - full build production version and min all files
  - `gulp build`     - inline style and minify html for build,
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

