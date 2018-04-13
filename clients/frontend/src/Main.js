import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import People from './People';
import Piece from './Piece';
import Audition from './Audition';
import Show from './Show';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Casting from './Casting';
import MobileNavigationElement from './MobileNavigation';
import NavigationElement from './NavigationElement';
import {Button, SideNav, SideNavItem} from 'react-materialize';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Divider from 'material-ui/Divider';
import * as Util from './util';
import 'materialize-css';
import './styling/Main.css';

class Main extends Component {
  constructor(props) {
    super(props);
    this.getNavigation = this.getNavigation.bind(this);
    this.signOut = this.signOut.bind(this);
    this.updatePage = this.updatePage.bind(this);
    this.getCurrShows = this.getCurrShows.bind(this);
    this.getShowTypes = this.getShowTypes.bind(this);
    //"page" lets me know what page we are looking at, numerically encoded so I don't have to deal with strings
    //starts on dashboard (100)
    //onClick links will update
    this.state = {
      user: JSON.parse(localStorage.user),
      shows: null,
      routing: null,
      firstRender: true,
      showTypes: null,
      currShows: [],
      open: false
    }


    
  };

  componentWillMount(){
    
  }

  componentDidMount(){
    
    this.getShowTypes();
    this.getCurrShows();
    if(!localStorage['firstLoad']){
      localStorage['firstLoad'] = true
      window.location.reload()
    };
  }

  getCurrShows(){
    //TODO deal with the fact that there's going to be pages
    Util.makeRequest("shows?history=all&includeDeleted=false", {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(data => {
      this.setState({
        shows: data.shows
      })
    })
    .then(
      this.getShowTypes()
    )
    .then( showTypes => {
      let currShows = []
      this.state.shows.map(s => {
        console.log(s)
        currShows.push({"name" : this.state.showTypes[s.typeID], "audition": s.auditionID})
      })
      return currShows
    })
    .then(currShows => {
      this.setState({
        currShows: currShows
      })
    })
    .catch(err => console.log(err))
  }

  getShowTypes(shows){
    Util.makeRequest("shows/types?includeDeleted=true", {}, "GET", true)
    .then((res) => {
      if(res.ok){
        return res.json()
      }
    })
    .then((data) => {
      let showTypes = {};
      data.map(function(show){
         showTypes[show.id.toString()] = show.desc
      })
      return showTypes
   })
   .then((showTypes) => {
      this.setState({
          showTypes: showTypes
      })
   }) 
  }

  getNavigation(){
    let showNav = this.state.currShows.map((s, i) => {
                    return <NavigationElement key ={i} user={this.state.user} showTitle={s.name} />
                  })

    return <ul className="collapsible collapsible-accordion">{showNav}</ul>
  }

  getMobileNavigation = () => {
    let mobileShowNav = this.state.currShows.map((s, i) => {
      return <MobileNavigationElement key ={i} user={this.state.user} showTitle={s.name} handleClose={this.handleClose}/>
    })

    return <ul className="collapsible collapsible-accordion">{mobileShowNav}</ul>
  }

  signOut(){
    Util.signOut();
    this.props.auth();
  }

  updatePage(pageNum){
    if(this.state.page !== pageNum) {
      this.setState({
        page: pageNum
      })
    }
  }

  handleToggle = () => this.setState({open: !this.state.open});

  handleClose = () => this.setState({open: false});

  render() {
    return (
      <section>
        <section className="mobile">
          <div>
            <RaisedButton
              label="MENU"
              onClick={this.handleToggle}
            />
            <Drawer
              docked={false}
              width={250}
              open={this.state.open}
              onRequestChange={(open) => this.setState({open})}
            >
              <div id="mobileLogo"> STAGE </div>
              
                <Link to="/"><MenuItem onClick={this.handleClose}>Dashboard</MenuItem></Link>
                {this.getMobileNavigation()}
             
              <Link to={{pathname:"/profile"}}><MenuItem onClick={this.handleClose}>Profile</MenuItem></Link>
              
              <Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button>
            </Drawer>
          </div>
        </section>
        <section className="routing">
        <Switch>
          <Route exact path='/' component={Dashboard}/>
          <Route exact path='/profile' component={Profile}/>
        </Switch>
          {this.state.currShows.map((show, i) => {
            let showName = show.name
            let path = "/" + showName.split(' ').join('')
            console.log(show.audition)
            return( 
              <Switch key = {i}>
                <Route exact path={path} render={
                  props => <Show {...props} name={show.name}/>
                }/>
                <Route exact path={path + "/audition"} render={
                  props => <Audition {...props} name={show.name} audition={show.audition}/>
                }/>
                <Route exact path={path + "/casting"} render={
                  props => <Casting {...props} name={show.name} audition={show.audition}/>
                }/>
                <Route exact path={path + "/piece"} render={
                  props => <Piece {...props} name={show.name} audition={show.audition}/>
                }/>
                <Route exact path={path + "/people"} render={
                  props => <People {...props} name={show.name} audition={show.audition}/>
                }/>
              </Switch>
            )}
          )}

      </section>
      
      <section className="desktop">
      <ul id="slide-out" className="side-nav fixed">
          <li><div id="logo">STAGE</div></li>
          <li><Link to="/">Dashboard</Link></li>
          <li>
              {this.getNavigation()}
          </li>
          <li><Link to={{pathname:"/profile"}}>Profile</Link></li>
          <li><Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button></li>
        </ul>
      </section>
    </section>
  );
};

}
export default Main;