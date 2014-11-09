(function() {
    "use strict";

    var _; //keep jshint happy, until they fix yield*


    var init = function*(config, baseConfig) {
        /*
            Services
            0) Configuration
            1) Database Service
            2) Extensions Service
            3) Types Service
        */
        var models = require("fora-app-models");
        var services = require('fora-app-services');

        //Configuration
        services.add("configuration", baseConfig);

        //Database Service
        var Database = require('fora-app-db-backend');
        var db = new Database(baseConfig.db);
        services.add("db", db);

        /*
            Extensions Service
            ------------------
        */
        var ExtensionsService = require('fora-extensions-service');
        var fnModuleMapper = function*(extModule, kind, typeName, version, moduleName) {
            if (kind === "record" && moduleName === "definition") {
                extModule.name = kind + "/" + typeName + "/" + version;
            }
            if (extModule.init)
                _ = yield* extModule.init();

            return extModule;
        };
        var extensionsService = new ExtensionsService(config.services.extensions, baseConfig.services.extensions, fnModuleMapper);
        _ = yield* extensionsService.init();
        services.add("extensionsService", extensionsService);

        /*
            Types Service
            -------------
            We must pass all the typeDefinitions and virtual typeDefinitions to typesService.
            Virtual Type Definitions are defined in extensions, so we need to get it via extensionsService.
        */
        var TypesService = require('fora-app-types-service');
        var typesService = new TypesService(
            extensionsService,
            {
                modelServices: {
                    getRowId: db.getRowId.bind(db),
                    setRowId: db.setRowId.bind(db),
                    isModel: function(i) { return i && i.constructor.typeDefinition; },
                    setTypeDefinition: function*(def) {
                        this.getTypeDefinition = function*() {
                            return def;
                        };
                    },
                    getTypeDefinition: function*() {
                        return yield* this.getTypeDefinition();
                    }
                }
            }
        );


        var modelsArray = Object.keys(models).map(function(k) { return models[k]; });
        var typeDefinitions = modelsArray.map(function(Model) {
            var typeDefinition = Model.typeDefinition;
            typeDefinition.ctor = function(params) { return new Model(params); };
            return typeDefinition;
        });

        var appExtensions = yield* extensionsService.getModulesByKind("app", "definition");
        var appVirtTypeDefinitions = Object.keys(appExtensions).map(function(key) {
            return appExtensions[key];
        });

        var recordExtensions = yield* extensionsService.getModulesByKind("record", "definition");
        var recordVirtTypeDefinitions = Object.keys(recordExtensions).map(function(key) {
            return recordExtensions[key];
        });

        _ = yield* typesService.init(
            typeDefinitions,
            [
                { typeDefinitions: appVirtTypeDefinitions, baseTypeDefinition: models.App.typeDefinition },
                { typeDefinitions: recordVirtTypeDefinitions, baseTypeDefinition: models.Record.typeDefinition }
            ]
        );
        services.add("typesService", typesService);

        return {};
    };

    module.exports = init;

})();
