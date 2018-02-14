import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import SignUp from './SignUp.js';
import SignIn from './SignIn.js';
import Main from './Main.js'
import './styling/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.registerUser = this.registerUser.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.state = {
      user: null,
      signUp: false,
      authorized: false
    };
  };

  registerUser(userVal) {
    this.setState({
      user: userVal
    })
  };

  handleSignUp() {
    this.setState({signUp: true})
  }

  componentDidUpdate(){
    if(this.state.authorized == false){
      if(this.state.user != null){
        if(this.state.user.status === 200) {
          this.setState({
            authorized: true
          })
        }
      }
    }
  }

  render() {
    let page = null;

    //if(this.state.user != null){
      //<Main />
    //}

          {/*
      <section className="routing">
        <Switch>
          <Route exact path='/' component={SignIn}/>
          <Route path='/signup' component={SignUp}/>
          <Route path='/dashboard' component={Main}/>
        </Switch>
      </section>
          */}

    return (  
      <section>
        {/*{this.state.authorized == false && this.signUp == false ? (
          page = <SignIn onSignIn={this.handleSignIn} onSignUp={this.handleSignUp}/>
        ) : (
          page = <Main />
        )}*/}

        {this.state.authorized === false && this.state.signUp === false &&
          <SignIn onSignIn={this.registerUser} onSignUp={this.handleSignUp}/>
        }
        {this.state.authorized === false && this.state.signUp === true &&
          <SignUp onSignUp={this.registerUser}/>
        }
        {this.state.authorized === true &&
          <Main />
        }
      </section>
  );
};

}
export default App;

