/** @jsx React.DOM */
(function() {
    "use strict";

    var React = require("react");

    var UI = require('fora-app-ui');
    var Page = UI.Page,
        Cover = UI.Cover,
        Content = UI.Content;

    module.exports = React.createClass({
        statics: {
            componentInit: function*(request) {
                var props = yield* request.api.get("/api/v1/ui/home");

                /* Attach the templates */
                var init = function*(records) {
                  for (var i = 0; i < records.length; i++) {
                      var typeDef = yield* records[i].getTypeDefinition();
                      var extension = yield* request.libs.extensions.get(typeDef.name);
                      records[i].template = extension["web/views"].list;
                  }
              };

                yield* init(props.featured);
                yield* init(props.editorsPicks);

                return props;
            }
        },

        render: function() {
            var createItem = function(record) {
                return record.template({ key: record._id, record: record, app: record.app, author: record.createdBy });
            };

            return (
                <Page>
                    <Cover cover={this.props.cover} coverContent={this.props.coverContent} />
                    <Content>
                        <nav>
                            <ul>
                                <li className="selected">
                                    Records
                                </li>
                                <li>
                                    <a href="/s">Forums</a>
                                </li>
                            </ul>
                        </nav>
                        <div className="content-area">
                            <ul className="articles default-view">
                                {this.props.editorsPicks.map(createItem)}
                            </ul>
                            <ul className="articles default-view">
                                {this.props.featured.map(createItem)}
                            </ul>
                        </div>
                    </Content>
                </Page>
            );
        }
    });

})();
