var gulp = require('gulp'),
    glp = require('gulp-load-plugins')(),
    del = require('del'),
    nwb = require('nwjs-builder'),
    argv = require('yargs').alias('p', 'platforms').argv,
    paths = {
        base: './',
        build: './build',
        src: './src',
        lib: './src/lib',
        icons: './src/images/icons'
    },
    detectCurrentPlatform = function () {
        switch (process.platform) {
        case 'darwin':
            return process.arch === 'x64' ? 'osx64' : 'osx32';
        case 'win32':
            return (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
        case 'linux':
            return process.arch === 'x64' ? 'linux64' : 'linux32';
        }
    };

gulp.task('pre-commit', ['jshint']);

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('jshint', function () {
    return gulp.src(['gulpfile.js', paths.lib + '/*.js', paths.lib + '/**/*.js', paths.src + '/vendor/videojshooks.js', paths.src + '/vendor/videojsplugins.js', paths.src + '/*.js'])
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('jshint-stylish'))
        .pipe(glp.jshint.reporter('fail'));
});

// beautify entire code (tweak in .jsbeautifyrc)
gulp.task('jsbeautifier', function () {
    return gulp.src([paths.lib + '/*.js', paths.lib + '/**/*.js', paths.src + '/*.js', paths.src + '/vendor/videojshooks.js', paths.src + '/vendor/videojsplugins.js', '*.js', '*.json'], {
            base: paths.base
        })
        .pipe(glp.jsbeautifier({
            config: '.jsbeautifyrc'
        }))
        .pipe(glp.jsbeautifier.reporter())
        .pipe(gulp.dest(paths.base));
});

gulp.task('run', function () {
    return new Promise(function (resolve, reject) {
        nwb.commands.nwbuild([paths.src], {
            run: true,
            version: '0.15.4-sdk',
            withFFmpeg: true
        }, function (err, code) {
            if (err) {
                reject(err);
            } else if (code === 0) {
                resolve();
            } else {
                reject('Unexpected error', code);
            }
        });
    });
});

gulp.task('build', ['clean'], function () {
    return new Promise(function (resolve, reject) {
        nwb.commands.nwbuild(paths.src, {
            version: '0.15.4',
            platforms: argv.p ? argv.p : detectCurrentPlatform(),
            withFFmpeg: true,
            production: true,
            macIcns: paths.icons + '/popcorntime.icns',
            winIco: paths.icons + '/popcorntime.ico',
            sideBySide: false,
            outputDir: paths.build
        }, function (err) {
            if (err) {
                reject(err);
            }
            return resolve();
        });
    });
});

gulp.task('clean', function () {
    return del(paths.build);
});