var gulp = require('gulp'),
    glp = require('gulp-load-plugins')(),
    nwb = require('nwjs-builder'),
    argv = require('yargs').alias('p', 'platforms').argv,
    paths = {
        base: './',
        build: './build',
        src: './src',
        css: './src/css',
        images: './src/images',
        language: './src/language',
        lib: './src/lib',
        templates: './src/templates',
        themes: './src/themes',
        vendor: './src/vendor'
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

// validate css sources
gulp.task('validate:css', function () {
    var customReporter = function (file) {
        glp.util.log(glp.util.colors.cyan(file.csslint.errorCount) + ' errors in ' + glp.util.colors.magenta(file.path));
        file.csslint.results.forEach(function (result) {
            glp.util.log(result.error.message + ' on line ' + result.error.line);
        });
    };
    return gulp.src(paths.themes + '/**/*.css')
        .pipe(glp.csslint())
        .pipe(glp.csslint.reporter(customReporter))
        .pipe(glp.csslint.reporter('fail'));
});

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('validate:js', function () {
    return gulp.src(['gulpfile.js', paths.lib + '/*.js',
            paths.lib + '/**/*.js', paths.src + '/vendor/videojshooks.js',
            paths.src + '/vendor/videojsplugins.js',
            paths.src + '/*.js'
        ]).pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('jshint-stylish'))
        .pipe(glp.jshint.reporter('fail'));
});

// beautify entire code (tweak in .jsbeautifyrc)
gulp.task('beautify', function () {
    return gulp.src([
            '*.js',
            '*.json',
            paths.src + '/*.html',
            paths.src + '/*.js',
            paths.src + '/*.json',
            paths.language + '/*.json',
            paths.lib + '/*.js',
            paths.lib + '/**/*.js',
            paths.vendor + '/videojshooks.js',
            paths.vendor + '/videojsplugins.js',
            //paths.themes + '/**/*.css',
            '*.js', '*.json'
        ], {
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

gulp.task('build', ['clean:build'], function () {
    return new Promise(function (resolve, reject) {
        nwb.commands.nwbuild(paths.src, {
            version: '0.15.4',
            platforms: argv.p ? argv.p : detectCurrentPlatform(),
            withFFmpeg: true,
            production: true,
            macIcns: paths.images + '/popcorntime.icns',
            winIco: paths.images + '/popcorntime.ico',
            sideBySide: false,
            //outputFormat: 'ZIP',
            outputDir: paths.build
        }, function (err) {
            if (err) {
                reject(err);
            }
            return resolve();
        });
    });
});

// cleans build directory
gulp.task('clean:build', function () {
    return gulp.src(paths.build, {
        read: false
    }).pipe(glp.clean());
});

// cleans dependencies
gulp.task('clean:deps', function () {
    return gulp.src([paths.base + '/node_modules', paths.src + '/node_modules'], {
            read: false
        }).pipe(glp.clean())
        .pipe(glp.exec('npm install'))
        .pipe(glp.exec.reporter());
});
