modules = {
    user: 'User',
    credentials: 'Credentials',
    forum: 'Forum',
    foruminfo: 'ForumInfo',
    post: 'Post',
    token: 'Token',
    userinfo: 'UserInfo',
    message: 'Message',
    network: 'Network',
    article: 'Article',
    conversation: 'Conversation',
    membership: 'Membership',
}

for k, v of modules
    exports[v] = require("./#{k}")[v]

