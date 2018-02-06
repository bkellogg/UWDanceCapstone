import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import SignUp from './SignUp.js';
import SignIn from './SignIn.js';
import Main from './Main.js'
import './styling/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentTab: 'signIn',
    };
    console.log(this.state);
  };

  handleSignIn(userVal) {
    this.setState({user: userVal})
  };

  render() {
    if(this.state.user === null){
        let signIn = <SignIn onSignIn={this.handleSignIn}/>
    }
    
    if(this.state.user != null){
      <Main />
    }

    return (
      <section className="routing">
        <Switch>
          <Route exact path='/' component={SignIn}/>
          <Route path='/signup' component={SignUp}/>
          <Route path='/dashboard' component={Main}/>
        </Switch>
      </section>
  );
};

}
export default App;

