import React, { Component } from 'react';
import { Button } from 'react-materialize';
import img from './imgs/jump.jpg';
import * as Util from './util.js';
import SignUpExtra from './SignUpExtra.js'
import './styling/SignUp.css';

class SignUp extends Component {
    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.inputChange = this.inputChange.bind(this);
      this.goBack = this.goBack.bind(this);
      this.skip = this.skip.bind(this);
      this.state ={
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        passwordConf: null,
        auth: null,
        signUpExtra: false
      }
    };

    onClick(event){
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
          .then((data) => {
              //this.props.onSignUp(this.state.auth)
          })
          .catch((err) => {
            this.setState({
              error: true
            })
          })
    }

    inputChange(val){
      const name = val.target.name

      this.setState({
        [name] : val.target.value
      })
    }

    goBack(){
      this.props.goBack();
    }

    skip(){
      this.props.onSignUp(this.state.auth)
    }
  
    render() {
        return(
        <section className="signUp">
        <div className="LogInPhoto">
        <img src={img}></img>
        </div>
        <div className="Functionality">
        <div className="Logo"></div>
        <div className='content'>
        <h5 className='title'> Sign up </h5>
        <div className="error">
          {this.state.auth != null}
        </div>
        {this.state.signUpExtra === false &&
          <div>
          <form>
            <div className="row">
              <div className="input-field col s12">
                <input type="text" name="firstname" id="firstname" onChange={this.inputChange}/>
                <label htmlFor="firstname">First Name</label>
              </div>
              <div className="input-field col s12">
                <input type="text" name="lastname" id="lastname" onChange={this.inputChange}/>
                <label htmlFor="lastname">Last Name</label>
              </div>
              <div className="input-field col s12">
                <input type="email" name="email" id="email" onChange={this.inputChange}/>
                <label htmlFor="email">Email</label>
              </div>
              <div className="input-field col s12">
                <input type="password" name="password" id="password" onChange={this.inputChange}/>
                <label htmlFor="password">Password</label>
              </div>
              <div className="input-field col s12">
                <input type="password" name="passwordConf" id="passwordConf" onChange={this.inputChange}/>
                <label htmlFor="passwordConf">Confirm Password</label>
              </div>
            </div>
          </form>
          <Button onClick={this.goBack}> Back </Button>
          <Button onClick={this.onClick}> Sign Up </Button> 
          </div> }
        {this.state.signUpExtra === true && this.state.auth != null &&
          <SignUpExtra skip={this.skip} userID={this.state.auth.id} />
        }

        </div>
        </div>
        </section>
        )
    };
}

export default SignUp;