const gulp = require('gulp');

const javascriptObfuscator = require('gulp-javascript-obfuscator');
const gulpEsbuild = require('gulp-esbuild');

const gulpTs = require('gulp-typescript');
const tsProject = gulpTs.createProject('tsconfig.build.json', {
  typescript: require('typescript'),
});

const gulpRename = require('gulp-rename');

const merge = require('merge2');

const rsync = require('gulp-rsync');

const conditionalBuild = require('../../esbuild/esbuild-plugin-conditional-build.js');

// more options: https://www.npmjs.com/package/javascript-obfuscator
const obfOptions = {
  compact: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  identifierNamesGenerator: 'mangled-shuffled',
  ignoreImports: true,
  stringArrayThreshold: 1,
};

gulp.task('compile', function () {
  const tsResult = tsProject
    .src()
    .pipe(tsProject())
    .on('error', () => {
      /* Ignore compiler errors */
    });
  return merge([
    tsResult.dts.pipe(gulp.dest('./dist')),
    tsResult.js.pipe(gulp.dest('./dist')),
  ]);
});

gulp.task('not-minify', function () {
  return gulp
    .src(['./dist/**/{PSThreadItemContent.js,index.js}', './dist/**/{PSMessageAwesomeMessageWrapper.js,index.js}', './dist/**/{PSMessageStickerWrapper.js,index.js}', './dist/**/{PSMessageInput.js,index.js}', './dist/**/{PSSkeleton.js,index.js}'], {base: '.'})
    .pipe(
      gulpEsbuild({
        // minify: true,
        loader: {
          '.js': 'jsx',
        },
      }),
    )
    .pipe(javascriptObfuscator(obfOptions))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify-dev', function () {
  return gulp
    .src(['./dist/**/*.js', '!./dist/**/PSThreadItemContent.js', '!./dist/**/PSMessageAwesomeMessageWrapper.js', '!./dist/**/PSMessageStickerWrapper.js', '!./dist/**/PSMessageInput.js', '!./dist/**/PSSkeleton.js'], {
      base: '.',
    })
    .pipe(
      gulpEsbuild({
        minify: true,
        loader: {
          '.js': 'jsx',
        },
        plugins: [conditionalBuild(['DEVELOPMENT'])],
      }),
    )
    .pipe(javascriptObfuscator(obfOptions)) // more options: https://www.npmjs.com/package/javascript-obfuscator
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', function () {
  return gulp
    .src(['./dist/**/*.js', '!./dist/**/PSThreadItemContent.js', '!./dist/**/PSMessageAwesomeMessageWrapper.js', '!./dist/**/PSMessageStickerWrapper.js', '!./dist/**/PSMessageInput.js', '!./dist/**/PSSkeleton.js'], {
      base: '.',
    })
    .pipe(
      gulpEsbuild({
        minify: true,
        loader: {
          '.js': 'jsx',
        },
        plugins: [conditionalBuild(['PRODUCTION'])],
      }),
    )
    .pipe(javascriptObfuscator(obfOptions)) // more options: https://www.npmjs.com/package/javascript-obfuscator
    .pipe(gulp.dest('./dist'));
});

gulp.task('prepack', function () {
  const packageJson = gulp
    .src(['./package.build.json'])
    .pipe(gulpRename('./dist/package.json'))
    .pipe(gulp.dest('.'));

  const assets = gulp
    .src(['src/assets/**', 'src/translations/resources/**'])
    .pipe(
      rsync({
        root: 'src/',
        silent: true,
        exclude: ['*'],
        include: ['*.png', '*.json', '*/'],
        destination: './dist/src',
      }),
    );

  const others = gulp.src(['./LICENSE', './README.md']).pipe(gulp.dest('dist'));

  return merge(packageJson, assets, others);
});

gulp.task(
  'build-dev',
  gulp.series('compile', 'not-minify', 'minify-dev', 'prepack'),
);

gulp.task('build', gulp.series('compile', 'not-minify', 'minify', 'prepack'));
