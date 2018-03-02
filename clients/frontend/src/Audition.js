import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardText, CardTitle} from 'material-ui/Card';
import Availability from './Availability';
import './styling/Audition.css';

const styles = {
  customWidth: {
    width: 150,
  },
};

class Audition extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.state ={
      value: 1,
      registered: false
    }
  };

  handleChange = (event, index, value) => this.setState({value});

  handleRegister (){
    //MAKE POST
    //.then set state isRegistered to true, which will cause the page to rerender
    this.setState({
      registered: true
    })
  }

  render() {
      return(
        <section className="main">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name}</h1>
            {
              this.state.registered === false &&
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
                    <TextField name="class"/><br />
                  </div>
                  <br/>
                  <div className="row">
                    <div><p>Availability [click & drag to indicate when you are <b>available</b> to rehearse]</p></div>
                    <Availability />
                  </div>
                  <br/>
                  <div className="row">
                    <div><p>Please indicate any additional notes below</p></div>
                    <TextField
                      name="comments"
                      multiLine={true}
                      rows={2}
                    />
                  </div>
                  <RaisedButton className='register' onClick={this.handleRegister} style={{backgroundColor: "#BFB2E5"}}> Register </RaisedButton>
                </div>
            }
            {
              this.state.registered === true &&
              <div className="registered">
                <Card>
                  <div className="success">
                    <CardText>
                    <h2 id="successReg"> You have successfully registered </h2>
                      </CardText>
                    </div>
                </Card>
              </div>
            }
          </div>
        </section>
      )
  }

}


export default Audition;