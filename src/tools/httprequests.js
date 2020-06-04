import axios from 'axios'

const url = 'http://localhost/kokousapi/documents.php?'
// localhost/test.php?call=...

const getAllDocs = () => axios.get(`${url}call=getalldocs`).then(res => res.data)
const postDocument = newDocument => axios.post(`${url}call=postdoc`, newDocument).then(res => {
    alert("Success!")
    console.log('res.data', res.data)
}).catch(err => {
    console.log('err.data', err.data)
})

// localhost/test.php?call=getdoc&id=3
const getDocument = id => {}



export default { postDocument, getDocument, getAllDocs }