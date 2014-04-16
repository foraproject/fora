React = require('react')

tags = [
    'div', 'p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'span', 'a', 'em', 'strong', 'table', 'th', 'tr', 'td',
    'nav', 'section', 'article', 'header', 'footer', 'br', 'hr', 'img'
]

DOM = {}
for tag in tags
    do (tag) ->
        DOM[tag] = ->
            React.DOM[tag].apply React.DOM, arguments

module.exports = {
    DOM,
    controls: {
        Cover: require('./controls/cover'),
        Page: require('./controls/page'),
        PostEditor: require('./controls/posteditor')
    },
    helpers: require('./helpers'),
    createClass: React.createClass
}
