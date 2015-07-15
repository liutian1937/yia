/**
 * 文件压缩
 * @type {exports}
 */

var path = require('path');
var fs = require('fs');

var file = require('./file.js');

var Config = require('./config.js');
var UglifyJS = require("uglify-js");
var CleanCSS = require("clean-css");
var MiniHTML = require('html-minifier').minify;


var compress = module.exports = {};

/**
 * @初始化目录
 * @param sourcePath 文件夹路径
 * 压缩css js html
 */
compress.init = function(sourcePath){
    if(file.isDir(sourcePath)){
        fs.readdirSync(sourcePath).forEach(function(name){
            if(!(/^\./.test(name))) {
                compress.init(sourcePath + '/' + name);
            }
        });
    }else{
        var suffix = path.extname(sourcePath);
        if(suffix === '.css'){
            compress.css(sourcePath);
        }else if(suffix === '.js'){
            compress.js(sourcePath);
        }else if(suffix === '.html' || suffix === '.htm'){
            compress.html(sourcePath);
        }
    }
}

/**
 * @压缩css
 * @param sourcePath
 */
compress.css = function(sourcePath){
    var code = fs.readFileSync(sourcePath),
        filename = path.basename(sourcePath,'.css'),
        outputPath = path.join(Config.distDir,sourcePath),
        miniCode = new CleanCSS().minify(code).styles;
    fs.writeFileSync(outputPath,miniCode);
}

/**
 * @压缩js
 * @param sourcePath
 */
compress.js = function(sourcePath){
    var code = fs.readFileSync(sourcePath,'utf-8'),
        filename = path.basename(sourcePath,'.js'),
        outputPath = path.join(Config.distDir,sourcePath);

    var toplevel = null;
    toplevel = UglifyJS.parse(code, {
        filename: path.basename(sourcePath),
        toplevel: toplevel
    });
    toplevel.figure_out_scope();
    var compressor = UglifyJS.Compressor();
    var compressed_ast = toplevel.transform(compressor);
    compressed_ast.figure_out_scope();
    compressed_ast.compute_char_frequency();
    compressed_ast.mangle_names();
    var stream = UglifyJS.OutputStream();
    compressed_ast.print(stream);
    var code = stream.toString();
    fs.writeFileSync(outputPath,code);
}

/**
 * @压缩html
 * @param sourcePath
 */
compress.html = function(sourcePath){
    var code = file.read(sourcePath),
        filename = path.basename(sourcePath,'.html'),
        outputPath = path.join(Config.distDir,sourcePath);

    var miniCode = MiniHTML(code,{
        //collapseWhitespace: true,	//移除的空格
        removeComments: true,		//移除注释
        minifyJS: true,				//压缩js
        minifyCSS: true				//压缩css
    })
    fs.writeFileSync(outputPath,miniCode);
}