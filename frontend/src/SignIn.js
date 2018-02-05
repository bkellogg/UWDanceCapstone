import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import './styling/SignIn.css';

class SignIn extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
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
                            <input id="email" type="email" className="validate" />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="input-field col s12">
                            <input id="password" type="password" className="validate" />
                            <label htmlFor="password">Password</label>
                        </div>
                    </div>

            </form>
            <div className="Buttons">
              <button onClick={this.handleSignIn}><Link to='/dashboard'>Sign In</Link></button>
              <button onClick={this.handleSignUp}><Link to='/signup'>Sign Up</Link></button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  };

  handleSignIn(event){
    console.log("sign in!")

  };

}

export default SignIn;