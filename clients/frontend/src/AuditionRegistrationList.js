import React, { Component } from 'react';
import './styling/General.css';

class AuditionRegistrationList extends Component {


  render() {
    return (
      <section className="main">
      <div className="mainView">
          <h1>{this.props.name}: Audition Registration List</h1>
      </div>
      </section>
    );
  };
}

export default AuditionRegistrationList;