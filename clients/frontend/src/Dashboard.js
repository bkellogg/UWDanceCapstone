import React, { Component } from 'react';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageCode: 100
    }
    console.log(this.state);
  };

  componentDidMount(){
    //this.props.onClick(this.state.pageCode)
  }

  render() {
    console.log("Dashboard!");
      return(
        <section className='dashboard'>
          <h1> Dashboard! </h1>
        </section>
      )
  }

}


export default Dashboard;