/**
 * 文件压缩
 * @type {exports}
 */

var path = require('path');
var fs = require('fs');


var UglifyJS = require("uglify-js"); //压缩js
var CleanCSS = require("clean-css"); //压缩css
var MiniHTML = require('html-minifier').minify; //压缩html
var Imagemin = require('imagemin'); //压缩图片
var spritesmith = require('spritesmith'); //合并图片


var $ = require('./base.js');
var file = require('./file.js');
var Config = require('./config.js');


var crypto = require("crypto");

var compress = module.exports = {};
var hashMap = {
    css : {},
    js : {},
    images : {}
};

function outMap(sourcePath,hash){
    var mapDir = path.join(Config.distDir,'./.ver/');
    file.write(mapDir+sourcePath+'.txt',hash);
}

function getHash(data){
    if(Config.hashname){
        var hash = crypto.createHash('md5');
        hash.update(data, 'utf8');
        return '@'+hash.digest('hex');
    }else{
        return '';
    }
}
function hashWriteFile(){
    var filepath = path.join(Config.distDir,Config.hashmap);
    file.write(filepath,file.JSONFormat(JSON.stringify(hashMap)));
}


/**
 * @初始化目录
 * @param sourcePath 文件夹路径
 * 压缩css js html
 */
compress.run = function(sourcePath){
    if(file.isDir(sourcePath)){
        fs.readdirSync(sourcePath).forEach(function(name){
            if(!(/^\./.test(name))) {
                compress.run(sourcePath + '/' + name);
            }
            hashWriteFile();
        });
    }else{
        var suffix = path.extname(sourcePath);
        if(suffix === '.css'){
            compress.css(sourcePath);
        }else if(suffix === '.js'){
            compress.js(sourcePath);
        }else if(suffix === '.html' || suffix === '.htm' || suffix === '.vm' || suffix === '.jsp'){
            compress.html(sourcePath,suffix);
        }else if(suffix === '.jpg' || suffix === '.png'){
            compress.images(sourcePath);
        }
    };
}

/**
 * @压缩images
 * @param sourcePath
 */
compress.images = function(sourcePath){
    var code = fs.readFileSync(sourcePath),
        extendname = path.extname(sourcePath),
        filename = path.basename(sourcePath,extendname),
        hash = getHash(code),
        hashName = filename+hash;
    var outname = hashName+extendname;
    var outpath = path.join(Config.distDir,sourcePath,'..');

    hashMap.images[sourcePath] = sourcePath.replace(filename,hashName);
    outMap(sourcePath,hash); // output hash file

    new Imagemin()
        .src(sourcePath)
        .use(file.rename(outname))
        .dest(outpath)
        .use(Imagemin.optipng({optimizationLevel: 3})).run();
}


/**
 * @压缩js
 * @param sourcePath
 */
compress.js = function(sourcePath){
    var code = fs.readFileSync(sourcePath,'utf-8'),
        filename = path.basename(sourcePath,'.js'),
        hash = getHash(code),
        hashName = filename+hash;

    var outputPath = path.join(Config.distDir,sourcePath,'../'+hashName+'.js');

    hashMap.js[sourcePath] = sourcePath.replace(filename,hashName);

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
    outMap(sourcePath,hash); // output hash file
    //console.log('js');
}

/**
 * @压缩html
 * @param sourcePath
 */
compress.html = function(sourcePath,suffix){
    var suffix = suffix || '.html';
    var code = file.read(sourcePath),
        filename = path.basename(sourcePath,suffix),
        outputPath = path.join(Config.distDir,sourcePath);

    //for(var key in hashMap.css){
    //    code = code.replace(key,hashMap.css[key]);
    //}

    var miniCode = MiniHTML(code,{
        //collapseWhitespace: true,	//移除的空格
        removeComments: true,		//移除注释
        minifyJS: true,				//压缩js
        minifyCSS: true				//压缩css
    });
    miniCode = convertHtml(miniCode);
    fs.writeFileSync(outputPath,miniCode);
}

function revertPath(src){
    var template = "<%@ include file='{{path}}.txt' %>";
    var filename = path.basename(src);
    var extname = path.extname(src);
    var reSrc = path.join('.ver',src.replace('..',''));
    var revertPath = filename.replace(extname,template.replace('{{path}}',reSrc)+extname);
    return src.replace(filename,revertPath);
}

function convertHtml(code){

    var ScriptRegex = /<script([\s\S]*?)\s+src([\s\S]*?)(><\/script>|$)/ig;
    var StyleRegex = /<link([\s\S]*?)href([\s\S]*?)(>|$)/ig;
    var ImagesRegex = /<img([\s\S]*?)src([\s\S]*?)(>|$)/ig;

    var JsRegex = /<script.*?src=(\S*)/;
    var CssRegex = /<link.*?href=(\S*)/;
    var ImgRegex = /<img.*?src=(\S*)/;
    var httpRegex = /http/;


    var ScriptReferences = code.match(ScriptRegex);
    if(ScriptReferences){
        ScriptReferences.forEach(function(item){
            var src = JsRegex.exec(item)[1].replace(/['">]/ig,'');
            if (!httpRegex.test(src)) {
                code = code.replace(src,revertPath(src));
            };
        });
    };

    var StyleReferences = code.match(StyleRegex);
    if(StyleReferences){
        StyleReferences.forEach(function(item){
            var src = CssRegex.exec(item)[1].replace(/['">]/ig,'');
            if (!httpRegex.test(src)){
                code = code.replace(src,revertPath(src));
            };
        });
    };

    var ImageReferences = code.match(ImagesRegex);
    if(ImageReferences){
        ImageReferences.forEach(function(item){
            var src = ImgRegex.exec(item)[1].replace(/['">]/ig,'');
            if (!httpRegex.test(src)){
                code = code.replace(src,revertPath(src));
            };
        });
    };

    return code;
}

/**
 * @压缩css
 * @param sourcePath
 */
compress.css = function(sourcePath){
    var code = file.read(sourcePath),
        filename = path.basename(sourcePath,'.css'),
        hash = getHash(code),
        hashName = filename+hash;

    hashMap.css[sourcePath] = sourcePath.replace(filename,hashName);

    collectImages({
        filename : filename,
        csspath : path.join(sourcePath,'..'),
        code : code,
        callback : function(res){
            var outputPath = path.join(Config.distDir,sourcePath,'../'+hashName+'.css');
            var miniCode = new CleanCSS().minify(res).styles;
            fs.writeFileSync(outputPath,miniCode);
            outMap(sourcePath,hash); // output hash file

            $.log(filename+'.css was compressed done','green');
        }
    });
}


// Merge task-specific and/or target-specific options with these defaults.
var options = {
    algorithm: 'top-down',
    baseUrl: './',
    engine: 'auto',
    padding: 2
};
/**
 * 获取css中的图片
 * @param params 参数对象
 * @returns {*}
 */
function collectImages(params){
    var httpRegex = /http[s]?/ig,
        suffix = /\?__sprite/ig,
        imgRegex = /background(?:-image)?:([\s\S]*?)(?:;|$)/ig,
        filepathRegex = /\([\s\S\w]*\)/ig;

    var imagesList = [],imagesHash = {},
        references = params.code.match(imgRegex);


    if(references){
        references.forEach(function(bgcode) {
            // Exit if it contains a http/https
            if (httpRegex.test(bgcode)) {
                $.log(bgcode + ' has been skipped as it\'s an external resource!');
                return false;
            };
            if(!suffix.test(bgcode)){
                return false;
            }

            var imagePath = bgcode.match(filepathRegex);
            if(imagePath && imagePath.length > 0){
                imagePath = imagePath[0].replace(/["'()]/g,'').replace(suffix,'');
            }else{
                return false;
            };

            if(imagePath[0] === '/') {
                imagePath = path.join(options.baseUrl,imagePath);
            } else {
                imagePath = path.join(params.csspath,imagePath);
            }

            if(!imagesHash[imagePath]){
                imagesList.push(imagePath);
                imagesHash[imagePath] = [];
            };
            imagesHash[imagePath].push(bgcode);
        });
        if(imagesList.length){
            imagesSprite(imagesList,imagesHash,params)
        }else{
            params.callback(params.code);
        }
    }else{
        params.callback(params.code);
    };

}

/**
 * 图片sprite
 * @param imagesList
 * @param imagesHash
 * @param params
 */
function imagesSprite(imagesList,imagesHash,params){
    spritesmith({
        src: imagesList,
        algorithm : options.algorithm
    }, function(err, result) {
        if (err) {
            throw err;
        }

        var imgDir = path.join(Config.distDir,Config.baseDir.images);
        var hash = getHash(result.image);
        var name = params.filename+hash+'@sprite.png';
        var imgPath = path.join(imgDir,name);
        fs.writeFileSync(imgPath,result.image,'binary');

        //压缩图片
        new Imagemin()
            .src(imgPath)
            .dest(imgDir)
            .use(Imagemin.optipng({optimizationLevel: 3})).run();

        imgPath = path.join('../',Config.baseDir.images,name);

        var code = params.code;
        var coords = [];
        var tmpResult = result.coordinates;
        for(var key in tmpResult) {
            if(imagesHash[key]){
                var list = imagesHash[key];
                for(var i = 0; i < list.length; i ++){
                    code = cssReplace(list[i],{
                        source: imgPath,
                        width : result.properties.width,
                        height : result.properties.height,
                        x: tmpResult[key].x,
                        y: tmpResult[key].y
                    },code);
                }
            }

        };
        for(var key in hashMap.images){
            code = code.replace(key,hashMap.images[key]);
        };
        params.callback && params.callback(code);
    });
}


/**
 * 替换css
 * @param bgcode
 * @param obj
 * @param code
 * @returns {*|XML|string|void}
 */
function cssReplace(bgcode,obj,code){
    return code.replace(bgcode,'background-image: url(\''+ obj.source +'\');\nbackground-position: -'+ obj.x +'px -'+ obj.y +'px;\nbackground-size:'+obj.width+'px '+obj.height+'px!important;');
}
