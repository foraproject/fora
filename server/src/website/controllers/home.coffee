conf = require '../../conf'
db = require('../app').db
models = require '../../models'
utils = require('../../app-lib/utils')
auth = require '../../app-lib/web/auth'

exports.index = auth.handler ->*
    editorsPicks = yield models.Post.find { meta: 'pick', 'forum.network': @network.stub }, { sort: db.setRowId({}, -1) , limit: 1 }, {}, db
    featured = yield models.Post.find { meta: 'featured', 'forum.network': @network.stub }, { sort: db.setRowId({}, -1) , limit: 12 }, {}, db
    featured = (f for f in featured when (db.getRowId(x) for x in editorsPicks).indexOf(db.getRowId(f)) is -1)

    cover = {
        image: { src: '/images/cover.jpg' },
    }
    coverContent = "<h1>Editor's Picks</h1>
                    <p>Fora is a place to share ideas. Lorem Ipsum Bacon?</p>"

    yield @renderView('home/index', { editorsPicks, featured, cover, coverContent })

    ###
    component = IndexView 
    yield component.type.componentInit(component)
    
    script = "
        <script>
            var page = new Fora.Views.Page(
                '/shared/website/views/home/index.js',
                #{JSON.stringify({ editorsPicks, featured, cover, coverContent })}
            );
        </script>"
    
    html = "
        #{script}
        #{Sandbox.renderComponentToString(component)}"
    
    yield @renderPage 'page', { 
        pageName: 'home-page',
        html
    }
    ###
    
    
exports.login = ->*
    yield @renderPage 'home/login', { 
        pageName: 'login-page'
    }
