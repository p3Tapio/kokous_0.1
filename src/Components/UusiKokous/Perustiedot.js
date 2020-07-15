import React from 'react'
import request from '../Shared/HttpRequests'
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fi from 'date-fns/locale/fi';


const Perustiedot = ({ perustiedot, setPerustiedot, setShowComponent, yhdistys, kysy, setKysy }) => {
    console.log('perustiedot', perustiedot)
    registerLocale('fi', fi)
    let avoin
    const pvmYear = { year: 'numeric' };
    const now = Date();

    const startNewKokouskutsu = () => {
        const getnro = JSON.stringify({ call: 'kokousnro', yhdistys: yhdistys })
        request.kokous(getnro).then(res => {
            setPerustiedot({ id: '', otsikko: '', kokousnro: res.data.kokousnro + "/" + (new Date(now)).toLocaleDateString('fi-FI', pvmYear), startDate: '', endDate: '', avoinna: false })
        }).catch(err => console.log('kokousnro - error:', err.data))
    }
    const handlePerustiedotChange = (ev) => {
        if (ev.target.name === 'otsikko') setPerustiedot({ ...perustiedot, otsikko: ev.target.value })
        else if (ev.target.name === 'kokousnro') setPerustiedot({ ...perustiedot, kokousNro: ev.target.value })
        else if (ev.target.id === 'avaa') setPerustiedot({ ...perustiedot, avoinna: !perustiedot.avoinna })
    }
    if (kysy) {
        if (perustiedot) {
            if (perustiedot.id) {
                if (!window.confirm('Yhdistyksellä on tallentamaton kokous. Haluatko jatkaa kokoustietojen täyttämistä vai aloittaa uudelleen?')) startNewKokouskutsu()
            } else startNewKokouskutsu()
            setKysy(false)
        }
    }

    if (perustiedot && perustiedot.kokousnro) {
        avoin = perustiedot.avoinna ? "Avoinna" : "Kiinni"
        return (
            <div className="col-md-6  m-auto">
                <h5 className="mb-4">Kokouksen perustiedot</h5>
                <div >
                    <div className="form-group">
                        <label>Otsikko</label>
                        <input type="text" className="form-control" name="otsikko" onChange={handlePerustiedotChange} value={perustiedot.otsikko} />
                    </div>
                    <div className="form-group">
                        <label>Kokouksen numero</label>
                        <input type="text" className="form-control" name="kokousnro" onChange={handlePerustiedotChange} value={perustiedot.kokousnro || ''} />
                    </div>
                    <div className="form-group">
                        <label>Kokous alkaa</label><br />
                        <DatePicker
                            name='startdate'
                            locale="fi"
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            selected={perustiedot.startDate}
                            onChange={date => setPerustiedot({ ...perustiedot, startDate: date })}
                            selectsStart
                            startDate={perustiedot.startDate}
                            endDate={perustiedot.endDate}
                        />
                    </div>
                    <div className="form-group">
                        <label>Kokous päättyy</label><br />
                        <DatePicker
                            locale="fi"
                            dateFormat="dd/MM/yyyy"
                            className="form-control"
                            selected={perustiedot.endDate}
                            onChange={date => setPerustiedot({ ...perustiedot, endDate: date })}
                            selectsEnd
                            startDate={perustiedot.startDate}
                            endDate={perustiedot.endDate}
                            minDate={perustiedot.startDate}
                        />
                    </div>
                    <div className="form-group custom-control custom-switch">
                        <input type="checkbox" className="custom-control-input" onChange={handlePerustiedotChange} id="avaa" value={perustiedot.avoinna} checked={perustiedot.avoinna} />
                        <label className="custom-control-label" htmlFor="avaa">Avaa kokoustila heti osallistujille</label>
                    </div><p>Tila: {avoin}</p>
                    <div className="text-right">
                        <button onClick={() => { setShowComponent('esityslista') }} className="btn btn-outline-primary mt-3">Seuraava</button>
                    </div>
                </div>
                <hr />
            </div>
        )
    } else return <p>Loading....</p>

}
export default Perustiedot
