const gulp = require('gulp')
const rename = require('gulp-rename');
const del = require('del');

const browserSync = require('browser-sync').create();
const less = require('gulp-less');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const htmlmin = require('gulp-htmlmin');
const csso = require('gulp-csso');
const terser = require('terser');
const gulpTerser = require('gulp-terser');

const webp = require('gulp-webp');
const image = require('gulp-image');
const svgstore = require('gulp-svgstore');

const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

// server dev

gulp.task('serve', function(done) {
  browserSync.init({
    server: {
       baseDir: 'source'
    },
  });
  done();
  gulp.watch('source/less/**/*.less', gulp.series('style'));
  gulp.watch(['source/*.html', 'source/js/*.js']).on('change', browserSync.reload);
});

// server build for test only

gulp.task('servebuild', function(done) {
  browserSync.init({
    server: {
       baseDir: 'build'
    },
  });
  done();
});

// style autoprefixer source map

gulp.task('style', function() {
  return gulp.src('source/less/style.less')
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: [ path.join('source/less', 'less', 'includes') ]
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('source/css'))
    .pipe(browserSync.stream());
});

// html minify

gulp.task('htmlminify', function() {
  return gulp.src('build/*.html')
    .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
    }))
    .pipe(gulp.dest('build'));
});

// css minify

gulp.task('cssminify', function() {
  return gulp.src('build/css/style.css')
    .pipe(csso({comments: false}))
    .pipe(gulp.dest('build/css'));
});

// js minify

gulp.task('jsminify', function() {
  return gulp.src('build/js/*.js')
          .pipe(gulpTerser({format: {comments: false}}, terser.minify))
          .pipe(gulp.dest('build/js'));
});

// webp

gulp.task('webpgen', function() {
  return gulp.src('source/image/*.{jpg, png}')
    .pipe(webp({quality: 70}))
    .pipe(gulp.dest('source/image'));
});

// image min

gulp.task('imageminify', function() {
  return gulp.src(['build/image/*', '!build/image/sprite.svg'])
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

// svg min

gulp.task('svgminify', function() {
  return gulp.src(['source/image/*.svg', '!source/image/sprite.svg'])
    .pipe(image({svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors']}))
    .pipe(gulp.dest('source/image'));
});

// svg sprite

gulp.task('sprite', function() {
  return gulp.src('source/image/icon-*.svg')
    .pipe(svgstore())
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('source/image'));
});

// font gen woff woff2 from ttf

gulp.task('fontwoff', function(){
  return gulp.src('source/font/ttf/*.ttf')
    .pipe(ttf2woff())
    .pipe(gulp.dest('source/font/woff'));
});

gulp.task('fontwoff2', function(){
  return gulp.src('source/font/ttf/*.ttf')
    .pipe(ttf2woff2())
    .pipe(gulp.dest('source/font/woff2'));
});

// delete build folder

gulp.task('clean', function() {
  return del('build');
});

// copy files for build

gulp.task('copy', function() {
  return gulp.src([
    'source/*.html',
    'source/css/*.css',
    'source/js/*.js',
    'source/image/**/*',
    '!source/image/icon-*.svg',
    'source/font/woff/*',
    'source/font/woff2/*',
    ], {base: 'source'})
    .pipe(gulp.dest('build'));
});

/* dev zone ---------- */

/*
  create font woff woff2 from ttf
  console command:
    $ gulp font
*/

exports.font = gulp.series(
  gulp.parallel(
    'fontwoff',
    'fontwoff2'
  )
);

/*
  create webp, minify svg and create svg sprite
  console command:
    $ gulp image
*/

exports.image = gulp.series(
  gulp.parallel(
    'webpgen',
    'svgminify'
  ),
  'sprite'
);

/*
  open server for dev
  console command:
    $ gulp test
*/

exports.start = gulp.series(
  'style',
  'serve'
);

/* product zone ---------- */

/*
  create product version
  console command:
    $ gulp build
*/

exports.build = gulp.series(
  gulp.parallel(
    'style',
    'clean'
  ),
  'copy',
  gulp.parallel(
    'htmlminify',
    'cssminify',
    'jsminify',
    'imageminify'
  )
);

/*
  open server for test build version only
  console command:
    $ gulp test
*/

exports.test = gulp.series(
  'servebuild'
);
