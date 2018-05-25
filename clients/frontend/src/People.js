import React, { Component } from 'react';
import * as Util from './util';
import './styling/General.css';
import './styling/People.css';
import './styling/CastingFlowMobile.css';

import PersonRow from './PersonRow'



class People extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
  }

  componentDidMount() {
    this.getPeople()
  }

  getPeople = () => {
    //TODO deal with pages
    for(let i = 1; i <= Util.PAGEMAX; i++) {
      Util.makeRequest("shows/" + this.props.show + "/users?page=" + i, "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(data => {
        console.log(data)
        let currUsers = this.state.users
        let newUsers = currUsers.concat(data.users)
        this.setState({ 
          users: newUsers
        })
      })
      .catch(err => {
        console.log(err)
        Util.handleError(err)
      })
    }
  }

  render() {
    let rows = this.state.users.map((person, i) => {
      return (
        <PersonRow key={i} p={person} />
      )
    })
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1>{this.props.name}: People</h1>
            <div className="fullWidthCard">
              <div className="wrap">
                <div className="peopleList">
                  <table>
                    <tbody>
                      <tr className="categories">
                        <th className="avatar2">Photo</th>
                        <th>Name</th>
                        <th className="userRoleDisp">Role</th>
                        <th>Email</th>
                      </tr>
                      {rows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

}

export default People;

