(function() {
    "use strict";

    var _;

    var co = require('co'),
        logger = require('fora-lib-logger'),
        Router = require('fora-lib-router'),
        Renderer = require('fora-lib-renderer'),
        ForaRequest = require('fora-lib-request'),
        services = require('fora-lib-services'),
        models = require('fora-lib-models'),
        initializeApp = require('fora-lib-initialize'),
        baseConfig = require('./config');


    /*  Container UI Routes */
    var addContainerUIRoutes = function*(router, urlPrefix, extensionsService) {
        var webModule = yield* extensionsService.getModule("container", "default", "1.0.0", "web");

        var renderer = new Renderer(router);

        var uiRoutes = renderer.createRoutes(webModule.routes);
        uiRoutes.forEach(function(route) {
            var url = /\/$/.test(urlPrefix) || /^\//.test(route.url) ? urlPrefix + route.url : urlPrefix + "/" + route.url;
            router[route.method](url, route.handler);
        });
    };



    var init = function() {
        co(function*() {
            var config = {
                services: {
                    extensions: {
                        modules: [
                            { kind: "container", modules: ["api", "web"] },
                            { kind: "app", modules: ["definition", "api", "web"] },
                            { kind: "record", modules: ["definition", "model", "web"] }
                        ]
                    }
                }
            };

            var initResult = yield* initializeApp(config, baseConfig);
            var router = new Router();

            var extensionsService = services.getExtensionsService();
            yield* addContainerUIRoutes(router, "/", extensionsService);

            var routeFunc = router.route();

            var doRouting = function*() {
                var request = new ForaRequest();
                yield* routeFunc.call(request, null);
            };

            var onChange = function() {
                co(doRouting).then(null, function(err) { console.log(err); });
            };

            // Listen on hash change, page load:
            window.addEventListener('hashchange', onChange);
            window.addEventListener('load', onChange);

            logger.log("Fora started at " + new Date());
        }).then(null, function(err) { console.log(err); });
    };

    window.initForaApp = init;

})();
