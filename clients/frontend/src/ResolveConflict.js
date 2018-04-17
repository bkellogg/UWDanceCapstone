import React, { Component } from 'react';

class ResolveConflict extends Component {
  constructor(props) {
    super(props);
    this.state = {
      willEdit : true
    }
  };

  render() {
    return (
      <section className="main">
      <div className="mainView">
        <h1>Resolve Conflicts</h1>
        </div>
      </section>
  );
};

}
export default ResolveConflict;