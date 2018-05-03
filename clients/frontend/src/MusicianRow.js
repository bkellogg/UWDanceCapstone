import React, { Component } from 'react';
import TextField from 'material-ui/TextField';

class MusicianRow extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    return (
      <section>
          <div>
            Name:
                <TextField 
                    className="musicianName"
                    onChange={this.handleChange('musicianName')}
                />
            
            Phone Number:
                <TextField 
                    className="musicianPhoneNumber"
                    onChange={this.handleChange('musicianPhoneNumber')}
                />
            
            Email:
                <TextField 
                    className="musicianEmail"
                    onChange={this.handleChange('musicianEmail')}
                />
            
        </div>
      </section>
  );
};

}
export default MusicianRow;

