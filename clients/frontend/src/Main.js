import React, { Component } from 'react';
import {SideNav, SideNavItem, Button} from 'react-materialize';
import Navigation from './Navigation.js';
import Content from './Content.js';
import 'materialize-css';
import './styling/Main.css';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'dashboard'
    }
  };

  componentWillMount(){
    $(".button-collapse").sideNav();
  }

  render() {
    return (
      <section>
        <ul id="slide-out" className="side-nav fixed">
          <li><div id="logo">STAGE</div></li>
          <li><a href="#!">Dashboard</a></li>
          <li>
            <ul className="collapsible collapsible-accordion">
              <li>
                <a className="collapsible-header" style={{paddingLeft: 32}}>Dropdown</a>
                <div className="collapsible-body">
                  <ul>
                    <li><a href="#!">First</a></li>
                    <li><a href="#!">Second</a></li>
                    <li><a href="#!">Third</a></li>
                    <li><a href="#!">Fourth</a></li>
                  </ul>
                </div>
              </li>
            </ul>
          </li>
          <li><a href="#!">Profile</a></li>
          <li><Button>Sign Out</Button></li>
        </ul>
      <a href="#" dataActivates="slide-out" className="button-collapse"><i className="material-icons">menu</i></a>
        
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

