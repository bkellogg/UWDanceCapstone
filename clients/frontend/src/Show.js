import React, { Component } from 'react';
import {Switch, Route} from 'react-router-dom';
import People from './People';
import Piece from './Piece';
import Audition from './Audition';
import './styling/Show.css';

class Show extends Component {
  constructor(props) {
    super(props);
  };

  componentDidMount(){
    //get everything together to show the 
    console.log(this.props.name)
    console.log(this.props.id)
  }

  render() {
    return (
      <section className="main">
        <h1>{this.props.name}</h1>
      </section>
    );
  };
}

export default Show;