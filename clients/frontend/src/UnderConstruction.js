import React, { Component } from 'react';
import logo from './imgs/logoex.png'
import './styling/Landing.css';

class UnderConstruction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            signUp: false,
            authorized: false,
            underConstruction: true,
        };
    };

    render() {
        return (
            <div className="landingBackground">
                <div className="landingView">
                    <div className="landingBanner">
                        <div className="landingLogoWrap">
                            <img className="officialLogoLandingPage" alt="logo" src={logo} />
                        </div>
                    </div>
                    <div className="landingContent">
                        <div className="capstoneInfoWrap">
                            <p>
                                STAGE is currently down for maintenance. Thank you for your patience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

}
export default UnderConstruction;