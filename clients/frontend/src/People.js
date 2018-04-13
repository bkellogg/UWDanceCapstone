import React, { Component } from 'react';
import * as Util from './util';

class People extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
  }

  componentDidMount(){
    this.getPeople()
  }

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
      this.setState({users: data.users})
    })
    .catch(err => console.log(err))
  }

  render() {
    let rows = this.state.users.map((person, i) => {
      return(
        <PersonRow key={i} p={person}/>
      )
    })
    return (
      <section className="main">
        <h1>People</h1>
        <table>
          <tbody>
            {rows}
          </tbody>
        </table>
      </section>
  );
};

}

const PersonRow = (props) => {
  return (
    <tr>
      <td>
        photo
      </td>
      <td>
        name
      </td>
      <td>
        role
      </td>
      <td>
        asdf
      </td>
    </tr>
  );
}

export default People;

