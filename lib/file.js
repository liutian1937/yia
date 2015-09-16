'use strict';
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");

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
 * @param sourceCode  资源路径|资源代码
 * @returns {*}
 */
file.write = function(target,sourceCode,callback){
    var dir = path.join(target,'..');
    if(!file.isDir(dir)){
        file.create(dir);
    }
    fs.writeFileSync(target,sourceCode);
    callback && callback();
}

/**
 * @复制文件
 * @param target 目标路径，
 * @param source  资源路径|资源代码
 * @returns {*}
 */
file.copy = function(target,source,callback){
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
};

/**
 * @获取文件的hash
 * 文件路径
 */
file.hashSync = function(sourcePath,callback){
    var hash = crypto.createHash('md5'),
        stream = fs.createReadStream(sourcePath);
    stream.on('data', function (data) {
        hash.update(data, 'utf8')
    });
    stream.on('end', function () {
        var hex =  hash.digest('hex');
        //callback(hex);
        console.log(hex);
    });
}

/**
 * @重命名
 * @param filepath
 * @returns {Stream.Transform}
 */
file.rename = function(filepath){
    var Stream = require('stream')
    var stream = new Stream.Transform( { objectMode: true } );
    stream._transform = function (file, encoding, callback) {
        file.path = path.join(file.base, filepath);
        callback(null,file);
    }
    return stream;
}

/**
 * @获取文件名称
 * @param filepath 文件路径
 * @returns {*}
 */
file.getname = function(filepath){
    var extname = path.extname(filepath);
    return path.basename(filepath,extname);
}


file.JSONFormat = (function(){
    var p = [],
        push = function( m ) { return '\\' + p.push( m ) + '\\'; },
        pop = function( m, i ) { return p[i-1] },
        tabs = function( count ) { return new Array( count + 1 ).join( '\t' ); };

    return function ( json ) {
        p = [];
        var out = "",
            indent = 0;

        // Extract backslashes and strings
        json = json
            .replace( /\\./g, push )
            .replace( /(".*?"|'.*?')/g, push )
            .replace( /\s+/, '' );

        // Indent and insert newlines
        for( var i = 0; i < json.length; i++ ) {
            var c = json.charAt(i);

            switch(c) {
                case '{':
                case '[':
                    out += c + "\n" + tabs(++indent);
                    break;
                case '}':
                case ']':
                    out += "\n" + tabs(--indent) + c;
                    break;
                case ',':
                    out += ",\n" + tabs(indent);
                    break;
                case ':':
                    out += ": ";
                    break;
                default:
                    out += c;
                    break;
            }
        }

        // Strip whitespace from numeric arrays and put backslashes
        // and strings back in
        out = out
            .replace( /\[[\d,\s]+?\]/g, function(m){ return m.replace(/\s/g,''); } )
            .replace( /\\(\d+)\\/g, pop ) // strings
            .replace( /\\(\d+)\\/g, pop ); // backslashes in strings

        return out;
    };
})();


/**
 * @循环栏目
 * @param sourcePath
 * @param callback
 */
file.loopDir = function(sourcePath,callback){
    var newPath, callback = callback || function(){};
    if(file.isDir(sourcePath)){
        fs.readdirSync(sourcePath).forEach(function(filename){
            newPath = path.resolve(sourcePath,filename);
            if(file.isFile(newPath)){
                callback(newPath);
            }else{
                file.loopDir(newPath,callback);
            }
        });
    }else{
        callback(sourcePath);
    }
}