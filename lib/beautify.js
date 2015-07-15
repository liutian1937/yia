/**
 * 文件美化
 * @type {exports}
 */


/*
beautify options
{
    "indent_size": 4,
    "indent_char": " ",
    "eol": "\n",
    "indent_level": 0,
    "indent_with_tabs": false,
    "preserve_newlines": true,
    "max_preserve_newlines": 10,
    "jslint_happy": false,
    "space_after_anon_function": false,
    "brace_style": "collapse",
    "keep_array_indentation": false,
    "keep_function_indentation": false,
    "space_before_conditional": true,
    "break_chained_methods": false,
    "eval_code": false,
    "unescape_strings": false,
    "wrap_line_length": 0,
    "wrap_attributes": "auto",
    "wrap_attributes_indent_size": 4,
    "end_with_newline": false
}*/

var path = require('path');
var fs = require('fs');

var file = require('./file.js');

var beautifyJson = {
    js : require('js-beautify'),
    css : require('js-beautify').css,
    html : require('js-beautify').html
}

var beautify = module.exports = {};

/**
 * @初始化目录
 * @param sourcePath 文件夹路径
 * 压缩css js html
 */
beautify.init = function(sourcePath){
    if(file.isDir(sourcePath)){
        fs.readdirSync(sourcePath).forEach(function(name){
            if(!(/^\./.test(name))) {
                beautify.init(sourcePath + '/' + name);
            }
        });
    }else{
        var suffix = path.extname(sourcePath).replace('.','');
        if(suffix === 'html' || suffix === 'css' || suffix === 'js'){
            beautify.do(sourcePath,suffix);
        }
    }
}

/**
 * @格式化文件
 * @param sourcePath
 */
beautify.do = function(sourcePath,type){
    var code = file.read(sourcePath);
    var options = {
        "indent_size": 4,
        "indent_char": " "
    }
    var beautifulCode = beautifyJson[type](code,options);
    fs.writeFileSync(sourcePath,beautifulCode);
}