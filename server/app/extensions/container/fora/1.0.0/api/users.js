(function() {
    "use strict";

    var _;

    var models = require('fora-app-models'),
        services = require('fora-services'),
        typeHelpers = require('fora-type-helpers'),
        FileService = require('fora-file-service'),
        conf = require('fora-configuration');

    var Parser = services.get('parser'),
        typesService = services.get('types'),
        db = services.get('db');

    var context = { typesService: typesService, db: db };

    var fileService = new FileService(conf);

    var create = function*() {
        var parser = new Parser(this);
        var user = new models.User({
            username: yield* parser.body('username'),
            credentialId: this.session.credentialId,
            name: yield* parser.body('name'),
            location: yield* parser.body('location'),
            email: (yield* parser.body('email') || 'unknownthis.foraproject.org'),
            about: yield* parser.body('about'),
            lastLogin: Date.now()
        });

        user = yield* user.save(context);

        //Move images to assets
        var picture = {
            src: yield* parser.body('picture_src'),
            small: yield* parser.body('picture_small')
        };

        var copy = function*(sourcePath, destFilename) {
            var srcPathArr = sourcePath.split('/');
            var file = srcPathArr.pop();
            var subdir = srcPathArr.pop();
            var source = fileService.getFilePath('images', subdir, file);
            var dest = fileService.getFilePath('assets', user.assets, destFilename);
            _ = yield* fileService.copyFile(source, dest);
        };

        _ = yield* copy(picture.src, user.username + ".jpg");
        _ = yield* copy(picture.small, user.username + "_t.jpg");

        this.body = user.summarize(context);
    };


    var login = function*() {
        var parser = new Parser(this);
        var session = yield* this.session.upgrade(yield* parser.body('username'));

        var user = session.user;
        user.token = session.token;

        this.cookies.set("userId", user.id.toString(), { httpOnly: false });
        this.cookies.set("username", user.username, { httpOnly: false });
        this.cookies.set("fullName", user.name, { httpOnly: false });
        this.cookies.set("token", session.token);

        this.body = user;
    };


    var item = function*(username) {
        var user = yield* models.User.get({ username: username }, context);
        if (user)
            this.body = user.summarize({}, db);
    };


    var auth = services.get('auth');
    module.exports = {
        create: auth({ session: 'credential' }, create),
        login: auth({ session: 'credential' }, login),
        item: auth(item)
    };

})();
