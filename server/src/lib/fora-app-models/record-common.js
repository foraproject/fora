(function() {

    "use strict";

    var _;

    var dataUtils = require('fora-data-utils'),
        services = require('fora-app-services');

    var extendRecord = function(Record) {

        Record.typeDefinition = {
            name: "record",
            collection: 'records',
            discriminator: function*(obj, typesService) {
                return yield* typesService.getTypeDefinition(obj.type);
            },
            schema: {
                type: 'object',
                properties: {
                    type: { type: 'string' },
                    recordType: { type: 'string' },
                    version: { type: 'string' },
                    versionMajor: { type: 'number' },
                    versionMinor: { type: 'number' },
                    versionRevision: { type: 'number' },
                    appId: { type: 'string' },
                    createdBy: { $ref: 'user-summary' },
                    meta: { type: 'array', items: { type: 'string' } },
                    tags: { type: 'array', items: { type: 'string' } },
                    stub: { type: 'string' },
                    state: { type: 'string', enum: ['draft','published'] },
                    savedAt: { type: 'integer' }
                },
                required: ['type', 'recordType', 'version', 'versionMajor', 'versionMinor', 'versionRevision',
                           'appId', 'createdBy', 'meta', 'tags', 'stub', 'state', 'savedAt']
            },
            indexes: [
                { 'state': 1, 'app.stub': 1 },
                { 'state': 1, 'appId': 1 },
                { 'state': 1, 'createdAt': 1, 'app.stub': 1 },
                { 'createdBy.id' : 1 },
                { 'createdBy.username': 1 }
            ],
            links: {
                app: { type: 'app', key: 'appId' }
            },
            autoGenerated: {
                createdAt: { event: 'created' },
                updatedAt: { event: 'updated' }
            },
            initialize: function*(record, raw, typeDef, typesService) {
                var clone = JSON.parse(JSON.stringify(raw));
                var original = yield* typesService.constructModel(clone, typeDef, true);
                this.getOriginal = function*() {
                    return original;
                };
            },
            logging: {
                onInsert: 'NEW_POST'
            }
        };


        var getCustomFields = function*(typeDefinition, acc, prefix) {
            acc = acc || [];
            prefix = prefix || [];

            for (var field in typeDefinition.schema.properties) {
                if (!typeDefinition.ownProperties || typeDefinition.ownProperties.indexOf(field) > -1) {
                    var def = typeDefinition.schema.properties[field];
                    if (dataUtils.isPrimitiveType(def.type)) {
                        if (def.type === "array" && dataUtils.isCustomType(def.items.type)) {
                                prefix.push(field);
                                _ = yield* getCustomFields(def.items.typeDefinition, acc, prefix);
                                prefix.pop(field);
                        } else {
                            acc.push(prefix.concat(field).join('_'));
                        }
                    } else if (dataUtils.isCustomType(def.type)) {
                        prefix.push(field);
                        _ = yield* getCustomFields(def.typeDefinition, acc, prefix);
                        prefix.pop(field);
                    }
                }
            }

            return acc;
        };


        Record.prototype.getCustomFields = function*(typeDefinition) {
            return yield* getCustomFields(typeDefinition);
        };


        Record.new = function*(params) {
            var typesService = services.get('typesService');
            var typeDefinition = yield* typesService.getTypeDefinition(Record.typeDefinition.name);
            return yield* typesService.constructModel(params, typeDefinition);
        };


        Record.extend = function(items) {
            var ctor = function(params) {
                Record.call(this, params);
            };

            ctor.prototype = Object.create(Record.prototype);
            ctor.prototype.constructor = ctor;

            for (var key in items) {
                if (!/^my_/.test(key))
                    throw new Error("Custom functions in record/name/version/model.js must start with my_ prefix. Rename " + key + " as my_" + key + ".");
                ctor.prototype[key] = items[key];
            }

            return ctor;
        };
    };

    module.exports = {
        extendRecord: extendRecord
    };

})();