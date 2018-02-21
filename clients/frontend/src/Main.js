import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
//import Navigation from './Navigation.js';
//import Content from './Content.js';
import Dashboard from './Dashboard';
import NavigationElement from './NavigationElement.js';
import 'materialize-css';
import './styling/Main.css';
//import $ from 'jquery';

class Main extends Component {
  constructor(props) {
    super(props);
    this.getNavigation = this.getNavigation.bind(this);
    this.signOut = this.signOut.bind(this);
    this.state = {
      user: JSON.parse(localStorage.user)
    }
    console.log(this.state.user);
  };

  componentWillMount(){
    //$(".button-collapse").sideNav();
  }

  getNavigation(){
    //this will be a for each through the active shows, for now it's just an array of shows
    let shows = ['Faculty Dance Concert', 'Dance Majors Concert', 'MFA Concert']
    
    let showNav = shows.map((s, i) => {
                    return <NavigationElement key ={i} user={this.state.user} showTitle={s} />
                  })

    return <ul className="collapsible collapsible-accordion">{showNav}</ul>
  }

  signOut(){
    console.log("no signing out 4 u");
  }

  render() {
    return (
      <section>
        <section className="routing">
        <Switch>
            <Route exact path='/#!Dashboard' component={Dashboard}/>
            <Route path='/dashboard/shows' component={Dashboard}/>
            <Route path='/dashboard/calendar' component={Dashboard}/>
            <Route path='/dashboard/profile' component={Dashboard}/>
        </Switch>
      </section>

        <ul id="slide-out" className="side-nav fixed">
          <li><div id="logo">STAGE</div></li>
          <li><Link to="#!Dashboard">Dashboard</Link></li>
          <li>
              {this.getNavigation()}
          </li>
          <li><a href="#!Profile">Profile</a></li>
          <li><div id='signOut'>Sign Out</div></li>
        </ul>
      <a href="#" data-activates="slide-out" className="button-collapse"><i className="material-icons">menu</i></a>
        
    {/*
        <ul id="slide-out" className="side-nav fixed">
          <li className="no-padding">
            <ul className="collapsible collapsible-accordion">
              <li>
                <div className='logo'>STAGE</div>
              </li>
              <li>
                <a className="collapsible-header">Dashboard</a>
              </li>
              <li>
                <a className="collapsible-header">Profile</a>
              </li>
              <li>
                <a className="collapsible-header">Faculty Dance Concert</a>
                <div className="collapsible-body">
                  <ul>
                    <li><a href="#!">My Piece</a></li>
                    <li><a href="#!">People</a></li>
                  </ul>
                </div>
              </li>
              <li>
                <a className="collapsible-header">Dance Majors Concert</a>
                <div className="collapsible-body">
                  <ul>
                    <li><a href="#!">My Piece</a></li>
                    <li><a href="#!">People</a></li>
                  </ul>
                </div>
              </li>
              <li>
                <a className="collapsible-header">MFA Concert</a>
                <div className="collapsible-body">
                  <ul>
                    <li><a href="#!">My Piece</a></li>
                    <li><a href="#!">People</a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </li>
    </ul> 
        <a href="#" data-activates="slide-out" className="button-collapse show-on-large"><i className="material-icons">menu</i></a>   
    */}</section>
  );
};

}
export default Main;

