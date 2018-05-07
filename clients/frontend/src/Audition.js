import React, {Component} from 'react';
import * as Util from './util.js';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';
import Availability from './Availability';

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
      changeRegistration: false
    }
  };

  componentWillMount() {
    this.checkRegistration()
  }

  checkRegistration = () => {
    Util
      .makeRequest("users/me/auditions/" + this.props.audition, "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res
          .text()
          .then((t) => Promise.reject(t));
      })
      .then(audition => {
        this.setState({registered: true, audition: audition.audition, regNum: audition.regNum, currAvailability: audition.availability})
      })
      .catch(err => {
        console.error(err)
        Util.handleError(err)
      })
  }

  registerUser = () => {
    this.checkRegistration()
  }

  unregister = () => {
    console.log("unregistered")
    this.setState({
      registered: false,
      open: true
    })
  }

  changeReg = () => {
    this.setState({
      changeRegistration : true
    })
  }

  updateAvailability = () => {
    let body = {
      "days" : this.state.availability
    }
    Util.makeRequest("users/me/auditions/" + this.props.audition + "/availability", body, "PATCH", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(
      this.setState({
        changeRegistration : false,
        openAvailability: true,
      })
    )
    .then(
      this.checkRegistration()
    )
    .catch(err => {
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
      availability : availability
    })
  }

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name + " Audition Form"}</h1>
            {!this.state.registered && <Registration
              audition={this.props.audition}
              registered={() => this.checkRegistration()}/>
            }
            {this.state.registered && <RegistrationConf
              audition={this.state.audition}
              regNum={this.state.regNum}
              unregister={this.unregister}
              changeReg={this.changeReg}
              updateAvailability = {this.updateAvailability}
              showChangeReg={this.state.changeRegistration}
              discardChanges={() => this.setState({changeRegistration : false})}/>
            }
            {this.state.changeRegistration &&  
              <Availability availability={this.setAvailability} currAvailability={this.state.currAvailability} />
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