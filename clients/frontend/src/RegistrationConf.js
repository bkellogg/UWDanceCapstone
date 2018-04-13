import React, { Component } from 'react';
import * as Util from './util.js';

//styling
import { Card, CardText, CardTitle} from 'material-ui/Card';
import './styling/Audition.css';

const styles = {
  customWidth: {
    width: 150,
  },
};

class RegistrationConf extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
    }
    console.log(this.props.audition)
  };

  //TODO make this actual info about an audition
  render() {
      return(
              <div className="registered">
                <Card className="successCard">
                  <div className="success">
                    <CardTitle>You have successfully registered</CardTitle>
                  </div>
                    <CardText>
                      <p>Meany Hall Studio 265</p>
                      <p>Audition starts at 6:30</p>
                      <p>Doors open for warmup 30 minutes prior</p>
                    </CardText>
                </Card>
                <Card className="successCard" id="regCard">
                  <div className="regNum">
                    <CardTitle><h3>You are number</h3> </CardTitle>
                    </div>
                    <CardText id="numArea">
                      <p id="number">1</p>
                    </CardText>
                </Card>
              </div>

      )
  }

}


export default RegistrationConf;