import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import './styling/General.css';

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
              <div className="param param-displayInline">
          <p className="inputLabelBlock-noWidth"><b>Name </b> </p>
          
                <TextField 
                    defaultValue={this.props.musician.name}
                    id="musicianName"
                    className="textField musicianInput"
                    onChange={this.updateName}
                />
            </div>
            <div className="param param-displayInline">
            <p className="inputLabelBlock-noWidth"><b>Phone Number </b> </p>
                <TextField 
                    defaultValue={this.props.musician.phone}
                    id="musicianPhoneNumber"
                    className="textField musicianInput"
                    onChange={this.updateNumber}
                />
            </div>
            <div className="param param-displayInline">
            <p className="inputLabelBlock-noWidth"><b>Email </b> </p>
                <TextField 
                    defaultValue={this.props.musician.email}
                    id="musicianEmail"
                    className="textField musicianInput"
                    onChange={this.updateEmail}
                />
            </div>
        </div>
      </section>
  );
};

}
export default MusicianRow;

