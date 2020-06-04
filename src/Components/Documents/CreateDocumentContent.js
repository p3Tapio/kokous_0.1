import React from 'react'
import { Editor } from "@tinymce/tinymce-react"

const CreateDocumentContent = ({ editorContentChange, content }) => {
    
    const tab = '&nbsp;&nbsp;&nbsp;&nbsp;'

    return (
        <div>

            <Editor apiKey={process.env.REACT_APP_TINYAPI_KEY}
                onEditorChange={editorContentChange}
                value={content}
                init={{
                    height: 500,
                    plugins: [
                        'advlist lists link image',
                        'charmap print preview anchor help',
                        'searchreplace visualblocks',
                        'insertdatetime table paste '
                    ],
                    toolbar: [
                        'undo redo | formatselect | bold italic |  alignleft aligncenter alignright |  bullist numlist outdent indent | help | insertdatetime'],
                    insertdatetime_dateformat: ["%HH:%M", "%d-%m-%Y"],

                    setup: function (ed) {
                        ed.on('keydown', function (evt) {
                            if (evt.keyCode === 9) {
                                ed.execCommand('mceInsertRawHTML', false, tab);
                                evt.preventDefault();
                                evt.stopPropagation();
                                return false;
                            }
                        })
                    }
                }}
            />




        </div>
    )
}
export default CreateDocumentContent
