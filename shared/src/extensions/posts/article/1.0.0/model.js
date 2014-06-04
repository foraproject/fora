(function() {
    "use strict"

    /* 
        typeDefinition: Defines the various fields in the type
    */
    exports.typeDefinition = {
        author: "Fora",
        schema: {
            type: "object",
            properties: {
                title: { type: "string", maxLength: 200 },
                subtitle: { type: "string", maxLength: 200 },
                synopsis: { type: "string", maxLength: 2000 },
                cover: { $ref: "cover" },
                content: { $ref: "text-content" }
            },
            required: ["title"]
        }
    }


    /* 
        save: Gives you a hook to make changes to the post before it gets saved.
    */
    exports.save = function*() {
        //If no cover was specified, use 'inline-cover'
        if (this.cover && !this.cover.type) {
            this.cover.type = "inline-cover";
        }    
    }


    /* 
        view: return a view of the object.
        A view is a subset (or summary) of fields in the post.
    */
    exports.view = function*(name) {
        return {
            image: this.cover ? this.cover.image.small : null,
            title: this.title,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            id: this._id.toString(),
            stub: this.stub
        }
    }
})();
