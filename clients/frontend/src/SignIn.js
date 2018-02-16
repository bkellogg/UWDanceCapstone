import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {Button, Card} from 'react-materialize';
//import img from './imgs/tresmaines.jpg'
import './styling/SignIn.css';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.emailChange = this.emailChange.bind(this);
    this.passwordChange = this.passwordChange.bind(this);
    this.goBack = this.goBack.bind(this);
    this.state = {
      email: null,
      password: null,
      auth: null,
      error: null
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

  goBack(){
    this.props.goBack()
  }

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
      .catch(error => {
        this.setState({
          error: 1
        })
      });
  };

  render() {
    return (
      <div className="LogInLanding" style={{height:100 + '%'}}>
        <div className="LogInPhoto">
        {/* <img src={img}></img> */}
        </div>
        <div className="Functionality">
        <div className="Logo"></div>
          <div className="content">
          <h5 className="title">Sign in</h5>
          <div className='error'>
            {this.state.auth != null && this.state.auth.status != 200 &&
              <alert> Incorrect username or password </alert>
            }
          </div>
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
              <Button onClick={this.signIn}>Sign In</Button>
              <Button onClick ={this.signUp}>Sign Up</Button>
            </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };


}

export default SignIn;