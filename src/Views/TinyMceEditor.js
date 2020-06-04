// chrome://flags/ --> Cookie deprecation messages disabled. (Näyttää muuten erroria, jonkun tinyMCE cookien takia)
/* TODO

--- tab pressed ... palauttaa osoittimen dokumentin  alkuun
--- loki tms ...    loki kuka teki eidtin ja milloin? 
---  res ja error handling tänne, jotta antaa käyttäjälle palautteen
*/

import React, { useState, useEffect } from 'react'
import { Editor } from "@tinymce/tinymce-react"
import request from '../tools/httprequests'
import axios from 'axios'

const TinyMceEditor = () => {


    const tab = '&nbsp;&nbsp;&nbsp;&nbsp;'
    const [content, setContent] = useState()
    const id = 22
    useEffect(() => {
        axios.get(`http://localhost/kokousapi/documents.php?call=getdoc&id=${id}`)
            .then(res => {
                console.log('res.data', res.data)
                setContent(res.data.content)
            })
    }, [])

    const saveDocument = () => {
      
        const doc = JSON.stringify({ id_y: 1, content: content, draft: true })
        request.postDocument(doc)

    }
    const editorContentChange = (content) => {
        setContent(content)
    }

    return (
        <div className="col-md-8 mx-auto mt-5">
            <form>

                <h3>Pöytäkirjaluonnos</h3>
                <h4 >Yhdistys x</h4>
                <h4 className="mb-4" >Kokousotsikko id#</h4>

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
                <button className="mt-2" onClick={saveDocument}>Tallenna luonnos</button>
            </form>
        </div>
    )
}
export default TinyMceEditor









    // const now = Date();
    // const pvmForm = { month: 'numeric', day: 'numeric', year: 'numeric' };
    // const yhd = 'Templateyhdistys'
      // `<h4>${yhd}${tab}${tab}${new Date(now).toLocaleDateString('fi-FI', pvmForm)}</h4>`