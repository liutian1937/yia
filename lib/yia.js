/**
 * yia 前端工程化组件
 * yia -h 获取命令
 */

var path = require('path');

var $ = require('./base.js'); //工具集
var file = require('./file.js'); //文件处理


var Config = require('./config.js'); //加载配置文件

/**
 * 处理压缩，格式化，合并，雪碧图等
 */
var sprites = require('./sprites.js');
var compress = require('./compress.js'); //压缩css js
var beautify = require('./beautify.js'); //格式化css js


var yia = module.exports =  {};

var basePath = path.resolve(__dirname,'..');

/**
 * @初始化工程
 * 创建工作目录
 */
yia.init = function(){
    $.log('Initialize start ... ','blue');
    for(var name in Config.baseDir){
        var filename = Config.baseDir[name];
        file.create(filename);
        //复制html模板
        if(name === 'html'){
            var temPath = path.resolve(__dirname,'../template/index.html');
            file.write(filename+'/index.html',temPath,function(err){
                if(err) throw err;
            });
        }
    }
    $.log('Initialize success !!!','blue');
}

/**
 * @格式化代码
 */
yia.format = function(){
    $.log('format start ... ','blue');
    for(var name in Config.baseDir){
        var filename = Config.baseDir[name];
        if(filename !== Config.distDir){
            beautify.init(filename);
        }
    }
    $.log('format success !!!','blue');
}

/**
 * 打包工程
 * css , js 压缩
 * images sprite
 */
yia.build = function(){
    $.log('build start ... ','blue');
    file.del(Config.distDir);
    for(var name in Config.baseDir){
        var filename = Config.baseDir[name];
        var outputPath = path.join(Config.distDir,filename);
        //创建目录，压缩代码
        file.create(outputPath,function(){
            compress.init(filename);
        });
    }
    $.log('build success !!!','blue');
}

yia.sprite = function(callback){
    $.log('sprite start ...','blue');
    //css sprite
    sprites.init(function(){
        callback && callback();
        $.log('sprite success !!!','blue');
    });
}

/**
 * @创建http服务
 */
yia.server = function(){
    var server = require('./server.js');
    server.start();
}

yia.test = function(){


    var img = sprites.init();

    //// Load in dependencies




}