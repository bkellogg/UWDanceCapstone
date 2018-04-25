import React, { Component } from 'react';
import * as Util from './util.js';

import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


import AllDancersRow from './AllDancersRow';

class SelectCast extends Component {
  constructor(props) {
    super(props);
    this.state ={
        users: [],
        selectedUsers: [],
        checked: false
    }
  };

  componentDidMount(){
    this.getPeople()
  }

  getPeople = () => {
    //API route to get people in an audition will go here
    //TODO deal with pages
    //TODO get this to be just the people in a show
    //I don't think this works if they sign out and then come back to this page directly?
    if (localStorage.getItem("allUsers") === null){
      Util.makeRequest("auditions/" + this.props.auditionID + "/users", "", "GET", true)
      .then( res => {
        if (res.ok) {
          return res.json()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(data => {
        let users = data.users
        users.forEach(user => {
          user.rank = ""
        });
        return users
      })
      .then(users => {
        this.setState({
            users: users
        })
        return users
      })
      .then( users => {
        localStorage.setItem('allUsers', JSON.stringify(users));
        localStorage.setItem('cast', JSON.stringify([]));
      })
      .catch(err => {
        Util.handleError(err)
      })
    } else {

      //TODO use the info from the websocket
      this.setState({
        users: JSON.parse(localStorage.getItem("allUsers"))
      })
    }
  }

  render() {
    let rows = this.state.users.map((person) => {
        return(
          <AllDancersRow person={person}  key={person.id} rank={person.rank} selectCast={true}/>
        )
    })
    return (
      
        <section>
          <div className="mainView">
          <div className="card1">
            <table className="table">
            <tbody>
                <tr className="categories">
                <th></th>
                <th>#</th>
                <th>Name</th>
                <th>Pieces</th>
                <th className="personRankBoxes">
                    Rank
                    <br/>
                    <div className="check rank">1</div>
                    <div className="check rank"> 2</div>
                    <div className="check rank"> 3</div>
                </th>
                </tr>
                {rows}
            </tbody>
            </table>
            </div>
            </div>
        </section>
  );
};

}


export default SelectCast;