var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');

var $ = require('./base.js'); //工具集
var file=require('./file.js');
var Config = require('./config.js'); //加载配置文件

var query = require("querystring");
var ejs = require('ejs');
var Engine = require('velocity').Engine; //velocity 模板引擎

var mime  = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml",
    "vm" : "text/html",
    "jsp" : "text/html"
};
var server = module.exports = {};
var baseSrc = '';


/**
 * open browser url
 * @param url
 * @param callback
 */
function openBrowser(url, callback) {
    var spawn = require('child_process').spawn;
    var command;

    switch(process.platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'explorer.exe';
            break;
        case 'linux':
            command = 'xdg-open';
            break;
        default:
            throw new Error('Unsupported platform: ' + process.platform);
    }

    var child = spawn(command, [url]);
    var errorText = "";
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
        errorText += data;
    });
    child.stderr.on('end', function () {
        if (errorText.length > 0) {
            var error = new Error(errorText);
            if (callback) {
                callback(error);
            } else {
                throw error;
            }
        } else if (callback) {
            callback(error);
        }
    });
}

function handle(request,response){
    if(request.url == '/_/api/update'){
        var postdata = '';
        request.addListener("data",function(postchunk){
            postdata += postchunk;
        });
        //POST结束输出结果
        request.addListener("end",function(){
            var params = query.parse(postdata);

            baseSrc = params['src'];
            server.watch(baseSrc);

            response.writeHead(200, {
                'Content-Type': 'application/json'
            });
            response.end(JSON.stringify(params));
        });

    }else{
        var pathname = url.parse(request.url).pathname;
        var source = path.join(baseSrc,pathname);
        if(file.isDir(source)){
            var list = [];
            fs.readdirSync(source).forEach(function(name){
                if(name[0] === '.' && name != Config.distDir){
                    return false;
                }
                var url = path.join('/',pathname,name);
                var fileSource = path.join(source,name);

                var extname = path.extname(url) || 'floder';

                list.push({
                    link : url,
                    title : name,
                    target : file.isFile(fileSource) ? '_blank' : '',
                    extname : extname.replace('.','')
                });
            });

            var str = file.read(path.resolve(__dirname,'..')+'/template/home.html'),
                data = {list: list};

            var html = ejs.render(str, data, {
                rmWhitespace : true
            });
            response.writeHead(200, {
                'Content-Type': mime['html']
            });
            response.write(html);
            response.end();

        }else{
            if(fs.existsSync(source)){
                fs.readFile(source,'binary',function(err,code){
                    var suffix = path.extname(source).replace('.','');
                    var filename = path.basename(source, suffix);
                    var contentType = mime[suffix] || "text/plain";
                    if(contentType === "text/html"){
                        code = code.replace(/<\/body>/gi, "<script src='http://localhost:35729/livereload.js'></script>\n</body>");
                    };
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    if(suffix == 'vm' || suffix == 'jsp'){
                        var data = file.read('./data/'+filename+'.js') || {};
                        code = new Engine({
                            template : source
                        }).render(data);
                    }

                    var template = require('./template.js');
                    code = template.render(code);

                    //var encoding = contentType.match(/image/) ? 'binary' : 'utf-8';
                    response.write(code,'binary');
                    response.end();
                });
            }else{
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404');
                response.end();
            }
        }
    };
}

server.start = function(src){
    baseSrc = src;
    var PORT = Config.port;
    http.createServer(handle).listen(PORT);
    if(!this.lanching){
        openBrowser('http://localhost:'+PORT);
    }
    this.lanching = true;
    console.log("Server runing at port: " + PORT + ".");

    var livereload = require('livereload');
    server = livereload.createServer({
        port : 35729,
        exts : ['.vm','.jsp']
    });
    server.watch(src);
    $.log('watch file success !!!','blue');
}
