(function() {
    "use strict";

    var _;

    var configure = function(fn, appInfo, options) {
        var services = require('fora-app-services'),
            conf = require('../../config'),
            models = require('fora-app-models');

        var typesService = services.get('typesService'),
            db = services.get('db');
        var context = { typesService: typesService, db: db };

        var Router = require("fora-router");
        var router = new Router(options.urlPrefix);

        var Sandbox = require('fora-app-sandbox');
        var sandbox = new Sandbox(services, options.extensionModuleName);

        var Parser = require('fora-request-parser');

        //healthcheck
        router.get("/healthcheck", function*() {
            var uptime = parseInt((Date.now() - since)/1000) + "s";
            this.body = { jacksparrow: "alive", instance: params.app.instance, since: params.app.since, uptime: params.app.uptime };
        });


        //Rewrite: example.com/url -> /apps/example/url
        //If the request is for a different domain, it must be an app.
        router.when(
            function(routingContext) {
                return this.hostname && (conf.domains.indexOf(this.hostname) === -1);
            },
            function*(routingContext) {
                routingContext.application = yield* models.App.findOne({ domains: this.hostname }, context);
                return true; //continue matching.
            }
        );

        fn(router);

        //Run the app in a sandbox.
        //Also rewrite the url: /apps/:appname/some/path -> /some/path, /apps/:appname?x -> /?x\
        options.appUrlPrefix = options.appUrlPrefix || "";
        var appUrlPrefix = /\/$/.test(options.appUrlPrefix) ? options.appUrlPrefix : options.appUrlPrefix + "/";
        var prefixPartsCount = appUrlPrefix.split("/").length - 1;
        var appPathRegex = new RegExp("^" + (appUrlPrefix));
        var appRootRegex = new RegExp("^" + appUrlPrefix + "[a-z0-9-]*/?");
        router.when(
            function(routingContext) {
                return appPathRegex.test(this.url);
            },
            function*(routingContext) {
                if (!routingContext.application) {
                    routingContext.application = yield* models.App.findOne({ stub: this.path.split("/")[prefixPartsCount] }, context);
                    if (routingContext.application) {
                        var urlParts = this.url.split("/");
                        this.url = this.url.replace(appRootRegex, "/");
                    } else {
                        throw new Error("Invalid application");
                    }
                }

                this.parser = new Parser(this, typesService);

                var token = this.query.token || this.cookies.get('token');
                if (token)
                    this.session = yield* models.Session.findOne({ token: token }, context);

                return yield* sandbox.executeRequest(this, routingContext);
            }
        );

        return router;

    };

    module.exports = configure;

})();
