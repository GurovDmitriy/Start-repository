module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    concurrent: {
      concurrentTask: ['watch:watchStyleTask'],
      concurrentBuildTask: [
        'watch:watchHtmlBuildTask',
        'watch:watchStyleBuildTask',
        'watch:watchJsBuildTask',
      ],
      options: {
        logConcurrentOutput: true,
      },
    },

    watch: {
      watchStyleTask: {
        files: ['source/less/**/*.less'],
        tasks: ['less:lessTask'],
      },
      watchHtmlBuildTask: {
        files: ['source/*.html'],
        tasks: ['clean:cleanHtmlBuildTask', 'copy:copyHtmlBuildTask', 'htmlmin:htmlMinBuildTask'],
      },
      watchStyleBuildTask: {
        files: ['source/less/**/*.less'],
        tasks: ['less:lessTask', 'clean:cleanStyleBuildTask', 'copy:copyStyleBuildTask', 'cssmin:cssminBuildTask'],
      },
      watchJsBuildTask: {
        files: ['source/js/*.js'],
        tasks: ['clean:cleanJsBuildTask', 'copy:copyJsBuildTask', 'babel:babelBuildTask', 'uglify:uglifyBuildTask'],
      },
    },

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
      browserSyncBuildTask: {
        bsFiles: {
          src: ['build/*.html', 'build/css/*.css', 'build/js/*.js'],
        },
        options: {
          server: 'build/',
          watchTask: true,
        },
      },
    },

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

    cssmin: {
      cssminBuildTask: {
        files: [{
          expand: true,
          cwd: 'build/css/',
          src: ['*.css'],
          dest: 'build/css/',
        }]
      }
    },

    babel: {
      babelBuildTask: {
        options: {
          presets: ["@babel/preset-env"],
        },
        files: [{
          expand: true,
          cwd: 'build/js/',
          src: ['default.js'],
          dest: 'build/js/',
        }]
      },
    },

    uglify: {
      uglifyBuildTask: {
        files: [{
          expand: true,
          cwd: 'build/js',
          src: '*.js',
          dest: 'build/js'
        }],
      },
    },

    svgstore: {
      svgstoreTask: {
        options: {
          includeTitleElement: false,
          prefix: 'icon-',
          svg: {
            viewBox: '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg',
          },
        },
        svgSprite: {
          files: {
            'source/image/min/sprite.svg': ['source/image/min/*.svg'],
          },
        },
      },
    },

    cwebp: {
      cwebpTask: {
        options: {
          q: 70,
        },
        files: [{
          expand: true,
          cwd: 'source/image/origin/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'source/image/min/',
        }],
      },
    },

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
          cwd: 'source/image/origin/',
          src: ['**/*.{png,jpg,gif,svg}'],
          dest: 'source/image/min/',
        }],
      },
      imageSvgMinTask: {
        options: {
          svgo: ['--enable', 'cleanupIDs', '--disable', 'convertColors'],
        },
        files: [{
          expand: true,
          cwd: 'source/image/origin/',
          src: ['**/*.svg'],
          dest: 'source/image/min/',
        }],
      },
    },

    // prettify: {
    //   prettifyTask: {
    //     options: {
    //       config: '.prettifyrc',
    //     },
    //     files: {
    //       expand: true,
    //       cwd: 'build/',
    //       ext: '.html',
    //       src: ['*.html'],
    //       dest: 'build/',
    //     },
    //   },
    // },

    htmlmin: {
      htmlMinBuildTask: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
        },
        files: [{
          expand: true,
          cwd: 'build',
          src: ['*.html'],
          dest: 'build',
        }],
      },
    },

    ttf2woff: {
      ttf2woffTask: {
        src: ['source/fonts/ttf/*.ttf'],
        dest: 'source/fonts/woff/',
      },
    },

    ttf2woff2: {
      ttf2woff2Task: {
        src: ['source/fonts/ttf/*.ttf'],
        dest: 'source/fonts/woff2/',
      },
    },


    clean: {
      cleanBuildTask: {
        src: ['build/'],
      },
      cleanHtmlBuildTask: {
        src: ['build/*.html'],
      },
      cleanStyleBuildTask: {
        src: ['build/css/*.css'],
      },
      cleanJsBuildTask: {
        src: ['build/js/*.js'],
      },
    },

    copy: {
      copyBuildTask: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ['source/*'],
            dest: 'build/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'source',
            src: [
              'fonts/woff/*',
              'fonts/woff2/*',
              'image/min/*',
              'css/style.css',
              'js/*.js',
            ],
            dest: 'build/',
          },
        ],
      },
      copyHtmlBuildTask: {
        files: [
          {
            expand: true,
            cwd: 'source',
            src: [
              '*.html',
            ],
            dest: 'build/',
          },
        ],
      },
      copyStyleBuildTask: {
        files: [
          {
            expand: true,
            cwd: 'source',
            src: [
              'css/*.css',
            ],
            dest: 'build/',
          },
        ],
      },
      copyJsBuildTask: {
        files: [
          {
            expand: true,
            cwd: 'source',
            src: [
              'js/*.js',
            ],
            dest: 'build/',
          },
        ],
      },
    },
  });

  grunt.registerTask('serve', [
    'less:lessTask',
    'browserSync:browserSyncTask',
    'concurrent:concurrentTask',
  ]);

  grunt.registerTask('servebuild', [
    'less:lessTask',
    'clean:cleanBuildTask',
    'copy:copyBuildTask',
    'cssmin:cssminBuildTask',
    'babel:babelBuildTask',
    'uglify:uglifyBuildTask',
    'htmlmin:htmlMinBuildTask',
    'browserSync:browserSyncBuildTask',
    'concurrent:concurrentBuildTask',
  ]);

  grunt.registerTask('imgpress', [
    'cwebp:cwebpTask',
    'image',
    'svgstore:svgstoreTask',
  ]);

  grunt.registerTask('svgsprite', [
    'image:svgMinTask',
    'svgstore:svgstoreTask',
  ]);

  grunt.registerTask('fontgen', [
    'ttf2woff:ttf2woffTask',
    'ttf2woff2:ttf2woff2Task',
  ]);

  grunt.registerTask('build', [
    'less:lessTask',
    'clean:cleanBuildTask',
    'copy:copyBuildTask',
    'cssmin:cssminBuildTask',
    'babel:babelBuildTask',
    'uglify:uglifyBuildTask',
    'htmlmin:htmlMinBuildTask',
  ]);
};
