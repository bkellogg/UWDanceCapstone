import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import './styling/SignUp.css'

class SignUp extends Component {
    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.inputChange = this.inputChange.bind(this);
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
        //.then(res => { return res.json() })
        .then(json => {
          this.setState({
            auth: json
          });
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
  
    render() {
        return(
        <section className="signUp">
        <h1> Sign up </h1>
          <form>
            <label>
              First Name
              <input type="text" name="firstname" onChange={this.inputChange}/>
            </label>
            <label>
              Last Name
              <input type="text" name="lastname" onChange={this.inputChange}/>
            </label>
            <label>
              Email
              <input type="email" name="email" onChange={this.inputChange}/>
            </label>
            <label>
              Password
              <input type="password" name="password" onChange={this.inputChange}/>
            </label>
            <label>
              Confirm Password
              <input type="password" name="passwordConf" onChange={this.inputChange}/>
            </label>
          </form>
          <button onClick={this.onClick}> Sign Up </button>
        </section>
        )
    };
}

export default SignUp;