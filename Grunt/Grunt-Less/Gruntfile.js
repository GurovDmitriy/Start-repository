module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    // browser for dev
    browserSync: {
      serverDev: {
        bsFiles: {
          src: ['source/*.html', 'source/css/*.css', 'source/js/*.js'],
        },
        options: {
          server: 'source/',
          watchTask: true,
        },
      },
      // browser for production test
      serverTest: {
        options: {
          server: 'build/',
        },
      },
    },

    // watcher
    watch: {
      watch: {
        files: ['source/less/**/*.less'],
        tasks: ['less:cssCompil'],
      },
    },

    // css copmil
    less: {
      cssCompil: {
        options: {
          relativeUrls: true,
          plugins: [
            new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})
          ],
          sourceMap: true,
          sourceMapFilename: 'source/css/style.css.map',
          sourceMapURL: '/css/style.css.map',
          sourceMapBasepath: 'source',
          sourceMapRootpath: '/',
        },
        files: {
          'source/css/style.css': 'source/less/style.less',
        },
      },
    },

    // css minify for production
    cssmin: {
      cssMin: {
        files: [{
          expand: true,
          cwd: 'build/css/',
          src: ['*.css'],
          dest: 'build/css/',
        }],
      },
    },

    // js minify for production
    uglify: {
      jsMin: {
        files: [{
          expand: true,
          cwd: 'build/js/',
          src: '*.js',
          dest: 'build/js/'
        }],
      },
    },

    // svg sprite
    svgstore: {
      options: {
        includeTitleElement: false,
        prefix : 'icon-',
        svg: {
          viewBox: '0 0 100 100',
          xmlns: 'http://www.w3.org/2000/svg',
        },
      },
      svgSprite: {
        files: {
          'source/image/sprite.svg': ['source/image/*.svg', '!source/image/sprite.svg'],
        },
      },
    },

    // webp convert
    cwebp: {
      webpGen: {
        options: {
          q: 70,
        },
        files: [{
          expand: true,
          cwd: 'source/image/',
          src: ['*.{png,jpg,gif}'],
          dest: 'source/image/',
        }],
      },
    },

    // image minify
    image: {
      imageMin: {
        options: {
          optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
          pngquant: ['--speed=1', '--force', 256],
          zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
          jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
          mozjpeg: ['-optimize', '-progressive'],
          guetzli: ['--quality', 85],
          gifsicle: ['--optimize'],
        },
        files: [{
          expand: true,
          cwd: 'build/image/',
          src: ['*.{png,jpg,gif}'],
          dest: 'build/image/',
        }],
      },
      // svg minify
      svgMin: {
        options: {
          svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
        },
        files: [{
          expand: true,
          cwd: 'source/image/',
          src: ['*.svg', '!sprite.svg'],
          dest: 'source/image/',
        }],
      },
    },

    // html minify
    htmlmin: {
      htmlMin: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
        },
        files: [{
          expand: true,
          cwd: 'build/',
          src: ['*.html'],
          dest: 'build/',
        }],
      },
    },

    // woff convert
    ttf2woff: {
      fontWoff: {
        src: ['source/font/ttf/*.ttf'],
        dest: 'source/font/woff/',
      },
    },

    // woff2 convert
    ttf2woff2: {
      fontWoff2: {
        src: ['source/font/ttf/*.ttf'],
        dest: 'source/font/woff2/',
      },
    },

    // clean all build
    clean: {
      cleanFull: {
        src: ['build/'],
      },
      // clean build without images
      clean: {
        src: ['build/*', '!build/image'],
      },
      // clean webp for dev refresh
      cleanWebp: {
        src: ['source/image/*.webp'],
      },
      // clean font fo dev refresh
      cleanFont: {
        src: ['source/font/*', '!source/font/ttf'],
      },
    },

    // copy all for production
    copy: {
      copyFull: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['source/*'],
            dest: 'build/',
            filter: 'isFile',
          },
          {
            expand: true,
            cwd: 'source/',
            src: [
              'font/woff/**',
              'font/woff2/**',
              'css/*.css',
              'js/*.js',
              'image/**',
              '!image/*.svg',
            ],
            dest: 'build/',
          },
        ],
      },
      // copy all without images for production
      copy: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['source/*'],
            dest: 'build/',
            filter: 'isFile',
          },
          {
            expand: true,
            cwd: 'source/',
            src: [
              'font/woff',
              'font/woff2',
              'css/*.css',
              'js/*.js',
            ],
            dest: 'build/',
          },
        ],
      },
    },

    // parallel config task
    concurrent: {
      parallelCleanFontWebp: [
        'clean:cleanFont',
        'clean:cleanWebp',
      ],
      parallelFullGen: [
        'less:cssCompil',
        'ttf2woff:fontWoff',
        'ttf2woff2:fontWoff2',
        'cwebp:webpGen',
        'image:svgMin',
      ],
      parallelFont: [
        'ttf2woff:fontWoff',
        'ttf2woff2:fontWoff2',
      ],
      parallelAllMin: [
        'htmlmin:htmlMin',
        'cssmin:cssMin',
        'uglify:jsMin',
      ],
      options: {
        logConcurrentOutput: true,
      },
    },

  });

  grunt.registerTask('fullstart', [
    'concurrent:parallelCleanFontWebp',
    'concurrent:parallelFullGen',
    'svgstore:svgSprite',
  ]);


  grunt.registerTask('start', [
    'less:cssCompil',
    'browserSync:serverDev',
    'watch:watch',
  ]);


  grunt.registerTask('imgstart', [
    'clean:cleanWebp',
    'cwebp:webpGen',
  ]);


  grunt.registerTask('svgstart', [
    'image:svgMin',
    'svgstore:svgSprite',
  ]);


  grunt.registerTask('fontstart', [
    'clean:cleanFont',
    'concurrent:parallelFont',
  ]);


  grunt.registerTask('fullbuild', [
    'clean:cleanFull',
    'copy:copyFull',
    'concurrent:parallelAllMin',
    'image:imageMin',
  ]);


  grunt.registerTask('build', [
    'clean:clean',
    'copy:copy',
    'concurrent:parallelAllMin',
  ]);


  grunt.registerTask('testbuild', [
    'browserSync:serverTest',
  ]);

};

/*
  Grunt

  for development

  first launch after download repository
  console command:

  - `npm i`          - install devDependencies
  - `npm run build`  - full update dev and build

  daily launch
  console command:

  - `grunt fullstart` - first start or full update for development (css, webp, svgmin, svgsprite, fontgen)
  - `grunt start`     - compilation of styles and live reload server
  - `grunt imgstart`  - webp update and generation
  - `grunt svgstart`  - svg update minify and svgsprite
  - `grunt fontstart` - font update convert to woff & woff2


  for production

  Compressing images is a long task,
  it makes no sense to run it every time,
  when you update the build without changing
  the jpg png webp, so there are two commands - fullbuild and build

  console command:

  - `grunt fullbuild` - full build production version and min all files
  - `grunt build`     - copy font, copy and minify html, css, js
  - `grunt testbuild` - server for test only (for example for testing lighthouse)

  when developing:

  open the second tab in the browser
  to open the server settings.
  You can turn on outline highlighting or grid for debugging
  in the debag section

  enjoy

*/
