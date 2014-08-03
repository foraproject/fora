odm = require('fora-models')


class ForaTypesServiceBase extends odm.TypesService

    init: (@builtinTypes, @RecordType) =>*
        yield* @buildTypeCache()



    getCacheItems: =>*
        definitions = {}

        for defs in [yield* @getModelTypeDefinitions(), yield* @getBuiltInUserTypes()]
            for name, def of defs
                definitions[name] ?= def

        return definitions



    getModelTypeDefinitions: =>*
        #Get type definitions from models
        models = []

        fnAdd = (module) ->
            for name, model of module
                models.push model
                if model.childModels
                    fnAdd model.childModels

        for module in @builtinTypes
            fnAdd module

        definitions = {}

        for model in models
            def = if typeof model.typeDefinition is "function" then model.typeDefinition() else model.typeDefinition
            def = @completeTypeDefinition(def, model)
            definitions[def.name] ?= def

        definitions



    getBuiltInUserTypes: =>*
        definitions = {}

        yield* @addTrustedUserTypes @RecordType, 'record', 'records', definitions

        return definitions



    addTrustedUserTypes: =>*
        throw new Error "addTrustedUserTypes() method must be overridden in derived class."



    mergeUserTypeDefinition: (ext, ctor, baseTypeName, dir, typeName, version, typeDef) =>
        def = JSON.parse JSON.stringify ext.typeDefinition

        if typeDef.initialize
            def.initialize = typeDef.initialize
        def.type = baseTypeName
        def.name = "#{dir}/#{typeName}/#{version}"
        def.version = version
        def.extensionType = 'builtin'

        for field in ['collection', 'trackChanges', 'autoGenerated', 'logging']
            def[field] = typeDef[field]

        def.ctor = ctor

        def.inheritedProperties = []
        for k, v of typeDef.schema.properties
            def.schema.properties[k] = v
            def.inheritedProperties.push k

        for req in typeDef.schema.required
            if def.schema.required?.indexOf(req) is -1
                def.schema.required.push req

        def



    resolveDynamicTypeDefinition: (name) =>*
        #TODO: make sure we dont allow special characters in name, like '..'
        console.log "Missing " + JSON.stringify name


exports.ForaTypesServiceBase = ForaTypesServiceBase
