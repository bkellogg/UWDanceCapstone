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
import DancerPiece from './DancerPiece';
import StaticProfile from './StaticProfile';
import { Button } from 'react-materialize';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import * as Util from './util';
import 'materialize-css';
import logo from './imgs/logoex.png'
import './styling/Main.css';
import './styling/Navigation.css';
import './styling/MobileNavigation.css';
import './styling/General.css';


const style = {
  textColor: 'white',
  boxShadow: 'none',
  backgroundColor: 'none',
  height: '46'
};

const styleNav = {
  color: '#ffffff',
  backgroundColor: 'red'
};

localStorage.setItem("rehearsals", JSON.stringify([{
  id: 3,
  title: 'Weekly Rehearsal',
  start: new Date('2018-05-10 11:00 AM'),
  end: new Date('2018-05-10 12:30 PM')
}]))

class Main extends Component {
  constructor(props) {
    super(props);
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

  componentDidMount() {
    this.getCurrShows();
    if (!localStorage['firstLoad']) {
      localStorage['firstLoad'] = true
      window
        .location
        .reload()
    };
  }

  getCurrShows = () => {
    //TODO deal with the fact that there's going to be pages
    Util.makeRequest("shows?history=all&includeDeleted=false", {}, "GET", true).then(res => {
      if (res.ok) {
        return res.json()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    }).then(data => {
      this.setState({ shows: data.shows })
      return data.shows
    }).then(shows => {
      this.getShowTypes(shows)
    }).catch(err => {
      console.error(err)
      Util.handleError(err)
    })
  }

  getShowTypes = (shows) => {
    Util.makeRequest("shows/types?includeDeleted=true", {}, "GET", true).then((res) => {
      if (res.ok) {
        return res.json()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    }).then((data) => {
      let showTypes = {};
      data.map(function (show) {
        return showTypes[
          show
            .id
            .toString()
        ] = show.desc
      })
      return showTypes
    }).then((showTypes) => {
      this.setState({ showTypes: showTypes })
    }).then(() => {
      shows.map(show => {
        this.getAudition(show)
        return this.state.currShows
      })
    }).catch(err => {
      console.log(err)
      Util.handleError(err)
    })
  }

  // Gets audition information for passed in show
  getAudition = (show) => {
    let auditionID = show.auditionID
    let currShows = this.state.currShows

    Util.makeRequest("auditions/" + auditionID, {}, "GET", true).then((res) => {
      if (res.ok) {
        return res.json();
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    }).then((data) => {
      currShows.push({
        "name": this.state.showTypes[show.typeID],
        "auditionID": show.auditionID,
        "show": show.id,
        "audition": data
      })
      this.setState({ currShows: currShows })
    }).catch((err) => {
      Util.handleError(err)
    });
  }

  getNavigation = () => {
    let showNav = this
      .state
      .currShows
      .map((show, index) => {
        return <NavigationElement key={index} user={this.state.user} showTitle={show.name} />
      })

    return <ul className="collapsible collapsible-accordion">{showNav}</ul>
  }

  getMobileNavigation = () => {
    let mobileShowNav = this
      .state
      .currShows
      .map((show, index) => {
        return <MobileNavigationElement
          key={index}
          user={this.state.user}
          showTitle={show.name}
          handleClose={this.handleClose} />
      })

    return <ul className="collapsible collapsible-accordion">{mobileShowNav}</ul>
  }

  signOut = () => {
    Util.signOut();
  }

  handleToggle = () => this.setState({
    open: !this.state.open
  });

  handleClose = () => this.setState({ open: false });

  render() {
    return (
      <section>
        <section className="mobile">
          <div className="mobileNavWrap">
            <div className="mobileNav">
              <div className="hamburger">
                <div className="mobileNavLogoWrap">
                  <RaisedButton
                    backgroundColor="#27384A"
                    className="hamburgerButton"
                    style={style}
                    onClick={this.handleToggle}>
                    <p className="hambMenu">MENU</p>
                  </RaisedButton>

                  <img className="mobileNavLogo" alt="logo" src={logo} />
                </div>
              </div>
              <Drawer
                style={styleNav}
                docked={false}
                width={250}
                open={this.state.open}
                onRequestChange={(open) => this.setState({ open })}>

                <div className="menuList">
                  <Link to="/">
                    <MenuItem onClick={this.handleClose}>
                      <p className="mobileNavItem">Dashboard</p>
                    </MenuItem>
                  </Link>
                  {this.getMobileNavigation()}

                  <Link to={{
                    pathname: "/profile"
                  }}>
                    <MenuItem onClick={this.handleClose}>
                      <p className="mobileNavItem">Profile</p>
                    </MenuItem>
                  </Link>

                </div>
                <Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button>

              </Drawer>
            </div>
          </div>
        </section>

        <section className="routing">
          <Switch>
            <Route
              exact
              path='/'
              render={props => <Dashboard {...props} shows={this.state.currShows} showTypes={this.state.showTypes} />} />
            <Route exact path='/profile' component={Profile} />
            <Route path='/users/:userID' component={StaticProfile} />
          </Switch>
          {this
            .state
            .currShows
            .map((show, i) => {
              let showName = show.name
              let path = "/" + showName
                .split(' ')
                .join('')
              let routes = []
              if (this.state.user.role.level === 10) { //dancer

                let route1 = <Route
                  exact
                  path={path + "/audition"}
                  render={props => <Audition {...props} name={show.name} audition={show.auditionID} />} />

                let route2 = <Route
                  exact
                  path={path + "/piece"}
                  render={props => <DancerPiece {...props} name={show.name} audition={show.auditionID} />} />

                routes.push(route1)
                routes.push(route2)
              } else if (this.state.user.role.level === 70) { //choreographer

                let route1 = <Route
                  exact
                  path={path + "/casting"}
                  render={props => <Casting
                    {...props}
                    name={show.name}
                    audition={show.auditionID} 
                    show={show.show}/>} />

                let route2 = <Route
                  exact
                  path={path + "/people"}
                  render={props => <People
                    {...props}
                    name={show.name}
                    audition={show.auditionID}
                    show={show.show} />} />

                let route3 = <Route
                  exact
                  path={path + "/piece"}
                  render={props => <Piece
                    {...props}
                    name={show.name}
                    audition={show.auditionID}
                    show={show.show} />} />

                routes.push(route1)
                routes.push(route2)
                routes.push(route3)
              } else { //admin

                let route1 = <Route
                  key={i}
                  exact
                  path={path + "/casting"}
                  render={props => <Casting
                    {...props}
                    name={show.name}
                    audition={show.auditionID}
                    show={show.show}
                  />} />

                let route2 = <Route
                  key={i * 10}
                  exact
                  path={path + "/people"}
                  render={props => <People
                    {...props}
                    name={show.name}
                    audition={show.auditionID}
                    show={show.show} />} />

                let route3 = <Route
                  key={i * 100}
                  exact
                  path={path + "/audition"}
                  render={props => <Audition {...props} name={show.name} audition={show.auditionID} />} />

                let route4 = <Route
                  exact
                  path={path + "/piece"}
                  render={props => <Piece
                    {...props}
                    name={show.name}
                    audition={show.auditionID}
                    show={show.show} />} />

                routes.push(route1)
                routes.push(route2)
                routes.push(route3)
                routes.push(route4)
              }
              return (
                <Switch key={i}>
                  <Route exact path={path} render={props => <Show {...props} name={show.name} />} /> {routes}
                  {/* <Route
                    exact
                    path={path + "/piece"}
                    render={props => <Piece {...props} name={show.name} audition={show.auditionID}/>}/> */}
                </Switch>
              )
            })}

        </section>

        <section className="desktop">
          <div className="navigationWrap">
            <ul id="slide-out" className="side-nav fixed">
              <div className="navigationBg">
                <li>
                  <div id="logo">
                    <img className="officialLogoImage" alt="logo" src={logo} />
                  </div>
                </li>
                <li className="dropDown">
                  <Link to="/">Dashboard</Link>
                </li>
                <li>
                  {this.getNavigation()}
                </li>
                <li className="dropDown">
                  <Link to={{
                    pathname: "/profile"
                  }}>Profile</Link>
                </li>
              </div>
              <Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button>
            </ul>
            
          </div>
        </section>
      </section>
    );
  };

}
export default Main;
