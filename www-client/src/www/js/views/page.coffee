
class Page

    constructor: (@componentPath, @data) ->
        require [@componentPath], @render
        
        
    
    render: (Component) =>
        (co =>*
            component = Component @data
            if component.type.componentInit
                yield component.type.componentInit(component, true)
            React.renderComponent component, $('#page-container')[0]
        )()
        
        
module.exports = Page
