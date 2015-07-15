var chalk = require('chalk');

var $ = module.exports = {};

/**
 * 克隆对象
 * @param target 目标对象
 * @param source 源对象
 * @returns {*} 目标对象
 */
$.extend = function(target,source){
    for(var key in source){
        var copy = source[key];
        if(copy instanceof Array){
            target[key] = arguments.callee([],copy);
        }else if(copy instanceof Object){
            target[key] = arguments.callee({},copy);
        }else{
            target[key] = copy;
        }
    }
    return target;
}

/**
 * log
 * @param val 内容
 */
$.log = function(val,styles){
    var fn = chalk;
    if(styles){
        styles = styles.split(' ');
        styles.forEach(function(style){
            fn = style === ' ' ? fn : fn[style];
        });
    }else{
        fn = chalk.black;
    }
    console.log(fn(val));
}

/**
 * hash算法
 */
$.hash = function(str){
    //string hash
    var hash = 1,c = 0,len, char;
    if(str){
        hash = 0;
        for(len = str.length-1; len >= 0; len--){
            char = str.charCodeAt(len);
            hash = (hash << 6 & 268435455)+char+(char<<14);
            c = hash & 266338304;
            hash = c !=0 ? hash^c >> 21 : hash;
        }
    }
    return hash;
}