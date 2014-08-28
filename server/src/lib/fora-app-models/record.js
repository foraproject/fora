(function() {
    "use strict";

    var _;

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } };


    var RecordBase = require('./record-base').RecordBase,
        models = require('./'),
        randomizer = require('fora-app-randomizer'),
        typeHelpers = require('fora-app-type-helpers'),
        services = require('fora-app-services');


    //ctor
    var Record = function() {
        this.meta = this.meta || [];
        this.tags = this.tags || [];
        RecordBase.apply(this, arguments);
    };

    Record.prototype = Object.create(RecordBase.prototype);
    Record.prototype.constructor = Record;

    __extends(Record, RecordBase);



    Record.create = function*(params) {
        var obj;
        var typesService = services.get('typesService');
        var typeDef = yield* this.getTypeDefinition(typesService);
        if (typeDef.discriminator) {
            var actualTypeDef = yield* typeDef.discriminator(params, typesService);
            obj = new actualTypeDef.ctor(params);
            obj.getTypeDefinition = function*() {
                return actualTypeDef;
            };
        } else {
            obj = new typeDef.ctor(params);
        }
        return obj;
    };



    Record.search = function*(criteria, settings, context) {
        var limit = getLimit(settings.limit, 100, 1000);

        var params = {};
        for (var k in criteria) {
            v = criteria[k];
            params[k] = v;
        }

        yield Record.find(
            params,
            { sort: settings.sort, limit: limit },
            context
        );
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



    Record.prototype.getMappableFields = function*() {
        var def = yield* this.getTypeDefinition();
        return def.__ownProperties;
    };



    Record.prototype.addMetaList = function*(metaList) {
        metaList.forEach(function(m) {
            if (this.meta.indexOf(m) === -1)
                this.meta.push(m);
        });
        return yield* this.save(services.copy());
    };



    Record.prototype.removeMetaList = function*(metaList) {
        this.meta = this.meta.filter(function(m) {
            return metaList.indexOf(m) === -1;
        });
        return yield* this.save(services.copy());
    };



    Record.prototype.save = function*() {
        var extensionsService = services.get('extensionsService');
        var model = extensionsService.getModuleByName("record", this.type, this.version, "model");

        var versionParts = this.version.split('.');
        this.versionMajor = parseInt(versionParts[0]);
        this.versionMinor = parseInt(versionParts[1]);
        this.versionRevision = parseInt(versionParts[2]);

        //if stub is a reserved name, change it
        if (this.stub) {
            if (conf.reservedNames.indexOf(this.stub) > -1)
                throw new Error("Stub cannot be " + this.stub + ", it is reserved");

            var regex = /[a-z][a-z0-9|-]*/;
            if (!regex.test(this.stub))
                throw new Error("Stub is invalid");
        } else {
            this.stub = this.stub || randomizer.uniqueId(16);
        }

        var result = yield* RecordBase.prototype.save.call(this);

        if (this.state === 'published') {
            _ = yield* models.App.findById(this.appId, services.copy());
        }

        return result;
    };



    Record.prototype.getCreator = function*() {
        return yield* models.User.findById(this.createdBy.id, context);
    };



    exports.Record = Record;

})();