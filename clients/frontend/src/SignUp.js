import React, { Component } from 'react';
import { Button } from 'react-materialize';
import * as Util from './util.js';
import SignUpExtra from './SignUpExtra.js'
import './styling/SignIn.css';
import './styling/SignUp.css';

class SignUp extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.goBack = this.goBack.bind(this);
    this.skip = this.skip.bind(this);
    this.state = {
      firstname: null,
      lastname: null,
      email: null,
      password: null,
      passwordConf: null,
      auth: null,
      signUpExtra: false
    }
  };

  onClick(event) {
    event.preventDefault()
    let payload = {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      email: this.state.email,
      password: this.state.password,
      passwordConf: this.state.passwordConf
    };

    Util.makeRequest("users", payload, "POST", false)
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
          auth: data,
          signUpExtra: true
        });
      })
      .catch((err) => {
        let error = err
        if (error.indexOf("new user first name must exist") >= 0) {
          this.setState({
            error: "A first name must be supplied"
          })
        } else if (error.indexOf("new user last name must exist") >= 0) {
          this.setState({
            error: "A last name must be supplied"
          })
        } else if (error.indexOf("new users must supply a valid email address") >= 0) {
          this.setState({
            error: "A valid email must be supplied"
          })
        } else if (error.indexOf("new users must have a password") >= 0) {
          this.setState({
            error: "A password of 8 or more characters must be supplied"
          })
        } else if (error.indexOf("passwords do not match") >= 0) {
          this.setState({
            error: "Passwords must match"
          })
        } else if (error.indexOf("user already exists with that email") >= 0) {
          this.setState({
            error: "A user already exists with that email."
          })
        } else {
          this.setState({
            error: "An error occurred"
          })
        }
        Util.handleError(err)
      })
  }

  inputChange(val) {
    const name = val.target.name

    this.setState({
      [name]: val.target.value
    })

    if (val.key === "Enter") {
      this.onClick(val)
    }
  }

  goBack() {
    this.props.goBack();
  }

  skip() {
    this.props.onSignUp(this.state.auth)
  }

  render() {
    return (

      <section className="signUp">
        <div className="LogInLanding">
          <div className="Functionality">
            <div className="Logo"></div>
            <div className='content'>
              <h5 className='title'> Sign up </h5>
              <div className="error">
                {
                  this.state.error !== null &&
                  <p>{this.state.error}</p>
                }
              </div>
              {
                this.state.signUpExtra === false &&
                <div className="SignUp">
                  <div className="Input">
                    <form className="authenticate">
                      <div className="row">
                        <div className="input-field col s12">
                          <input type="text" name="firstname" id="firstname" onChange={this.inputChange} />
                          <label htmlFor="firstname">First Name</label>
                        </div>
                        <div className="input-field col s12">
                          <input type="text" name="lastname" id="lastname" onChange={this.inputChange} />
                          <label htmlFor="lastname">Last Name</label>
                        </div>
                        <div className="input-field col s12">
                          <input type="email" name="email" id="email" className="validate" onChange={this.inputChange} />
                          <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-field col s12">
                          <input type="password" name="password" id="password" onChange={this.inputChange} />
                          <label htmlFor="password">Password</label>
                        </div>
                        <div className="input-field col s12">
                          <input type="password" name="passwordConf" id="passwordConf" onChange={this.inputChange} onKeyPress={this.inputChange} />
                          <label htmlF or="passwordConf">Confirm Password</label>
                        </div>
                      </div>
                    </form>
                    <div className="Buttons">
                      <Button onClick={this.onClick}> Sign Up </Button>
                    </div>
                    <div className="Link">
                      <a className="signlink" onClick={this.goBack}> Sign In </a>
                    </div>


                  </div>
                </div>
              }

              {
                this.state.signUpExtra === true && this.state.auth != null &&
                <SignUpExtra skip={this.skip} userID={this.state.auth.id} />
              }
            </div>
          </div>
        </div>
      </section>

    )
  };
}

export default SignUp;