import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MenuItem from 'material-ui/MenuItem';


class NavigationElement extends Component {
  constructor(props) {
    super(props);
    this.state = {
        role : JSON.parse(localStorage.user).role.level
    }
  };

  render() {
    let address = "/" + this.props.showTitle.split(' ').join('');
    return (
        <li>
            <Link className="collapsible-header" style={{paddingLeft: 32}} to={{pathname: "/"}}>{this.props.showTitle}</Link>
            <div className="collapsible-body">
                <ul>
                    {/*Dancer (new user)*/}
                    {this.state.role === 10 && 
                        <li><Link to={{pathname: address + "/audition"}}>Audition</Link></li>
                    }
                    {/*Choreographer*/}
                    {this.state.role === 70 && 
                        <li><Link to={{pathname:address + "/casting"}}>Casting</Link></li> &&
                        <li><Link to={{pathname:address + "/people"}}>People</Link></li>
                    }
                    {/*Admin*/}
                    {this.state.role === 100 && 
                        <section>
                        <li><Link to={{pathname:address + "/casting"}}>Casting</Link></li> 
                        <li><Link to={{pathname:address + "/people"}}>People</Link></li>
                        <li><Link to={{pathname: address + "/audition"}}>Audition</Link></li>
                        </section>
                    }
                    <li><Link to={{pathname:address + "/piece"}}>My Piece</Link></li>
                </ul>
            </div>
        </li>
    );
  };
}

export default NavigationElement;