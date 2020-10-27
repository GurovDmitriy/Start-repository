const gulp = require('gulp');
const rename = require('gulp-rename');
const del = require('del');

const browserSync = require('browser-sync').create();

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const htmlmin = require('gulp-htmlmin');
const csso = require('gulp-csso');
const terser = require('terser');
const gulpTerser = require('gulp-terser');

const webp = require('gulp-webp');
const image = require('gulp-image');
const svgstore = require('gulp-svgstore');
const inject = require('gulp-inject');

const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');


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
  gulp.watch(['source/*.html', 'source/js/*.js']).on('change', browserSync.reload);
});

/* style css compile, autoprefixer, source map */

gulp.task('cssCompil', function() {
  return gulp.src('source/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

/* webp gen */

gulp.task('webpGen', function() {
  return gulp.src('source/image/*.{jpg,png}')
    .pipe(webp({quality: 70}))
    .pipe(gulp.dest('source/image'));
});

/* svg minify */

gulp.task('svgMin', function() {
  return gulp.src('source/image/*.svg')
    .pipe(image({svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']}))
    .pipe(gulp.dest('source/image'));
});

/* svg sprite end inject in html */

gulp.task('svgSprite', function() {
  const svgs = gulp.src('source/image/*.svg', {base: 'source/image'})
    .pipe(rename({prefix: 'icon-'}))
    .pipe(svgstore({ inlineSvg: true }));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp.src('source/**/*.html')
    .pipe(inject(svgs, {transform: fileContents}))
    .pipe(gulp.dest('source'));
});

/* font gen woff */

gulp.task('fontGenWoff', function(){
  return gulp.src('source/font/ttf/*.ttf')
    .pipe(ttf2woff())
    .pipe(gulp.dest('source/font/woff'));
});

/* font gen woff2 */

gulp.task('fontGenWoff2', function(){
  return gulp.src('source/font/ttf/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest('source/font/woff2'));
});

/* delete webp for refresh */

gulp.task('cleanWebp', function() {
  return del('source/image/*.webp');
});

/* delete font woff woff2 for refresh */

gulp.task('cleanFont', function() {
  return del(['source/font/*', '!source/font/ttf']);
});


/*----------------------------------------*/
/* tasks for production on build folder   */
/*----------------------------------------*/


/* html minify */

gulp.task('htmlMin', function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    }))
    .pipe(gulp.dest('build'));
});

/* css minify */

gulp.task('cssMin', function() {
  return gulp.src('build/css/*.css')
    .pipe(csso({
      comments: false,
      restructure: false,
      sourceMap: false
    }))
    .pipe(gulp.dest('build/css'));
});

/* js minify */

gulp.task('jsMin', function() {
  return gulp.src('build/js/*.js')
    .pipe(gulpTerser({format: {comments: false}}, terser.minify))
    .pipe(gulp.dest('build/js'));
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

/* copy all files for build */

gulp.task('copyFull', function() {
  return gulp.src([
    'source/**',
    '!source/sass/**',
    '!source/font/ttf/**',
    '!source/css/*.map',
    '!source/image/*.svg',
    ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

/* copy all files for build without image */

gulp.task('copy', function() {
  return gulp.src([
    'source/**',
    '!source/sass/**',
    '!source/font/ttf/**',
    '!source/css/*.map',
    '!source/image/**',
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


/*----------------------------------------*/
/* config commands for development        */
/*----------------------------------------*/


/* console command: gulp fullstart */

exports.fullstart = gulp.series(
  gulp.parallel(
    'cleanFont',
    'cleanWebp'
  ),
  gulp.parallel(
    'cssCompil',
    'fontGenWoff',
    'fontGenWoff2',
    'webpGen',
    'svgMin'
  ),
  'svgSprite'
);

/* console command: gulp start */

exports.start = gulp.series(
  'cssCompil',
  'serverDev'
);


/* console command: gulp imgstart */

exports.imgstart = gulp.series(
  'cleanWebp',
  'webpGen'
);

/* console command: gulp svgstart */

exports.svgstart = gulp.series(
  'svgMin',
  'svgSprite'
);

/* console command: gulp fontstart */

exports.fontstart = gulp.series(
  'cleanFont',
  gulp.parallel(
    'fontGenWoff',
    'fontGenWoff2'
  )
);


/*----------------------------------------*/
/* config commands for production         */
/*----------------------------------------*/


/* console command: gulp fullbuild */

exports.fullbuild = gulp.series(
  'cleanFull',
  'copyFull',
  gulp.parallel(
    'htmlMin',
    'cssMin',
    'jsMin'
  ),
  'imageMin'
);

/* console command: gulp build */

exports.build = gulp.series(
  'clean',
  'copy',
  gulp.parallel(
    'htmlMin',
    'cssMin',
    'jsMin'
  )
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

  - `gulp fullstart` - first start, full update for development (css, webp, svgmin, svgsprite inject in html, fontgen)
  - `gulp start`     - compilation of styles and live reload server
  - `gulp imgstart`  - webp update and generation
  - `gulp svgstart`  - svg update minify and svgsprite inject to html
  - `gulp fontstart` - font update convert to woff & woff2


  for production

  Compressing images is a long task,
  it makes no sense to run it every time,
  when you update the build without changing
  the jpg png webp, so there are two commands - fullbuild and build

  console command:

  - `gulp fullbuild` - full build production version and min all files
  - `gulp build`     - copy font, copy and minify html, css, js
  - `gulp testbuild` - server for test only (for example for testing lighthouse)

  when developing:

  open the second tab in the browser
  http: // localhost: 3001 / (or the address that browsersync points for gui to the console)
  to open the server settings.
  You can turn on outline highlighting or grid for debugging
  in the debag section

  enjoy

*/


