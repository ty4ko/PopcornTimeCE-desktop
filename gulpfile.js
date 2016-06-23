var gulp = require('gulp'),
    del = require('del'),
    nwb = require('nwjs-builder'),
    argv = require('yargs').alias('p', 'platforms').argv,
    paths = {
      build: './build',
      src: './src/',
      icons: './src/images/icons/'
    },
    detectCurrentPlatform = function(){
      switch (process.platform) {
        case 'darwin':
            return process.arch === 'x64' ? 'osx64' : 'osx32';
        case 'win32':
            return (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
        case 'linux':
            return process.arch === 'x64' ? 'linux64' : 'linux32';
      }
    };

gulp.task('run', function() {
  return new Promise(function(resolve, reject){
    nwb.commands.nwbuild([paths.src], {
        run: true,
        version: '0.15.3-sdk',
        //withFFmpeg: true
    }, function (err, code) {
        if(err) reject(err);
        else if(code === 0) resolve();
        else reject('Unexpected error', code);
    });
  });
});

gulp.task('build', ['clean'], function() {
  return new Promise(function(resolve, reject){
    nwb.commands.nwbuild(paths.src, {
          version: '0.15.3',
          platforms: argv.p ? argv.p : detectCurrentPlatform(),
          withFFmpeg: true,
          production: false,
          macIcns: paths.icons + 'popcorntime.icns',
          winIco:  paths.icons + 'popcorntime.ico',
          sideBySide: false,
      }, function(err) {
          if(err) reject(err);
          return resolve();
    });
  });
});

gulp.task('clean', function() {
    return del(paths.build);
});
