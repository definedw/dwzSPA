var gulp = require('gulp'),
    htmlMin = require('gulp-htmlmin'),
    changed = require('gulp-changed'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    pngquant = require('imagemin-pngquant'),
    changed = require('gulp-changed'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-util');

var postcss = require('gulp-postcss');
var px2rem = require('postcss-pxtorem');
var precss = require('precss');
var postNested = require('postcss-nested');
var postMixins = require('postcss-mixins');
var postVars = require('postcss-simple-vars');
var postExtend = require('postcss-extend');
var postImport = require('postcss-import');
var cssNext = require('postcss-cssnext');
var util = require('postcss-utilities');

gulp.task('move-html', () => {
    return gulp
        .src('./test/**/*.html')
        .pipe(changed('test_build', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('test_build'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

/* postcss */

gulp.task('postcss', () => {
    let processors = [
        postImport,
        postMixins,
        postVars,
        postNested,
        postExtend,
        cssNext({
            browsers: ['last 1 version']
        }),
        precss,
        // px2rem({
        //     rootValue: 100,
        //     replace: false
        // }),
        util,
    ];
    return gulp
        // .src('./test/css/*.css')
        .src(['./test/css/*.css', '!./test/css/demo-3.css'])
        .pipe(changed('test_build/css', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest('test_build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
})



/* js */
gulp.task('script', () => {
    return gulp
        .src('./test/js/*.js')
        .pipe(changed('test_build/js', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('test_build/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

/* images */

gulp.task('move-img', () => {
    return gulp
        .src('./test/images/**/*.*')
        .pipe(changed('test_build/images', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('test_build/images'))
        .pipe(browserSync.reload({
            stream: true
        }));
})


/* static */

// gulp.task('static-dev', () => {
//     return gulp
//         .src('./src/video/**/*')
//         .pipe(gulp.dest('build/video'))
// })

// gulp.task('static-prod', () => {
//     return gulp
//         .src('./src/video/**/*')
//         .pipe(gulp.dest('dist/video'))
// })

// /* json */
// gulp.task('move-json', () => {
//     return gulp
//         .src('./src/*.json')
//         .pipe(gulp.dest('./dist'))
// })


/* del */
gulp.task('clean-build', (cb) => {
    return del(['test_build/**/*', '!test_build/images/*', '!test_build/static/*'], cb)
})

gulp.task('clean-dist', (cb) => {
    return del(['dist/**/*', '!dist/static/*'], cb)
})

/* serve */

gulp.task('serve', () => {

    browserSync.init({
        port: 2018,
        server: {
            baseDir: ['test_build']
        }
    });
    gulp.watch('test/**/*.html', ['move-html']);
    gulp.watch('test/css/**/*', ['postcss']);
    gulp.watch('test/images/**/*.*', ['move-img'])
    gulp.watch('test/js/*.js', ['script']);
})

/* start */

gulp.task('start', (cb) => {
    runSequence('clean-build', 'move-html', ['postcss', 'script'], 'move-img', (cb))
})


/* dev */
gulp.task('dev', (cb) => {
    runSequence('start', ['serve'])
})