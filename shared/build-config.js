module.exports = function(tools) {

    spawn = tools.process.spawn({ log: console.log });
    exec = tools.process.exec({ log: console.log });
    ensureDirExists = tools.fs.ensureDirExists();
    compressor = require('node-minify');
    react = require('react-tools');
        
    return function() {
    
        /*
            When the build starts, recreate the app directory
        */
        this.onBuildStart(function*() {
            console.log("*************************");
            console.log("Started fora/shared build");
            console.log("*************************");
            this.state.start = Date.now();
            yield exec("rm -rf app");
            yield exec("mkdir app");        
        }, "shared_build_start");
        


        /*
            Compile all coffee-script files
            Coffee doesn't do coffee {src} {dest} yet, hence the redirection.
        */
        this.watch(["src/*.coffee"], function*(filePath) {
            var dest = filePath.replace(/^src\//, 'app/').replace(/\.coffee$/, '.js');
            yield ensureDirExists(dest);
            yield exec("coffee -cs < " + filePath + " > " + dest);
        }, "shared_coffee_compile");


        /*
            Compile all JSX files
            Use the React Tools API for this; there is no way to do this from the command line
        */
        this.watch(["src/app-lib/fora-ui/*.jsx", "src/extensions/*.jsx", "src/website/views/*.jsx"], function*(filePath) {
            var dest = filePath.replace(/^src\//, 'app/').replace(/\.jsx$/, '.js');
            yield ensureDirExists(dest);
            var contents = fs.readFileSync(filePath);
            console.log("jsx " + filePath);
            var result = react.transform(contents.toString());
            fs.writeFileSync(dest, result);
        }, "shared_jsx_compile");    


        /*
            Copy other files
        */
        this.watch(["src/*.json", "src/*.js"], function*(filePath) {
            var dest = filePath.replace(/^src\//, 'app/');
            yield ensureDirExists(dest);
            yield exec("cp " + filePath + " " + dest);
        }, "shared_files_copy");


        /*
            If debug, include all unminified js files. Otherwise minify.
            Finally, go back and change debug.hbs
        */
        this.onBuildComplete(function*() {
            this.state.end = Date.now();
        }, "shared_build_complete");
    }
        
}
