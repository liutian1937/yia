var PORT = 3000;

var http = require('http');
var url=require('url');
var fs=require('fs');
var path=require('path');

var file=require('./file.js');

var template = require('art-template');
template.config('base', path.resolve(__dirname,'..')); // 设置模板根目录，默认为引擎所在目录
//template.config('compress', true);// 压缩输出

var mine  = {
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
    "xml": "text/xml"
};
var server = module.exports = {};



/**
 * Error handling is deliberately minimal, as this function is to be easy to use for shell scripting
 *
 * @param url The URL to open
 * @param callback A function with a single error argument. Optional.
 */

function open(url, callback) {
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

server.start = function(){
    http.createServer(function (request, response) {


        var pathname = url.parse(request.url).pathname;
        pathname = path.join('.',pathname);

        if(file.isDir(pathname)){
            var list = [];
            fs.readdirSync(pathname).forEach(function(name){
                var url = path.join(pathname,name);
                list.push({
                    link : url,
                    title : name,
                    target : file.isFile(url) ? '_blank' : ''
                });
            });
            var data = {list: list};
            var html = template('template/home', data);

            response.writeHead(200, {
                'Content-Type': mine['html']
            });
            response.write(html);
            response.end();

        }else{
            if(fs.existsSync(pathname)){
                fs.readFile(pathname,'binary',function(err,file){
                    var suffix = path.extname(pathname).replace('.','');
                    var contentType = mine[suffix] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
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
    }).listen(PORT);

    open('http://localhost:3000');
    console.log("Server runing at port: " + PORT + ".");
}
