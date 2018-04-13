import React, { Component } from 'react';
import * as Util from './util.js';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';

//styling
import './styling/Audition.css';

const styles = {
  customWidth: {
    width: 150,
  },
};

class Audition extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
    }
    console.log(this.props.audition)
  };

  componentWillMount(){
    this.checkRegistration()
  }

  checkRegistration = () => {
    Util.makeRequest("users/me/auditions/" + this.props.audition, "", "GET", true)
    .then(res => {
      if(res.ok) {
        return res.json
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(user => {
      this.setState({
        registered: true
      })
    })
    .catch(err => {console.log(err)})
  }

  registerUser = () => {
    this.checkRegistration()
  }

  render() {
    const registered = this.state.registered
      return(
        <section className="main">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name}</h1>
            {
              this.state.registered === false &&
                <Registration audition={this.props.audition} registered={() => {this.setState({registered: true})}} />
            }
            {
              this.state.registered === true &&
              <RegistrationConf />
            }
          </div>
        </section>
      )
  }

}


export default Audition;