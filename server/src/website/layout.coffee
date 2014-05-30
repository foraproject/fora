React = require 'fora-react-sandbox'

makeScript = (src) ->
    "<script src=\"#{src}\"></script>"

makeLink = (href, rel="stylesheet", media="screen", type = "text/css") ->
    "<link href=\"#{href}\" rel=\"#{rel}\" media=\"#{media}\" />"


deps = () ->
    styles = [
        'http://fonts.googleapis.com/css?family=Open+Sans:400,700|Lato:900|Crimson+Text:400,600,400italic|Oswald',
        '/css/lib.css',
        '/css/main.css'
    ]
    
    scripts = [
        '/js/vendor.js',
        '/js/lib.js',
        '/js/bundle.js'
    ]
     
    (makeLink(x) for x in styles).concat(makeScript(x) for x in scripts).join('')


debug_deps = () ->
    styles = [
        'http://fonts.googleapis.com/css?family=Open+Sans:400,700|Lato:900|Crimson+Text:400,600,400italic|Oswald',
        '/vendor/components/font-awesome/css/font-awesome.css',
        '/vendor/css/HINT.css',
        '/vendor/css/toggle-switch.css',
        '/vendor/components/medium-editor/css/medium-editor.css',
        '/vendor/components/medium-editor/css/themes/default.css',
        '/css/main.css'
    ]
    
    scripts = [
        '/vendor/js/co.js',
        '/vendor/js/markdown.js',
        '/vendor/js/setImmediate.js',
        '/vendor/js/regenerator-runtime.js',
        '/vendor/js/react.js',
        '/js/bundle.js'
    ]

    (makeLink(x) for x in styles).concat(makeScript(x) for x in scripts).join('')


render = (debug) ->
    (reactClass, props = {}, params = {}) ->*
        component = reactClass(props)
        if component.componentInit
            yield component.componentInit()

        title = props.title ? "The Fora Project"
        pageName = props.pageName ? "default-page"
        theme = props.theme ? "default-theme"
        bodyClass = "#{pageName} #{theme}"
            
        return "
            <!DOCTYPE html>
            <html>
                <head>
                    <title>#{title}</title>
                    #{if debug then debug_deps() else deps()}                
                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
                </head>

                <body class=\"#{bodyClass}\">
                    <!-- header -->
                    <header class=\"site\">
                        <a href=\"#\" class=\"logo\">
                            Fora
                        </a>
                    </header>
                    <div class=\"page-container\">
                    #{React.renderComponentToString(component)}
                    </div>
                </body>
            </html>"



module.exports = {
    render: render(false),
    render_DEBUG: render(true)
}
