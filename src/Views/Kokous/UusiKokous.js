import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import request from '../../Components/Shared/HttpRequests'
import HelpPop from '../../Components/Shared/HelpPop'
import Perustiedot from '../../Components/UusiKokous/Perustiedot'
import Osallistujat from '../../Components/UusiKokous/Osallistujat'
import Paatosvaltaisuus from '../../Components/UusiKokous/Paatosvaltaisuus'
import Yhteenveto from '../../Components/UusiKokous/Yhteenveto'
import { getSessionRole, getUser } from '../../Components/Auth/Sessions'
import Esityslista from '../../Components/UusiKokous/Esityslista';

const UusiKokous = () => {

    let user = getUser()
    const { yhdistys } = useParams()
    const [members, setMembers] = useState()

    const [showComponent, setShowComponent] = useState('perustiedot')
    let history = useHistory()

    const [perustiedot, setPerustiedot] = useState({ otsikko: '', kokousNro: null, kokousid: '', startDate: '', endDate: '', avoinna: false })
    const [esityslista, setEsityslista] = useState()
    const [osallistujat, setOsallistujat] = useState()
    const [puheenjohtaja, setPuheenjohtaja] = useState()
    const [varalla, setVaralla] = useState([])
    const [paatosvaltaisuus, setPaatosvaltaisuus] = useState({ esityslista: '', aktiivisuus: '', kesto: '', muu: '' })
    const [id_y, setId_y] = useState();


    useEffect(() => {
        const pvmYear = { year: 'numeric' };
        const now = Date();
        const getDraft = JSON.stringify({ call: 'getkokousdraft', name: yhdistys })

        if (!perustiedot.kokousNro) {

            request.kokous(getDraft).then(res => {

                if (res.data.message !== 'Ei kesken olevia kokouskutsuja') {
                    if (window.confirm('Yhdistyksellä on tallentamaton kokous. Haluatko jatkaa kokoustietojen täyttämistä vai aloittaa uudelleen?')) {
                 
                        const avoin = res.data.avoinna === "0" ? false : true
                        const alkaa = res.data.startDate === "1970-01-01" ? '': new Date(res.data.startDate)    // null sotkee bäkin puolella koska isset
                        const loppuu = res.data.endDate === "1970-01-01" ? '': new Date(res.data.endDate)

                        console.log('res.data.startDate', res.data.startDate)
                        setPerustiedot({
                            otsikko: res.data.otsikko,
                            kokousNro: res.data.kokousnro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear),
                            kokousid: res.data.id,
                            startDate: alkaa,
                            endDate: loppuu,
                            avoinna: avoin
                        })

                        const esitys = res.data.pv_esityslista === "0" ? '' : res.data.pv_esityslista
                        const aktiv = res.data.pv_aktiivisuus === "0" ? '' : res.data.pv_aktiivisuus
                        const kesto = res.data.pv_kesto === "0" ? '' : res.data.pv_kesto
                      
                        setPaatosvaltaisuus({ esityslista: esitys, aktiivisuus: aktiv, kesto: kesto, muu: res.data.pv_muu })
                        setId_y(res.data.id_y)

                        const body2 = JSON.stringify({ call: 'getosallistujat', id: res.data.id })
                        request.osallistujat(body2).then(res => {
                            console.log('res.data', res.data)
                            setOsallistujat(res.data)
                            setPuheenjohtaja(res.data.filter(x => x.role === 'puheenjohtaja'))
                        }).catch(err => console.log('err.response.data', err.response.data))

                        const req = JSON.stringify({ call: 'getallmembers', yhdistys: yhdistys })
                        request.assoc(req).then(res => {
                            setMembers(res.data)
                        }).catch(err => console.log('err.response', err.response))

                    } else {
                        const delReq = JSON.stringify({ call: "deletedraft", kokousid: res.data.id })
                        request.kokous(delReq)
                            .then(res => {
                                console.log('res.data', res.data)
                                getKokousNro()
                                return;
                            }).catch(err => console.log('err.response.data', err.response.data))
                    }
                } else {
                    getKokousNro()
                }
            }).catch(err => console.log('err.response.data', err.response.data))
        }
        if (members && osallistujat && puheenjohtaja) {
            setVaralla(members.filter(vara => !osallistujat.find(({ email }) => vara.email === email)))
            setOsallistujat(osallistujat.filter(x => x.role !== 'puheenjohtaja'))

        } else if (!members && varalla.length === 0 && !puheenjohtaja) {
            const req = JSON.stringify({ call: 'getallmembers', yhdistys: yhdistys })
            request.assoc(req).then(res => {
                setMembers(res.data)
                setOsallistujat(res.data.filter(x => x.email !== getUser().email))
                setPuheenjohtaja(res.data.filter(x => x.email === getUser().email))
            }).catch(err => console.log('err.response', err.response))
        }                                    
    }, [members, perustiedot, yhdistys])  // missing dependencies, mutta seurauksena looppi ... refaktoroi 

    const helpText = "Aloita kokous antamalla sille otsikko sekä alku- ja loppupäivämäärät. Kun olet valmis, paina seuraava-näppäintä, niin voit luoda esityslistan ja päättää voiko yhdistyksen jäsenet liittää omia esityksiään esityslistalle. Seuraavaksi voit määritellä kokouksen osallistujat ja päätösvaltaisuuden. Lopuksi näet kutsu kokous -välilehdeltä luomasi kokouksen tiedot, missä voit tallentaa ja lähettää kutsun kokoukseen osallistujille."

    const getKokousNro = () => {
        const pvmYear = { year: 'numeric' };
        const now = Date();
        const body = JSON.stringify({ call: 'kokousnro', yhdistys: yhdistys })
        request.kokous(body).then(res => {
            setPerustiedot({ ...perustiedot, kokousNro: res.data.kokousnro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear) })
            setId_y(res.data.id_y)
        })

    }
    const handleMenuClick = (ev) => {
        setShowComponent(ev.target.name)
        saveKokousDraft()
    }
    const saveKokousDraft = () => {

        const uusiKokous = JSON.stringify({
            call: 'luokokous',
            id_y: id_y,
            kokousid: perustiedot.kokousid,
            otsikko: perustiedot.otsikko,
            kokousnro: perustiedot.kokousNro.substring(0, perustiedot.kokousNro.length - 5),
            startDate: perustiedot.startDate,
            endDate: perustiedot.endDate,
            avoinna: perustiedot.avoinna,
            paatosvaltaisuus: paatosvaltaisuus,
            valmis: false
        })
        console.log('uusiKokous', uusiKokous)
        request.kokous(uusiKokous).then(res => {
            console.log('res.data ---- uusiKok', res.data)
            setPerustiedot({ ...perustiedot, kokousid: res.data.kokousid })
            saveOsallistujat()
        }).catch(err => {
            alert(err.response.data.message)
        })

    }
    const saveOsallistujat = () => {

        let kokousosallistujat
        kokousosallistujat = osallistujat.map(x => ({ rooli: 'osallistuja', ...x }))
        user = Object.assign({ rooli: 'puheenjohtaja' }, user)
        const call = { call: 'postosallistujat', id_y: id_y, kokousnro: perustiedot.kokousNro.substring(0, perustiedot.kokousNro.length - 5) }
        kokousosallistujat = [user].concat(kokousosallistujat)
        kokousosallistujat = [call].concat(kokousosallistujat)
        const body = JSON.stringify(kokousosallistujat)

        request.osallistujat(body).then(res => {
            console.log('res.data', res.data)
        }).catch(err => console.log('Error res.data ', err.response.data))

    }
    const handlePerustiedotChange = (ev) => {
        if (ev.target.name === 'otsikko') setPerustiedot({ ...perustiedot, otsikko: ev.target.value })
        else if (ev.target.name === 'kokousnro') setPerustiedot({ ...perustiedot, kokousNro: ev.target.value })
        else if (ev.target.id === 'avaa') setPerustiedot({ ...perustiedot, avoinna: !perustiedot.avoinna })
    }
    const handlePaatosvaltaChange = (ev) => {
        if (ev.target.name === 'esityslista') setPaatosvaltaisuus({ ...paatosvaltaisuus, esityslista: ev.target.value })
        else if (ev.target.name === 'aktiivisuus') setPaatosvaltaisuus({ ...paatosvaltaisuus, aktiivisuus: ev.target.value })
        else if (ev.target.name === 'kesto') setPaatosvaltaisuus({ ...paatosvaltaisuus, kesto: ev.target.value })
        else if (ev.target.name === 'muu') setPaatosvaltaisuus({ ...paatosvaltaisuus, muu: ev.target.value })
    }

    let component
    if (showComponent === 'perustiedot') component = <Perustiedot setShowComponent={setShowComponent} handlePerustiedotChange={handlePerustiedotChange} saveKokousDraft={saveKokousDraft} perustiedot={perustiedot} setPerustiedot={setPerustiedot} />
    else if (showComponent === 'esityslista') component = <Esityslista setShowComponent={setShowComponent} setEsityslista={setEsityslista} esityslista={esityslista} />
    else if (showComponent === 'osallistujat') component = <Osallistujat puheenjohtaja={puheenjohtaja} osallistujat={osallistujat} setOsallistujat={setOsallistujat} saveOsallistujat={saveOsallistujat} varalla={varalla} setVaralla={setVaralla} setShowComponent={setShowComponent} />
    else if (showComponent === 'paatosvaltaisuus') component = <Paatosvaltaisuus setShowComponent={setShowComponent} handlePaatosvaltaChange={handlePaatosvaltaChange} paatosvaltaisuus={paatosvaltaisuus} saveKokousDraft={saveKokousDraft} />
    else if (showComponent === 'yhteenveto') component = <Yhteenveto perustiedot={perustiedot} osallistujat={osallistujat} paatosvaltaisuus={paatosvaltaisuus} yhdistys={yhdistys} id_y={id_y} />
    else component = <></>


    if (getSessionRole() && getSessionRole().role === 'admin' && getSessionRole().yhdistys === yhdistys) {
        return (
            <div className="col-md-10 mx-auto mt-5">
                <h2>{yhdistys}</h2>
                <h4>Luo uusi kokous</h4>
                <Link to={`/assoc/${yhdistys}`} >Yhdistyksen pääsivu</Link>
                <hr />
                <div>
                    <div className="d-flex justify-content-center">
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
        history.push('/userpage')
        return <></>
    }
}
export default UusiKokous