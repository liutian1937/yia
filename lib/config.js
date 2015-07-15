/**
 * @配置信息
 * 默认读取config.json文件的配置
 */

var $ = require('./base.js');
var fs = require('fs');
var path = require('path');
var defaults = {
    distDir : 'dist',
    baseDir : { //初始化的配置信息
        "css": "css", //css的存放路径
        "js": "js", //js的存放路径
        "images": "images", //images的存放路径
        "html": "html", //html的存放路径，模板渲染方式
    },

    build : { //打包的配置信息

    }
};


module.exports = (function(){
    var configPath = path.resolve(fs.realpathSync('.'),'config.json');
    var exist = fs.existsSync(configPath);
    if(exist){
        var config = require(configPath);
        defaults = $.extend(defaults,config);
    }
    return defaults;
})();