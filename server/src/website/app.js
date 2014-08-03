(function() {
    "use strict";

    var _;

    var host = process.argv[2];
    var port = process.argv[3];

    if (!host || !port) {
        logger.log("Usage: app.js host port");
        process.exit();
    }

    var server = require('fora-app-server');

    var config = {
        baseConfiguration: require('../conf'),

        /* Extensions needed by this app */
        extensionsService: {
            types: {
                containers: ['web'],
                apps: ['web'],
                records: ['model', 'templates']
            }
        },

        /*
            App server will start applicationContainer:containerModuleName
            For example: containers/fora/1.0.0:web
        */
        containerModuleName: "web",

        host: host,
        port: port
    };

    co(function*() {
        _ = yield* loader.init();
        _ = yield* server(config);
        logger.log("Fora Website started at " + new Date() + " on " + host + ":" + port);
    })();

})();
