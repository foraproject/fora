(function() {
    "use strict";
    module.exports = function(tools) {

        var spawn = tools.process.spawn({ log: function(data) { process.stdout.write(data); } });
        var exec = tools.process.exec({ log: console.log });
        var ensureDirExists = tools.fs.ensureDirExists();
        var react = require('react-tools');
        var compressor = require('node-minify');

        return function() {

            /*
                When the build starts, recreate the app directory
            */
            this.onStart(function*() {
                console.log("*************************");
                console.log("Started fora/shared build");
                console.log("*************************");
                this.state.start = Date.now();
            }, "shared_build_start");



            /*
                Compile all JSX files
                Use the React Tools API for this; there is no way to do this from the command line
            */
            this.watch(["app/lib/fora-ui/*.jsx", "app/extensions/*.jsx"], function*(filePath) {
                var fs = require('fs');
                var dest = filePath.replace(/\.jsx$/, '.js');
                var contents = fs.readFileSync(filePath);
                console.log("jsx " + filePath);
                var result = react.transform(contents.toString());
                fs.writeFileSync(dest, result);
            }, "shared_jsx_compile");



            /*
                If debug, include all unminified js files. Otherwise minify.
                Finally, go back and change debug.hbs
            */
            this.onComplete(function*() {
                this.state.end = Date.now();
            }, "shared_build_complete");
        }
    }
})();
