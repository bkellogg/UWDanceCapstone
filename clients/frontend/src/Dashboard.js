import React, { Component } from 'react';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
  };

  render() {
    console.log("Dashboard!");
      return(
        <section className='dashboard'>
          <h1 style={{textAlign:"center"}}> Dashboard! </h1>
        </section>
      )
  }

}


export default Dashboard;