/**
 * Created by codemonkey on 15/9/7.
 */
'use strict';
var $ = require('./base.js');
var path = require('path');
var file = require('./file.js');
var Config = require('./config.js'); //加载配置文件



function collectParams(sourcePath){

    var code = file.read(sourcePath);

    var httpRegex = /http[s]?/ig,
        suffix = /\?__sprite/ig,
        imgRegex = /background(?:-image)?:([\s\S]*?)(?:;|$)/ig,
        filepathRegex = /\([\s\S\w]*\)/ig;

    var Regex = /^\$\{[\s\S]*\}/;
    var references = code.match(Regex);
    console.log(references);
}



module.exports = {
    render : function(code){
        var IncludeRegex = /<%@([\s\S]*?)include([\s\S]*?)(%>|$)/ig;
        var PathRegex = /<%@ include file='(\S*)' %>/;

        var IncludeReferences = code.match(IncludeRegex);
        if(IncludeReferences){
            IncludeReferences.forEach(function (item) {
                var filepath = PathRegex.exec(item)[1];
                filepath = path.join(Config.distDir,filepath);
                var md5 = file.read(filepath) || '';
                code = code.replace(item,md5);
            });
        }
        return code;
    },
    parse : function(sourcePath){
        collectParams(sourcePath);
    }
}