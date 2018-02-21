import React, { Component } from 'react';
import {SideNav, SideNavItem, Button} from 'react-materialize';
import Navigation from './Navigation.js';
import Content from './Content.js';
import './styling/Main.css'

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 'dashboard'
    }
  };

  render() {
    return (
      <section>
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
      </section>
  );
};

}
export default Main;

