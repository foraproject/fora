(function() {
    "use strict";

    var _;

    var router;

    var init = function*() {
        router = configureRouter();
    };

    var configureRouter = function() {
        var services = require('fora-services'),
            extensions = services.get('extensions'),
            conf = require('../../config');

        var credentials = require('./credentials'),
            users = require('./users'),
            apps = require("./apps"),
            images = require("./images");

        var models = require('../../models');

        var Router = require("fora-router");
        var router = new Router("/api");


        //apps will do their own routing.
        var routeToApp = function*(app) {
            var appExtensions = yield* extensions.getByName(app.type);
            console.log(appExtensions);
            var router = appExtension.getRouter();
            _ = yield* router.route().call(this);
        };

        //If the request is for a different domain, it must be an app.
        //There is no need to rewrite, since domain based urls don't have /apps/:appname prefix
        router.when(function() {
            return this.req.hostname && (conf.domains.indexOf(this.req.hostname) === -1);
        }, function*() {
            var app = yield* models.App.findOne({ domains: this.req.hostname }, services.context());
            return yield* routeToApp.call(this, app);
        });

        //Before passing this on to the app, rewrite the url
        //eg: rewrite /apps/:appname/some/path -> /some/path
        router.when(function() {
            return /^\/apps\//.test(this.req.url);
        }, function*(next) {
            var parts = this.req.url.split('/');
            this.url = "/" + parts.slice(3).join("/");
            var app = yield* models.App.findOne({ stub: parts[2] }, services.context());
            return yield* routeToApp.call(this, app);
        });

        //healthcheck
        router.get("/healthcheck", function*() {
            var uptime = parseInt((Date.now() - since)/1000) + "s";
            this.body = { jacksparrow: "alive", instance: params.app.instance, since: params.app.since, uptime: params.app.uptime };
        });

        //users
        router.post("/credentials", credentials.create);
        router.post("/users", users.create);
        router.post("/login", users.login);
        router.get("/users/:username", users.item);

        //apps
        router.post("/apps", apps.create);

        //images
        router.post("/images", images.upload);

        return router;
    };

    var getRouter = function*() {
        return router;
    };

    module.exports = {
        init: init,
        getRouter: getRouter
    };

})();
