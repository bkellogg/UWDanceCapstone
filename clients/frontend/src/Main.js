import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
//import Navigation from './Navigation.js';
//import Content from './Content.js';
import Dashboard from './Dashboard';
import Profile from './Profile';
import NavigationElement from './NavigationElement.js';
import {Button} from 'react-materialize';
import 'materialize-css';
import './styling/Main.css';
//import $ from 'jquery';

class Main extends Component {
  constructor(props) {
    super(props);
    this.getNavigation = this.getNavigation.bind(this);
    this.signOut = this.signOut.bind(this);
    this.updatePage = this.updatePage.bind(this);
    //"page" lets me know what page we are looking at, numerically encoded so I don't have to deal with strings
    //starts on dashboard (100)
    //onClick links will update
    this.state = {
      user: JSON.parse(localStorage.user),
      page: 100
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

  updatePage(pageNum){
    console.log(this.state.page);
    if(this.state.page !== pageNum) {
      this.setState({
        page: pageNum
      })
    }
  }

  render() {
    return (
      <section>
        <section className="routing">
        <Switch>
            <Route exact path='/' component={Dashboard}/>
            <Route exact path='/Profile' component={Profile}/>
        </Switch>
      </section>

        <ul id="slide-out" className="side-nav fixed">
          <li><div id="logo">STAGE</div></li>
          <li><Link to="/" onClick={() => this.updatePage()}>Dashboard</Link></li>
          <li>
              {this.getNavigation()}
          </li>
          <li><Link to="/Profile" onClick={() => this.updatePage(200)}>Profile</Link></li>
          <li><Button id='signOut'>Sign Out</Button></li>
        </ul>
      <a href="#" data-activates="slide-out" className="button-collapse"><i className="material-icons">menu</i></a>
      </section>
  );
};

}
export default Main;

