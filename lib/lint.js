'use strict';

//todo:未完成

var path = require('path');

var htmllint = require('htmllint');


var $ = require('./base.js');
var file = require('./file.js');

var lint = module.exports = {
    run : function(callback){

        var Config = require('./config.js'); //加载配置文件
        var loopDir = ['images','css','js','html']; //按照这个顺序执行
        for(var i = 0; i < loopDir.length; i ++){
            var filename = Config.baseDir[loopDir[i]];
            file.loopDir('./'+filename,function(sourcePath){
                var code = file.read(sourcePath),
                    extendname = path.extname(sourcePath);
                if(extendname === '.html' || extendname === '.htm'){
                   var a =  htmllint(code,{
                       'doctype-html5' : true,
                       'attr-bans' : true
                   });
                   console.log(a);
                }else if(extendname === '.css'){

                }
            });
        }
    }
}