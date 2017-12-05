// "use strict";
//
// var gulp = require("gulp");
// var sass = require("gulp-sass");
// var plumber = require("gulp-plumber");
// var postcss = require("gulp-postcss");
// var autoprefixer = require("autoprefixer");
// var server = require("browser-sync").create();
// var wait = require("gulp-wait");
//
// gulp.task("style", function() {
//   gulp.src("sass/style.scss")
//     .pipe(wait(100))
//     .pipe(plumber())
//     .pipe(sass())
//     .pipe(postcss([
//       autoprefixer({browsers: [
//         "last 2 versions"
//       ]})
//     ]))
//     .pipe(gulp.dest("css"))
//     .pipe(server.stream());
// });
//
// gulp.task("serve", ["style"], function() {
//   server.init({
//     server: ".",
//     notify: false,
//     open: true,
//     cors: true,
//     ui: false
//   });
//
//   gulp.watch("sass/**/*.{scss,sass}", ["style"]);
//   gulp.watch("*.html").on("change", server.reload);
// });




"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");              // минификация CSS
var rename = require("gulp-rename");            // переименование файла
var imagemin = require("gulp-imagemin");        // оптимизация изображений
var run = require("run-sequence");              // последовательный запуск плагинов
var del = require("del");                       // удаление файла
var htmlreplace = require("gulp-html-replace");
var wait = require("gulp-wait");
var webp = require("gulp-webp");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(wait(100))
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
  return gulp.src("img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("img"));
})

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
  ], {
    base: "."
  })
    .pipe(gulp.dest("build"));
});

gulp.task("htmlreplace", function() {
  gulp.src("index.html")
    .pipe(htmlreplace({
      'css': 'css/style.min.css'
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html:update"]);
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "style",
    "htmlreplace",
    done
  );
});
