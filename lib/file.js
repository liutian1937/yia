'use strict';
var fs = require("fs");
var path = require("path");
var file = module.exports;

/**
 * @读取文件
 * @param sourcePath
 * @returns {*}
 */
file.read = function(sourcePath){
    return fs.existsSync(sourcePath) && fs.readFileSync(sourcePath,'utf-8');
}

/**
 * @写入文件
 * @param targetPath 目标路径，
 * @param source  资源路径|资源代码
 * @returns {*}
 */
file.write = function(target,source,callback){
    if(fs.existsSync(source)){
        source = fs.readFileSync(source,'utf-8');
    };
    fs.writeFileSync(target,source);
    callback && callback();
}


/**
 * @是否是目录
 * @param sourcePath 文件路径
 * @returns {*}
 */
file.isDir = function(sourcePath){
    return fs.existsSync(sourcePath) && fs.statSync(sourcePath).isDirectory()
}

/**
 * @是否是文件
 * @param sourcePath 文件路径
 * @returns {*}
 */
file.isFile = function(sourcePath){
    return fs.existsSync(sourcePath) && fs.statSync(sourcePath).isFile()
}

/**
 * @创建文件夹
 * @param dirPath 文件夹路径
 */
file.create = function(sourcePath,callback){
    var pathArr = sourcePath.split('/'),
        len = pathArr.length,
        pathPlus = '';
    for(var i = 0; i < len; i++){
        if(pathArr[i] !== '.'){
            if(pathPlus === ''){
                pathPlus += './'+pathArr[i];
            }else{
                pathPlus += '/'+pathArr[i];
            }
            if(!fs.existsSync(pathPlus)){
                fs.mkdirSync(pathPlus);
            }
        }else{
            pathPlus += '.';
        }
    }
    callback && callback();
}

/**
 * @删除文件夹，不判断是否有文件，直接删除
 * @param sourcePath 文件夹路径
 */
file.del = function(sourcePath){
    var files = [], self = this;
    if(self.isFile(sourcePath)){
        fs.unlinkSync(sourcePath);
    }else if(self.isDir(sourcePath)){
        files = fs.readdirSync(sourcePath);
        files.forEach(function(file){
            var curPath = sourcePath + "/" + file;
            self.del(curPath);
        });
        fs.rmdirSync(sourcePath);
    };
}