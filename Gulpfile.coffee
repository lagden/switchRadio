'use strict'

gulp       = require 'gulp'
sass       = require 'gulp-ruby-sass'
prefix     = require 'gulp-autoprefixer'
jade       = require 'gulp-jade'
coffee     = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
uglify     = require 'gulp-uglifyjs'
filter     = require 'gulp-filter'
util       = require 'gulp-util'

browserSync = require 'browser-sync'
reload      = browserSync.reload

AUTOPREFIXER_BROWSERS = [
  'ie >= 10'
  'ie_mob >= 10'
  'ff >= 30'
  'chrome >= 34'
  'safari >= 7'
  'opera >= 23'
  'ios >= 7'
  'android >= 4.4'
  'bb >= 10'
]

sources =
  sass   : './src/*.sass'
  jade   : './src/examples/*.jade'
  coffee : './src/*.coffee'
  js     : [
    './lib/vendor/get-style-property/get-style-property.js'
    './lib/vendor/classie/classie.js'
    './lib/vendor/hammerjs/hammer.js'
    './switch.js'
  ]

destinations =
  sass     : './'
  jade     : './examples/'
  coffee   : './'
  js       : './'
  prefixer : './'

gulp.task 'sass', ->
  gulp.src sources.sass
    .pipe sass
      trace         : true
      sourcemap     : true
      sourcemapPath : '../'
      style         : 'compressed'
      noCache       : true
    .pipe prefix AUTOPREFIXER_BROWSERS,
      map: false
    .pipe gulp.dest destinations.sass
    .pipe filter '*.css'
    .pipe reload {stream: true}
  return

gulp.task 'jade', ->
  gulp.src sources.jade
    .pipe jade
      pretty: false
    .pipe gulp.dest destinations.jade
    .pipe reload
      stream: true
  return

gulp.task 'lint', ->
  gulp.src sources.coffee
    .pipe coffeelint(
        max_line_length:
            level: 'ignore'
    )
    .pipe coffeelint.reporter()

gulp.task 'coffee', ->
  gulp.src sources.coffee
    .pipe coffee(bare: true).on 'error', util.log
    .pipe gulp.dest destinations.coffee
    .pipe reload
      stream: true
  return

gulp.task 'uglify', ->
  gulp.src sources.js
    .pipe uglify 'switch.pkg.min.js',
      outSourceMap: true
    .pipe gulp.dest destinations.js
  return

gulp.task 'watch', ->
  gulp.watch sources.sass, ['sass']
  gulp.watch sources.jade, ['jade']
  gulp.watch sources.coffee, ['lint', 'coffee', 'uglify']
  return

gulp.task 'default', ['sass', 'jade', 'lint', 'coffee', 'uglify']

gulp.task 'server', ['default', 'watch'], ->
  browserSync
    port: 8182
    server:
      baseDir: [
        'examples', './'
      ]
  return
