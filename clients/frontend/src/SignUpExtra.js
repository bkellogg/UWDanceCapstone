import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { Button, Input } from 'react-materialize';
import * as Util from './util.js';


class SignUpExtra extends Component {
  constructor(props) {
    super(props);
    this.skip = this.skip.bind(this);
    this.signUp = this.signUp.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.resumeChange = this.resumeChange.bind(this);
    this.photoChange = this.photoChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      user: null,
      bio: null,
      resumeUpload: null,
      photoUpload: null,
      // User bio word count
      wordCount: null,
    }
  };

  signUp(event) {
    event.preventDefault()
    if (this.state.bio !== null && this.state.bio !== "") {
      Util.uploadBio(this.state.bio)
    }
    if (this.state.resumeUpload !== null) {
      Util.uploadResume(this.state.resumeUpload)
    }
    if (this.state.photoUpload !== null) {
      Util.uploadPhoto(this.state.photoUpload)
    }
    this.props.skip()
  }

  inputChange(val) {
    const name = val.target.name
    this.setState({
      [name]: val.target.value
    })
  }

  resumeChange(val) {
    this.setState({
      resumeUpload: val.target
    })
  }

  photoChange(val) {
    this.setState({
      photoUpload: val.target
    })
  }

  onKeyDown = event => {
    let len = event.target.value.split(/[\s]+/);
    this.setState({
      bio: event.target.value,
      wordCount: len.length,
    });
    if (len.length > 60) {
      if (event.keyCode == 46 || event.keyCode == 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {

      } else if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
      }
    }
  }

  //let user skip adding additional info
  skip() {
    this.props.skip();
  }

  render() {
    return (
      <section className="signUpExtra">
        <form>
          <p>Please upload the following information</p>
          <p>Bio (60 words or less)</p>
          <TextField name="bio" onKeyDown={this.onKeyDown}></TextField>
          {this.state.wordCount > 60 && (
            <div id="bioWarning">You have reached the max word limit</div>
          )}
          <p>Resume (PDF)</p>
          <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange} />
          <p>Headshot</p>
          <input id="photoUpload" name="photoUpload" type="file" onChange={this.photoChange} />
        </form>
        <Button onClick={this.signUp}> Finish Sign Up </Button>
        <Button onClick={this.skip}> Skip </Button>
      </section>
    )
  };
}

export default SignUpExtra;