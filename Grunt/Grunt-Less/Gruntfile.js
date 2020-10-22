module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    // server
    browserSync: {
      browserSyncTask: {
        bsFiles: {
          src: ['source/*.html', 'source/css/*.css', 'source/js/*.js'],
        },
        options: {
          server: 'source/',
          watchTask: true,
        },
      },
      // server for product version test only
      browserSyncBuildTask: {
        options: {
          server: 'build/',
        },
      },
    },

    // watcher
    watch: {
      watchStyleTask: {
        files: ['source/less/**/*.less'],
        tasks: ['less:lessTask'],
      },
    },

    // less to css autoprefixer source map
    less: {
      lessTask: {
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

    // cssmin for build
    cssmin: {
      cssminTask: {
        files: [{
          expand: true,
          cwd: 'build/css/',
          src: ['*.css'],
          dest: 'build/css/',
        }],
      },
    },

    // js min for build
    uglify: {
      uglifyTask: {
        files: [{
          expand: true,
          cwd: 'build/js/',
          src: '*.js',
          dest: 'build/js/'
        }],
      },
    },

    // svg sprite for dev
    svgstore: {
      options: {
        includeTitleElement: false,
        prefix : '',
        svg: {
          viewBox: '0 0 100 100',
          xmlns: 'http://www.w3.org/2000/svg',
        },
      },
      svgstoreTask: {
        files: {
          'source/image/sprite.svg': ['source/image/icon-*.svg'],
        },
      },
    },

    // webp
    cwebp: {
      cwebpTask: {
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

    // image min for build
    image: {
      imageMinTask: {
        options: {
          optipng: ['-i 1', '-strip all', '-fix', '-o7', '-force'],
          pngquant: ['--speed=1', '--force', 256],
          zopflipng: ['-y', '--lossy_8bit', '--lossy_transparent'],
          jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
          mozjpeg: ['-optimize', '-progressive'],
          guetzli: ['--quality', 85],
          gifsicle: ['--optimize'],
          svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
        },
        files: [{
          expand: true,
          cwd: 'build/image/',
          src: ['*.{png,jpg,gif,svg}', '!sprite.svg'],
          dest: 'build/image/',
        }],
      },
      // svg min for dev
      imageSvgMinTask: {
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

    // html min for build
    htmlmin: {
      htmlMinTask: {
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

    // font to woff from ttf for dev
    ttf2woff: {
      ttf2woffTask: {
        src: ['source/font/ttf/*.ttf'],
        dest: 'source/font/woff/',
      },
    },

    // font to woff2 from ttf for dev
    ttf2woff2: {
      ttf2woff2Task: {
        src: ['source/font/ttf/*.ttf'],
        dest: 'source/font/woff2/',
      },
    },

    // clean build
    clean: {
      cleanTask: {
        src: ['build/'],
      },
    },

    // copy for build
    copy: {
      copyTask: {
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
              'css/style.css',
              'js/*.js',
              'font/woff/*',
              'font/woff2/*',
              'image/*',
              '!image/icon-*.svg',
            ],
            dest: 'build/',
          },
        ],
      },
    },

    // for parallel config task
    concurrent: {
      concurrentBasicTask: [
        'ttf2woff:ttf2woffTask',
        'ttf2woff2:ttf2woff2Task',
        'cwebp:cwebpTask',
        'image:imageSvgMinTask',
      ],
      concurrentImagesTask: [
        'cwebp:cwebpTask',
        'image:imageSvgMinTask',
      ],
      concurrentfontTask: [
        'ttf2woff:ttf2woffTask',
        'ttf2woff2:ttf2woff2Task',
        ],
      concurrentCleanTask: [
      'less:lessTask',
      'clean:cleanTask',
      ],
      concurrentMinTask: [
        'cssmin:cssminTask',
        'uglify:uglifyTask',
        'htmlmin:htmlMinTask',
        'image:imageMinTask',
      ],
      options: {
        logConcurrentOutput: true,
      },
    },

  });

  // basic task run font and webp convert svgmin and svgsprite for dev
  grunt.registerTask('basic', [
    'concurrent:concurrentBasicTask',
    'svgstore:svgstoreTask',
  ]);

  // run compil style browser and watcher for dev
  grunt.registerTask('start', [
    'less:lessTask',
    'browserSync:browserSyncTask',
    'watch:watchStyleTask',
  ]);

  // run build product version
  grunt.registerTask('build', [
    'concurrent:concurrentCleanTask',
    'copy:copyTask',
    'concurrent:concurrentMinTask',
  ]);

  // run browser for test build product version only
  grunt.registerTask('test', [
    'browserSync:browserSyncBuildTask',
  ]);

  // individual task

  // individual task run font convert for dev
  grunt.registerTask('font', [
    'concurrent:concurrentfontTask',
  ]);

  // individual task run webp convert and svgmin for dev
  grunt.registerTask('images', [
    'concurrent:concurrentImagesTask',
  ]);

  // individual task run svgmin and svgsprite for dev
  grunt.registerTask('sprite', [
    'image:imageSvgMinTask',
    'svgstore:svgstoreTask',
  ]);


};

/*
  console command:

 - on first start run: grunt basic

    the command generates fonts wff woff2, webp, compresses svg,
    builds sprite svg from icon-*.svg — in souce folder for dev

 - next step: grunt start

    the command compil style, source map and will deploy a live development
    server — in source folder for dev

  - next step: grunt build

    the command build pruduct version, copy files to build folder,
    compress html, css, js, img  in sourve folder for dev

  - next step: grunt test

    the command run server for test only — in build folder for test

 - command: grunt font

    the command individual for generates fonts
    wff, woff2 — in source folder for dev

 - command: grunt images

    the command individual for generates
    webp, compresses svg — in source folder for dev

 - command: grunt sprite

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
