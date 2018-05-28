import React, { Component } from 'react';
import './styling/Show.css';

class Terms extends Component {


  render() {
    return (
      <section className="terms">
        <h1>Terms of Service</h1>
        <p>STAGE is student designed and student developed application. We do not guarantee protection against pointed, malicous attacks on our system, 
         data leaks due to user error, or malicious use by users. </p>
        <p>STAGE has three levels of user permissions : administrative, which can see and modify everything about the application, choreographers, which 
            can see data about dancers and each other, and dancers, who can see and modify data about themselves, see data about dancers in their cast, and 
            delete their account. <b>You may permanently disable your account at any time and you will be removed from any shows you are in. </b>
        </p>
        <p>
            As a result of our tiered permissions, the administrator may elevate or lower any users permissions at any time. Should the administrator choose to
            elevate a user to the level of an administrator, this reliquishes sole power of the administrator over the platform and we are not responsible
            for any malicious use of the system. Our administrator reserves the right to elevate and lower permissions as they see fit.
        </p>
        <p>STAGE is built on trust between our users. Communicate with each other, and respect the permissions you have been given. 
            The technology we have built is not a replacement for human interaction, merely a support system for an existing process.
        </p>
        <p>This platforms hosting services are paid for by the Department of Dance at the University of Washington, and may be discontinued at any time,
            which could result in permanent data loss.</p>
        <p></p>
      </section>    
    );
  };
}

export default Terms;