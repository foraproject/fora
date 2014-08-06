(function() {
    "use strict";

    var _;

    var __hasProp = {}.hasOwnProperty,
        __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } };

    var RecordBase = require('./foramodel').RecordBase,
        models = require('./'),
        randomizer = require('fora-randomizer');

    //ctor
    var Record = function() {
        this.meta = this.meta || [];
        this.tags = this.tags || [];
        RecordBase.apply(this, arguments);
    };

    Record.prototype = Object.create(RecordBase.prototype);
    Record.prototype.constructor = Record;

    __extends(Record, RecordBase);


    Record.typeDefinition = this.mergeTypeDefinition({
        discriminator: function*(obj, typesService) {
            var def = yield* typesService.getTypeDefinition(obj.type);
            if (def.ctor !== Record)
                throw new Error("Record type definitions must have ctor set to Record");
            return def;
        }
    }, RecordBase.typeDefinition);



    Record.search = function*(criteria, settings, context) {
        var limit = getLimit(settings.limit, 100, 1000);

        var params = {};
        for (var k in criteria) {
            v = criteria[k];
            params[k] = v;
        }

        yield Record.find(
            params,
            function(cursor) {
                return cursor.sort(settings.sort).limit(limit);
            },
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


    Record.prototype.addMetaList = function*(metaList, context) {
        context = this.getContext(context);
        metaList.forEach(function(m) {
            if (this.meta.indexOf(m) === -1)
                this.meta.push(m);
        });
        _ = yield* this.save(context);
    };


    Record.prototype.removeMetaList = function*(metaList) {
        context = this.getContext(context);
        this.meta = this.meta.filter(function(m) {
            return metaList.indexOf(m) === -1;
        });
        _ = yield* this.save(context);
    };


    Record.prototype.save = function*(context) {
        context = this.getContext(context);

        //Broken here.. getModel isn't implemented
        var model = yield* extensions.getModel();
        _ = yield* model.save.call(this);

        //if stub is a reserved name, change it
        if (stub) {
            if (conf.reservedNames.indexOf(this.stub) > -1)
                throw new Error("Stub cannot be " + stub + ", it is reserved");

            var regex = /[a-z][a-z0-9|-]*/;
            if (!regex.test(this.stub))
                throw new Error("Stub is invalid");
        } else {
            this.stub = this.stub || randomizer.uniqueId(16);
        }

        var result = yield* RecordBase.prototype.save.call(this, context);

        if (this.state === 'published') {
            app = yield* models.App.getById(this.appId, context);
            _ = yield* app.refreshCache();
        }

        return result;
    };



    Record.prototype.getCreator = function*(context) {
        context = this.getContext(context);
        return yield* models.User.getById(this.createdById, context);
    };


    exports.Record = Record;

})();
