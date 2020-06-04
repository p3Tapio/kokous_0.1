import React from 'react';
import './App.css';
import DocumentList from './Views/DocumentList';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import NewDocument from './Views/NewDocument';
import { EditDocument } from './Components/Documents/EditDocument';


function App() {
  return (
    <div className="container">
      <Router>
        <Switch>
          <Route exact path='/' component={DocumentList} />
          <Route path="/uusipoytakirja" component={NewDocument} />
          <Route path="/muokkaapk/:id" component={EditDocument}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
