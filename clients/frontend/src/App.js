import React, { Component } from 'react';
//import { Switch, Route } from 'react-router-dom'
import SignUp from './SignUp.js';
import SignIn from './SignIn.js';
import Main from './Main.js'
import './styling/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.registerUser = this.registerUser.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.goBack = this.goBack.bind(this);
    this.signOut = this.signOut.bind(this);
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
    this.setState({
      signUp: true
    })
  }

  goBack() {
    this.setState({
      signUp: false
    })
  }

  signOut(){
    this.setState({
      authorized: false,
      user: null
    })
  }

  componentWillMount(){
    if(localStorage.getItem("user")){
      this.setState({
        authorized: true
      })
    } 
  }

  componentDidUpdate(){
    if(this.state.authorized === false){
      if(this.state.user !== null){
        this.setState({
          authorized: true
        })
      }
    }
  }

  render() {
    return (  
      <section>
        {this.state.authorized === false && this.state.signUp === false &&
          <SignIn onSignIn={this.registerUser} onSignUp={this.handleSignUp}/>
        }
        {this.state.authorized === false && this.state.signUp === true &&
          <SignUp onSignUp={this.registerUser} goBack={this.goBack}/>
        }
        {this.state.authorized === true &&
          <Main auth={this.signOut}/>
        }
      </section>
  );
};

}
export default App;

