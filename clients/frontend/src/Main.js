import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import People from './People';
import Piece from './Piece';
import Audition from './Audition';
import Show from './Show';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Casting from './Casting';
import NavigationElement from './NavigationElement';
import {Button} from 'react-materialize';
import * as Util from './util';
import 'materialize-css';
import './styling/Main.css';
//import $ from 'jquery';

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
      currShows: []
    }
  };

  componentWillMount(){
    this.getShowTypes();
    this.getCurrShows();
  }

  componentDidMount(){
    if(window.localStorage){
      if(!localStorage.getItem('firstLoad')){
        localStorage['firstLoad'] = true;
        window.location.reload()
      } else {
        localStorage.removeItem('firstLoad')
      }
    }
  }

  getCurrShows(){
    //TODO deal with the fact that there's going to be pages

    let currShows = []
    Util.makeRequest("shows?history=all&includeDeleted=false", {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
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
        currShows.push(this.state.showTypes[s.typeID])
      })
      return currShows
    })
    .then(currShows => {
      this.setState({
        currShows: currShows
      })
    })
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
                    return <NavigationElement key ={i} user={this.state.user} showTitle={s} />
                  })

    return <ul className="collapsible collapsible-accordion">{showNav}</ul>
  }

  signOut(){
    Util.signOut();
    this.props.auth();
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
          <Route exact path='/profile' component={Profile}/>
          {this.state.currShows.map((r, i) => {
                return(
                    <Route exact path={"/" + r.split(' ').join('')} render={
                      () => (<Show id={i + 1} name={r}/>)}/> 
          )})}
          {this.state.currShows.map((r,i) =>{
            return(
              <Route path={"/" + r.split(' ').join('') + "/audition"} render={
                () => (<Audition id={(10 * (i + 1))} name={r}/>)}/>
            )
          })}
          {this.state.currShows.map((r,i) =>{
            return(
              <Route path={"/" + r.split(' ').join('') + "/casting"} render={
                () => (<Casting id={11 * (i + 1)} name={r}/>)}/>
            )
          })}
          {this.state.currShows.map((r,i) =>{
            return(
              <Route path={"/" + r.split(' ').join('') + "/piece"} render={
                () => (<Piece id={12 * (i + 1)} name={r}/>)}/>
            )
          })}
          {this.state.currShows.map((r,i) =>{
            return(
              <Route path={"/" + r.split(' ').join('') + "/people"} render={
                () => (<People id={13 * (i + 1)} name={r}/>)}/>
            )
          })}
        </Switch>
    </section>
        <ul id="slide-out" className="side-nav fixed">
          <li><div id="logo">STAGE</div></li>
          <li><Link to="/">Dashboard</Link></li>
          <li>
              {this.getNavigation()}
          </li>
          <li><Link to={{pathname:"/profile"}}>Profile</Link></li>
          <li><Button id='signOut' onClick={() => this.signOut()}>Sign Out</Button></li>
        </ul>
      {/*<Link to="#" data-activates="slide-out" className="button-collapse"><i className="material-icons">menu</i></Link>*/}
      </section>
  );
};

}
export default Main;

