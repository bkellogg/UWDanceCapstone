import React, { Component } from 'react';
import * as Util from './util.js';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';

//styling
import './styling/Audition.css';

class Audition extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
      audition: null
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
        audition: audition.audition
      })
    })
    .catch(err => {console.log(err)})
  }

  registerUser = () => {
    this.checkRegistration()
  }

  render() {
      return(
        <section className="main">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name}</h1>
            {
              this.state.registered === false &&
                <Registration audition={this.props.audition} registered={() => this.checkRegistration()} />
            }
            {
              this.state.registered === true &&
              <RegistrationConf audition={this.state.audition}/>
            }
          </div>
        </section>
      )
  }

}


export default Audition;