
module.exports = ({typeUtils, models, fields, db, conf, auth, mapper, loader }) -> {
    create: auth.handler { session: 'user' }, (forum) ->*
        forum = yield* models.Forum.get { stub: forum, network: @network.stub }, { user: @session.user }, db

        post = yield* models.Post.create {
            type: yield* @parser.body('type'),
            createdById: @session.user.id,
            createdBy: @session.user,
            state: yield* @parser.body('state'),
            rating: 0,
            savedAt: Date.now()
        }
        
        yield* @parser.map post, yield* mapper.getMappableFields yield* post.getTypeDefinition()
        post = yield* forum.addPost post
        @body = post


    edit: auth.handler { session: 'user' }, (forum, post) ->*
        forum = yield* models.Forum.get { stub: forum, network: @network.stub }, { user: @session.user }, db
        post = yield* models.Post.get { stub: post, forumId: forum._id.toString() }, { user: @session.user }, db
        
        if post
            if (post.createdBy.username is @session.user.username) 
                post.savedAt = Date.now()                       
                yield* @parser.map post, yield* mapper.getMappableFields yield* post.getTypeDefinition()
                if yield* @parser.body('state') is 'published'
                    post.state = 'published'
                post = yield* post.save()
                @body = post
            else
                @throw 'access denied', 403
        else
            @throw 'access denied', 403


    remove: auth.handler { session: 'user' }, (forum, post) ->*
        forum = yield* models.Forum.get { stub: forum, network: @network.stub }, { user: @session.user }, db
        post = yield* models.Post.get { stub: post, forumId: forum._id.toString() }, { user: @session.user }, db
        if post
            if (post.createdBy.username is @session.user.username) or @session.admin
                post = yield* post.destroy()
                @body = post
            else
                @throw 'access denied', 403
        else
            @throw 'invalid post', 400
                 

    admin_update: auth.handler { session: 'admin' }, (forum, post) ->*
        forum = yield* models.Forum.get { stub: forum, network: @network.stub }, { user: @session.user }, db
        post = yield* models.Post.get { stub: post, forumId: forum._id.toString() }, { user: @session.user }, db

        if post 
            meta = yield* @parser.body('meta')
            if meta
                post = yield* post.addMetaList meta.split(',')
            @body = post
        else
            @throw 'invalid post', 400
}


