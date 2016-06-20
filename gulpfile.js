var gulp = require('gulp'),
    gutil = require('gulp-util'),
    os = require('os'),
    del = require('del'),
    nwb = require('nwjs-builder'),
    argv = require('yargs')
      .alias('p', 'platforms').argv,
      detectCurrentPlatform = function(){
        switch (process.platform) {
          case 'darwin':
              return process.arch === 'x64' ? 'osx64' : 'osx32';
          case 'win32':
              return (process.arch === 'x64' || process.env.hasOwnProerty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
          case 'linux':
              return process.arch === 'x64' ? 'linux64' : 'linux32';
        }
      },
      logError = function(error, code){
        return gutil.log(gutil.colors.red.bold('[ERROR:]'),gutil.colors.bgRed(err));
      },
      logSuccess = function(message){
        return gutil.log(gutil.colors.red.green('[OK:]'), message);
      };

gulp.task('run', function() {
    nwb.commands.nwbuild(['./'], {
        run: true,
        version: '0.15.3-sdk',
        withFFmpeg: true
    }, function (err, code) {
        if(err) return handleError(err);
        else if(code === 0) return logSuccess('Done');
        else return handleError('Unexpected error', code);
    });
});

gulp.task('build', ['clean'], function() {
  nwb.commands.nwbuild('./', {
        version: '0.15.3',
        platforms: argv.p ? argv.p : detectCurrentPlatform(),
        withFFmpeg: true,
        production: false,
        macIcns: './src/app/images/icons/popcorntime.icns',
        winIco: './src/app/images/icons/popcorntime.ico',
        sideBySide: false,
        includes: [
            ['./', 'package.json', './'],
            ['./', 'LICENSE.txt', './'],
            // cp -r ./src/ ${DIR_BUILD}/
            ['./', 'src/**/**', './']
        ],
    }, function(err) {
        if(err) return handleError(err);
        return logSuccess('Done');
  });
});

gulp.task('clean', function() {
    return del('build/');
});
