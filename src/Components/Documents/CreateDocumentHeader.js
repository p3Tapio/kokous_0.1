import React from 'react'

// TODO: ns "metadetaljit" tänne, kuten osallistujat, kesto yms 

const CreateDocumentHeader = ({handleInputChange}) => {
    return (

        <form>
            <div className="form-group mt-4">
                <label>Dokumentin nimi</label>
                <input onChange={handleInputChange} type="text" className="form-control" id='name' />
            </div>
        </form>
    )
}
export default CreateDocumentHeader