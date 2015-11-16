/**
 * @配置信息
 * 默认读取config.js文件的配置
 */

var $ = require('./base.js');
var fs = require('fs');
var path = require('path');

var defaults = {
    port : 3000,
    hashname : true,
    hashmap : "map.json", //输出哈希表
    distDir : ".output",
    baseDir : { //初始化的配置信息
        "images": "images", //images的存放路径
        "css": "css", //css的存放路径
        "js": "js", //js的存放路径
        "html": "html" //html的存放路径，模板渲染方式
    },
    build : { //打包的配置信息
        "hashmap" : true, //哈希表输出
        "sprite" : true, //是否合并图片
        "js-compress" : true, //是否压缩脚本
        "css-compress" : true, //是否压缩css
        "html-compress" : true //是否压缩html
    }
};


module.exports = (function(){
    var configPath = path.resolve(fs.realpathSync('.'),'config.js');
    var exist = fs.existsSync(configPath);
    if(exist){
        var config = require(configPath);

        //扩展，@todo
        for(var key in config){
            defaults[key] = config[key];
        }

        //defaults = $.extend(defaults,config);
    }
    return defaults;
})();