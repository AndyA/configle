"use strict";

var del = require("del");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var mocha = require("gulp-mocha");
var shell = require("gulp-shell");

gulp.task("lint", function() {
  var src = [];
  src.push("gulpfile.js");
  src.push("index.js");
  src.push("bin/**/*.js");
  src.push("lib/**/*.js");
  src.push("test/**/*.js");
  return gulp.src(src)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task("test", function() {
  return gulp.src(["test/**/*.js"])
    .pipe(mocha({
      reporter: "spec"
    }));
});

gulp.task("docs", shell.task([
  "node ./node_modules/jsdoc/jsdoc.js -c jsdoc.json -d docs -r"
]));

gulp.task("clean", function() {
  del("docs");
});

gulp.task("default", ["lint", "test"], function() {});
