import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'

import Dashboard from './Dashboard.js';
import Shows from './Shows.js';
import Calendar from './Calendar.js';
import Profile from './Profile.js';

class Navigation extends Component {
  constructor(props) {
    super(props);
    console.log(this.state);
  };

  render() {
      return(
        <section className='router'>
          <Switch>
            <Route exact path='/dashboard' component={Dashboard}/>
            <Route path='/dashboard/shows' component={Shows}/>
            <Route path='/dashboard/calendar' component={Calendar}/>
            <Route path='/dashboard/profile' component={Profile}/>
          </Switch>
        </section>
      )
  }

}


export default Navigation;