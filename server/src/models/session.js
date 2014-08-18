(function() {
    "use strict";

    var _;

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } };

    var ForaDbModel = require('./foramodel').ForaDbModel,
        models = require('./'),
        randomizer = require('../common/randomizer');

    /*
        A session token starts life as a credential token.
        A credential token can be converted into a user-session token.
    */
    var Session = function() {
        ForaDbModel.apply(this, arguments);
    };

    Session.prototype = Object.create(ForaDbModel.prototype);
    Session.prototype.constructor = Session;

    __extends(Session, ForaDbModel);

    Session.typeDefinition = {
        name: 'session',
        collection: 'sessions',
        schema: {
            type: 'object',
            properties: {
                credentialId: { type: 'string' },
                userId: { type: 'string' },
                token: { type: 'string' },
                user: { $ref: 'user-summary' }
            },
            required: ['credentialId', 'token']
        },
        links: {
            credential: { key: 'credentialId' },
        },
        autoGenerated: {
            createdAt: { event: 'created' },
            updatedAt: { event: 'updated' }
        },
        indexes: [
            { 'userId': 1, 'token': 1 },
        ]
    };


    /*
        Upgrades a credential token to a user token.
        User tokens can be used to login to the app.
    */
    Session.prototype.upgrade = function*(username, context) {
        var user = yield* models.User.findOne({ username: username, credentialId: this.credentialId }, context);
        if (user) {
            this.token = randomizer.uniqueId(24);
            this.userId = user._id.toString();
            this.user = user.summarize(context);
            return yield* this.save(context);
        } else {
            throw new Error("User not found");
        }
    };

    exports.Session = Session;
})();
