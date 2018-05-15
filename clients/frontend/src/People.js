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
    //API route to get people in an audition will go here
    //that route is down, so for now we are just getting the first 100 active people in the data
    //TODO deal with pages
    //STYLING NOTE: if you want to show dummy data change this.props.show to 1
    Util.makeRequest("shows/" + this.props.show + "/users", "", "GET", true)
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
        this.setState({ users: data.users })
      })
      .catch(err => {
        console.log(err)
        Util.handleError(err)
      })
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

