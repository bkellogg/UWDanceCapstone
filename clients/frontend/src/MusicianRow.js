import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

class MusicianRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        id: this.props.id,
        musician : {
            name : "",
            phone : "",
            email : ""
        }
    }
  };

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
    this.props.musicianContact(musician, this.state.id)
  }

  updateNumber = (event) => {
    let musician = this.state.musician
    musician.phone = event.target.value
    this.setState({
        musician : musician
    })
    this.props.musicianContact(musician, this.state.id)
  }

  updateEmail = (event) => {
    let musician = this.state.musician
    musician.email = event.target.value
    this.setState({
        musician : musician
    })
    this.props.musicianContact(musician, this.state.id)
  }

  render() {
    return (
      <section>
          <div>
            Name:
                <TextField 
                    id="musicianName"
                    className="musicianName"
                    onChange={this.updateName}
                />
            
            Phone Number:
                <TextField 
                    id="musicianPhoneNumber"
                    className="musicianPhoneNumber"
                    onChange={this.updateNumber}
                />
            
            Email:
                <TextField 
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

