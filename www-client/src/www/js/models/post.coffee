
PostBase = require('./post-base').PostBase
models = require('./')

class Post extends PostBase

    @typeDefinition: ->
        typeDef = PostBase.typeDefinition()
        typeDef.discriminator = (obj) ->*
            def = yield Post.getTypeUtils().getTypeDefinition(obj.type)
            if def.ctor isnt Post
                throw new Error "Post type definitions must have ctor set to Post"
            def
        typeDef        
        
        
exports.Post = Post

                
