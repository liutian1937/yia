'use strict';

//模块
var fs = require('fs');
var path = require('path');
var spritesmith = require('spritesmith'); //合并图片

var file = require('./file.js');
var beautify = require('./beautify.js'); //格式化css js

module.exports = {
    run : function(callback){

        var spriteImg = './sprite/sprites.png',
            spriteCss = './sprite/sprites.css';
        file.create('sprite',function(){

            file.del(spriteImg);
            file.del(spriteCss);

            var imagesList = [];
            fs.readdirSync('./').forEach(function(filename){
                imagesList.push('./'+filename);
            });
            spritesmith({
                src: imagesList,
                algorithm : 'top-down'
            }, function(err, result) {
                if (err) {
                    throw err;
                };
                fs.writeFileSync(spriteImg,result.image,'binary');
                var code = '';
                var tmpResult = result.coordinates;
                for(var key in tmpResult) {
                    var extendname = path.extname(key),
                        filename = path.basename(key,extendname);
                    code += '.'+filename+'{background-image: url(\''+ imagePath +'\');\n    background-position: -'+ tmpResult[key].x +'px -'+ tmpResult[key].y +'px;\n    background-size:'+result.properties.width+'px '+result.properties.height+'px!important;}';
                };
                fs.writeFileSync(spriteCss,code);
                beautify.do(spriteCss,'css');
                callback && callback();
            });

        });

    }
}