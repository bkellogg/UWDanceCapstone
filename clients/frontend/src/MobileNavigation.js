import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MenuItem from 'material-ui/MenuItem';


class MobileNavigationElement extends Component {
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

            <MenuItem className="collapsible-header">{this.props.showTitle}</MenuItem>
            <div className="collapsible-body">
                <ul>
                    {/*Dancer (new user)*/}
                    {this.state.role === 10 && 
                        <li><Link to={{pathname: address + "/audition"}}><MenuItem onClick={this.props.handleClose}>Audition</MenuItem></Link></li>
                    }
                    {/*Choreographer*/}
                    {this.state.role === 70 && 
                        <li><Link to={{pathname:address + "/casting"}}><MenuItem onClick={this.props.handleClose} s>Casting</MenuItem></Link></li> &&
                        <li><Link to={{pathname:address + "/people"}}><MenuItem onClick={this.props.handleClose}>People</MenuItem></Link></li>
                    }
                    {/*Admin*/}
                    {this.state.role === 100 && 
                        <section>
                        <li><Link to={{pathname:address + "/casting"}}><MenuItem onClick={this.props.handleClose}>Casting</MenuItem></Link></li> 
                        <li><Link to={{pathname:address + "/people"}}><MenuItem onClick={this.props.handleClose}>People</MenuItem></Link></li>
                        <li><Link to={{pathname: address + "/audition"}}><MenuItem onClick={this.props.handleClose}>Audition</MenuItem></Link></li>
                        </section>
                    }
                    <li><Link to={{pathname:address + "/piece"}}><MenuItem onClick={this.props.handleClose}>My Piece</MenuItem></Link></li>
                </ul>
            </div>

        </li>
    );
  };
}

export default MobileNavigationElement;