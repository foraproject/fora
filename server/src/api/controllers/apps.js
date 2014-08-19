(function() {
    "use strict";

    var _;

    var models = require('fora-app-models'),
        services = require('fora-app-services'),
        typeHelpers = require('fora-app-type-helpers'),
        conf = require('../../config');

    var typesService = services.get('types'),
        db = services.get('db');

    var Parser = require('fora-request-parser')(typesService);
    var context = { typesService: typesService, db: db };


    var create = function*() {
        var parser = new Parser(this);

        var stub = (yield* parser.body('name')).toLowerCase().trim();
        if (conf.reservedNames.indexOf(stub) > -1)
            stub = stub + "-app";
        stub = stub.replace(/\s+/g,'-').replace(/[^a-z0-9|-]/g, '').replace(/^\d*/,'');

        var app = yield* models.App.findOne({
                $or: [{ stub: stub }, { name: yield* parser.body('name') }]
            }, typeHelpers.extend({ user: this.session.user }, context)
        );

        if (!app) {

            app = yield* models.App.create({
                type: yield* parser.body('type'),
                version: yield* parser.body('version'),
                name: yield* parser.body('name'),
                access: yield* parser.body('access'),
                stub: stub,
                createdById: this.session.user.id,
                createdBy: this.session.user,
            }, typesService);

            var versionParts = app.version.split('.');
            app.versionMajor = parseInt(versionParts[0]);
            app.versionMinor = parseInt(versionParts[1]);
            app.versionRevision = parseInt(versionParts[2]);

            _ = yield* parser.map(app, ['description', 'cover_image_src', 'cover_image_small', 'cover_image_alt', 'cover_image_credits']);
            app = yield* app.save(context);
            _ = yield* app.addRole(this.session.user, 'admin', context);

            this.body = app;

        } else {
            throw new Error("App exists");
        }
    };



    var edit = function*(app) {
        var parser = new Parser(this);
        app = yield* models.App.findOne({ stub: app }, context);

        if (this.session.user.username === app.createdBy.username || this.session.admin) {
            _ = yield* parser.map(app, ['description', 'cover_image_src', 'cover_image_small', 'cover_image_alt', 'cover_image_credits']);
            app = yield* app.save(context);
            this.body = app;
        } else {
            throw new Error("Access denied");
        }
    };


    var auth = require('fora-app-auth-service')(conf, db);
    module.exports = {
        create: auth({ session: 'user' }, create),
        edit: auth({ session: 'user' }, edit)
    };



})();
