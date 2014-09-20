(function() {
    "use strict";

    var React = require('react');

    var makeScript = function (src) {
        return '<script src="' + src + '"></script>';
    };

    var makeLink = function(href, rel, media, type) {
        rel = rel || "stylesheet";
        media = media || "screen";
        type = type || "text/css";
        return '<link href="' + href + '" rel="' + rel + '" media="' + media + '" />';
    };

    var deps = {
        styles: [
            'http://fonts.googleapis.com/css?family=Open+Sans:400,700|Lato:900|Crimson+Text:400,600,400italic|Oswald',
            '/css/lib.css',
            '/css/main.css'
        ],

        scripts: [
            '/js/vendor.js',
            '/js/lib.js',
            '/js/bundle.js'
        ]
    };

    var debug_deps ={
        styles: [
            'http://fonts.googleapis.com/css?family=Open+Sans:400,700|Lato:900|Crimson+Text:400,600,400italic|Oswald',
            '/vendor/components/font-awesome/css/font-awesome.css',
            '/vendor/css/HINT.css',
            '/vendor/css/toggle-switch.css',
            '/vendor/components/medium-editor/css/medium-editor.css',
            '/vendor/components/medium-editor/css/themes/default.css',
            '/css/main.css'
        ],

        scripts: [
            '/vendor/js/co.js',
            '/vendor/js/markdown.js',
            '/vendor/js/setImmediate.js',
            '/vendor/js/regenerator-runtime.js',
            '/vendor/js/react.js',
            '/js/lib.js',
            '/js/bundle.js'
        ]
    };



    var render = function(debug) {
        return function*(reactClass, pagePath) {
            var props;

            if (reactClass.componentInit)
                props = yield* reactClass.componentInit.call(null, this);

            props = props || {};

            var component = reactClass(props);

            var title = props.title || "The Fora Project";
            var pageName = props.pageName || "default-page";
            var theme = props.theme || "default-theme";
            var bodyClass = pageName + " " + theme;

            var d = debug ? debug_deps : deps;
            var depsHtml = d.styles.map(function(x) { return makeLink(x); }).concat(d.scripts.map(function(x) { return makeScript(x); })).join('');

            depsHtml += '\
                <script> \
                    app.initPage("' + pagePath + '", ' + JSON.stringify(props) + '); \
                </script>';

            return (
                '<!DOCTYPE html>\
                <html>\
                    <head>\
                        <title>' + title + '</title>' +
                        depsHtml +
                        '<meta name="viewport" content="width=device-width, initial-scale=1"/>\
                    </head>\
                    <body class="' + bodyClass + '">\
                        <!-- header -->\
                        <header class="site">\
                            <a href="#" class="logo">\
                                Fora\
                            </a>\
                        </header>\
                        <div class="page-container"> \
                        ' + React.renderComponentToString(component) + '\
                        </div>\
                    </body>\
                </html>');
            };
        };

    module.exports = {
        render: render(false),
        render_DEBUG: render(true)
    };

})();
