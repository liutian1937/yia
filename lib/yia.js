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
            var temPath = path.resolve(__dirname,'../template/default.html');
            file.copy(filename+'/index.html',temPath,function(err){
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
    //删除输出目录
    file.del(Config.distDir);
    var loopDir = ['images','css','js','html']; //按照这个顺序执行
    for(var i = 0; i < loopDir.length; i ++){
        var filename = Config.baseDir[loopDir[i]];
        var outputPath = path.join(Config.distDir,filename);
        //创建目录，压缩代码
        file.create(outputPath,function(){
            compress.run(filename);
        });
    }
    $.log('build success !!!','blue');
}

yia.sprite = function(){
    $.log('sprite start ...','blue');
    var sprites = require('./sprites.js');
    //css sprite
    sprites.run(function(){
        $.log('sprite success !!!','blue');
    });
}

/**
 * @创建http服务
 */
yia.server = function(url){
    var src = url ? path.resolve(process.cwd(),url) : process.cwd();
    var server = require('./server.js');
    server.start(src);
    $.log('server start success !!!','blue');
}

yia.test = function(sourcePath){

    var code = file.read(sourcePath);

    var IncludeRegex = /<!--([\s\S]*?)include([\s\S]*?)(-->|$)/ig;
    var PathRegex = /<!-- #include file='(\S*)' -->/;

    var IncludeReferences = code.match(IncludeRegex);
    if(IncludeReferences){
        console.log(IncludeReferences);
        IncludeReferences.forEach(function (item) {
            var filepath = PathRegex.exec(item);
            console.log(filepath);
        });
    }


    //function revertPath(src){
    //    var template = "<!-- #include file='.ver/{{path}}' -->";
    //    var filename = path.basename(src);
    //    var extname = path.extname(src);
    //    var revertPath = filename.replace(extname,template.replace('{{path}}',src)+extname);
    //    return src.replace(filename,revertPath);
    //}
    //
    //var hash = {};
    //var code = file.read(sourcePath);
    //
    //var ScriptRegex = /<script([\s\S]*?)src([\s\S]*?)(><\/script>|$)/ig;
    //var StyleRegex = /<link([\s\S]*?)href([\s\S]*?)(>|$)/ig;
    //var JsRegex = /<script.*?src=(\S*)/;
    //var CssRegex = /<link.*?href=(\S*)/;
    //var httpRegex = /http/;
    //
    //var src;
    //
    //var references = code.match(ScriptRegex);
    //
    //console.log(references);
    //
    //if(references){
    //    references.forEach(function(item){
    //        var src = JsRegex.exec(item)[1].replace(/['"]/ig,'');
    //        if (httpRegex.test(src)) {
    //            return false;
    //        };
    //        console.log(revertPath(src));
    //    });
    //};
    //
    //var references = code.match(StyleRegex);
    //if(references){
    //    references.forEach(function(item){
    //        var src = CssRegex.exec(item)[1].replace(/['"]/ig,'');
    //        if (!httpRegex.test(src)){
    //            console.log(revertPath(src));
    //        };
    //    });
    //};



    //console.log(references);

    //var Regex = /<%=([\s\S]*?)(>|$)/ig;
    //var references = code.match(Regex);
    //
    //var text = 'XXXXX';
    //if(references){
    //    references.forEach(function(tip) {
    //        var arr = [];
    //        tip = tip.replace(/<%=/ig,'').replace(/%>/ig,'').replace(/(^\s*)|(\s*$)/g,'');
    //        arr = tip.split('.');
    //        var len = arr.length;
    //        var temp = {};
    //        for(var i = len -1 ; i >= 0; i--){
    //
    //            if(i === 0){
    //                hash[arr[i]] = len > 1 ? temp : text;
    //            }else if(i == len){
    //                temp[arr[i]] = text;
    //            }else{
    //                temp[arr[i]] = temp;
    //            }
    //
    //        }
    //    });
    //    console.log(hash);
    //};
    //
    //var RegexVm = /<%=([\s\S]*?)(>|$)/ig;
    //
    //
    //var references = code.match(RegexVm);

}