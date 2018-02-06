import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import './styling/SignUp.css'

class SignUp extends Component {
    constructor(props) {
      super(props);
      console.log(this.state)
    };
  
    render() {
        return(
        <section className="signUp">
        <h1> Sign up </h1>  
        <button><Link to='/dashboard'>Submit</Link></button>
        </section>
        )
    };


  handleSignUp(){
    console.log("oop")
  }
}

export default SignUp;