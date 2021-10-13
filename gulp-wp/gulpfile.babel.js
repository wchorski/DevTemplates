const websiteName = 'alitut';


import gulp from 'gulp';
// import filelog from 'gulp-filelog';
import yargs from 'yargs';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imageMin from 'gulp-imagemin';
import del from 'del';
import webpack from 'webpack-stream';
import vNamed from 'vinyl-named';
import browserSync from 'browser-sync';
import zip from 'gulp-zip';
import replace from 'gulp-replace';
import pkgJ from './package.json';
import rename from 'gulp-rename';
import wpPot from 'gulp-wp-pot';
import { info } from 'console';

const fs = require('fs');

const serverSync = browserSync.create();
const PRODUCTION = yargs.argv.prod;
//** TODO insert this variable to serverSync */

const paths = {
  rename: {
    src: [
      'archive-_themen_portfolio.php',
      'single-_themen_portfolio.php',
      'taxonomy-_themen_project_type.php',
      'taxonomy-_themen_skills.php',
      // gotta copy over items above and add ! to the buildZip src
    ]
  },
  styles: {
    src: ['src/assets/scss/bundle.scss', 'src/assets/scss/admin.scss', 'src/assets/scss/editor.scss'],
    dest: 'dist/assets/css'
  },
  scripts: {
    src: ['src/assets/js/bundle.js', 'src/assets/js/admin.js', 'src/assets/js/customize-preview.js'],
    dest: 'dist/assets/js'
  },
  img: {
    src: 'src/assets/img/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/img'
  },
  other: {
    src: [
      'src/assets/**/*',
      '!src/assets/{img,js,scss}',
      '!src/assets/{img,js,scss}/**/*'
    ],
    dest: 'dist/assets'
  },
  plugins: {
    src: [
      '../../plugins/_themen-metaboxes/buildZip/*',
      '../../plugins/_themen-shortcodes/buildZip/*',
      '../../plugins/_themen-post-types/buildZip/*'
    ],
    dest: ['lib/plugins']
  },
  buildZip: {
    src: [
      '**/*',
      '!.vscode',
      '!node_modules{,/**}',
      '!src{,/**}', '!buildZip{,/**}',
      '!.babelrc', '!.gitignore',
      '!gulpfile.babel.js',
      '!package.json',
      '!package-lock.json',
      '!archive-_themen_portfolio.php',
      '!single-_themen_portfolio.php',
      '!taxonomy-_themen_project_type.php',
      '!taxonomy-_themen_skills.php'
    ],
    dest: 'buildZip'
  }
}

//** TASKS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

export const potTask = () => {
  return gulp.src('**/*.php').pipe(wpPot({
    domain: '_themen',
    package: pkgJ.name
  })).pipe(gulp.dest(`languages/${pkgJ.name}.pot`));
}

export const replace_filenames = () => {
  return gulp.src(paths.rename.src).pipe(rename((path) => {
    path.basename = path.basename.replace("_themen", pkgJ.name)
  }))
    .pipe(gulp.dest('./'));
}

export const delete_replaced_filenames = () => {
  return del(paths.rename.src.map((filename) => filename.replace("_themen", pkgJ.name)));
}

//? me trying to automate this but i give up
// let path2Website = __dirname;
// export const getWebsitePath = (done) => {

//   fs.realpath(path2Website, (error, resolvedPath) => { 
//     if (error){
//       console.log(error)
//     } else {

//       console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
//       path2Website = path2Website.replace('C://MAMP//htdocs//', '');
//       path2Website = path2Website.split('wp-content')[0];
//       console.log('DIRECTORY NAME: ' + path2Website);
//       console.log('>>>>>>>>>>>>>>>>>>>>>>>>');
//       return(path2Website);

//     }
//   });
//   done();
// }

export const serveBrowser = (done) => {

  serverSync.init({
    proxy: `http://localhost/${websiteName}/`
  });
  done();
}

export const reloadBrowser = (done) => {
  serverSync.reload();
  done();
}

export const cleanTask = () => del(['dist']);

export const stylesTask = (done) => {
  return gulp.src(paths.styles.src)
    .pipe(gulpif(!PRODUCTION, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(PRODUCTION, cleanCSS({ compatability: 'ie8' })))
    .pipe(gulpif(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(serverSync.stream());
}

export const imageTask = () => {
  return gulp.src(paths.img.src)
    .pipe(gulpif(PRODUCTION, imageMin()))
    .pipe(gulp.dest(paths.img.dest));
}

export const scriptsTask = () => {
  return gulp.src(paths.scripts.src)
    .pipe(vNamed())
    .pipe(webpack({
      module: {
        rules:
          [
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env']
                }
              }
            }
          ]
      },
      output: {
        filename: '[name].js'
      },
      externals: {
        jquery: 'jQuery'
      },
      devtool: !PRODUCTION ? 'inline-source-map' : false,
      mode: PRODUCTION ? 'production' : 'development'
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}

export const otherTask = () => {
  return gulp.src(paths.other.src)
    .pipe(gulp.dest(paths.other.dest));
}

export const pluginsTask = () => {
  return gulp.src(paths.plugins.src)
    .pipe(gulp.dest(paths.plugins.dest));
}

//** END TASKS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/


//** WATCH >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
export const watch = () => {
  gulp.watch('src/assets/scss/**/*.scss', gulp.series(stylesTask, reloadBrowser));
  gulp.watch('src/assets/js/**/*.js', gulp.series(scriptsTask, reloadBrowser));
  gulp.watch('**/*.php', reloadBrowser);
  gulp.watch(paths.img.src, gulp.series(imageTask, reloadBrowser));
  gulp.watch(paths.other.src, gulp.series(otherTask, reloadBrowser));
}


//** Executables >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
export const zipMe = () => {
  return gulp.src(paths.buildZip.src)
    .pipe(gulpif((file) => (file.relative.split('.').pop() !== 'zip'), replace('_themen', pkgJ.name)))
    .pipe(zip(`${pkgJ.name}_000.zip`))
    .pipe(gulp.dest(paths.buildZip.dest));
}

export const dev = gulp.series(cleanTask, gulp.parallel(stylesTask, imageTask, scriptsTask, otherTask), serveBrowser, watch);
export const build = gulp.series(cleanTask, gulp.parallel(stylesTask, imageTask, scriptsTask, otherTask), pluginsTask, potTask);
export const bundle = gulp.series(build, replace_filenames, zipMe, delete_replaced_filenames);

export default dev;