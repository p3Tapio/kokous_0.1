import React from 'react'
import request from '../Shared/HttpRequests'

const Osallistujat = ({ setShowComponent, kokousid, puheenjohtaja, setPuheenjohtaja, osallistujat, setOsallistujat, jasenet, setJasenet, getOsallistujat, setGetOsallistujat }) => {
    // if getOsallistujat === true niin hae kokousosallistujat, jos ei niin filtteröi  
    if(getOsallistujat) {
        
        const getos = JSON.stringify({ call: 'getosallistujat', id: kokousid})
        console.log('getos', getos)

        request.osallistujat(getos).then(res => {
            console.log('res.data', res.data)
            // setPuheenjohtaja(res.data.filter(x => x.role === 'puheenjohtaja'))
            setOsallistujat(res.data)
        }).catch(err => console.log('err.response.data', err.response.data))
     
        setGetOsallistujat(false)
    }   
    else {
        
    }
   
    return (
        <div>
            <p>Osallistujat</p>
        </div>
    )
}

export default Osallistujat
