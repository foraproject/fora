class Validator

    constructor: (@typeUtils) ->
        

    validate: (obj, modelDescription) ->   
        errors = []
        
        if not modelDescription.useCustomValidationOnly
            for fieldName, def of modelDescription.fields                
                @addError errors, fieldName, @validateField(obj, obj[fieldName], fieldName, def)

            if modelDescription.validate
                customValidationResults = modelDescription.validate.call obj
                return if customValidationResults?.length then errors.concat customValidationResults else errors
            else
                return errors
        else
            if modelDescription.validate
                customValidationResults = modelDescription.validate.call obj
                return if customValidationResults?.length then customValidationResults else []
            else
                return []
    
    
    
    validateField: (obj, value, fieldName, fieldDef) ->
        errors = []

        if not fieldDef.useCustomValidationOnly                
            if fieldDef.required and not value?
                errors.push "#{fieldName} is #{JSON.stringify value}"
                errors.push "#{fieldName} is required."
            
            #Check types.       
            if value?
                if fieldDef.type is 'array'
                    for item in value                        
                        @addError errors, fieldName, @validateField(obj, item, "[#{fieldName} item]", fieldDef.contents)
                else
                    #If it is a custom class or a primitive
                    if fieldDef.type isnt ''      
                        if (@typeUtils.isUserDefinedType(fieldDef.type) and not (value instanceof fieldDef.ctor)) or (not @typeUtils.isUserDefinedType(fieldDef.type) and typeof(value) isnt fieldDef.type)
                            errors.push "#{fieldName} is #{JSON.stringify value}"
                            errors.push "#{fieldName} should be a #{fieldDef.type}."

                        if fieldDef.type is 'string'
                            if fieldDef.maxLength and fieldDef.maxLength < value.length
                                errors.push "#{fieldName} cannot be longer than #{fieldDef.maxLength}."

                            if fieldDef.$in
                                if fieldDef.$in.indexOf(value) is -1
                                    errors.push "#{fieldName} must be one of #{JSON.stringify(fieldDef.$in)}."

                        if @typeUtils.isUserDefinedType(fieldDef.type) and value.validate
                            errors = errors.concat value.validate()
        
        if value? and fieldDef.validate
            @addError errors, fieldName, fieldDef.validate.call obj
            
        errors            
        
        
    
    addError: (list, fieldName, error) ->
        if error is true
            return list
        if error is false
            list.push "#{fieldName} is invalid."
            return list
        if error instanceof Array
            if error.length > 0
                for item in error
                    @addError list, fieldName, item
            return list
        if error
            list.push error
            return list


exports.Validator = Validator
        
