import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// import request from '../tools/httprequests'
import axios from 'axios'
// TODO: TK:hon --> otsikko! Tai kuvaus tms ! 
// create new document-nappi ja näkymä 
const DocumentList = () => {
  const [documents, setDocuments] = useState()

  useEffect(() => {

    console.log('useEffect')
    axios.get('http://localhost/kokousapi/documents.php?call=getalldocs')
      .then(res => {
        console.log('res.data', res.data)
        setDocuments(res.data)
      })
  }, [])

  if (documents) {
    return (
      <div className="col-md-8 mx-auto mt-5">
        <p>Alla näkyy dokumentit.</p>
        <Link to="/uusipoytakirja" >Klikkaa jos haluat luoda uuden</Link>
        <hr />
        {documents.map((item, key) =>
          <p key={item.id} >{item.name} <button id={item.id}><Link to ={`/muokkaapk/${item.id}`}>More info</Link></button> </p>)}
      </div>
    )
  } else return <p>loading....</p>
}

export default DocumentList