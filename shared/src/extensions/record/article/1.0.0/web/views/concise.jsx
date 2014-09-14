/** @jsx React.DOM */
(function() {
    "use strict";

    var React = require('react'),
        ForaUI = require('fora-app-ui');

    var RecordEditor = ForaUI.RecordEditor;

    module.exports = React.createClass({
        render: function() {
            return (
                <article>
                    <RecordEditor record={this.props.record} />
                    <h1>{this.props.record.title}</h1>
                    <section className="author"></section>
                    <section className="content" dangerouslySetInnerHTML={{ __html: this.props.record.content.formatContent()}}>
                    </section>
                </article>
            );
        }
    });
})();
