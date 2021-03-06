import React, { useState, useEffect } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import { getSessionRole, getUser } from '../../Components/Auth/Sessions'
import request from '../../Components/Shared/HttpRequests'
import KokousDocs from '../../Components/Kokous/KokousDocs'
import KokousOsallistujat from '../../Components/Kokous/KokousOsallistujat'
import Kokousaika from '../../Components/Kokous/Kokousaika'
import KokousPaatosvalta from '../../Components/Kokous/KokousPaatosvalta';

const KokousDetails = () => {

    let history = useHistory()
    const user = getUser()
    const pvmForm = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const pvmYear = { year: 'numeric' };
    const { yhdistys } = useParams()
    const { kokousId } = useParams()
    const [kokousRooli, setKokousRooli] = useState()
    const [kokous, setKokous] = useState()
    const [puheenjohtaja, setPuheenjohtaja] = useState()
    const [osallistujat, setOsallistujat] = useState()
    const [jasenet, setJasenet] = useState()

    const [showComponent, setShowComponent] = useState([])
    const [showTable, setShowTable] = useState(true)

    useEffect(() => {
        
        if (getSessionRole()) {
            const body = JSON.stringify({ call: 'getkokous', id: kokousId })
            request.kokous(body).then(res => {
                setKokous(res.data)
            }).catch(err => console.log('err.response.data', err.response.data))

            const body2 = JSON.stringify({ call: 'getosallistujat', id: kokousId })
            request.osallistujat(body2).then(res => {
                setOsallistujat(res.data.filter(x => x.role === 'osallistuja'))
                setPuheenjohtaja(res.data.filter(x => x.role === 'puheenjohtaja'))
                console.log('res.data', res.data)
                const osal = res.data.filter(x => x.email === user.email)
                if (osal[0]) {
                    setKokousRooli(osal[0].role)
                } else history.push(`/assoc/${yhdistys}`)
            }).catch(err => console.log('err.response.data', err.response.data))

            const req = JSON.stringify({ call: 'getallmembers', yhdistys: yhdistys })
            request.assoc(req).then(res => {
                setJasenet(res.data)
            }).catch(err => console.log('err.response', err.response))
        }

    }, [kokousId, yhdistys, user.email, history])

    const handleMenuClick = (ev) => {
        setShowComponent(ev.target.name)
        if (ev.target.name === 'asiakirjat') setShowTable(true)
    }
    const handleOsallistujatClick = (ev) => {

        const henkilo = jasenet.find(x => x.email === ev.target.name)
        let body
        let runRequest = false

        if (ev.target.id === 'varalle') {
            if (window.confirm(`Haluatko perua osallistujan ${henkilo.firstname} ${henkilo.lastname} osallistumisoikeuden kokoukseen?`)) {
                setOsallistujat(osallistujat.filter(x => x.email !== ev.target.name))
                body = JSON.stringify({ call: 'poistaosallistuja', kokousid: kokousId, email: ev.target.name })
                runRequest = true
            }
        } else if (ev.target.id === 'osallistujaksi') {
            if (window.confirm(`Haluatko muuttaa henkilön ${henkilo.firstname} ${henkilo.lastname} kokousosallistujaksi?`)) {
                setOsallistujat(osallistujat.concat(henkilo))
                body = JSON.stringify({ call: 'lisaaosallistuja', kokousid: kokousId, yhdistys: yhdistys, email: ev.target.name })
                runRequest = true
            }
        } else if (ev.target.id === 'poistu') {     // Kokousosallistuja: Voi ilmoittaa esteellisyydestä yksittäiseen kokoukseen ja nimetä varakokousedustajan kokousosallistujaksi tilalleen  ????
            if (window.confirm('Oletko varma, että haluat perua osallistumisesi ja poistua kokouksesta?')) {
                setOsallistujat(osallistujat.filter(x => x.email !== user.email))
                body = JSON.stringify({ call: 'poistaosallistuja', kokousid: kokousId, email: user.email })
                runRequest = true
                window.location.reload();
            }
        }
        if (runRequest) {
            console.log('body', body)
            request.osallistujat(body).then(res => {
                alert(res.data.message)
            }).catch(err => {
                alert(err.response.data.message)
                console.log('err.response', err.response)
            })
        }
    }
    const handleVaihdaKokousaika = (date) => {

        if (typeof date === 'object' && Date.parse(date) !== Date.parse(kokous.endDate)) {
            const pvmForm = { month: 'numeric', day: 'numeric', year: 'numeric' };
            const uusiPvm = date.toISOString().split('T')[0]
            if (window.confirm(`Haluatko vaihtaa kokouksen uudeksi päättymispäiväksi ${(new Date(uusiPvm)).toLocaleDateString('fi-FI', pvmForm)}?`)) {
                setKokous({ ...kokous, endDate: uusiPvm })
                const body = JSON.stringify({ call: 'vaihdapvm', kokousid: kokousId, enddate: date })
                request.kokous(body).then(res => {
                    alert(res.data.message)
                }).catch(err => alert(err.response.data.message))
            }
        } else {
            alert("Määritä uusi päättymispäivä ennen tallentamista")
        }
    }
    
    if (getSessionRole() && getSessionRole().yhdistys === yhdistys) {

        if (kokous && kokousRooli) {

            if (kokous.avoinna === "1" || kokousRooli==="puheenjohtaja") { 

                let component
                if (showComponent === 'asiakirjat') component = <KokousDocs kokous={kokous} yhdistys={yhdistys} setShowComponent={setShowComponent} setShowTable={setShowTable} showTable={showTable} />
                else if (showComponent === 'osallistujat') component = <KokousOsallistujat osallistujat={osallistujat} jasenet={jasenet} puheenjohtaja={puheenjohtaja} kokousRooli={kokousRooli} handleOsallistujatClick={handleOsallistujatClick} />
                else if (showComponent === 'kokousaika') component = <Kokousaika kokous={kokous} handleVaihdaKokousaika={handleVaihdaKokousaika} />
                else if (showComponent === 'paatosvaltaisuus') component = <KokousPaatosvalta kokous={kokous} />
                else component = <p>TO DO !!! </p>

                let text
                if (Date.parse(kokous.endDate) < new Date()) text = "Kokous on päättynyt"
                else if (Date.parse(kokous.endDate) > new Date() && Date.parse(kokous.startDate) < new Date()) text = "Kokous on käynnissä"
                else text = "Kokous ei ole vielä alkanut"

                return (
                    <div className="col-md-10 mx-auto mt-5">
                        <h2>{yhdistys}</h2>
                        <Link to={`/assoc/${yhdistys}`}>Yhdistyksen pääsivu</Link>
                        <hr />
                        <div className="mb-3">
                            <h4>{kokous.otsikko} </h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', lineHeight: '8px', whiteSpace: 'nowrap' }}>
                            <p>Kokouksen numero:</p>
                            <p> {kokous.kokousnro}/{(new Date(kokous.startDate)).toLocaleDateString('fi-FI', pvmYear)}</p>
                            <p>Kokouksen alku:</p>
                            <p>{(new Date(kokous.startDate)).toLocaleDateString('fi-FI', pvmForm)}</p>
                            <p>Kokouksen päätös:</p>
                            <p>{(new Date(kokous.endDate)).toLocaleDateString('fi-FI', pvmForm)}</p>
                            <small>({text})</small>
                        </div>
                        <hr />
                        <div className="d-sm-flex justify-content-center">
                            <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="asiat" >Asiakohdat</button>
                            <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="asiakirjat">Asiakirjat</button>
                            <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="osallistujat">Osallistujat</button>
                            {kokousRooli === 'puheenjohtaja'
                                ? <>     <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="kokousaika">Kokousaika</button></>
                                : <></>
                            }
                            <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="paatosvaltaisuus">Päätösvaltaisuus</button>
                            <button className="btn btn-outline-primary btn-sm mx-1" onClick={handleMenuClick} name="?" >Muuta juttua</button>
                        </div>
                        <hr />
                        {component}
                    </div>
                )
            } else {
                history.push(`/assoc/${yhdistys}`)
                return <></>
            }
        } else {
            return <p>Loading...</p>
        }
    } else {
        history.push(`/assoc/${yhdistys}`)
        return <></>
    }
}

export default KokousDetails

