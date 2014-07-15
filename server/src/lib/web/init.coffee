module.exports = ({ typeUtils, conf }) ->
    RequestParser = require('fora-webrequestparser')

    (next) ->*
        if @method is 'POST' or @method is 'PUT' or @method is 'PATCH'
            @parser =  new RequestParser(@, typeUtils)

        network = (n for n in conf.networks when n.domains.indexOf(@host) isnt -1)
        if network.length
            @network = network[0]
        else
            throw new Error "Invalid network"
            
        yield* next
            
            
