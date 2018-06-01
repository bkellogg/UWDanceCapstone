import React, { Component } from 'react';
import * as Util from './util';
import { Link } from 'react-router-dom';
import './styling/General.css';
import './styling/CastingFlowMobile.css';

class AuditionRegistrationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDancers : []
    }
  };

  componentWillMount(){
    this.getAllUsers()
  }

  getAllUsers = () => {
    //TODO deal with pages
    Util.makeRequest("auditions/" + this.props.auditionID + "/users", {}, "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(dancers => {
        this.getAllUserAuditionLink(dancers.users)
      })
      .catch(err => {
        console.error(err)
      })
  };

  async getAllUserAuditionLink(dancers) {
    const allDancersArray = dancers.map(async dancer => {
      const response = await Util.makeRequest("users/" + dancer.id + "/auditions/" + this.props.auditionID, {}, "GET", true)
      return response.json()
    })

    const allDancers = await Promise.all(allDancersArray)
    allDancers.sort((a,b) => {return a.regNum - b.regNum})
    this.setState({
      allDancers : allDancers
    })
  }

  render() {
    const allDancers = this.state.allDancers
    let dancerRows = allDancers.map((dancer, i) => {
      return (
        <tr key={i} >
          <td style={{textAlign: "center"}}>
            {dancer.regNum}
          </td>
          <td>
            <Link className="personNameLink" to={{ pathname: "/users/" + dancer.user.id }} target="_blank">{dancer.user.firstName + " " + dancer.user.lastName}</Link>
          </td>
          <td className="hideEmail">
            {dancer.user.email}
          </td>
        </tr>
      )
    })
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
          <h1>{this.props.name}: Audition Registration List</h1>
            <div className="fullWidthCard">
              <div className="wrap">
                <div className="peopleList">
                  <table>
                    <tbody>
                      <tr className="categories">
                        <th style={{width: "10%", textAlign:"center"}}>#</th>
                        <th>Name</th>
                        <th className="hideEmail">Email</th>
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