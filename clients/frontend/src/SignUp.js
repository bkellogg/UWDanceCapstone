import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {Button} from 'react-materialize';
import './styling/SignUp.css'

class SignUp extends Component {
    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.inputChange = this.inputChange.bind(this);
      this.goBack = this.goBack.bind(this);
      this.state ={
        firstname: null,
        lastname: null,
        email: null,
        password: null,
        passwordConf: null,
        auth: null,
      }
    };

    onClick(event){
      event.preventDefault()
      let baseUrl = 'https://dasc.capstone.ischool.uw.edu';
      let endpoint = '/api/v1/users'
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
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            email: this.state.email,
            password: this.state.password,
            passwordConf: this.state.passwordConf
          }
        )})
        //.then(res => { return res.json() }) if res.ok = true then do res.json
        .then(json => {
          this.setState({
            auth: json
          });
          console.log(json);
        })
        .then(this.props.onSignUp(this.state.auth))
        .catch(error => console.log(error));
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
  
    render() {
        return(
        <section className="signUp">
        <div className="Functionality">
        <div className="Logo"></div>
        <div className='content'>
        <h5 className='title'> Sign up </h5>
        <div className="error">
          {this.state.auth != null}
        </div>
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
        </div>
        </div>
        </section>
        )
    };
}

export default SignUp;