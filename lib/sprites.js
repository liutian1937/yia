'use strict';


var fs = require('fs');
var path = require('path');

var $ = require('./base.js');
var files = require('./file.js');

var Config = require('./config.js'); //加载配置文件

var spritesmith = require('spritesmith'); //合并图片


// Merge task-specific and/or target-specific options with these defaults.
var options = {
    algorithm: 'binary-tree',
    baseUrl: './',
    engine: 'auto',
    padding: 2
};

/**
 * @循环栏目
 * @param sourcePath
 * @param callback
 */
var loopDir = function(sourcePath,callback){
    var newPath, callback = callback || function(){};
    if(files.isDir(sourcePath)){
        fs.readdirSync(sourcePath).forEach(function(filename){
            newPath = path.resolve(sourcePath,filename);
            if(files.isFile(newPath)){
                callback(newPath);
            }else{
                loopDir(newPath,callback);
            }
        });
    }else{
        callback(sourcePath);
    }
}

/**
 *
 * @param callback
 */
var spriteSmithWrapper = function(callback) {

    var sprites = {};
    loopDir(Config.baseDir.images,function(source){
        var suffix = path.extname(source).replace('.','');
        if(suffix === 'png' || suffix === 'jpg'){
            var dir = path.dirname(source);
            sprites[dir] = sprites[dir] || [];
            sprites[dir].push(source);
        }
    });
    var j = 0, h = 0;
    for(var i in sprites){
        j++;
    };
    for(var i in sprites){
        (function(k){
            spritesmith({
                src: sprites[k],
                algorithm : 'top-down'
            }, function(err, result) {
                if (err) {
                    throw err;
                }

                var imgDir = path.join(Config.distDir,Config.baseDir.images);
                var name = $.hash(k)+'.png';
                var imgPath = path.join(imgDir,name);
                files.create(imgDir, function () {
                    fs.writeFileSync(imgPath,result.image,'binary');
                });

                var coords = [];
                var tmpResult = result.coordinates;
                var finished = false;

                for(var key in tmpResult) {
                    coords[key] = {
                        source: '../'+Config.baseDir.images+'/'+name,
                        x: tmpResult[key].x,
                        y: tmpResult[key].y
                    };
                };

                h++;
                if(h >= j){
                    finished = true;
                }
                callback && callback(coords,result.properties,finished);
            });

        })(i);
    }


};


/**
 * @收集图片集合
 * @returns {Array}
 */
var collectImages = function(refs) {
    var images = [];
    var httpRegex = /http[s]?/ig,
        imgRegex = /background(?:-image)?:([\s\S]*?)(?:;|$)/ig,
        filepathRegex = /\([\s\S\w]*\)/ig;

    loopDir(Config.baseDir.css,function(source){
        var suffix = path.extname(source).replace('.','');
        if(suffix === 'css'){

            var code = files.read(source);
            var references = code.match(imgRegex);


            if(references){
                references.forEach(function(bgcode) {
                    // Exit if it contains a http/https
                    if (httpRegex.test(bgcode)) {
                        $.log(bgcode + ' has been skipped as it\'s an external resource!');
                        return false;
                    }

                    var imagePath = bgcode.match(filepathRegex);
                    if(imagePath && imagePath.length > 0){
                        imagePath = imagePath[0].replace(/["'()]/g,'')
                    }else{
                        return false;
                    }

                    if(imagePath[0] === '/') {
                        imagePath = options.baseUrl + imagePath;
                    } else {
                        imagePath = path.resolve(source.substring(0, source.lastIndexOf("/")), imagePath);
                    }

                    if(refs[imagePath]){
                        code = cssReplace(bgcode,refs[imagePath],code);
                    }
                });
            };

            files.write(source,code);
            //files.create(path.dirname(output), function () {
            //    files.write(output,code);
            //});

        }
    });
};

var cssReplace = function(bgcode,obj,code){
    return code.replace(bgcode,'background-image: url(\''+ obj.source +'\');\n    background-position: -'+ obj.position.x +'px -'+ obj.position.y +'px;\n    background-size:'+obj.width+'px '+obj.height+'px!important;');
}


var sprites = module.exports = {
    init : function(callback){
        var refs = {};
        spriteSmithWrapper(function(coords,properties,finished){
            var ret = [];
            for(var key in coords) {
                refs[key] = {
                    src: key,
                    width : properties.width,
                    height : properties.height,
                    source : coords[key].source,
                    position: {
                        x: coords[key].x,
                        y: coords[key].y
                    }
                }
            };
            if(finished){
                //console.log(refs);
                collectImages(refs);
                callback && callback();
                //var collection = collectImages();
                //updateReferences('./css/icon.css', '../a.png', refs);

            }
        });

    }
};