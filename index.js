var yia = require('./lib/yia.js');
var program = require('commander');

module.exports = {
    run : function(){
        var package = require('./package.json');
        program
            .version(package.version)
            .usage('[options] <file ...>');

        program
            .command('init')
            .description('initialize project')
            .action(function(){
                yia.init();
            });

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

        program
            .command('format')
            .description('format html,js,css')
            .action(function(){
                yia.format();
            });

        program
            .command('sprite')
            .description('css sprites')
            .action(function(){
                yia.sprite();
            });

        program
            .command('release')
            .description('release project')
            .action(function(){
                yia.sprite(yia.build);
            });

        program
            .command('server')
            .description('server start')
            .action(function(){
                yia.server();
            });

        program
            .command('test')
            .description('test project')
            .action(function(){
                yia.test();
            });

        program.parse(process.argv);
    }
}