import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import SignUp from './SignUp.js';
import SignIn from './SignIn.js';
import Navigation from './Navigation.js'
import './styling/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentTab: 'landing',
    };
    console.log(this.state);
  };

  render() {
    return (
      <section className="routing">
        <Switch>
          <Route exact path='/' component={SignIn}/>
          <Route path='/signup' component={SignUp}/>
          <Route path='/dashboard' component={Navigation}/>
        </Switch>
      </section>
  );
};

}
export default App;

