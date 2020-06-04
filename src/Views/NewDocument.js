/*
TODO: 
 ---- getKirjautujan tietoja, yhdistys, ajanjakso, Ehdotukset kokouksesta (--> CreateDocumentHeader)
 ---- redirect listalle
*/
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateDocumentHeader from '../Components/Documents/CreateDocumentHeader'
import CreateDocumentContent from '../Components/Documents/CreateDocumentContent'
import request from '../tools/httprequests'


const NewDocument = () => {
    
    const tab = '&nbsp;&nbsp;&nbsp;&nbsp;'
    const now = Date();
    const pvmForm = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const yhd = 'Templateyhdistys'
        
    const [name, setName] = useState('')
    const [content, setContent] = useState(`<h4>${yhd}${tab}${tab}${new Date(now).toLocaleDateString('fi-FI', pvmForm)}</h4>`)

    const editorContentChange = (content) => {
        setContent(content)
        console.log('content', content)
    }
    const handleInputChange = ev => {
        if (ev.target.id === 'name') setName(ev.target.value)
    }
    const saveDraft = () => {
        const doc = JSON.stringify({ id_y: 1, name: name, content: content, draft: true })
        request.postDocument(doc)
    }

    return (
        <div className="col-md-8 mx-auto mt-5">
            <Link to='/'>Bäksii</Link>
            <hr />
            <h4 className="m-2">Luo uusi dokumentti</h4>
            <div>
                <CreateDocumentHeader handleInputChange={handleInputChange} />
                <CreateDocumentContent editorContentChange={editorContentChange} content={content} />
                <button onClick={saveDraft} className="btn btn-outline-primary mt-3">Tallenna</button>
            </div>
        </div>
    )
}
export default NewDocument
