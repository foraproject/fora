
PostBase = require('./post-base').PostBase
TextContent = require('./fields').TextContent

class Post extends PostBase

    @typeDefinition: ->
        typeDef = PostBase.typeDefinition()
        typeDef.discriminator = (obj) ->*
            def = yield* Post.getTypeUtils().getTypeDefinition(obj.type)
            if def.ctor isnt Post
                throw new Error "Post type definitions must have ctor set to Post"
            def
        typeDef


    constructor: (params) ->
        super
        if (!(@content instanceof TextContent))
            @content = new TextContent(@content)


    getTypeDefinition: =>*
        typeUtils = Post.getTypeUtils()
        yield* typeUtils.getTypeDefinition(@type)


exports.Post = Post
