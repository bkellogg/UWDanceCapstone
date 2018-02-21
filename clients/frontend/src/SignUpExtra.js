import React, { Component } from 'react';
import {Button} from 'react-materialize';
import img from './imgs/jump.jpg';
import * as Util from './util.js';
import './styling/SignUp.css';

class SignUpExtra extends Component {
    constructor(props) {
      super(props);
      this.skip = this.skip.bind(this);
      this.signUp = this.signUp.bind(this);
      this.inputChange = this.inputChange.bind(this);
      this.state = {
        user: null,
        bio: null
      }
      console.log(this.props.userID)
    };

    signUp(event){
      event.preventDefault()
      /* in here we're gonna need to add stuff to the user profile
      let payload = {
        firstname: this.state.firstname,
        lastname: this.state.lastname,
        email: this.state.email,
        password: this.state.password,
        passwordConf: this.state.passwordConf
      };
      
      Util.makeRequest("users/" + this.props.userId, payload, "POST", false)
          .then((res) => {
              if (res.ok) {
                  Util.saveAuth(res.headers.get(Util.headerAuthorization));
                  return res.json();
              }
              return res.text().then((t) => Promise.reject(t));
          })
          .then((data) => {
            // Util.setLocalUser(JSON.stringify(data));
              this.setState({
                auth: data
              });
          })
          .then((data) => {
              this.props.onSignUp(this.state.auth)
          })
          .catch((err) => {
            this.setState({
              error: true
            })
          }) */

    }

    inputChange(val){
      const name = val.target.name

      this.setState({
        [name] : val.target.value
      })
    }

    skip(){
      this.props.skip();
    }
  
    render() {
        return(
        <section className="signUpExtra">
          <form>
            <div className="row">
              <div className="input-field col s12">
                <input type="text" name="bio" id="bio" maxLength='250' onChange={this.inputChange}/>
                <label htmlFor="bio">Bio</label>
              </div>
              {/*
              <div class="file-field input-field">
                <div class="btn">
                    <span>Resume (PDF)</span>
                    <input type="file"/>
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text"/>
                </div>
              </div>
              <div class="file-field input-field">
                <div class="btn">
                    <span>Head Shot</span>
                    <input type="file"/>
                </div>
                <div class="file-path-wrapper">
                    <input class="file-path validate" type="text"/>
                </div>
              </div> */}
            </div>
          </form>
          <Button onClick={this.signUp}> Finish Sign Up </Button>
          <Button onClick={this.skip}> Skip </Button>
        </section>
        )
    };
}

export default SignUpExtra;