import React, { Component } from 'react';

//styling
import { Card, CardText, CardTitle } from 'material-ui/Card';
import Moment from 'react-moment';
import './styling/General.css';
import './styling/RegistrationConf.css';
import Button from 'react-materialize/lib/Button';

class RegistrationConf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registered: false,
    }
  };

  render() {
    return (
      <div className="card101">
        <Card className="successCard">
          <div className="success">
            <CardTitle id="successTitle"> <i class="material-icons">check</i> Success</CardTitle>
          </div>
          <CardText>
            <div className="successWrap">
              <div className="successfulRegistrationMessage">
                <p id="successMessage">You have successfully registered for the show!</p>
                <p>{this.props.audition.location}</p>
                {/*TODO format date time how you like*/}

                <p>Audition starts at <Moment format="YYYY/MM/DD HH:mm">{this.props.audition.time}</Moment></p>
              </div>

              <div className="editRegistration">
                <div className="unregister">
                  <Button onClick={this.signIn} className="unregisterButton">Unregister</Button>
                </div>
                <div className="changeAvailability">
                  <Button onClick={this.signIn} className="changeAvailabilityButton">Change Availability</Button>
                </div>
              </div>
            </div>
          </CardText>
        </Card>
        <Card className="successCard" id="regCard">
          <div className="regNum">
            <CardTitle><h3 id="numberMessage">You are number</h3> </CardTitle>
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