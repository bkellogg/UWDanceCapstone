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
    paddingLeft: '10px'
  },
  customWidth: {
    width: 80,
    backgroundColor: 'white',
    border: '1px solid lightgray',
    borderRadius: '5px',
    paddingLeft: '5px'
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
                <div>1. Number of pieces I am available for: 
                  <div className="xtraInfo tooltip pieceTip">
                    <i className="fas fa-question-circle"></i>
                    <span className="tooltiptext">
                      This is the maximum <b className="emphasis">number</b> of 
                      <b className="emphasis"> pieces</b> that you can do during the show run. Each piece rehearses for 
                      <b className="emphasis"> ~4 hours </b> a week.
                    </span>
                  </div>
                </div>
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
              <div>2. You must be enrolled in a <b>technique</b> class during the quarter the production is occurring.
                <div className="xtraInfo tooltip pieceTip">
                  <i className="fas fa-question-circle"></i>
                  <span className="tooltiptext">
                    This is <b className="emphasis">required</b> if you want to participate. 
                  </span>
                </div>
              </div>
              <br />
              <Checkbox
                labelStyle={{fontSize: "14px", fontWeight: '500', color: 'hsl(0, 0%, 29%)'}}
                label="I confirm I am enrolled in a technique class for the quarter during which the show is occuring."
                onClick={() => { this.setState({ clicked: !this.state.clicked }) }}
              />
            </div>
            <br />
            <div className="row">
              <div>
                3. Availability <b>[click & drag to indicate when you are <b className="importantAvailabilityFormMessage">AVAILABLE </b>to rehearse]</b>
                <div className="xtraInfo tooltip pieceTip">
                  <i className="fas fa-question-circle"></i>
                  <span className="tooltiptext">
                    Indicate your availability for the quarter that rehearsals will <b className="emphasis">starting</b>.
                  </span>
                </div>
              </div>
              <Availability availability={this.setAvailability} />
            </div>
            <br />
            <div className="row">
              <div>
                4. Please indicate any additional availability notes below
                <div className="xtraInfo tooltip pieceTip">
                  <i className="fas fa-question-circle"></i>
                  <span className="tooltiptext">
                    This could be known <b className="emphasis">dates</b> or general times you know you won't be available to rehearse.
                  </span>
                </div>
              </div>
              <TextField
                className="textField"
                name="comments"
                onChange={this.addComment}
                multiLine={true}
                style={styles.customWidthText}
                hintText="EX: I am not available on Saturday, April 29th"
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