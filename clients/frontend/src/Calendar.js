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
        <h5>Calendar!</h5>
      </div>
    );
  };
}

export default Calendar;