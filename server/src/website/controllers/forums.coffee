conf = require '../../conf'
database = (require '../../lib/data/database').Database
db = new database(conf.db)
models = require '../../models'
utils = require '../../lib/utils'
mdparser = require('../../lib/markdownutil').marked
auth = require '../../common/web/auth'


exports.index = auth.handler ->*
    featured = yield models.Forum.find({ network: @network.stub }, ((cursor) -> cursor.sort({ 'stats.lastPost': -1 }).limit 12), {}, db)
    for forum in featured
        forum.summary = forum.getView("card")
    
    yield @render @network.getView('forums', 'index'), { 
        featured, 
        pageName: 'forums-page', 
        pageLayout: {
            type: 'fixed-page',
        }              
    }



exports.item = auth.handler (stub) ->*
    forum = yield models.Forum.get({ stub, network: @network.stub }, {}, db)
    info = yield forum.associations 'info'

    if forum
        posts = yield forum.getPosts(12, { _id: -1 })
        for post in posts
            template = post.getTemplate 'card'
            post.html = template.render {
                post,
                forum: post.forum,
            }                    

        options = {}
        if @session.user
            membership = yield models.Membership.get { 'forum.id': forum._id.toString(), 'user.username': @session.user.username }, {}, db
            if membership
                options.isMember = true
                options.primaryPostType = forum.postTypes[0]
        
        coverContent = "
            <h1>#{forum.name}</h1>
            <p>#{info.about}</p>"
            
        yield @render @network.getView('forums', 'item'), { 
            forum,
            forumJson: JSON.stringify(forum),
            message: if info.message then mdparser(info.message),
            posts, 
            options,
            user: @session.user,
            pageName: 'forum-page', 
            pageLayout: {
                type: 'fluid-page',
                cover: forum.cover,
                coverContent
            }              
        }



exports.create = ->*
    yield @render @network.getView('forums', 'create'), { 
        pageName: 'create-forum-page', 
        pageLayout: {
            type: 'fluid-page',wwwwww
            cover: { image: { src: '/pub/images/cover.jpg' } },
        }                        
    }        



exports.about = (stub) ->*
    forum = yield models.Forum.get({ stub, network: @network.stub }, {}, db)        
    about = (yield forum.associations 'info').about

    #We query admins and mods seperately since the fetch limits the posts returned per call
    leaders = yield forum.getMemberships(['admin','moderator'])
    admins = leaders.filter (u) -> u.roles.indexOf('admin') isnt -1
    moderators = leaders.filter (u) -> u.roles.indexOf('moderator') isnt -1 and u.roles.indexOf('admin') is -1
    members = (yield forum.getMemberships ['member']).filter (u) -> u.roles.indexOf('admin') is -1 and u.roles.indexOf('moderator') is -1
    
    yield @render @network.getView('forums', 'about'), {
        forum,
        about: if about then mdparser(about),
        admins,
        moderators,
        members,
        pageName: 'forum-about-page', 
        pageType: 'cover-page', 
        cover: forum.cover ? '/pub/images/cover.jpg'
    }

