import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import {Button, Input, Row} from 'react-materialize';
//import * as Util from './util.js';
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
            <p>Please upload the following information</p>
            <p>Bio (60 words or less)</p>
            <TextField name="bio"></TextField>
            <p>Resume (PDF)</p>
            <Input id="resumeUpload" name="resumeUpload" type="file"/>
            <p>Headshot</p>
            <Input id="headshotUpload" name="headshotUpload" type="file"/>
          </form>
          <Button onClick={this.signUp}> Finish Sign Up </Button>
          <Button onClick={this.skip}> Skip </Button>
        </section>
        )
    };
}

export default SignUpExtra;