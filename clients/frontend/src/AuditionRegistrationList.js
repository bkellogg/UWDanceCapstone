import React, { Component } from 'react';
import * as Util from './util';
import { Link } from 'react-router-dom';
import { Button } from 'react-materialize';
import './styling/General.css';
import './styling/CastingFlowMobile.css';

class AuditionRegistrationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDancers: []
    }
  };

  componentWillMount() {
    this.getAllUsers()
  }

  getAllUsers = () => {
    this.getPages()
  };

  async getPages() {
    let dancers = [];
    let page = 1;
    let done = false;
    while (!done) {
      try {
        let response = await Util.makeRequest('auditions/' + this.props.auditionID + '/users?page=' + page, "", "GET", true)
        if (response.status === 401) {
          Util.signOut()
        }
        let json = await response.json();
        done = json.users.length === 0 ? true : false
        page++;
        dancers = dancers.concat(json.users);
      } catch (e) {
        console.error(e)
      }
    }
    this.getAllUserAuditionLink(dancers)
  }

  async getAllUserAuditionLink(dancers) {
    const allDancersArray = dancers.map(async dancer => {
      const response = await Util.makeRequest("users/" + dancer.id + "/auditions/" + this.props.auditionID, {}, "GET", true)
      return response.json()
    })

    const allDancers = await Promise.all(allDancersArray)
    allDancers.sort((a, b) => { return a.regNum - b.regNum })
    this.setState({
      allDancers: allDancers
    })
  }

  render() {
    const allDancers = this.state.allDancers
    let dancerRows = allDancers.map((dancer, i) => {
      return (
        <tr key={i} >
          <td style={{ textAlign: "center" }}>
            {dancer.regNum}
          </td>
          <td>
            <Link className="personNameLink" to={{ pathname: "/users/" + dancer.user.id }} target="_blank">{dancer.user.firstName + " " + dancer.user.lastName}</Link>
          </td>
          <td>
            {dancer.user.email}
          </td>
        </tr>
      )
    })
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1 className="printHeader">{this.props.name}: Audition Registration List</h1>
            <Button className="printButton" onClick={() => Util.printPage()}> Print </Button>
            <div className="fullWidthCard">
              <div className="wrap">
                <div className="peopleList">
                  <table>
                    <tbody>
                      <tr className="categories">
                        <th style={{ width: "10%", textAlign: "center" }}>Registration Number</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                      {dancerRows}
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

export default AuditionRegistrationList;