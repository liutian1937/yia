var yia = require('./lib/yia.js');
var program = require('commander');

module.exports = {
    run : function(){
        var package = require('./package.json');
        var argv = process.argv.slice(2);

        program
            .version(package.version)
            .usage('[options] <file ...>');

        /**
         * 初始化
         */
        program
            .command('init')
            .description('initialize project')
            .action(function(){
                yia.init();
            });

        /**
         * 打包
         */
        program
            .command('build')
            .description('build project')
            .option('--debug','build project with debug')
            .action(function(){
                yia.build();
            }).on('--help', function() {
                console.log('  Examples:');
                console.log();
                console.log('    $ yia build');
                console.log();
            });

        program
            .command('publish')
            .description('publish project')
            .action(function(){
                yia.publish();
            });

        /**
         * todo:(js hint)
         */
        program
            .command('format')
            .description('format html,js,css')
            .action(function(){
                yia.format();
            });

        /**
         * 合并当前文件夹图片，并生成css文件
         */
        program
            .command('sprite')
            .description('images sprite')
            .action(function(){
                yia.sprite();
            });

        program
            .command('server')
            .description('server start')
            .action(function(){
                if(argv.length > 1){
                    yia.server(argv[1]);
                }else{
                    yia.server();
                }
            });

        program
            .command('test')
            .action(function(){
                if(argv.length > 1){
                    yia.test(argv[1]);
                }else{
                    yia.test();
                }
            });

        program.parse(process.argv);
    }
}