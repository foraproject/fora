React = require 'react'
conf = require '../../conf'
db = require('../app').db
models = require '../../models'
fields = require '../../models/fields'
utils = require '../../lib/utils'
mdparser = require('../../lib/markdownutil').marked
auth = require '../../app-lib/web/auth'
widgets = require '../../app-lib/widgets'
ExtensionLoader = require '../../app-lib/extensions/loader'
loader = new ExtensionLoader()


class ForumContext

    constructor: (@context, @forum) ->
    
    
    getExtension: (object) ->*
        yield loader.load yield object.getTypeDefinition()
                      
        
    renderPage: ->*
    
    
    renderPost: (data) ->*
        yield @context.renderPage 'posts/post', { 
            pageName: 'post-page',
            theme: data.forum.theme,
            json: JSON.stringify(data.post),
            typeDefinition: JSON.stringify(yield data.post.getTypeDefinition()),
            html: data.html
        }


exports.index = auth.handler ->*
    featured = yield models.Forum.find({ network: @network.stub }, { sort: { 'stats.lastPost': -1 }, limit: 32 }, {}, db)
    for forum in featured
        forum.summary = yield forum.getView("card", {}, db)
    
    yield @renderPage 'forums/index', { 
        pageName: 'forums-page',
        featured
    }



exports.page = auth.handler (stub) ->*
    forum = yield models.Forum.get { stub, network: @network.stub }, {}, db
    if forum
        extension = yield loader.load yield forum.getTypeDefinition()
        pages = yield extension.getPages()
        component = yield pages.handle new ForumContext(@, forum)
        html = React.renderComponentToString component
        yield @renderPage 'posts/post', { 
            pageName: 'post-page',
            html
        }



exports.create = ->*
    yield @renderPage 'forums/new', { 
        pageName: 'create-forum-page', 
        pageLayout: {
            type: 'single-section-page fixed-width'
        }                        
    }        



exports.about = (stub) ->*
    forum = yield models.Forum.get({ stub, network: @network.stub }, {}, db)        
    about = (yield forum.link 'info').about

    #We query admins and mods seperately since the fetch limits the posts returned per call
    leaders = yield forum.getMemberships(['admin','moderator'])
    admins = leaders.filter (u) -> u.roles.indexOf('admin') isnt -1
    moderators = leaders.filter (u) -> u.roles.indexOf('moderator') isnt -1 and u.roles.indexOf('admin') is -1
    members = (yield forum.getMemberships ['member']).filter (u) -> u.roles.indexOf('admin') is -1 and u.roles.indexOf('moderator') is -1
    
    yield @renderPage 'forums/about', {
        forum,
        about: if about then mdparser(about),
        admins,
        moderators,
        members,
        pageName: 'forum-about-page', 
        coverInfo: {
            cover: { 
                image: { src: forum.cover ? '/images/cover.jpg' } 
            },
        }
    }

