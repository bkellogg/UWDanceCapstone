import React, { Component } from 'react';
import * as Util from './util';
import TextField from 'material-ui/TextField';
import Button from 'react-materialize/lib/Button';
import './styling/General.css';
import './styling/Piece.css';

const STYLES = { width: "200px", paddingLeft: "15px"}

class SearchUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
        firstName: "",
        lastName: "",
        email: "",
        results: [], 
        searchError: false,
        addError: false
    };
  };

  searchUsers = () => {
      this.setState({
          addError: false,
          searchError: false
      })

      let request = "?page=1"
      let requestExists = false
      if (this.state.firstName.length > 0) {
        requestExists = true
        request = request + "&fname=" + this.state.firstName
      }
      if (this.state.lastName.length > 0) {
        requestExists = true
        request = request + "&lname=" + this.state.lastName
      }
      if (this.state.email.length > 0) {
          requestExists = true
          request = request + "&email=" + this.state.email
      }

      if (requestExists) {
        Util.makeRequest("users/all" + request, {}, "GET", true)
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          return res.text().then((t) => Promise.reject(t));
        })
        .then(results => {
            this.setState({
                results : results.users
            })
        })
        .catch((err) => {
            console.error(err)
            this.setState({
                searchError: err
            })
        })
      }
  }

  addUser = (id) => {
      Util.makeRequest("users/" + id + "/pieces/" + this.props.pieceID, {}, "LINK", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(results => {
          this.props.addedUser()
          this.setState({
            addError: false,
            searchError: false
        })
      })
      .catch((err) => {
          this.setState({
              addError: err
          })
          console.error(err)
      })
  }

  render() {
    const results = this.state.results
    let searchResults = results.map((user, i) => {
        return(
          <tr key={i}>
            <td>
              {user.firstName + " " + user.lastName}
            </td>
            <td>
              {user.email}
            </td>
            <td>
                <Button className="addButton" onClick={() => this.addUser(user.id)}> ADD </Button>
            </td>
          </tr>
        )
    })
    
    return (
      <section>
          <div className="searchHeader"> Search for users using <b>at least one</b> of the following search parameters. </div>
          <div className="searchParams">
            <div className="param">
                <p className="inputLabelSearch" > First Name</p>
                <TextField
                    className="textField onSearch"
                    id="firstName"
                    label="First Name"
                    defaultValue={this.state.firstName}
                    onChange={(e) => this.setState({firstName: e.target.value})}
                    style={STYLES}
                />
            </div>
            <div className="param">
            <p className="inputLabelSearch" > Last Name</p>
                <TextField
                    className="textField onSearch"
                    id="lastName"
                    defaultValue={this.state.lastName}
                    onChange={(e) => this.setState({lastName: e.target.value})}
                    style={STYLES}
                />
            </div>
            <div className="param">
            <p className="inputLabelSearch" > Email Address</p>
                <TextField
                    className="textField onSearch"
                    id="email"
                    defaultValue={this.state.email}
                    onChange={(e) => this.setState({email: e.target.value})}
                    style={STYLES}
                />
            </div>
          </div>

          <div className="searchButton"><Button className="saveButton" onClick={this.searchUsers}> Search </Button></div>
          {
            this.state.addError &&
            <div className="serverError" style={{marginTop: "10px"}}>
              {Util.titleCase(this.state.addError)}
            </div>
          }
          {
            this.state.searchError &&
            <div className="serverError" style={{marginTop: "10px"}}>
              {Util.titleCase(this.state.searchError)}
            </div>
          }
          <table class="searchDancersTable">
            <tbody>
            <tr className="categories">
                <th>Name</th>
                <th className="userEmail">Email</th>
                <th></th>
            </tr>
            {searchResults}
            </tbody>
        </table>
      </section>
    );
  };
}

export default SearchUsers;