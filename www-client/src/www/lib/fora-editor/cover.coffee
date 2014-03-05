class Cover

    constructor: (@e, @editor) ->
    


    setup: =>
        if @e.find('.image').length
            @e.find('.cover-editor').remove()
            
            editor = $ '
                <div class="cover-editor">
                    <div class="underlay"></div>
                    <div class="content-area">
                        <p class="upload">
                            <i class="fa fa-picture-o"></i> <a href="#">Upload a picture</a>
                        <p>
                        <p class="text-color">
                            Text color<br />
                            <span class="colors">
                                <span style="background:#900"></span>
                                <span style="background:#090"></span>
                                <span style="background:#009"></span>
                                <span style="background:#aa3"></span>
                                <span style="background:#099"></span>
                                <span style="background:#909"></span>
                                <span style="background:#000"></span>
                                <span style="background:transparent"></span>
                            </span>
                        </p>
                        <p class="tint">
                            Tint<br />
                            <span class="colors">
                                <span style="background:#900"></span>
                                <span style="background:#090"></span>
                                <span style="background:#009"></span>
                                <span style="background:#990"></span>
                                <span style="background:#099"></span>
                                <span style="background:#909"></span>
                                <span style="background:#000"></span>
                                <span style="background:transparent"></span>
                            </span>
                        </p>
                    </div>
                </div>'

            @e.prepend editor
            
            editor.find('.colors span').clickHandler ->
                selected = $ @
                selected.parent().children().removeClass 'selected'
                selected.addClass 'selected'
                bg = selected.css('background-color')
                selected.parents('.cover').first().find('.image > .underlay').css('background-color', bg)

        else
            @e.html '
                <div class="cover-editor">
                    <p class="editor-option-row icon-text add-cover">
                        <i class="fa fa-picture-o"></i> <a href="#">Add a picture</a>
                    </p>
                </div>'
            @e.find('p a').clickHandler Fora.Utils.uploadImage =>
                @e.replaceWith "<img src=\"#{image}\" id=\"#{imageId}\" data-field-type=\"image\" data-field-name=\"#{fieldName}\" data-small-image=\"#{smallImage}\" class=\"image\" alt=\"\" />"
                @setup $("##{imageId}")

    update: (record) =>



window.ForaEditor.Cover = Cover
