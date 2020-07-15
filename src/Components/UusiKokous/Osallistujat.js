import React from 'react'
import request from '../Shared/HttpRequests'

const Osallistujat = ({ setShowComponent, kokousid,puheenjohtaja, setPuheenjohtaja, osallistujat, setOsallistujat, jasenet, getOsallistujat, setGetOsallistujat }) => {

    if (getOsallistujat) {
        const getos = JSON.stringify({ call: 'getosallistujat', id: kokousid })
        request.osallistujat(getos).then(res => {
            setOsallistujat(res.data)
            setPuheenjohtaja(res.data.filter(z => z.role === 'puheenjohtaja'))
        })
        setGetOsallistujat(false)
    }
    const handlePoistaClick = (ev) => {
        setOsallistujat(osallistujat.filter(x => x.email !== ev.target.name))
    }
    const handleLisaaClick = (ev) => {
        const osallistuja = jasenet.filter(x => x.email === ev.target.name)
        setOsallistujat(osallistujat.concat(osallistuja))
    }

    if (osallistujat && jasenet && puheenjohtaja) {
        return (
            <div className="mt-5 mx-auto col-md-10">
                <h5 className="mb-4">Osallistujat</h5>
                <h6>Puheenjohtaja:{' '} {puheenjohtaja[0].firstname} {puheenjohtaja[0].lastname} ({puheenjohtaja[0].email})</h6>
                <div className="mt-1">
                    {osallistujat.length > 0
                        ? <>
                            <h5 className="mt-4">Kokousosallistujat</h5>
                            < table className="table table-hover">
                                <thead>
                                    <tr className="table-primary"><th>Etunimi</th><th>Sukunimi</th><th>Sähköpostiosoite</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {osallistujat.filter(osallistuja => osallistuja.email !== puheenjohtaja[0].email).map((item, key) =>
                                        <tr key={key + item.firstname}>
                                            <td>{item.firstname}</td>
                                            <td>{item.lastname}</td>
                                            <td>{item.email}</td>
                                            <td><button onClick={handlePoistaClick} className="btn btn-outline-primary btn-sm" name={item.email}>Poista osallistujalistalta</button></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table></>
                        :
                        <h6>Kokouksessa ei ole osallistujia</h6>
                    }
                    {jasenet.length > 0
                        ? <>
                            <h5 className="mt-4">Muut yhdistyksen jäsenet</h5>
                            < table className="table table-hover">
                                <thead>
                                    <tr className="table-primary"><th>Etunimi</th><th>Sukunimi</th><th>Sähköpostiosoite</th><th></th></tr>
                                </thead>
                                <tbody>
                                    {jasenet.filter(jasen => !osallistujat.find(({ email }) => jasen.email === email)).map((item, key) =>
                                        <tr key={key + item.firstname}>
                                            <td>{item.firstname}</td>
                                            <td>{item.lastname}</td>
                                            <td>{item.email}</td>
                                            <td><button onClick={handleLisaaClick}  className="btn btn-outline-primary btn-sm" name={item.email} >Siirrä kokousosallistujaksi</button></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table></>
                        :
                        <h6>Kaikki yhdistyksen jäsenet ovat osallistujalistalla</h6>
                    }
                </div>
                <div className="form-group text-right">
                    <button onClick={() => { setShowComponent('paatosvaltaisuus'); }} type="submit" className="btn btn-outline-primary mt-3">Seuraava</button>
                </div>
                <hr />
            </div >

        )
    } else return <p>loading..</p>
}
export default Osallistujat
 