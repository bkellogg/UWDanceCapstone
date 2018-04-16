import React, { Component } from 'react';
import * as Util from './util';

import Avatar from 'material-ui/Avatar';

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
    //STYLING NOTE: if you want to show dummy data change this.props.show to 1
    Util.makeRequest("shows/"+this.props.show+"/users", "", "GET", true)
    .then( res => {
      if (res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(data => {
      this.setState({users: data.users})
    })
    .catch(err => {
      console.log(err)
      Util.handleError(err)
    })
  }

  render() {
    let rows = this.state.users.map((person, i) => {
        return(
          <PersonRow key={i} p={person}/>
        )
    })
    return (
      <section className="main">
      <div className="mainView">
        <h1>People</h1>
        <table>
          <tbody>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
            </tr>
            {rows}
          </tbody>
        </table>
      </div>
      </section>
  );
};

}

const PersonRow = (props) => {
  let p = props.p
  return (
    <tr>
      <td>
        <Avatar>:D</Avatar>
      </td>
      <td>
        {p.firstName + " " + p.lastName}
      </td>
      <td>
        {p.role.displayName}
      </td>
      <td>
        {p.email}
      </td>
    </tr>
  );
}

export default People;

