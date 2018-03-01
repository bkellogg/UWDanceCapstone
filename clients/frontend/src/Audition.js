import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import './styling/Audition.css'

const styles = {
  customWidth: {
    width: 150,
  },
};

class Audition extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
    this.state ={
      value: 1
    }
  };

  handleChange = (event, index, value) => this.setState({value});

  render() {
      return(
        <section className="main">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name}</h1>
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
                Confirm what class you are enrolled in:</div>
                <TextField/><br />
              </div>
              <br/>
              <div className="row">
                <div><p>Availability [click & drag to indicate when you are <b>available</b> to rehearse]</p></div>
                <p>This is where the availability picker will go!</p>
              </div>
              <br/>
              <div className="row">
                <div><p>Please indicate any additional notes below</p></div>
                <TextField
                  multiLine={true}
                  rows={2}
                />
              </div>
            </div>
          </div>
        </section>
      )
  }

}


export default Audition;