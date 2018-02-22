import React, { Component } from 'react';
//import { Link } from 'react-router-dom';
//import 'materialize-css';

class NavigationElement extends Component {
  /*constructor(props) {
    super(props);
  };*/

  render() {
    let address = this.props.showTitle.split(' ').join('');
    return (
           <li>
           <a className="collapsible-header" style={{paddingLeft: 32}} href={"#!" + address}>{this.props.showTitle}</a>
           <div className="collapsible-body">
               <ul>
                   {this.props.user.role === 100 &&
                       <li><a href={"#!/Audition"}>Audition</a></li>
                   }
                   {this.props.user.role === 200 &&
                       <li><a href={"#!" + address + "/Casting"}>Casting</a></li> &&
                       <li><a href={"#!"+ address + "/People"}>People</a></li>
                   }
                   <li><a href={"#!" + address + "/Piece"}>My Piece</a></li>
               </ul>
           </div>
           </li>
    );
  };
}

export default NavigationElement;