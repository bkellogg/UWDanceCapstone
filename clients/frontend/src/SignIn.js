import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import './styling/SignIn.css';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.state = {
      email: null,
      password: null,
      auth: null
    }
  };

  emailChange(event){
    this.setState({
      email: event.target.value
    })
  }

  passwordChange(event){
    this.setState({
      password: event.target.value
    })
  }

  signUp(){
    this.props.onSignUp()
  };

  signIn(event){
    event.preventDefault()
    let baseUrl = 'https://dasc.capstone.ischool.uw.edu';
    let endpoint = '/api/v1/sessions'
    let url = baseUrl + endpoint;
    let email =
    fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          email: this.state.email,
          password: this.state.password
        }
      )})
      //.then(res => { return res.json() })
      .then(json => {
        this.setState({
          auth: json
        });
      })
      .then(this.props.onSignIn(this.state.auth))
      .catch(error => console.log(error));
  };

  render() {
    return (
      <div className="LogInLanding" style={{height:100 + '%'}}>
        <div className="LogInPhoto">
         {/* <img src={img}></img>*/}
        </div>
        <div className="Functionality">
          <div className="Logo"></div>
          <h1>Sign in</h1>
          <div className="LogIn">
            <div className="Input">
            <form className="authenticate" id="sign-up">
                    <div className="row">
                        <div className="input-field col s12">
                            <input id="email" type="email" className="validate" onChange={this.emailChange}/>
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-field col s12">
                            <input id="password" type="password" className="validate" onChange={this.passwordChange}/>
                            <label htmlFor="password">Password</label>
                        </div>
                    </div>
            </form>
            <div className="Buttons">
              <button onClick={this.signIn}>Sign In</button>
              <button onClick ={this.signUp}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };


}

export default SignIn;