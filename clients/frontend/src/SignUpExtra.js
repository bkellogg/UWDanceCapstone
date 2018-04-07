"use strict";

import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import {Button, Input, Row} from 'react-materialize';
import * as Util from './util.js';
import './styling/SignUp.css';

class SignUpExtra extends Component {
    constructor(props) {
      super(props);
      this.skip = this.skip.bind(this);
      this.signUp = this.signUp.bind(this);
      this.inputChange = this.inputChange.bind(this);
      this.resumeChange = this.resumeChange.bind(this);
      this.photoChange = this.photoChange.bind(this);
      this.state = {
        user: null,
        bio: null,
        resumeUpload: null,
        photoUpload: null
      }
    };

    signUp(event){
      event.preventDefault()
      if(this.state.bio != null && this.state.bio != ""){
        console.log(this.state.bio);
        Util.uploadBio(this.state.bio)
      }
      if(this.state.resumeUpload != null){
        let resume = Util.uploadResume(this.state.resumeUpload)
        console.log(resume)
      }
      if(this.state.photoUpload != null){
        let photo = Util.uploadPhoto(this.state.photoUpload)
        console.log(photo)
      }
      this.props.skip()
    }

    inputChange(val){
      const name = val.target.name
      this.setState({
        [name] : val.target.value
      })
    }

    resumeChange(val){
      console.log(val.target.files)
      this.setState({
        resumeUpload: val.target
      })
    }

    photoChange(val){
      console.log(val.target.files)
      this.setState({
        photoUpload: val.target
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
              <TextField name="bio" onChange={this.inputChange}></TextField>
            <p>Resume (PDF)</p>
              <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange}/>
            <p>Headshot</p>
              <input id="photoUpload" name="photoUpload" type="file" onChange={this.photoChange}/>
          </form>
          <Button onClick={this.signUp}> Finish Sign Up </Button>
          <Button onClick={this.skip}> Skip </Button>
        </section>
        )
    };
}

export default SignUpExtra;