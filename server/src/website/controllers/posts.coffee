conf = require '../../conf'
db = require('../app').db
models = require '../../models'
utils = require '../../lib/utils'
auth = require '../../common/web/auth'
widgets = require '../../common/widgets'

exports.item = auth.handler (forum, post) ->*
    forum = yield models.Forum.get({ stub: forum, network: @network.stub }, {}, db)
    if forum
        post = yield models.Post.get({ 'forum.id': forum._id.toString(), stub: post }, {}, db)
        if post
            author = yield models.User.getById post.createdBy.id, {}, db

            yield @renderPage 'posts/post', { 
                pageName: 'post-page',
                theme: forum.theme,
                json: JSON.stringify(post),
                typeDefinition: JSON.stringify(yield post.getTypeDefinition()),
                html: yield models.Post.render('item', { post, forum: post.forum, author, layout: { theme: forum.theme } })
            }
    
   
