import React, { Component } from 'react';
import * as Util from './util.js';

import './styling/selectCast.css';

import CastingPersonRow from './CastingPersonRow';

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
    if (localStorage.getItem("allUsers") === null){
      Util.makeRequest("auditions/" + this.props.auditionID + "/users", "", "GET", true)
      .then( res => {
        if (res.ok) {
          return res.json()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(data => {
        this.setState({
            users: data.users
        })
        localStorage.setItem('allUsers', JSON.stringify(data.users));
        localStorage.setItem('cast', []);

        /*var retrievedObject = localStorage.getItem('testObject');
          console.log('retrievedObject: ', JSON.parse(retrievedObject));*/
      })
      .catch(err => {
        console.log(err)
        Util.handleError(err)
      })
    } else {
      this.setState({
        users: JSON.parse(localStorage.getItem("allUsers"))
      })
    }
  }

  
  render() {
    let rows = this.state.users.map((person, i) => {
        return(
          <CastingPersonRow person={person}  key={person.id}/>
        )
    })
    return (
        <section>
            <table>
            <tbody>
                <tr>
                <th></th>
                <th>#</th>
                <th>Name</th>
                <th>Pieces</th>
                <th>
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
        </section>
  );
};

}


export default SelectCast;