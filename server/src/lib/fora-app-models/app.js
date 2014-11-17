(function() {
    "use strict";

    var _;

    var models = require('./'),
        appCommon = require('./app-common'),
        dataUtils = require('fora-data-utils'),
        DbConnector = require('fora-app-db-connector'),
        services = require('fora-app-services'),
        Parser = require('fora-request-parser');
    var typesService = services.get('typesService');

    var App = function(params) {
        dataUtils.extend(this, params);
        if (!this.stats) {
            this.stats = new models.AppStats({
                records: 0,
                members: 0,
                lastRecord: 0
            });
        }
        if (this.my_init)
            this.my_init();
    };
    appCommon.extendApp(App);

    var appStore = new DbConnector(App);

    App.prototype.save = function*() {
        var conf = services.get('configuration');

        if (conf.reservedNames.indexOf(this.stub) > -1)
            throw new Error("Stub cannot be " + this.stub + ", it is reserved");

        var regex = /[a-z][a-z0-9|-]*/;
        if (!regex.test(this.stub))
            throw new Error("Stub is invalid");

        var typeParts = this.type.split('/');
        this.appType = typeParts[1];
        this.version = typeParts[2];
        var versionParts = this.version.split('.');
        this.versionMajor = parseInt(versionParts[0]);
        this.versionMinor = parseInt(versionParts[1]);
        this.versionRevision = parseInt(versionParts[2]);

        return yield* appStore.save(this);
    };



    App.prototype.createRecordViaRequest = function*(request) {
        var parser = new Parser(request, typesService);

        var record = yield* this.createRecord({
            type: yield* parser.body('type'),
            version: yield* parser.body('version'),
            createdBy: request.session.user,
            state: yield* parser.body('state'),
            rating: 0,
            savedAt: Date.now()
        });

        var recordDef = yield* record.getTypeDefinition();
        _ = yield* parser.map(record, recordDef, yield* record.getCustomFields(recordDef));
        return yield* this.addRecord(record);
    };



    App.prototype.editRecordViaRequest = function*(stub, request) {
        var record = yield* this.getRecord({ stub: stub });

        if (record) {
            if (record.createdBy.username === request.session.user.username) {
                var recordDef = yield* record.getTypeDefinition();
                _ = yield* parser.map(record, yield* record.getCustomFields());
                record.savedAt = Date.now();
                if (yield* parser.body('state') === 'published') record.state = 'published';
                return yield* record.save();
            } else {
                throw new Error("Access denied");
            }
        } else {
            throw new Error("Not found");
        }
    };


    App.prototype.deleteRecordViaRequest = function*(stub, request) {
        var record = yield* this.getRecord(stub);
        if (record) {
            if(record.createdBy.username === request.session.user.username)
                record = yield* record.destroy();
            else
                throw new Error('Access denied');
        }
        return record;
    };



    App.prototype.addRecordMetaViaRequest = function*(stub, request) {
        var parser = new Parser(request, services.get('typesService'));
        var meta = yield* parser.body('meta');

        if (meta) {
            var record = yield* this.getRecord(stub);
            return yield* record.addMeta(meta.split(','));
        } else {
            throw new Error("Meta was not supplied");
        }
    };



    App.prototype.removeRecordMetaViaRequest = function*(stub, request) {
        var parser = new Parser(request, services.get('typesService'));
        var meta = yield* parser.body('meta');

        if (meta) {
            var record = yield* this.getRecord(stub);
            return yield* record.removeMeta(meta.split(','));
        } else {
            throw new Error("Meta was not supplied");
        }
    };



    App.prototype.createRecord = function*(params) {
        var typesService = services.get('typesService');
        var typeDefinition = yield* typesService.getTypeDefinition(models.Record.typeDefinition.name);
        var record = yield* typesService.constructModel(params, typeDefinition);
        record.appId = DbConnector.getRowId(this);
        return record;
    };



    App.prototype.addRecord = function*(record) {
        record.appId = DbConnector.getRowId(this);
        this.stats.lastRecord = Date.now();
        return yield* record.save();
    };



    App.prototype.getRecord = function*(stub) {
        var recordStore = new DbConnector(models.Record);
        return yield* recordStore.findOne({ 'appId': DbConnector.getRowId(this), stub: stub });
    };



    App.prototype.findRecord = function*(query) {
        query.appId = DbConnector.getRowId(this);
        var recordStore = new DbConnector(models.Record);
        return yield* recordStore.findOne(query);
    };


    var getLimit = function(limit, _default, max) {
        var result = _default;
        if (limit) {
            result = limit;
            if (result > max)
                result = max;
        }
        return result;
    };


    App.prototype.findRecords = function*(query, settings) {
        query.appId = DbConnector.getRowId(this);
        settings = settings ? { sort: settings.sort, limit: getLimit(settings.limit, 100, 1000) } : {};
        var recordStore = new DbConnector(models.Record);
        return yield* recordStore.find(query, settings);
    };



    App.prototype.join = function*(user) {
        if (this.access === 'public') {
            return yield* this.addRole(user, 'member');
        } else {
            throw new Error("Access denied");
        }
    };



    App.prototype.addRole = function*(user, role) {
        var membershipStore = new DbConnector(models.Membership);
        var membership = yield* membershipStore.findOne({ 'appId': DbConnector.getRowId(this), 'user.username': user.username });

        var typesService = services.get('typesService');
        if (!membership) {
            membership = new models.Membership(
                {
                    appId: DbConnector.getRowId(this),
                    userId: user.id,
                    user: user,
                    roles: [role]
                }
            );
        } else {
            if (membership.roles.indexOf(role) === -1) {
                membership.roles.push(role);
            }
        }

        return yield* membership.save();
    };



    App.prototype.removeRole = function*(user, role) {
        var membershipStore = new DbConnector(models.Membership);
        var membership = yield* membershipStore.findOne({ 'appId': this.getRowId(), 'user.username': user.username });
        membership.roles = membership.roles.filter(function(r) { return r != role; });
        return membership.roles.length ? (yield* membership.save()) : (yield* membership.destroy());
    };



    App.prototype.getMembership = function*(username) {
        var membershipStore = new DbConnector(models.Membership);
        return yield* membershipStore.findOne({ 'app.id': this.getRowId(), 'user.username': username });
    };



    App.prototype.getMemberships = function*(roles) {
        var membershipStore = new DbConnector(models.Membership);
        return yield* membershipStore.find(
            { 'appId': this.getRowId(), roles: { $in: roles } },
            { sort: { id: -1 }, limit: 200}
        );
    };

    exports.App = App;

})();
