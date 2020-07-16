import React, { useState, useEffect } from 'react'
import { getSessionRole } from '../../Components/Auth/Sessions'
import { useParams, useHistory, Link } from 'react-router-dom'
import { getUser } from '../../Components/Auth/Sessions';
import request from '../../Components/Shared/HttpRequests'
import HelpPop from '../../Components/Shared/HelpPop'
import Perustiedot from '../../Components/UusiKokous/Perustiedot'
import Osallistujat from '../../Components/UusiKokous/Osallistujat'

const UusiKokous = () => {

    const role = getSessionRole()
    const { yhdistys } = useParams()
    let history = useHistory()
    const helpText = "Aloita kokous antamalla sille otsikko sekä alku- ja loppupäivämäärät. Kun olet valmis, paina seuraava-näppäintä, niin voit luoda esityslistan ja päättää voiko yhdistyksen jäsenet liittää omia esityksiään esityslistalle. Seuraavaksi voit määritellä kokouksen osallistujat ja päätösvaltaisuuden. Lopuksi näet kutsu kokous -välilehdeltä luomasi kokouksen tiedot, missä voit tallentaa ja lähettää kutsun kokoukseen osallistujille."



    const [kysy, setKysy] = useState()
    const [showComponent, setShowComponent] = useState('perustiedot')

    const [perustiedot, setPerustiedot] = useState()

    const [getOsallistujat, setGetOsallistujat] = useState()
    const [puheenjohtaja, setPuheenjohtaja] = useState()
    const [osallistujat, setOsallistujat] = useState()
    const [jasenet, setJasenet] = useState()

    useEffect(() => {
        let user = getUser()
        user = Object.assign({ role: 'puheenjohtaja' }, user)
        const pvmYear = { year: 'numeric' };
        const now = Date();
        const getdraft = JSON.stringify({ call: 'getkokousdraft', name: yhdistys })

        request.kokous(getdraft).then(res => {
            if (res.data.id) {
                console.log('res.data', res.data)
                const kok_nro = res.data.kokousnro
                const avoin = res.data.avoinna === "0" ? false : true
                const alkaa = res.data.startDate === "1970-01-01" ? '' : new Date(res.data.startDate)
                const loppuu = res.data.endDate === "1970-01-01" ? '' : new Date(res.data.endDate)

                if (window.confirm('mmmm')) {

                    const getos = JSON.stringify({ call: 'getosallistujat', id: res.data.id })
                    request.osallistujat(getos).then(res => {
                        console.log('res.data', res.data)
                        setOsallistujat(res.data)
                        let pj = res.data.filter(x => x.role === 'puheenjohtaja')
                        pj = pj.length !== 0 ? res.data.filter(x => x.role === 'puheenjohtaja') : [user]    // TODO toimiiko jos kirjautujana on toinen admin? 
                        setPuheenjohtaja(pj)
                    })

                    setPerustiedot({
                        id: res.data.id,
                        id_y: res.data.id_y,
                        otsikko: res.data.otsikko,
                        kokousnro: res.data.kokousnro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear),
                        startDate: alkaa,
                        endDate: loppuu,
                        avoinna: avoin
                    })

                } else {
                    const body = JSON.stringify({ call: 'kokousnro', yhdistys: yhdistys })
                    request.kokous(body).then(res => {
                        setPerustiedot({ id: '', id_y: res.data.id_y, otsikko: '', kokousnro: kok_nro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear), startDate: '', endDate: '', avoinna: false })
                    })
                    setPuheenjohtaja([user])
                    setOsallistujat([])
                }
            } else {
                const body = JSON.stringify({ call: 'kokousnro', yhdistys: yhdistys })
                request.kokous(body).then(res => {
                    setPerustiedot({ id: '', id_y: res.data.id_y, otsikko: '', kokousnro: res.data.kokousnro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear), startDate: '', endDate: '', avoinna: false })
                })
                setPuheenjohtaja([user])
                setOsallistujat([])
            }

        }).catch(err => console.log('err.data', err.data))

        const req = JSON.stringify({ call: 'getallmembers', yhdistys: yhdistys })
        request.assoc(req).then(res => {
            setJasenet(res.data)
        }).catch(err => console.log('err.response', err.response))
        console.log('UUSIKOKOUS USEEFFECT FIRED')
    }, [yhdistys])

    const handleMenuClick = (ev) => {
        setShowComponent(ev.target.name)
        if (osallistujat) saveOsallistujat()
    }
    const saveOsallistujat = () => {
        let kokousosallistujat
        kokousosallistujat = osallistujat.filter(x => x.role !== 'puheenjohtaja').map(x => ({ ...x, role: 'osallistuja' }))
        kokousosallistujat = kokousosallistujat.filter((o => !puheenjohtaja.find(({ email }) => o.email === email)))
        const call = { call: 'postosallistujat', id_y: perustiedot.id_y, kokousnro: perustiedot.kokousnro.substring(0, perustiedot.kokousnro.length - 5) }
        kokousosallistujat = [puheenjohtaja[0]].concat(kokousosallistujat)
        kokousosallistujat = [call].concat(kokousosallistujat)

        const body = JSON.stringify(kokousosallistujat)
        console.log('body', body)
        request.osallistujat(body).then(res => {
            console.log('res.data', res.data)
        }).catch(err => console.log('Error res.data ', err.response.data))
    }

    let component
    if (showComponent === 'perustiedot') component = <Perustiedot setShowComponent={setShowComponent} perustiedot={perustiedot} setPerustiedot={setPerustiedot} yhdistys={yhdistys} kysy={kysy} setKysy={setKysy} />
    // else if (showComponent === 'esityslista') component = <Esityslista setShowComponent={setShowComponent} setEsityslista={setEsityslista} esityslista={esityslista} />
    else if (showComponent === 'osallistujat') component = <Osallistujat saveOsallistujat={saveOsallistujat} setShowComponent={setShowComponent} perustiedot={perustiedot} puheenjohtaja={puheenjohtaja} setPuheenjohtaja={setPuheenjohtaja} osallistujat={osallistujat} setOsallistujat={setOsallistujat} jasenet={jasenet} setJasenet={setJasenet} getOsallistujat={getOsallistujat} setGetOsallistujat={setGetOsallistujat} />
    // else if (showComponent === 'paatosvaltaisuus') component = <Paatosvaltaisuus setShowComponent={setShowComponent} handlePaatosvaltaChange={handlePaatosvaltaChange} paatosvaltaisuus={paatosvaltaisuus} saveKokousDraft={saveKokousDraft} />
    // else if (showComponent === 'yhteenveto') component = <Yhteenveto perustiedot={perustiedot} osallistujat={osallistujat} paatosvaltaisuus={paatosvaltaisuus} yhdistys={yhdistys} id_y={id_y} />
    else component = <></>

    if (role && role.role === 'admin' && role.yhdistys === yhdistys) {
        return (
            <div className="col-md-10 mx-auto mt-5">
                <h2>{yhdistys}</h2>
                <h4>Luo uusi kokous</h4>
                <Link to={`/assoc/${yhdistys}`} >Yhdistyksen pääsivu</Link>
                <hr />
                <div>
                    <div className="d-sm-flex justify-content-center">
                        <button className="btn btn-outline-primary btn-sm mx-1" name="perustiedot" onClick={handleMenuClick}>Perustiedot</button>
                        <button className="btn btn-outline-primary btn-sm mx-1" name="esityslista" onClick={handleMenuClick}>Esityslista</button>
                        <button className="btn btn-outline-primary btn-sm mx-1" name="osallistujat" onClick={handleMenuClick}>Osallistujat</button>
                        <button className="btn btn-outline-primary btn-sm mx-1" name="paatosvaltaisuus" onClick={handleMenuClick}>Päätösvaltaisuus</button>
                        <button className="btn btn-outline-primary btn-sm mx-1" name="yhteenveto" onClick={handleMenuClick}>Kutsu kokous</button>
                        <HelpPop heading="Kokouksen luominen" text={helpText} btnText="Selitystä" placement="left" variant="btn btn-outline-danger btn-sm mx-1" />
                    </div>
                    <hr />
                </div>
                <div className="mt-5">
                    {component}
                </div>
            </div>

        )
    } else {
        history.push(`/assoc/${yhdistys}`)
        return <></>
    }
}

export default UusiKokous
