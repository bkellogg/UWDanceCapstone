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
    //TODO get this to be just the people in a show
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
      <div className="mainView">
        <h1>People</h1>
<<<<<<< HEAD
      </div>
=======
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
>>>>>>> d1434f83689d6a09c871ad1c43e019e2f60ea3d7
      </section>
  );
};

}

const PersonRow = (props) => {
  let p = props.p
  return (
    <tr>
      <td>
        photo
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

