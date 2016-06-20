var gulp = require('gulp'),
  gutil = require('gulp-util'),
  os = require('os'),
  nwb = require('nwjs-builder'),
  argv = require('yargs')
    .alias('p', 'platforms')
    .argv,
  del = require('del'),

  detectCurrentPlatform = function(){
    switch (process.platform) {
      case 'darwin':
          return process.arch === 'x64' ? 'osx64' : 'osx32';
      case 'win32':
          return (process.arch === 'x64' || process.env.hasOwnProerty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
      case 'linux':
          return process.arch === 'x64' ? 'linux64' : 'linux32';
    }
  };

gulp.task('run', function() {
    nwb.commands.nwbuild([], {
        run: true,
        version: '0.15.3-sdk',
        withFFmpeg: true
    }, function (err, code) {
        if(err) return gutil.log(gutil.colors.red.bold('[ERROR:]'),gutil.colors.bgRed(err));
        else if(code === 0) gutil.log(gutil.colors.red.green('[OK:]'), 'Done');
    });
});

gulp.task('build', ['clean'], function() {
  nwb.commands.nwbuild(['./'], {
        version: '0.15.3',
        platforms: argv.p ? argv.p.split(',') : detectCurrentPlatform(),
        outputDir: './build',
        withFFmpeg: true,
        sideBySide: true,
        production: true,
        macIcns: './src/app/images/icons/popcorntime.icns',
        winIco: './src/app/images/icons/popcorntime.ico'
    }, function(err) {
        if(err) return gutil.log(gutil.colors.red.bold('[ERROR:]'),gutil.colors.bgRed(err));
        return gutil.log(gutil.colors.red.green('[OK:]'), 'Done');
  });
});

gulp.task('clean', function() {
    return del('build/');
});
