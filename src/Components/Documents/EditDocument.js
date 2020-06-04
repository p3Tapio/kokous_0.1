import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import { Editor } from "@tinymce/tinymce-react"
import { Link } from 'react-router-dom'

export const EditDocument = () => {
    const tab = '&nbsp;&nbsp;&nbsp;&nbsp;'
    const [content, setContent] = useState()
    const [name, setName] = useState()
    const { id } = useParams();

    console.log('id', id)

    if (id) {
        axios.get(`http://localhost/kokousapi/documents.php?call=getdoc&id=${id}`).then(res => {
            setName(res.data[0].name)
            setContent(res.data[0].content)
        })
    }
  
    const editorContentChange = () => {

    }
    if (content && name) {
        return (
            <div className="col-md-8 mx-auto mt-5">
                <div>
                    <h1>{name}</h1>
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
                <Link to={'/'}>Takaisin</Link>
            </div>
        )
    } else return <p>loading...</p>
}
