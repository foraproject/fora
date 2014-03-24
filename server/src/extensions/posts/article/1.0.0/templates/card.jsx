/** @jsx React.DOM */
var React = require("react");
var widgets = require("widgets");

var Card = widgets.Card,
    Heading = widgets.Heading,
    Author = widgets.Author, 
    Html = widgets.Html;

module.exports = React.createClass({
    render: function() {
        var post = this.props.post;

        var image, text; 
        if(post.cover)
            image = post.cover.image;
        else
            text = "No-image!";

        //If synopsis is not given, try to auto-generate it.
        if (post.synopsis)
            synopsis = post.synopsis;
        else {
            /*
                If it markdown formatted, take the first line.
                If the first line is very short, take the second line too.
            */
            if (post.content && post.content.format === 'markdown') {
                sentence = post.content.text.match(/[^\.]+\./);
                if (sentence) {
                    synopsis = sentence[0];

                    if (synopsis.length < 100) {
                        sentence = post.content.text.match(/[^\.]+\.[^\.]+\./i);

                        if (sentence && sentence[0].length < 400)
                            synopsis = sentence[0];
                    }                 
                }           
            }
        }
        
        //If synopsis isn't found just use content text. This is going to be truncated while displaying.        
        if (typeof synopsis === "undefined")
            synopsis = post.content.text;
        
        return (
            <Card image={image} text={text}>
                <Heading size="h2" link={"/" + this.props.forum.stub + "/" + post.stub } title={post.title} />
                <Html html={synopsis} />
                <Author type="text" forum={this.props.forum} author={this.props.author} />
            </Card>
        );
    }
});

