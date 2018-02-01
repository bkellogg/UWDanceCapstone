import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import img from './imgs/tresmaines.jpg'

class App extends Component {
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
              <button></button>
              <button></button>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }
}

export default App;

