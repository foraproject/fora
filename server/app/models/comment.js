// Generated by CoffeeScript 1.6.3
(function() {
  var AppError, BaseModel, Comment, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  AppError = require('../common/apperror').AppError;

  BaseModel = require('./basemodel').BaseModel;

  Comment = (function(_super) {
    __extends(Comment, _super);

    function Comment() {
      _ref = Comment.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Comment.describeModel = function() {
      return {
        type: Comment,
        collection: 'comments',
        fields: {
          forum: 'string',
          postid: 'string',
          data: 'object',
          createdBy: {
            type: this.getModels().User.Summary,
            validate: function() {
              return this.createdBy.validate();
            }
          },
          createdAt: {
            autoGenerated: true,
            event: 'created'
          },
          updatedAt: {
            autoGenerated: true,
            event: 'updated'
          }
        },
        logging: {
          isLogged: true,
          onInsert: 'NEW_COMMENT'
        },
        validateMultiRecordOperationParams: function(params) {
          return params.postid;
        }
      };
    };

    return Comment;

  })(BaseModel);

  exports.Comment = Comment;

}).call(this);