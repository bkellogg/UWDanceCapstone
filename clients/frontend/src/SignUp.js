import React, { Component } from 'react';
import { Button } from 'react-materialize';
import * as Util from './util.js';
import logo from './imgs/logoex.png'
import './styling/SignIn.css';
import './styling/SignUp.css';
import './styling/Landing.css';

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
      auth: null
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
          // signUpExtra: true
        });
        this.skip()
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

  toLanding = () => {
    this.props.toLanding()
  }

  render() {
    return (
      <section className="landingBackground">
        <div>
        <i className="fas fa-arrow-circle-left fa-2x" onClick={this.toLanding}></i>
          <div className="functionality">
            <div className="signInUplogoWrap">
              <img className="officialLogoLandingPage" alt="logo" src={logo} />
            </div>
            <div className='signIn-SignUpContent'>
              <h1 className='title'> Sign up </h1>
              <div className="error">
                {
                  this.state.error !== null && !this.state.signUpExtra &&
                  <p>{this.state.error}</p>
                }
              </div>
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
                          <label htmlFor="passwordConf">Confirm Password</label>
                        </div>
                      </div>
                    </form>

                    <div className="termsOfService"> <p>By using this product you are agreeing to University of Washington's <a href="http://www.washington.edu/online/terms/" target="_blank" rel="noopener noreferrer">terms of service</a>.</p></div>

                    <div className="buttons">
                      <Button onClick={this.onClick}> Sign Up </Button>
                    </div>
                    <div className="link">
                      <a className="blueTextLink" onClick={this.goBack}> Sign In </a>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>

    )
  };
}

export default SignUp;