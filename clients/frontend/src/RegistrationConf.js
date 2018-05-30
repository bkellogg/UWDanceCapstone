import React, { Component } from 'react';

//styling
import moment from 'moment';
import './styling/General.css';
import './styling/RegistrationConf.css';
import './styling/RegistrationConfMobile.css';
import Availability from './Availability';
import * as Util from './util.js';
import Button from 'react-materialize/lib/Button';

class RegistrationConf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registered: false,
      auditionID: this.props.audition.id,
      open: false
    }
  };

  unLink = () => {
    Util.makeRequest("users/me/auditions/" + this.state.auditionID, "", "UNLINK", true)
      .then(res => {
        if (res.ok) {
          this.props.unregister()
          return res.json()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .catch(err => {
        Util.handleError(err)
      })
  }

  changeReg = () => {
    this.props.changeReg()
  }

  updateAvailability = () => {
    this.props.updateAvailability()
  }

  discardChanges = () => {
    this.props.discardChanges()
  }

  render() {
    return (
      <div className="cardsWrap">
        <div className="fullWidthCard profileCard1">
          <div className="wrap wrapFlex">
            <div className="card101">
              <div className="numberDiv">
                <p id="number">{this.props.regNum}</p>
              </div>
              <div className="informationalDiv">

                <div className="successWrap">
                  <div className="successfulRegistrationMessage">
                    <p id="successMessage">You have successfully registered for the show! Your assigned number is {this.props.regNum}.</p>
                    <p>This number will be your identifier during the audition, when you arrive you will check in with the choreographers running the audition and recieve your physical number.</p>
                    <p>Location: {this.props.audition.location}</p>

                    <p>Date: {moment(this.props.audition.time).format("LLLL")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card102">
          {
            !this.props.showChangeReg &&
            <div className="editRegistration">
              <div className="unregister">
                <Button className="unregisterButton negativeButton" onClick={this.unLink}>Unregister</Button>
              </div>
              <div className="changeAvailability">
                <Button className="changeAvailabilityButton" onClick={this.changeReg}>Change Availability</Button>
              </div>
            </div>
          }

        </div>
        {
          this.props.showChangeReg &&
          <section>
            <Availability className="availability" availability={this.props.setAvailability} currAvailability={this.props.currAvailability}/>
            <div className="editRegistration">
              <div className="changeAvailability">
                <Button className="changeAvailabilityButton" onClick={this.updateAvailability}>Confirm Availability</Button>
                <Button className="cancelButton" onClick={this.discardChanges}>Cancel</Button>
              </div>
            </div>
          </section>
        }
      </div>
    )
  }

}


export default RegistrationConf;