import React, { Component } from 'react';
import './styling/Calendar.css';

class Calendar extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
  };

  render() {
    return (
      <div>
        <h1>Calendar!</h1>
      </div>
    );
  };
}

export default Calendar;