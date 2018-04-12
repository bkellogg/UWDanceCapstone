import React, { Component } from 'react';
import * as Util from './util';

class People extends Component {
  /*constructor(props) {
    super(props);
  };*/

  getPeople = () => {
    //API route to get people in an audition will go here
    //that route is down, so for now we are just getting the first 100 active people in the data
    //TODO deal with pages
    Util.makeRequest("users/all", "", "GET", true)
    .then( res => {
      if (res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(data => {
      return data.users
    })
    .then(p => {
      let pers = p.map(person => {
        return(
          <tr>
            <td>
              ah
            </td>
          </tr>
        )
      })
      return (
        <div>{pers}</div>
      )
    })
    .catch(err => console.log(err))
  }

  render() {
    return (
      <section className="main">
        <h1>People</h1>
        <table>
          <tbody>
          <tr>
          <th>
            Photo
          </th>
          <th>
            Name
          </th>
          <th>
            Role
          </th>
          <th>
            Email
          </th>
          </tr>
{this.getPeople()}
          </tbody>
        </table>
      </section>
  );
};

}
export default People;

