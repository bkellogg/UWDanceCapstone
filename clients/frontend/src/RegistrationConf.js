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
      <div className="cardsWrap">
      <div className="card1">
      <div className="card101wrap">
        <div className="card101">
          <div className="numberDiv">
            <p id="number">1</p>
          </div>
          <div className="informationalDiv">

            <div className="successWrap">
              <div className="successfulRegistrationMessage">
                <p id="successMessage">You have successfully registered for the show! Your assigned number is on the left.</p>
                <p>Location: {this.props.audition.location}</p>
                {/*TODO format date time how you like*/}

                <p>Audition starts at <Moment format="YYYY/MM/DD HH:mm">{this.props.audition.time}</Moment></p>
              </div>
            </div>

          </div>
</div>
          </div>
      </div>
      <div className="card102">
        <div className="editRegistration">
          <div className="unregister">
            <Button className="unregisterButton">Unregister</Button>
          </div>
          <div className="changeAvailability">
            <Button className="changeAvailabilityButton">Change Availability</Button>
          </div>
        </div>
        </div>
      </div>
    )
  }

}


export default RegistrationConf;