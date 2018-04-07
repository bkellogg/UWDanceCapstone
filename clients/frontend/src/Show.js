import React, { Component } from 'react';
import './styling/Show.css';

class Show extends Component {
  constructor(props) {
    super(props);
  };

  componentDidMount(){
    //get everything together to show the 
    console.log(this.props.name)

  }

  render() {
    return (
      <section className="main">
        <div className="show">
          <h1 id='showTitle'>{this.props.name}</h1>
        </div>
      </section>
    );
  };
}

export default Show;