import React, { Component } from 'react';
import * as Util from './util.js';

//components
import Availability from './Availability';

//styling
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import './styling/General.css';
import './styling/Audition.css';


const styles = {
  customWidthText: {
    width: 500,
  },
  customWidth: {
    width: 80,
  }
};

class Registration extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.state = {
      value: 1,
      registered: false,
      clicked: false
    }
  };

  handleChange = (event, index, value) => this.setState({ value });

  setAvailability = (availability) => this.setState({ availability: availability });

  addComment = (e) => this.setState({ comments: e.target.value })

  handleRegister() {
    let body = {
      "comment": this.state.comments,
      "availability": {
        "days": this.state.availability
      }
    }

    Util.makeRequest("users/me/auditions/" + this.props.audition + "?shows=" + this.state.value, body, "LINK", true)
      .then(res => {
        if (res.ok) {
          return res.text();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(res => {
        this.props.registered()
      })
      .catch(err => {
        Util.handleError(err)
      })
  }

  render() {
    const disabled = !this.state.clicked

    return (
      <div className="auditionForm">
        <div className="fullWidthCard">
          <div className="formWrap">
            <div className="row">
              <div className="">
                <p>1. Number of pieces I am available for: </p>
                <SelectField
                  value={this.state.value}
                  onChange={this.handleChange}
                  style={styles.customWidth}
                >
                  <MenuItem value={1} primaryText="1" />
                  <MenuItem value={2} primaryText="2" />
                </SelectField>
              </div>
            </div>
            <br />
            <div className="row">
              <div>2. You must be enrolled in a technique class during the quarter the production is occurring.<br />
              </div>
              <br />
              <Checkbox
                iconStyle={{ fill: '#22A7E0' }}
                label="I confirm I am enrolled in a class for the quarter during which the show is occuring."
                onClick={() => { this.setState({ clicked: !this.state.clicked }) }}
              />
            </div>
            <br />
            <div className="row">
              <div><p>3. Availability <b className="importantAvailabilityFormMessage">[click & drag to indicate when you are available to rehearse]</b></p></div>
              <Availability availability={this.setAvailability} />
            </div>
            <br />
            <div className="row">
              <div><p>4. Please indicate any additional notes below</p></div>
              <TextField
                name="comments"
                onChange={this.addComment}
                multiLine={true}
                style={styles.customWidthText}
                rows={2}
              />
            </div>

          </div>
        </div>
        <RaisedButton
          onClick={this.handleRegister}
          disabled={disabled}
          backgroundColor="#22A7E0"
          style={{ color: '#ffffff' }}
        >
          REGISTER </RaisedButton>
      </div>

    )

  }
}


export default Registration;