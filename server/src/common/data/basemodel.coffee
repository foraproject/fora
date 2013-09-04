databaseModule = require('./database').Database
utils = require('../utils')

class BaseModel

    constructor: (params) ->
        utils.extend(this, params)

            
            
    @mergeModelDescription: (child, parent) ->
        fields = utils.clone(parent.fields)   
        for k,v of child.fields
            fields[k] = v
        modelDescription = utils.clone(parent)
        for k,v of child
            if k isnt 'fields'
                modelDescription[k] = v
        modelDescription.fields = fields
        modelDescription
                
                
    
    @getModelDescription: (model = @) ->
        try
            modelDescription = model.describeModel()
            modelDescription.validateMultiRecordOperationParams ?= (params) -> 
                false
            modelDescription
        catch e
            utils.dumpError e
        
    
    
    @getLimit: (limit, _default, max) ->
        result = _default
        if limit
            result = limit
            if result > max
                result = max
        result        
        
        
                
    @getFullFieldDefinition: (def) ->
        #Convert short hands to full definitions.
        #eg: 'string' means { type: 'string', required: true }
        if typeof(def) isnt "object"
            fieldDef = {
                type: def,
                required: true
            }
        else 
            fieldDef = def

        if fieldDef.autoGenerated and (fieldDef.event is 'created' or fieldDef.event is 'updated')
            fieldDef.type = 'number'
            fieldDef.required = true

        fieldDef.required ?= true
        fieldDef.type ?= ''
        
        fieldDef


                
    @isCustomClass: (type) ->
        ['string', 'number', 'boolean', 'object', 'array', ''].indexOf(type) is -1                

                
    
    validate: (modelDescription = @constructor.getModelDescription()) ->
        BaseModel.validate.call @, modelDescription
    
    
    
    @validate: (modelDescription) ->   
        errors = []
        
        if not modelDescription.useCustomValidationOnly
            for fieldName, def of modelDescription.fields                
                BaseModel.addError errors, fieldName, BaseModel.validateField.call(@, @[fieldName], fieldName, def)

            if modelDescription.validate
                customValidationResults = modelDescription.validate.call @                    
                return if customValidationResults?.length then errors.concat customValidationResults else errors
            else
                return errors
        else
            if modelDescription.validate
                customValidationResults = modelDescription.validate.call @, modelDescription
                return if customValidationResults?.length then customValidationResults else []
            else
                return []
    
    
    
    @validateField: (value, fieldName, def) ->
        errors = []

        if not def.useCustomValidationOnly                
            fieldDef = BaseModel.getFullFieldDefinition(def)

            if fieldDef.required and not value?
                errors.push "#{fieldName} is #{JSON.stringify value}"
                errors.push "#{fieldName} is required."
            
            #Check types.       
            if value
                if fieldDef.type is 'array'
                    for item in value                        
                        BaseModel.addError errors, fieldName, BaseModel.validateField.call(@, item, "[#{fieldName} item]", fieldDef.contents)
                else
                    #If it is a custom class or a primitive
                    if fieldDef.type isnt ''                        
                        if (BaseModel.isCustomClass(fieldDef.type) and not (value instanceof fieldDef.type)) or (not BaseModel.isCustomClass(fieldDef.type) and typeof(value) isnt fieldDef.type)
                            errors.push "#{fieldName} is #{JSON.stringify value}"
                            errors.push "#{fieldName} should be a #{fieldDef.type}."

                    if BaseModel.isCustomClass(fieldDef.type) and value.validate
                        errors = errors.concat value.validate()
                    else
                        #We should also check for objects inside object. (ie, do we have fields inside the fieldDef?)
                        if fieldDef.fields
                            errors =  errors.concat BaseModel.validate.call value, fieldDef
        
        if value and fieldDef.validate
            BaseModel.addError errors, fieldName, fieldDef.validate.call(@)
            
        errors            
        

    
    @addError: (list, fieldName, error) ->
        if error is true
            return list
        if error is false
            list.push "#{fieldName} is invalid."
            return list
        if error instanceof Array
            if error.length > 0
                for item in error
                    BaseModel.addError list, fieldName, item
            return list
        if error
            list.push error
            return list
            
            
    
    toJSON: ->
        result = {}
        for k,v of @
            if not /^__/.test(k) 
                result[k] = v
        result



class ValidationError extends Error        
    constructor: (@message, @details) ->
        Error.captureStackTrace @, ValidationError        



exports.BaseModel = BaseModel
exports.ValidationError = ValidationError
