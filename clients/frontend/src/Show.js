import React, { Component } from 'react';
import './styling/Show.css';

class Show extends Component {


  render() {
    return (
      <section className="main">
      <div className="mainView">
        <div className="show">
          <h5 id='showTitle'>{this.props.name}</h5>
        </div>
      </div>
      </section>
    );
  };
}

export default Show;