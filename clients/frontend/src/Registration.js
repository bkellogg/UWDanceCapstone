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


const styles = {
  customWidth: {
    width: 150,
  },
};

class Registration extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.state ={
      value: 1,
      registered: false,
      clicked: false
    }
  };

  handleChange = (event, index, value) => this.setState({value});

  setAvailability = (availability) => this.setState({availability: availability});

  addComment = (e) => this.setState({comments: e.target.value})

  handleRegister (){
    let body = {
      "comment" : this.state.comments,
      "availability" : {
        "days": this.state.availability
      }
    }

    Util.makeRequest("users/me/auditions/" + this.props.audition, body, "LINK", true)
    .then(res => {
      if (res.ok) {
        return res.text();
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(res => {
      this.props.registered()
    })
    .catch(err => console.log(err))
  }

  render() {
    const disabled = !this.state.clicked

      return(
                <div className="auditionForm">
                  <div className="row">
                    <div><p>Number of pieces I am available for: </p></div>
                    <SelectField
                      value={this.state.value}
                      onChange={this.handleChange}
                      style={styles.customWidth}
                    >
                      <MenuItem value={1} primaryText="1" />
                      <MenuItem value={2} primaryText="2" />
                    </SelectField>
                  </div>
                  <br />
                  <div className="row">
                    <div>You must be enrolled in a class during the quarter the production is occurring.<br/>
                   </div>
                   <br />
                    <Checkbox
                      label="I confirm I am enrolled in a class for the quarter during which the show is occuring."
                      onClick={() => {this.setState({clicked: !this.state.clicked})}}
                    />
                  </div>
                  <br/>
                  <div className="row">
                    <div><p>Availability [click & drag to indicate when you are <b>available</b> to rehearse]</p></div>
                    <Availability availability = {this.setAvailability}/>
                  </div>
                  <br/>
                  <div className="row">
                    <div><p>Please indicate any additional notes below</p></div>
                    <TextField
                      name="comments"
                      onChange = {this.addComment}
                      multiLine={true}
                      rows={2}
                    />
                  </div>
                  <RaisedButton className='register' onClick={this.handleRegister} disabled={disabled} style={{backgroundColor: "#BFB2E5"}}> Register </RaisedButton>
                </div>
           
      )

}
}


export default Registration;