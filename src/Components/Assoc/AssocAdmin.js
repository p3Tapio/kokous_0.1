import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Kokouslistat from './Kokouslistat'
import Jasenlista from './Jasenlista'
import HelpPop from '../Shared/HelpPop'


const AssocAdmin = ({ kokoukset, members, yhdistys }) => {

    const [showComponent, setShowComponent] = useState('tulevat')
    const helpText = <p >Valikon kautta voit valita haluamasi näkymän. Voit luoda uuden kokouksen painamalla uusi kokous -näppäintä. Näet myös tulevat ja käynnissä olevat kokoukset sekä menneiden kokouksien asiat valikon näppäimien kautta. Palveluun rekisteröityneet jäsenet saat näkyville yhdistyksen jäsenet -näppäintä painamalla. </p>
    const handleMenuClick = (ev) => {
        setShowComponent(ev.target.name)
    }

    let component
    if (showComponent === 'tulevat' || showComponent === 'menneet') component = <Kokouslistat kokoukset={kokoukset} showComponent={showComponent} />
    else if (showComponent === 'jasenet') component = <Jasenlista members={members} />
    else component = <></>

    return (
        <div>
            <div>
                <div className="d-flex justify-content-center">
                    <Link className="btn btn-outline-primary btn-sm mx-1" to={{pathname: `/uusikokous/${yhdistys}`, members:'test'}}>Uusi kokous</Link>
                    <button className="btn btn-outline-primary btn-sm mx-1" name="tulevat" onClick={handleMenuClick}>Tulevat ja käynnissä olevat kokoukset</button>
                    <button className="btn btn-outline-primary btn-sm mx-1" name="menneet" onClick={handleMenuClick}>Päättyneet kokoukset</button>
                    <button className="btn btn-outline-primary btn-sm mx-1" name="jasenet" onClick={handleMenuClick}>Yhdistyksen jäsenet</button>
                    <HelpPop heading="Yhdistyksen etusivu" text={helpText} btnText="Selitystä" placement="left" variant="btn btn-outline-danger btn-sm mx-1" />
                </div>
                <hr />
            </div>
            {component}
        </div>
    )
}
export default AssocAdmin