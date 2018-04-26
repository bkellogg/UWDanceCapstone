import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      signUp: false,
      authorized: false
    };
  };

  render() {
    return (  
      <section>
        <h1>you've landed on an alien planet</h1>
        <Button onClick={this.props.logIn}>Log In</Button>
        <Button onClick={this.props.signUp}>Sign Up</Button>
      </section>
  );
};

}
export default App;