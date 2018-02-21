import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {Button, Card} from 'react-materialize';
import * as Util from './util.js';
import img from './imgs/tresmaines.jpg'
import './styling/SignIn.css';

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.state = {
      email: null,
      password: null,
      auth: null,
      error: false
    }
  };

  inputChange(val){
    const name = val.target.name

    this.setState({
      [name] : val.target.value
    })
  }

  signUp(){
    this.props.onSignUp()
  }

  signIn(event){
    event.preventDefault()
    let payload = {
      email: this.state.email, 
      password: this.state.password
    };
    
    Util.makeRequest("sessions", payload, "POST", false)
        .then((res) => {
            if (res.ok) {
                Util.saveAuth(res.headers.get(Util.headerAuthorization));
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            Util.setLocalUser(JSON.stringify(data));
            this.setState({
              auth: data
            });
        })
        .then((data) => {
            this.props.onSignIn(this.state.auth)
        })
        .catch((err) => {
          this.setState({
            error: true
          })
        })
  };

  render() {
    return (
      <div className="LogInLanding" style={{height:100 + '%'}}>
        <div className="LogInPhoto">
        {/*<img src={img}></img>*/}
        </div>
        <div className="Functionality">
        <div className="Logo"></div>
          <div className="content">
          <h5 className="title">Sign in</h5>
          <div className='error'>
            {this.state.error === true &&
              <p> Incorrect username or password </p>
            }
          </div>
          <div className="LogIn">
            <div className="Input">
            <form className="authenticate" id="sign-up">
                    <div className="row">
                        <div className="input-field col s12">
                            <input id="email" type="email" name="email" className="validate" onChange={this.inputChange}/>
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-field col s12">
                            <input id="password" type="password" name="password" className="validate" onChange={this.inputChange}/>
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