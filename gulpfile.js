const projectFolder = require('path').basename(__dirname);
const srcFolder = "#src";

const fs = require('fs')

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/"
  },
  src: {
    html: [srcFolder + "/*.html", "!" + srcFolder + "/_*.html"],
    css: srcFolder + "/sass/*.{sass,css}",
    js: srcFolder + "/js/*.js",
    img: srcFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: srcFolder + "/fonts/**/*.ttf",
  },
  watch: {
    html: srcFolder + "/**/*.html",
    css: srcFolder + "/sass/**/*.{sass,css}",
    js: srcFolder + "/js/**/*.js",
    img: srcFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: projectFolder + "/fonts/**/*.ttf"
  },
  clean: "./" + projectFolder + "/"
}

const {src, dest} = require('gulp'),
  gulp = require('gulp'),
  browser_sync = require('browser-sync').create(),
  file_include = require('gulp-file-include'),
  del = require('del'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_medea = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify_es = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  webp = require('gulp-webp'),
  webp_html = require('gulp-webp-html'),
  webp_css = require('gulp-webp-css'),
  svg_sprite = require('gulp-svg-sprite'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter')


function browserSync(params) {
  browser_sync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 4000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(file_include())
    .pipe(webp_html())
    .pipe(dest(path.build.html))
    .pipe(browser_sync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      sass({
        outputStyle: "expanded"
           })
    )
    .pipe(group_medea())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 5 versions"],
      cascade: true
    }))
    .pipe(webp_css())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(rename({
      extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browser_sync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(file_include())
    .pipe(dest(path.build.js))
    .pipe(uglify_es())
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browser_sync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false}],
      interlaced: true,
      optimizationLevel: 3 //0-7
    }))
    .pipe(dest(path.build.img))
    .pipe(browser_sync.stream())
}

function fonts(params) {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts))
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts))
}

gulp.task('svg_sprite', () => {
  return gulp.src([srcFolder + '/iconsprite/*.svg'])
    .pipe(svg_sprite({
      mode: {
        stack: {
          sprite: '../icons/icons.svg', //sprite file name
          //example: true
        }
      }
    }))
    .pipe(dest(path.build.img))
})

gulp.task('otf2ttf', () => {
  return src([srcFolder + '/fonts/*.otf'])
    .pipe(fonter({
      formats: ['ttf']
    }))
    .pipe(dest(srcFolder + '/fonts/'))
})

function fontsStyle(params) {
  let file_content = fs.readFileSync(srcFolder + '/sass/fonts.sass');
  if (file_content === '') {
    fs.writeFile(`${srcFolder}/sass/fonts.sass`, '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (let i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname !== fontname) {
           fs.appendFile(`${srcFolder}/sass/fonts.sass`, `@include font("${fontname}", "${fontname}", "400", "normal");\\r\\n`, cb);
          }
          c_fontname = fontname;
        }
      }
    })
  }
}

function cb() { }

function watchFiles() {
  gulp.watch([path.watch.html], {usePolling: true}, html);
  gulp.watch([path.watch.css], {usePolling: true}, css);
  gulp.watch([path.watch.js], {usePolling: true}, js);
  gulp.watch([path.watch.img], {usePolling: true}, images);
}

function clean(params) {
  return del(path.clean)
}

const build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle)
const watch = gulp.parallel(build, watchFiles, browserSync)

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;