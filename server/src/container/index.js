(function() {
    "use strict";

    var _;

    var co = require('co');
    var logger = require('fora-app-logger');
    var Server = require('fora-app-server');
    var baseConfig = require('../config');

    var host = process.argv[2];
    var port = process.argv[3];

    if (!host || !port) {
        logger.log("Usage: app.js host port");
        process.exit();
    }

    var config = {
        services: {
            extensions: {
                modules: [
                    { kind: "app", modules: ["api"] },
                    { kind: "record", modules: ["definition", "model"] }
                ]
            }
        },

        host: host,
        port: port
    };

    co(function*() {
        var server = new Server(config, baseConfig);
        _ = yield* server.init();
        _ = yield* server.addRoutes(require('./api/routes'));
        server.listen();
        logger.log("Fora API started at " + new Date() + " on " + host + ":" + port);
    })();

})();