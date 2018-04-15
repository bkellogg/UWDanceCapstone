import React, { Component } from 'react';
import * as Util from './util.js';

import './styling/selectCast.css';

import Avatar from 'material-ui/Avatar';
import Checkbox from 'material-ui/Checkbox';

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

  updateCheck() {
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      };
    });
  }

  PersonRow = (p) => {
    
    return (
      <tr key={p.id}>
        <td>
        <Avatar>:)</Avatar>
        </td>
        <td>
            regNum
        </td>
        <td>
          {p.firstName + " " + p.lastName}
        </td>
        <td>
          numPieces
        </td>
        <td>
            <div className="check">
        <Checkbox
          //label="Simple with controlled value"
          //checked={this.state.checked}
          onCheck={this.updateCheck.bind(this)}
        />
        </div>
        <div className="check">
        <Checkbox
          //label="Simple with controlled value"
          //checked={this.state.checked}
          onCheck={this.updateCheck.bind(this)}
        />
        </div>
        <div className="check">
        <Checkbox
          //label="Simple with controlled value"
          //checked={this.state.checked}
          onCheck={this.updateCheck.bind(this)}
        />
        </div>
        </td>
      </tr>
    );
  }



  render() {
    let rows = this.state.users.map((person, i) => {
        return(
          //<PersonRow key={i} p={person}/>
          this.PersonRow(person)
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