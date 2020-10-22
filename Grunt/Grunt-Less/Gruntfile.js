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
      cleanAllTask: {
        src: ['build/'],
      },
      cleanTask: {
        src: ['build/*', '!build/image'],
      },
    },

    // copy for build
    copy: {
      copyAllTask: {
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
      concurrentAllCleanTask: [
      'less:lessTask',
      'clean:cleanAllTask',
      ],
      concurrentCleanTask: [
      'less:lessTask',
      'clean:cleanTask',
      ],
      concurrentAllMinTask: [
        'htmlmin:htmlMinTask',
        'cssmin:cssminTask',
        'uglify:uglifyTask',
        'image:imageMinTask',
      ],
      concurrentMinTask: [
        'htmlmin:htmlMinTask',
        'cssmin:cssminTask',
        'uglify:uglifyTask',
      ],
      options: {
        logConcurrentOutput: true,
      },
    },

  });

  // basic task run font and webp convert svgmin and svgsprite for dev
  grunt.registerTask('basic', [            // source folder
    'concurrent:concurrentBasicTask',      // fontgen webp and svgmin
    'svgstore:svgstoreTask',               // svgsprite
  ]);

  // run compil style browser and watcher for dev
  grunt.registerTask('start', [            // source folder
    'less:lessTask',                       // less compil, autoprefix
    'browserSync:browserSyncTask',         // server
    'watch:watchStyleTask',                // watcher
  ]);

  // run build product version
  grunt.registerTask('allbuild', [         // build folder
    'concurrent:concurrentAllCleanTask',   // clean build and less compil, autoprefix
    'copy:copyAllTask',                    // copy all files from source (without icon-*.svg)
    'concurrent:concurrentAllMinTask',     // min all files (without min svg)
  ]);

  // run build product version without image
  grunt.registerTask('build', [            // build folder
    'concurrent:concurrentCleanTask',      // clean build (without image folder) and less compil, autoprefix
    'copy:copyTask',                       // copy all files from source (without image folder)
    'concurrent:concurrentMinTask',        // min files html css js (without image)
  ]);

  // run browser for test build product version only
  grunt.registerTask('test', [             // build folder
    'browserSync:browserSyncBuildTask',    // server
  ]);

  // individual task

  // individual task run font convert for dev
  grunt.registerTask('font', [             // source folder
    'concurrent:concurrentfontTask',       // font gen
  ]);

  // individual task run webp convert and svgmin for dev
  grunt.registerTask('picture', [          // source folder
    'concurrent:concurrentImagesTask',     // webp gen and svg min
  ]);

  // individual task run svgmin and svgsprite for dev
  grunt.registerTask('sprite', [           // source folder
    'image:imageSvgMinTask',               // svg min
    'svgstore:svgstoreTask',               // svg sprite
  ]);

};

/*
  console command:

 - on first start run: grunt basic

    the command generates fonts wff woff2, webp, compresses svg,
    builds sprite svg from icon-*.svg — in souce folder for dev

 - next step: grunt start

    the command compil style, autoprefix, source map and will deploy a live development
    server — in source folder for dev

  - next step: grunt allbuild

    the command build pruduct version, copy files to build folder,
    compress html, css, js, img  in sourve folder for dev


  - next step: grunt test

    the command run server for test only — in build folder for test

 - command: grunt build

    images are usually prepared and compressed once,
    so you need to be able to do the assembly without this task

 - command: grunt font

    the command individual for generates fonts
    wff, woff2 — in source folder for dev

 - command: grunt picture

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

