import React, { Component } from 'react';

import Navigation from './Navigation.js';
import Content from './Content.js';

class Main extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <section className="main">
        <Navigation />
        <Content />
      </section>
  );
};

}
export default Main;

