import React, { Component } from 'react';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
  };

  componentDidMount(){
    console.log("Dashboard mounted")
  }

  render() {
      return(
        <section className='main'>
          <h1> Dashboard! </h1>
        </section>
      )
  }

}


export default Dashboard;