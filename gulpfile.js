const gulp = require('gulp');
const { series } = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const data = require('gulp-data');
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const clean = require('gulp-clean');
const minify = require('gulp-minify');
const imagemin = require('gulp-imagemin');

function scss() {
    return (
        gulp
        .src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass()).on("error", sass.logError)
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.stream())
    );    
}

function js() {
    return (
        gulp.src('./src/js/**/*')
            .pipe(gulp.dest('./public/js/'))
            .pipe(browserSync.stream())
    );    
}

function img() {
    return (
        gulp.src('./src/img/**/*')
            .pipe(gulp.dest('./public/img/'))
            .pipe(browserSync.stream())
    );    
}

function nunjucks() {
    return gulp
        .src('src/pages/*')
        .pipe(data(function(){
            return require('./src/data.json');
        }))
        .pipe(
            nunjucksRender({
                path: ['src/templates'],
            })
        )
        .pipe(gulp.dest('public'));
}

function reload() {
    browserSync.reload();
}

function watch() {
    js();
    img();
    scss();
    nunjucks();
    browserSync.init({
        server: {
            baseDir: "./public/"
        },
        notify: false
    });

    gulp.watch('./src/js/**/*', js);
    gulp.watch('./src/img/**/*', img);
    gulp.watch('./src/scss/**/*.scss', scss);
    gulp.watch('./src/**/*.njk', nunjucks);
    gulp.watch('./public/**/*.**').on('change', reload);
}

function minCss() {
    return gulp.src('./public/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'));
}

function minHtml() {
    return (
        gulp.src('./public/**/*.html')
            .pipe(htmlmin({ collapseWhitespace: true }))
            .pipe(gulp.dest('dist'))
    ); 
}

function minJs() {
    return (
        gulp.src('./public/js/scripts.js')
            .pipe(minify())
            .pipe(gulp.dest('dist/js'))
    ); 
}

function minImg() {
    return (
        gulp.src('./public/img/**/*')
            .pipe(imagemin())
            .pipe(gulp.dest('dist/img'))
    ); 
}

function del() {
    return gulp.src(['./public', './dist' ], {read: false})
        .pipe(clean());
}

exports.default = watch;
exports.del = del;
exports.build = series(js, img, scss, nunjucks, minJs, minImg, minCss, minHtml);