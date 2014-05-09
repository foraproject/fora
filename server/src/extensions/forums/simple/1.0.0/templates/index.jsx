/** @jsx React.DOM */
fn = function(React, ForaUI) {
    var Page = ForaUI.Page,
        Content = ForaUI.Content,
        Cover = ForaUI.Cover;

    return React.createClass({
        statics: {
            componentInit: function*(component, isBrowser) {           
                /* Convert the JSON into Post objects and attach the templates */
                for (i = 0; i < component.props.posts.length; i++) {
                    if (isBrowser)
                        posts[i] = new Models.Post(posts[i]);
                    extension = yield loader.load(yield posts[i].getTypeDefinition());
                    posts[i].template = yield extension.getTemplateModule('list');
                }
            }
        },
            
        render: function() {        
            forum = this.props.forum;
            
            //If the cover is missing, use default
            if (!forum.cover) {
                forum.cover = {
                    image: { 
                        src: '/images/forum-cover.jpg', 
                        small: '/images/forum-cover-small.jpg', 
                        alt: forum.name
                    }
                };
            }
            
            if (!forum.cover.type) {
                forum.cover.type = "auto-cover"
            }    
        
            createItem = function(post) {
                return post.template({ post: post, forum: post.forum, author: post.createdBy });
            };    
        

            options = this.props.options;
            buttons = null;
            
            if (options.loggedIn) {
                if (options.isMember)
                    action = <a href="#" className="positive new-post"><i className="fa fa-plus"></i>New {options.primaryPostType}</a>
                else
                    action = <a href="#" className="positive join-forum"><i className="fa fa-user"></i>Join Forum</a>

                buttons = (
                    <ul className="alt buttons">
                        <li>
                            {action}
                        </li>
                    </ul>
                );          
            }

            return (
                <Page>
                    <Cover cover={forum.cover} />                
                    <Content>
                        <nav>
                            <ul>
                                <li className="selected">
                                    Popular
                                </li>
                                <li>
                                    <a href="/{{forum.stub}}/about">About</a>
                                </li>          
                            </ul>
                            {buttons}
                        </nav>    
                        <div className="content-area">
                            <ul className="articles default-view">
                                {this.props.posts.map(createItem)}     
                            </ul>
                        </div>
                    </Content>
                </Page>        
            );
        }
    });
};


loader = function(definition) {
    if (typeof exports === "object")
        module.exports = definition(require('react'), require('fora-ui'));
    else
        define([], function() { return definition(React, ForaUI); });
}

loader(fn);


