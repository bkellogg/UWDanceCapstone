import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
import { Button } from 'react-materialize';
import * as Util from './util.js';
import logo from './imgs/logoex.png'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import TextField from 'material-ui/TextField';
import './styling/SignIn.css';
import './styling/Landing.css';


class SignIn extends Component {
  constructor(props) {
    super(props);
    this.signIn = this.signIn.bind(this);
    this.signUp = this.signUp.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.state = {
      forgotemail: "",
      email: null,
      password: null,
      auth: null,
      error: false,
      open: false
    }
  };

  inputChange(val) {
    const name = val.target.name

    this.setState({
      [name]: val.target.value
    })

    if (val.key === "Enter") {
      this.signIn(val)
    }
  }

  signUp() {
    this.props.onSignUp()
  }

  signIn(event) {
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
        console.error(err);
        Util.handleError(err);
      })
  };

  forgotPassword = () => {
    if (this.state.forgotemail !== "") {
      Util.makeRequest("passwordreset?email=" + this.state.forgotemail, "", "GET", false)
        .then(res => {
          if (res.ok) {
            return res.text();
          }
          return res.text().then((t) => Promise.reject(t));
        })
        .then(
          this.setState({
            forgotemail: ""
          }),
          this.handleClose()
        )
        .catch(err => {
          Util.handleError(err)
        })
    }
  }

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  getEmail = (event) => {
    this.setState({ forgotemail: event.target.value })
  }

  toLanding = () => {
    this.props.toLanding()
  }

  render() {
    const actions = [
      <TextField
        className="emailField"
        style={{marginLeft: '10px', marginRight: '10px',  paddingLeft: '10px', width: '300px'}}
        hintText="Account Email"
        onChange={this.getEmail}
      />,
      <FlatButton
        className="submitButton"
        style={{color: 'white', marginLeft: '15px'}}
        label="Submit"
        primary={true}
        onClick={this.forgotPassword}
      />,
    ];

    return (
      <div className="landingBackground">
        <i className="fas fa-arrow-circle-left fa-2x" onClick={this.toLanding}></i>
        <div className="functionality">
          <div className="signInUplogoWrap">
            <img className="officialLogoLandingPage" alt="logo" src={logo} />
          </div>
          <div className="signIn-SignUpContent">
            <h1 className="title">Sign in</h1>
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
                      <input id="email" type="email" name="email" className="validate" onChange={this.inputChange} />
                      <label htmlFor="email">Email</label>
                    </div>
                    <div className="input-field col s12">
                      <input id="password" type="password" name="password" className="validate" onChange={this.inputChange} onKeyPress={this.inputChange} />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>
                </form>
                <div className="buttons">
                  <Button onClick={this.signIn}>Sign In</Button>
                </div>
                <div className="link">
                <div>
                <a className="blueTextLink" onClick={this.signUp}> Sign Up </a>
                </div>
                  <a className="blueTextLink" onClick={this.handleOpen}> Forgot password? </a>
                  <div>
                    <Dialog
                      title="Password Reset"
                      actions={actions}
                      modal={false}
                      open={this.state.open}
                      onRequestClose={this.handleClose}
                    >
                      Enter the email address associated with your account. You will receive an email with instructions on how to reset your password.
                </Dialog>
                  </div>
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