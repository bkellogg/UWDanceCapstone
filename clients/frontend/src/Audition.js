import React, { Component } from 'react';
import * as Util from './util.js';
import moment from 'moment';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';

//styling
import './styling/Audition.css';
import './styling/General.css';
import Snackbar from 'material-ui/Snackbar';

class Audition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registered: false,
      audition: null,
      regNum: 0,
      open: false,
      openAvailability: false,
      changeRegistration: false,
      auditionPassed: false
    }
  };

  componentWillMount() {
    this.getAuditionInfo()
    this.checkRegistration()
  }

  getAuditionInfo = () => {
    Util.makeRequest("auditions/" + this.props.audition, {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(audition => {
      this.setState({ 
        audition: audition
      })
      this.checkAuditionDate(audition)
    })
    .catch(err => {
      console.error(err)
      Util.handleError(err)
    })
  }

  checkAuditionDate = (audition) => {
    let auditionTime = moment(audition.time)
    if (auditionTime.isBefore()) {
      this.setState({
        auditionPassed: true
      })
    }
  }
  
  checkRegistration = () => {
    let error = false
    Util
      .makeRequest("users/me/auditions/" + this.props.audition, "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        if (res.status !== 404) {
          error = true
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(audition => {
        this.setState({ 
          registered: true, 
          audition: audition.audition, 
          regNum: audition.regNum, 
          currAvailability: audition.availability })
      })
      .catch(err => {
        if (error) {
          let title = Util.titleCase(err)
          this.setState({
            error: title
          })
        }
        console.error(err)
        Util.handleError(err)
      })
  }

  registerUser = () => {
    this.checkRegistration()
  }

  unregister = () => {
    this.setState({
      registered: false,
      open: true
    })
  }

  changeReg = () => {
    this.setState({
      changeRegistration: true
    })
  }

  updateAvailability = () => {
    let body = {
      "days": this.state.availability
    }
    let error = false
    Util.makeRequest("users/me/auditions/" + this.props.audition + "/availability", body, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        if (res.status !== 404) {
          error = true
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(
        this.setState({
          changeRegistration: false,
          openAvailability: true,
        })
      )
      .then(
        this.checkRegistration()
      )
      .catch(err => {
        if (error) {
          let title = Util.titleCase(err)
          this.setState({
            error: title
          })
        }
        console.error(err)
        Util.handleError(err)
      })

  }

  handleRequestClose = () => {
    this.setState({
      open: false,
      openAvailability: false
    });
  };

  setAvailability = (availability) => {
    this.setState({
      availability: availability
    })
  }

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1 id="auditionTitle">{this.props.name + " Audition Form"}</h1>
            {
              this.state.auditionPassed &&
              <div className="auditionPassedWrap">
                <p className="auditionPassedMessage">The audition date has passed. Any information you enter here will not be considered during the casting process.</p>
              </div>
            }
            {!this.state.registered && <Registration
              audition={this.props.audition}
              registered={() => this.checkRegistration()} />
            }
            {this.state.registered && <RegistrationConf
              audition={this.state.audition}
              regNum={this.state.regNum}
              unregister={this.unregister}
              changeReg={this.changeReg}
              updateAvailability={this.updateAvailability}
              showChangeReg={this.state.changeRegistration}
              currAvailability = {this.state.currAvailability}
              setAvailability={this.setAvailability}
              discardChanges={() => this.setState({ changeRegistration: false })} />
            }
            {
              this.state.error &&
              <div className="serverError">
                {this.state.error}
              </div>  
            }
            <Snackbar
              open={this.state.open}
              message="Successfully Unregistered"
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
            <Snackbar
              open={this.state.openAvailability}
              message="Successfully Updated Availability"
              autoHideDuration={3000}
              onRequestClose={this.handleRequestClose}
            />
          </div>
        </div>
      </section>
    )
  }

}

export default Audition;