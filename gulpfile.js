'use strict';

var concat = require('gulp-concat');
var del = require('del');
var exec = require('child_process').exec;
var fs = require('fs');
var gulp = require('gulp');
var esformatter = require('esformatter');
var istanbul = require('gulp-istanbul');
var merge = require('merge-stream');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var template = require('gulp-template');
var uglify = require('gulp-uglify');

gulp.task('build', function(callback) {
    runSequence('clean', ['config', 'loader-min', 'source-min', 'modules', 'build-config', 'vendor', 'demo'], callback);
});

gulp.task('build-config', function(callback) {
    exec('node config-generator.js -c src/config/config-base.json -o src/config/config.js src/modules', function (err, stdout, stderr) {
        callback(err);
    });
});

gulp.task('clean', function (callback) {
    del(['dist'], callback);
});

gulp.task('combine-js', function() {
    return gulp.src([
        'src/js/utils.js',
        'src/js/event-emitter.js',
        'src/js/config-parser.js',
        'src/js/dependency-builder.js',
        'src/js/url-builder.js',
        'src/js/script-loader.js',
        ])
    .pipe(concat('source.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('config', function() {
    return gulp.src('src/config/**/*.*')
        .pipe(gulp.dest('dist/config'));
});

gulp.task('default', function(callback) {
    runSequence('build', callback);
});

gulp.task('demo', function() {
    return gulp.src('src/demo/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('format', function() {
    var src = gulp.src(['src/**/*.js'])
        .pipe(esformatter())
        .pipe(gulp.dest('src'));

    var test = gulp.src(['test/**/*.js'])
        .pipe(esformatter())
        .pipe(gulp.dest('test'));

    return merge(src, test);
});

gulp.task('js', ['combine-js', 'vendor-js'], function() {
    return gulp.src('src/template/loader.template')
        .pipe(template({
            vendor: fs.readFileSync('dist/js/vendor.js'),
            source: fs.readFileSync('dist/js/source.js')
        }))
        .pipe(rename('loader.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('loader-min', ['js'], function() {
    return gulp.src('dist/js/loader.js')
        .pipe(uglify())
        .pipe(rename('loader-min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('modules', function() {
    return gulp.src('src/modules/**/*.*')
        .pipe(gulp.dest('dist/modules'));
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function() {
  return gulp.src(['test/**/*.js', '!test/fixture/*.js'])
    .pipe(plugins.mocha());
});

gulp.task('test-cover', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(plugins.istanbul());
});

gulp.task('test-coverage', ['test-cover'], function() {
  return gulp.src(['test/**/*.js', '!test/fixture/*.js'])
    .pipe(plugins.mocha())
    .pipe(plugins.istanbul.writeReports());
});

gulp.task('test-watch', function() {
  gulp.watch('src/**/*.js', ['test']);
});

gulp.task('source-min', ['js'], function() {
    return gulp.src('dist/js/source.js')
        .pipe(uglify())
        .pipe(rename('source-min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('vendor', function() {
    return gulp.src('src/vendor/**/*.*')
        .pipe(gulp.dest('dist/vendor'));
});

gulp.task('vendor-js', function() {
    return gulp.src([
        'src/vendor/promise.js',
        ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*', ['build']);
});