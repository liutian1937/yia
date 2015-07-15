var fs = require("fs");

function loop (len, each, callback) {
    if (len == 0) return callback();

    (function loop (i) {
        each(next, i);

        function next (error) {
            if (error) return callback(error);
            if (i + 1 == len) return callback();

            loop(i + 1);
        }
    }(0));
}

function concat (files, dest, callback) {
    fs.writeFile(dest, '', function (error) {
        if (error) return callback(error);

        loop(files.length, each, callback);

        function each (done, i) {
            fs.readFile(files[i], function (error, buffer) {
                if (error) return done(error);

                fs.appendFile(dest, buffer, done);
            });
        }

    });
}

module.exports = concat;
