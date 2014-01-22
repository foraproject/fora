ForaDbModel = require('./foramodel').ForaDbModel

class UserInfo extends ForaDbModel

    @typeDefinition: {
        name: "user-info",
        collection: 'userinfo',
        schema: {
            type: 'object',        
            properties: {
                userid: { type: 'string' },
                subscriptions: { type: 'array', items: { $ref: 'forum-summary' } },
                following: { type: 'array', items: { $ref: 'user-summary' } },
                lastMessageAccessTime: { type: 'number' }
            },
            required: ['userid', 'following', 'subscriptions' ]
        }
        logging: {
            onInsert: 'NEW_USER'
        }
    }

    
    constructor: (params) ->
        @subscriptions ?= []
        @following ?= []
        super
        


exports.UserInfo = UserInfo
