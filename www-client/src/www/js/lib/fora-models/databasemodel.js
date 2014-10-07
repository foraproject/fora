(function() {
	"use strict";

	var __hasProp = {}.hasOwnProperty,
		__extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } };

	var _;

	var utils = require('./utils'),
		TypesUtil = require('./types-util'),
		typesUtil = new TypesUtil(),
		BaseModel = require('./basemodel'),
		ValidationError = require('./validation-error');


	//Constructor
	var DatabaseModel = function (params) {
		BaseModel.apply(this, arguments);
	};


	DatabaseModel.constructModel = function*(obj, typeDefinition, context) {
		var db = context.db, typesService = context.typesService;

		var clone, effectiveTypeDef, original, result;

		if (typeDefinition.discriminator) {
			effectiveTypeDef = yield* typeDefinition.discriminator(obj, typesService);
		} else {
			effectiveTypeDef = typeDefinition;
		}

		result = yield* this._constructModel_impl(obj, effectiveTypeDef, context);

		if (effectiveTypeDef.trackChanges) {
			clone = utils.deepCloneObject(obj);
			original = yield* this._constructModel_impl(clone, effectiveTypeDef, context);
			result.getOriginalModel = function() {
				return original;
			};
		}

		/*
			If the object is a dynamic type (effectiveTypeDef !== typeDefinition),
			we can't get the type info from getTypeDefinition(). So we overwrite getTypeDefinition with
			a new method which returns effectiveTypeDef.
		*/
		if (effectiveTypeDef !== typeDefinition) {
			result.getTypeDefinition = function*() {
				return effectiveTypeDef;
			};
			if (effectiveTypeDef.trackChanges) {
				original.getTypeDefinition = function*() {
					return effectiveTypeDef;
				};
			}
		}

		if (typeDefinition.initialize) {
			_ = yield* typeDefinition.initialize(result);
		}

		return result;
	};


	DatabaseModel._constructModel_impl = function*(obj, typeDefinition, context) {
		var db = context.db, typesService = context.typesService;

		var fnCtor, result;
		if (typeDefinition.customConstructor) {
			fnCtor = function*(_o, _context) {
				return yield* typeDefinition.customConstructor(_o, _context);
			};
			return yield* makeResult(obj, fnCtor, typeDefinition, context);
		} else {
			result = yield* this.constructModelFields(obj, typeDefinition, context);
			fnCtor = function*(_o, _context) {
				return typeDefinition.ctor ? new typeDefinition.ctor(_o, _context) : _o;
			};
			return yield* makeResult(result, fnCtor, typeDefinition, context);
		}
	};


	DatabaseModel.constructModelFields = function*(obj, typeDefinition, context) {
		var db = context.db, typesService = context.typesService;

		var result = {};

		for (var name in typeDefinition.schema.properties) {
			var arr;
			var def = typeDefinition.schema.properties[name];
			var value = obj[name];

			if (typesUtil.isPrimitiveType(def.type)) {
				if (value !== undefined && value !== null) {
					if (def.type === 'array') {
						arr = [];
						if (def.items.typeDefinition) {
							for (var _i = 0; _i < value.length; _i++) {
								var item = value[_i];
								arr.push(yield* this.constructModel(item, def.items.typeDefinition, context));
							}
						} else {
							arr = value;
						}
						result[name] = arr;
					} else {
						result[name] = value;
					}
				}
			} else {
				if (def.typeDefinition) {
					if (value) {
						result[name] = yield* this.constructModel(value, def.typeDefinition, context);
					}
				} else {
					result[name] = value;
				}
			}
		}

		if (typeDefinition.autoGenerated) {
			for (var fieldName in typeDefinition.autoGenerated) {
				result[fieldName] = obj[fieldName];
			}
		}
		if (db.getRowId(obj)) {
			db.setRowId(result, db.getRowId(obj));
		}
		return result;
	};


	DatabaseModel.prototype = Object.create(BaseModel.prototype);
	DatabaseModel.prototype.constructor = DatabaseModel;
	__extends(DatabaseModel, BaseModel);

	module.exports = DatabaseModel;

})();
