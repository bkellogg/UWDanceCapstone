import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
  };

  render() {
      return(
        <section className='dashboard'>
          <h1> Dashboard! </h1>
          <div className='shows'><Link to='/dashboard/shows'>Shows</Link></div>
          <div className='calendar'><Link to='/dashboard/calendar'>Calendar</Link></div>
          <div className='profile'><Link to='/dashboard/profile'>Profile</Link></div>
          <div className='dashboard'><Link to='/dashboard'>Dashboard</Link></div>
        </section>
      )
  }

}


export default Dashboard;