// Generated by CoffeeScript 1.6.3
(function() {
  var Cover, ForaModel, Image, TextContent, markdown,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  markdown = require('markdown').markdown;

  ForaModel = require('./foramodel').ForaModel;

  Image = (function(_super) {
    __extends(Image, _super);

    function Image() {
      return Image.__super__.constructor.apply(this, arguments);
    }

    Image.typeDefinition = {
      name: 'image',
      schema: {
        type: 'object',
        properties: {
          src: {
            type: 'string'
          },
          small: {
            type: 'string'
          },
          alt: {
            type: 'string'
          },
          credits: {
            type: 'string'
          }
        },
        required: ['src']
      }
    };

    return Image;

  })(ForaModel);

  Cover = (function(_super) {
    __extends(Cover, _super);

    function Cover() {
      return Cover.__super__.constructor.apply(this, arguments);
    }

    Cover.typeDefinition = {
      name: 'cover',
      schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string'
          },
          image: {
            $ref: 'image'
          },
          bgColor: {
            type: 'string'
          },
          bgOpacity: {
            type: 'string'
          },
          foreColor: {
            type: 'string'
          }
        },
        required: ['image']
      }
    };

    return Cover;

  })(ForaModel);

  TextContent = (function(_super) {
    __extends(TextContent, _super);

    function TextContent() {
      this.formatContent = __bind(this.formatContent, this);
      return TextContent.__super__.constructor.apply(this, arguments);
    }

    TextContent.typeDefinition = {
      name: 'text-content',
      schema: {
        type: 'object',
        properties: {
          text: {
            type: 'string'
          },
          format: {
            type: 'string'
          }
        },
        required: ['text', 'format']
      },
      allowHtml: ['text']
    };

    TextContent.prototype.formatContent = function() {
      switch (this.format) {
        case 'markdown':
          if (this.text) {
            return markdown.toHTML(this.text);
          } else {
            return '';
          }
          break;
        case 'html':
        case 'text':
          return this.text;
        default:
          return 'Invalid format.';
      }
    };

    return TextContent;

  })(ForaModel);

  exports.Image = Image;

  exports.Cover = Cover;

  exports.TextContent = TextContent;

}).call(this);