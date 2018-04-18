import React, { Component } from 'react';
import * as Util from './util.js';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';

//styling
import './styling/Audition.css';
import './styling/General.css';

class Audition extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
      audition: null,
      regNum: 0
    }
  };

  componentWillMount(){
    this.checkRegistration()
  }

  checkRegistration = () => {
    Util.makeRequest("users/me/auditions/" + this.props.audition, "", "GET", true)
    .then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(audition => {
      this.setState({
        registered: true,
        audition: audition.audition,
        regNum: audition.regNum
      })
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
    this.setState({
      registered: false
    })
  }

  render() {
      return(
        <section className="main">
        <div className="mainView">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name} Audition Form</h1>
            {
              this.state.registered === false &&
                <Registration audition={this.props.audition} registered={() => this.checkRegistration()} />
            }
            {
              this.state.registered === true &&
              <RegistrationConf audition={this.state.audition} regNum={this.state.regNum} unregister={this.unregister}/>
            }
          </div>
          </div>
        </section>
      )
  }

}


export default Audition;