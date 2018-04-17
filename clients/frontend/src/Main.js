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
import {Button} from 'react-materialize';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import * as Util from './util';
import 'materialize-css';
import './styling/Main.css';
import './styling/Navigation.css';


class Main extends Component {
  constructor(props) {
    super(props);
    this.getNavigation = this.getNavigation.bind(this);
    this.signOut = this.signOut.bind(this);
    this.getCurrShows = this.getCurrShows.bind(this);
    this.getShowTypes = this.getShowTypes.bind(this);
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

  componentDidMount(){
    //this.getShowTypes();
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
      return data.shows
    })
    .then( shows => {
      this.getShowTypes(shows)
    })
    .catch(err => console.log(err))
  }

  getShowTypes(shows){
    Util.makeRequest("shows/types?includeDeleted=true", {}, "GET", true)
    .then((res) => {
      if(res.ok){
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
      let showTypes = {};
      data.map(function(show){
         return showTypes[show.id.toString()] = show.desc
      })
      return showTypes
   })
   .then((showTypes) => {
      this.setState({
          showTypes: showTypes
      })
   })
   .then( () => {
    shows.map(show => {
      let auditionInfo = this.getAudition(show)
    })
   })
    .catch(err => console.log(err))
  
  }
  

  // Gets audition information for passed in show
  getAudition = (show) => {
    let auditionID = show.auditionID
    let currShows = this.state.currShows
    
    Util.makeRequest("/auditions/" + auditionID, {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        currShows.push({"name" : this.state.showTypes[show.typeID], "auditionID": show.auditionID, "show": show.id, "audition":data})
        this.setState({
          currShows: currShows
        })
      })
      .catch((err) => { 
        //Util.handleError(err)
      });
  }

  getNavigation(){
    let showNav = this.state.currShows.map((show, index) => {
                    return <NavigationElement key ={index} user={this.state.user} showTitle={show.name} />
                  })

    return <ul className="collapsible collapsible-accordion">{showNav}</ul>
  }

  getMobileNavigation = () => {
    let mobileShowNav = this.state.currShows.map((show, index) => {
      return <MobileNavigationElement key ={index} user={this.state.user} showTitle={show.name} handleClose={this.handleClose}/>
    })

    return <ul className="collapsible collapsible-accordion">{mobileShowNav}</ul>
  }

  signOut(){
    Util.signOut();
    this.props.auth();
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
          <Route exact path='/' render={
            props => <Dashboard {...props} shows={this.state.currShows}/>
            }/>
          <Route exact path='/profile' component={Profile}/>
        </Switch>
          {this.state.currShows.map((show, i) => {
            let showName = show.name
            let path = "/" + showName.split(' ').join('')
            return( 
              <Switch key = {i}>
                <Route exact path={path} render={
                  props => <Show {...props} name={show.name}/>
                }/>
                <Route exact path={path + "/audition"} render={
                  props => <Audition {...props} name={show.name} audition={show.auditionID}/>
                }/>
                <Route exact path={path + "/casting"} render={
                  props => <Casting {...props} name={show.name} audition={show.auditionID}/>
                }/>
                <Route exact path={path + "/piece"} render={
                  props => <Piece {...props} name={show.name} audition={show.auditionID}/>
                }/>
                <Route exact path={path + "/people"} render={
                  props => <People {...props} name={show.name} audition={show.auditionID} show={show.show}/>
                }/>
              </Switch>
            )}
          )}

      </section>
      
      <section className="desktop">
        <div className="navigationWrap">
          <ul id="slide-out" className="side-nav fixed">
            <div className="navigationBg">
              <li><div id="logo">STAGE</div></li>
              <li><Link to="/">Dashboard</Link></li>
              <li>
                  {this.getNavigation()}
              </li>
              <li><Link to={{pathname:"/profile"}}>Profile</Link></li>
              <li><Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button></li>
            </div>
          </ul>
        </div>
      </section>
    </section>
  );
};

}
export default Main;