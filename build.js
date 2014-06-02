start = Date.now();

foraBuild = require('fora-build');
spawn = foraBuild.tools.process.spawn({ log: function(data) { process.stdout.write(data); } });

optimist = require('optimist')
    .usage('Build the fora project.\nUsage: $0')
    .alias('h', 'help')
    .describe('debug', 'Compile in debug mode')
    .describe('client', "Build the client")
    .describe('server', "Build the server")
    .describe('norun', "Do not start the server after building")
    .describe('threads', "Number of threads to use for the build (default: 8)")
    .describe('help', 'Print this help screen');

argv = optimist.argv;
if (argv.help || argv.h) {
    optimist.showHelp();
    process.exit(0);
}

/* Create the build */
threads = argv.threads ? parseInt(argv.threads) : 8;
build = foraBuild.create({ threads: threads });

/* The three configs */
sharedConfig = require('./shared/build-config')(foraBuild.tools);
serverConfig = require('./server/build-config')(foraBuild.tools);
clientConfig = require('./www-client/build-config')(foraBuild.tools);

/* Set build parameters */
build.state.monitor = !argv.norun;

if (argv.client || argv.server) {
    build.state.buildClient = argv.client;    
    build.state.buildServer = argv.server;
} else {
    build.state.buildClient = true;
    build.state.buildServer = true;
}    

build.state.debug = argv.debug;

/* Create configuration */
shared = build.configure(sharedConfig, 'shared');
if (build.state.buildServer)
    server = build.configure(serverConfig, 'server');
if (build.state.buildClient)
    client = build.configure(clientConfig, 'www-client');

/* After all configs are built */
build.onBuildComplete(function*() {
    build.state.complete = true;

    var elapsed = Date.now() - start;

    var sharedTime = (shared.state.end - shared.state.start)/1000;
    console.log("Build(shared): " + sharedTime + "s");        
    
    if (build.state.buildServer) {
        var serverTime = (server.state.end - server.state.start)/1000;
        console.log("Build(server): " + serverTime + "s");        
    }
    if (build.state.buildClient) {
        var clientTime = (client.state.end - client.state.start)/1000;
        console.log("Build(client): " + clientTime + "s");
    }
    console.log("Build(total): " + (elapsed/1000) + "s");    
});

/* Monitor? */
if (build.state.monitor) {
    build.onBuildComplete(function*() {
        var runScript = !build.state.debug ? "server/run.sh" : "server/debug.sh";
        console.log("Restarting the server.....");
        var script = spawn("sh", [runScript]);
    });
}

/* Start */
build.start(build.state.monitor);


