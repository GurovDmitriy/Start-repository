const gulp = require('gulp')
const rename = require('gulp-rename');
const del = require('del');

const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
sass.compiler = require('node-sass');

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
  gulp.watch('source/sass/**/*.scss', gulp.series('style'));
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
  return gulp.src('source/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
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

// grunt basic

exports.basic = gulp.series(
  gulp.parallel(
    'fontwoff',
    'fontwoff2',
    'webpgen',
    'svgminify'
  ),
  'sprite'
);

// grunt start

exports.start = gulp.series(
  'style',
  'serve'
);

// grunt build

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

// grunt test

exports.test = gulp.series(
  'servebuild'
);

// grunt font

exports.font = gulp.series(
  gulp.parallel(
    'fontwoff',
    'fontwoff2'
  )
);

// grunt image

exports.image = gulp.series(
  gulp.parallel(
    'webpgen',
    'svgminify'
  )
);

// grunt spritesvg

exports.spritesvg = gulp.series(
  'sprite'
);

/*
  console command:

 - on first start run: gulp basic

    the command generates fonts wff woff2, webp, compresses svg,
    builds sprite svg from icon-*.svg — in souce folder for dev

 - next step: gulp start

    the command compil style, autoprefix, source map and will deploy a live development
    server — in source folder for dev

  - next step: gulp build

    the command build pruduct version, copy files to build folder,
    compress html, css, js, img  in sourve folder for dev

  - next step: gulp test

    the command run server for test only — in build folder for test

 - command: gulp font

    the command individual for generates fonts
    wff, woff2 — in source folder for dev

 - command: gulp image

    the command individual for generates
    webp, compresses svg — in source folder for dev

 - command: gulp spritesvg

    the command individual for compresses svg,
    builds sprite svg from icon-*.svg — in source folder for dev

 - when developing
    open the second tab in the browser
    http: // localhost: 3001 /
    to open the server settings.
    You can turn on outline highlighting or grid for debugging
    in the debag section

 - enjoy
*/
