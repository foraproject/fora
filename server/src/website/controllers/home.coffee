React = require 'react'
conf = require '../../conf'
db = require('../app').db
models = require '../../models'
utils = require('../../lib/utils')
auth = require '../../app-lib/web/auth'
ExtensionLoader = require '../../app-lib/extensions/loader'
loader = new ExtensionLoader()
IndexView = require('../views/home/index')

exports.index = auth.handler ->*
    editorsPicks = yield models.Post.find { meta: 'pick', 'forum.network': @network.stub }, { sort: db.setRowId({}, -1) , limit: 1 }, {}, db
    featured = yield models.Post.find { meta: 'featured', 'forum.network': @network.stub }, { sort: db.setRowId({}, -1) , limit: 12 }, {}, db
    featured = (f for f in featured when (db.getRowId(x) for x in editorsPicks).indexOf(db.getRowId(f)) is -1)

    for post in editorsPicks.concat(featured)
        extension = yield loader.load yield post.getTypeDefinition()
        post.template = yield extension.getTemplate 'list'
    
    cover = {
        image: { src: '/images/cover.jpg' },
    }
    coverContent = "<h1>Editor's Picks</h1>
                    <p>Fora is a place to share ideas. To Discuss and to debate. Everything on Fora is free. Right?</p>"

    component = IndexView { editorsPicks, featured, cover, coverContent }    
    yield @renderPage 'page', { 
        pageName: 'home-page',
        html: React.renderComponentToString component
    }
    
    
    
exports.login = ->*
    yield @renderPage 'home/login', { 
        pageName: 'login-page'
    }
