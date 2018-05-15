var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    imageMin = require('gulp-imagemin'),
    htmlMin = require('gulp-htmlmin'),
    changed = require('gulp-changed'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    pngquant = require('imagemin-pngquant'),
    cache = require('gulp-cache'), //图片缓存
    changed = require('gulp-changed'),
    md5 = require('gulp-md5-assets'),
    runSequence = require('run-sequence'),
    gutil = require('gulp-util');

// postcss

var postcss = require('gulp-postcss');
var px2rem = require('postcss-pxtorem');
var precss = require('precss');
var postNested = require('postcss-nested');
var postMixins = require('postcss-mixins');
var postVars = require('postcss-simple-vars');
var postExtend = require('postcss-extend');
var postImport = require('postcss-import');
var cssNext = require('postcss-cssnext');
var cssNano = require('cssnano');
var cssSize = require('postcss-size');


/*  html */

gulp.task('move-html', () => {
    return gulp
        .src('./src/**/*.html')
        .pipe(changed('build', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

gulp.task('min-html', () => {
    let options = {
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: false,
        removeStyleLinkAttributes: false,
        minifyJS: true,
        minifyCSS: true
    }
    return gulp
        .src('./src/**/*.html')
        .pipe(htmlMin(options))
        .pipe(gulp.dest('dist'))
        .pipe(md5(10));
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
        px2rem({
            rootValue: 100,
            replace: false
        }),
        cssSize,
    ];
    return gulp
        .src('./src/css/*.css')
        .pipe(changed('build/css', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

gulp.task('min-css', ['postcss'], () => {
    let processor = [cssNano()];

    return gulp
        .src('./build/css/*.css')
        .pipe(postcss(processor))
        .pipe(gulp.dest('dist/css'))
        .pipe(md5(10, './dist/**/*.html'));
})

/* js */
gulp.task('script', () => {
    return gulp
        .src('./src/js/*.js')
        .pipe(changed('build/js', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('./build/js'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

gulp.task('min-script', function() {
    return gulp
        .src('./src/js/*.js')
        .pipe(uglify())
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(gulp.dest('dist/js'))
        .pipe(md5(10, './dist/**/*.html'));
})


/* images */

gulp.task('move-img', () => {
    return gulp
        .src('./src/images/**/*.*')
        .pipe(changed('build/images', {
            hasChanged: changed.compareSha1Digest
        }))
        .pipe(gulp.dest('build/images'))
        .pipe(browserSync.reload({
            stream: true
        }));
})

gulp.task('min-img', () => {
    return gulp
        .src('./src/images/**/*.*')
        .pipe(cache(imageMin({
            progressive: true, // 无损压缩JPG图片
            svgoPlugins: [{
                removeViewBox: false
            }], // 不移除svg的viewbox属性
            use: [pngquant()] // 使用pngquant插件进行深度压缩
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(md5(10, './dist/**/*.{css,js,html}'));
})

/* static */

gulp.task('static-dev', () => {
    return gulp
        .src('./src/video/**/*')
        .pipe(gulp.dest('build/video'))
})

gulp.task('static-prod', () => {
    return gulp
        .src('./src/video/**/*')
        .pipe(gulp.dest('dist/video'))
})

/* json */
gulp.task('move-json', () => {
    return gulp
        .src('./src/*.json')
        .pipe(gulp.dest('./dist'))
})


/* del */
gulp.task('clean-build', (cb) => {
    return del(['build/**/*', '!build/images/*', '!build/static/*'], cb)
})

gulp.task('clean-dist', (cb) => {
    return del(['dist/**/*', '!dist/static/*'], cb)
})

/* serve */

gulp.task('serve', () => {

    browserSync.init({
        port: 2018,
        server: {
            baseDir: ['build']
        }
    });
    gulp.watch('src/**/*.html', ['move-html']);
    gulp.watch('src/css/**/*', ['postcss']);
    gulp.watch('src/images/**/*.*', ['move-img'])
    gulp.watch('src/js/*.js', ['script']);
})

/* start */

gulp.task('start', (cb) => {
    runSequence('clean-build', 'move-html', ['postcss', 'script', 'static-dev'], 'move-img', (cb))
})


/* dev */
gulp.task('dev', (cb) => {
    runSequence('start', ['serve'])
})

/* prod */

gulp.task('prod', (cb) => {
    runSequence('clean-dist', 'min-html', ['min-css', 'min-script', 'static-prod'], 'min-img', 'move-json', (cb))
})