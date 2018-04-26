import React, { Component } from 'react';

//components
import Landing from './Landing';
import SignUp from './SignUp.js';
import SignIn from './SignIn.js';
import Main from './Main.js'

//styling
import './styling/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      signUp: false,
      authorized: false,
      landing: true
    };
  };

  registerUser = (userVal) => {
    this.setState({
      user: userVal,
      landing: false,
    })
  };

  handleSignUp = () => {
    this.setState({
      signUp: true,
      landing: false,
    })
  }

  goBack = () => {
    this.setState({
      signUp: false
    })
  }

  signOut = () => {
    this.setState({
      authorized: false,
      user: null,
      landing: true,
    })
  }

  showSignIn = () => {
    this.setState({
      landing: false
    })
  }

  showSignUp = () => {
    this.setState({
      landing: false,
      signUp: true
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
          landing: false,
          authorized: true
        })
      }
    }
  }

  render() {
    return (  
      <section>
        {
          this.state.landing && !this.state.authorized && !this.state.signUp &&
          <Landing logIn={this.showSignIn} signUp={this.showSignUp} />
        }
        {
          !this.state.landing && !this.state.authorized && !this.state.signUp &&
          <SignIn onSignIn={this.registerUser} onSignUp={this.handleSignUp}/>
        }
        {
          !this.state.landing && !this.state.authorized && this.state.signUp &&
          <SignUp onSignUp={this.registerUser} goBack={this.goBack}/>
        }
        {
          this.state.authorized &&
          <Main auth={this.signOut}/>
        }
      </section>
  );
};

}
export default App;

