const check = require('./class/check')
const gulp = require('gulp')

// 引入我们的gulp组件
const sass 			= require('gulp-ruby-sass'),			// CSS预处理/Sass编译
    uglify 			= require('gulp-uglify'),				// JS文件压缩
    imagemin 		= require('gulp-imagemin'),		// imagemin 图片压缩
    pngquant 		= require('imagemin-pngquant'),	// imagemin 深度压缩
    livereload 		= require('gulp-livereload'),			// 网页自动刷新（服务器控制客户端同步刷新）
    webserver 		= require('gulp-webserver'),		// 本地服务器
    rename 		    = require('gulp-rename'),			// 文件重命名
    sourcemaps 	    = require('gulp-sourcemaps'),		// 来源地图
    changed 		= require('gulp-changed'),		// 只操作有过修改的文件
    babel           = require('gulp-babel'),		// es6 => es5
    gutil           = require('gulp-util'),		// es6 => es5
    plumber         = require('gulp-plumber');  //错误处理


if (!check.check()) {
    gulp.task('default')
    return false
} else {

    /* = 全局设置
-------------------------------------------------------------- */
    let projectRoute = 'web/' + check.project
    console.log(projectRoute)
    let srcPath = {
        html	: projectRoute + '/app',
        css		: projectRoute + '/app/scss',
        script	: projectRoute + '/app/js',
        image	: projectRoute + '/app/images'
    };
    let destPath = {
        html	: projectRoute + '/dist',
        css		: projectRoute + '/dist/css',
        script	: projectRoute + '/dist/js',
        image	: projectRoute + '/dist/images'
    };

    // HTML处理
    gulp.task('html', function() {
        return gulp.src( srcPath.html+'/**/*.html' )
            .pipe(changed( destPath.html ))
            .pipe(gulp.dest( destPath.html ));
    });
    // 样式处理
    gulp.task('sass', function () {
        return sass( srcPath.css + '/**/*.scss', { style: 'compact', sourcemap: true }) // 指明源文件路径、并进行文件匹配（编译风格：简洁格式）
            .pipe(sourcemaps.write('maps')) // 地图输出路径（存放位置）
            .pipe(gulp.dest( destPath.css )); // 输出路径
    });
    // JS文件压缩&重命名
    gulp.task('script', function() {
        return gulp.src( srcPath.script+'/**/*.js' ) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
            .pipe(plumber({
                errorHandler: function (err) {
                    gutil.log(gutil.colors.red('( ¯▽¯；) ( ¯▽¯；) ( ¯▽¯；)'));
                    gutil.log(gutil.colors.red('[Error]'), err.toString());
                    gutil.log(gutil.colors.red('[CodePosition]'), err.loc);
                    this.emit('end')
                }
            }))
            .pipe(babel({
                presets: ['es2015'] // es5检查机制
            }))
            .pipe(changed( destPath.script )) // 对应匹配的文件
            .pipe(sourcemaps.init()) // 执行sourcemaps
            .pipe(rename({ suffix: '.min' })) // 重命名
            .pipe(uglify())
            .pipe(gulp.dest( destPath.script )); // 输出路径
    });
    // imagemin 图片压缩
    gulp.task('images', function(){
        return gulp.src( srcPath.image+'/**/*' ) // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
            .pipe(changed( destPath.image ))
            .pipe(imagemin({
                progressive: true, // 无损压缩JPG图片
                svgoPlugins: [{removeViewBox: false}], // 不要移除svg的viewbox属性
                use: [pngquant()] // 深度压缩PNG
            }))
            .pipe(gulp.dest( destPath.image )); // 输出路径
    });
    // 文件合并
    gulp.task('concat', function () {
        return gulp.src( srcPath.script+'/*.min.js' )  // 要合并的文件
            .pipe(concat('libs.js')) // 合并成libs.js
            .pipe(rename({ suffix: '.min' })) // 重命名
            .pipe(gulp.dest( destPath.script )); // 输出路径
    });
    // 本地服务器
    gulp.task('webserver', function() {
        gulp.src( destPath.html ) // 服务器目录（.代表根目录）
            .pipe(webserver({ // 运行gulp-webserver
                livereload: true, // 启用LiveReload
                open: true // 服务器启动时自动打开网页
            }));
    });
    // 监听任务
    gulp.task('watch',function(){
        // 监听 html
        gulp.watch( srcPath.html+'/**/*.html' , ['html']);
        // 监听 scss
        gulp.watch( srcPath.css+'/**/*.scss' , ['sass']);
        // 监听 images
        gulp.watch( srcPath.image+'/**/*' , ['images']);
        // 监听 js
        gulp.watch( [srcPath.script+'/*.js'] , ['script']);
    });
    // 默认任务
    gulp.task('default',['images', 'watch']);
}
