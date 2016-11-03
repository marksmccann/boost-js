var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('compress', function() {
  gulp.src('src/boost.js')
    .pipe(minify({ext:{min:'.min.js'}}))
    .pipe(gulp.dest('dist'))
});

gulp.task('default',function() {
    gulp.watch('src/boost.js',['compress']);
});
