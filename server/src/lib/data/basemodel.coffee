databaseModule = require('./database').Database
utils = require('../utils')
Validator = require('./validator').Validator
typeUtils = new (require('./typeutils').TypeUtils)

class BaseModel

    constructor: (params) ->
        utils.extend(this, params)



    @getTypeDefinition: (model = @, inherited = true) ->
        typeDesc = if typeof model.describeType is "function" then model.describeType() else model.describeType
        
        if inherited and typeDesc?.inherits
            @mergeTypeDefinition typeDesc, typeDesc.inherits.getTypeDefinition()
        else
            typeDesc
        
        
    
    @getLimit: (limit, _default, max) ->
        result = _default
        if limit
            result = limit
            if result > max
                result = max
        result        
        
    
    
    @mergeTypeDefinition: (child, parent) ->
        if not parent
            return child
        else
            result = {}
            utils.extend result, child, (n) -> n isnt 'fields'
            utils.extend result, parent, (n) -> n isnt 'fields'
            result.fields = {}
            if child.fields
                utils.extend result.fields, child.fields 
            if parent.fields
                utils.extend result.fields, parent.fields 
            result



    @getTypeUtils: ->
        typeUtils


    
    validate: (modelDescription = @getTypeDefinition()) ->
        validator = new Validator @constructor.getTypeUtils()
        validator.validate @, modelDescription
            


    validateField: (value, fieldName, modelDescription = @getTypeDefinition()) ->
        validator = new Validator @constructor.getTypeUtils()
        validator.validateField @, value, fieldName, modelDescription
        


    getTypeDefinition: (inherited = true) =>
        @constructor.getTypeDefinition @constructor, inherited
            

    
    toJSON: ->
        result = {}
        for k,v of @
            if not /^__/.test(k) 
                result[k] = v
        result



exports.BaseModel = BaseModel
