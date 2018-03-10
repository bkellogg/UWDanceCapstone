import React, { Component } from 'react';
import { Link } from 'react-router-dom';
//import 'materialize-css';

class NavigationElement extends Component {
  /*constructor(props) {
    super(props);
  };*/

  render() {
    let address = "/" + this.props.showTitle.split(' ').join('');
    return (
        <li>
            <Link className="collapsible-header" style={{paddingLeft: 32}} to={{pathname: address}}>{this.props.showTitle}</Link>
            <div className="collapsible-body">
                <ul>
                    {/*Dancer (new user)*/}
                    {this.props.user.role === 10 && 
                        <li><Link to={{pathname: address + "/audition"}}>Audition</Link></li>
                    }
                    {/*Choreographer*/}
                    {this.props.user.role === 70 && 
                        <li><Link to={{pathname:address + "/casting"}}>Casting</Link></li> &&
                        <li><Link to={{pathname:address + "/people"}}>People</Link></li>
                    }
                    {/*Admin*/}
                    {this.props.user.role === 100 && 
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