import React, { Component } from 'react';
import './styling/Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
  };

  render() {
    return (
      <section className="profile">
        <h1>Profile!</h1>
      </section>
    );
  };
}

export default Profile;