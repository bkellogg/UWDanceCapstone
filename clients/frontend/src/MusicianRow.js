import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import * as Util from './util';

class MusicianRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        id: this.props.id,
        musician : {},
        existing: this.props.existing 
    }
  };

  componentWillUnmount(){
    console.log("unmounting")
    console.log(this.state)
        Util.makeRequest("pieces/" + this.props.pieceID + "/musicians/" + this.state.id, {},"DELETE", true)
        .then(res => {
            if (res.ok) {
              return res.text()
            }
            if (res.status === 404) {
              return res.text()
            }
            return res
              .text()
              .then((t) => Promise.reject(t));
          })
          .then(res => {
            console.log(res)
          })
          .catch((err) => {
            console.error(err)
          })
    
  }

  componentWillMount(){
      if (this.state.existing) {
          this.setState({
              toDelete: false,
              musician: this.props.musician
          })
      }
  }
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  updateName = (event) => {
    let musician = this.state.musician
    musician.name = event.target.value
    this.setState({
        musician : musician
    })
  }

  updateNumber = (event) => {
    let musician = this.state.musician
    musician.phone = event.target.value
    this.setState({
        musician : musician
    })
  }

  updateEmail = (event) => {
    let musician = this.state.musician
    musician.email = event.target.value
    this.setState({
        musician : musician
    })
  }

  updateUser = () => {
    if (!this.state.existing) {
        Util.makeRequest("pieces/" + this.props.pieceID + "/musicians", this.state.musician, "POST", true)
        .then(res => {
          if (res.ok) {
            return res.text()
          }
          if (res.status === 404) {
            return res.text()
          }
          return res
            .text()
            .then((t) => Promise.reject(t));
        })
        .then(res => {
          console.log(res)
        })
        .catch((err) => {
            this.props.error(err)
          console.error(err)
        })
    } else {
        Util.makeRequest("pieces/" + this.props.pieceID + "/musicians/" + this.state.id, this.state.musician, "PATCH", true)
        .then(res => {
        if (res.ok) {
            return res.text()
        }
        if (res.status === 404) {
            return res.text()
        }
        return res
            .text()
            .then((t) => Promise.reject(t));
        })
        .then(res => {
            console.log(res)
        })
        .catch((err) => {
            this.props.error(err)
            console.error(err)
        })
    }
  }

  render() {
    return (
      <section>
          <div>
            Name:
                <TextField 
                    defaultValue={this.props.musician.name}
                    id="musicianName"
                    className="musicianName"
                    onChange={this.updateName}
                />
            
            Phone Number:
                <TextField 
                    defaultValue={this.props.musician.phone}
                    id="musicianPhoneNumber"
                    className="musicianPhoneNumber"
                    onChange={this.updateNumber}
                />
            
            Email:
                <TextField 
                    defaultValue={this.props.musician.email}
                    id="musicianEmail"
                    className="musicianEmail"
                    onChange={this.updateEmail}
                />
            
        </div>
      </section>
  );
};

}
export default MusicianRow;

