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
    let pageNum = 1
    while (pageNum >= 1) {
      Util.makeRequest("shows/" + this.props.show + "/users", "", "GET", true)
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          if (res.status === 401) {
            Util.signOut()
            pageNum = 0
          }
          return res.text().then((t) => Promise.reject(t));
        })
        .then(data => {
          if (data.users.length > 0) {
            pageNum = pageNum + 1
          } else {
            pageNum = 0
          }
          //can do this either way bc the length will just be 0
          let users = data.users
          let currUsers = this.state.users
          users.forEach(user => {
            currUsers.push(user)
          })
          return currUsers
        })
        .then(currUsers => {
          this.setState({ 
            users: currUsers
          })
        })
        .catch(err => {
          pageNum = 0
          console.log(err)
          Util.handleError(err)
        })
        console.log(pageNum)
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
            <h1>People</h1>
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

