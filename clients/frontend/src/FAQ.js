import React, { Component } from 'react';
import './styling/General.css';
import { HashLink } from "react-router-hash-link";

class FAQ extends Component {

  render() {
    return (
        <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1>Help</h1>
            <h2 className="smallHeading" style={{paddingBottom: "0px"}}>Tutorials</h2>
            <p style={{paddingTop: "5px", paddingLeft: "15px"}}>Dancers</p>
              <li><HashLink to="/faq#profile">Edit your profile</HashLink></li>
              <li><HashLink to="/faq#audition">Register for an Audition</HashLink></li>
              <li><HashLink to="/faq#acceptcasting">Accept/Decline your Casting</HashLink></li>
              <li><HashLink to="/faq#viewdancerpiece">View Piece Information</HashLink></li>
            <p style={{paddingTop: "5px", paddingLeft: "15px"}}>Choreographers</p>
              <li><HashLink to="/faq#viewregistration">View Dancers Registered for an Audition</HashLink></li>
              <li><HashLink to="/faq#casting">Cast your Piece</HashLink></li>
              <li><HashLink to="/faq#setrehearsals">Set Rehearsal Schedule</HashLink></li>
              <li><HashLink to="/faq#editrehearsals">Edit Rehearsals</HashLink></li>
              <li><HashLink to="/faq#editcast">Add/Remove Dancers to Cast</HashLink></li>
              <li><HashLink to="/faq#addcollaborators">Add Collaborators (Musicians, Production Staff)</HashLink></li>
              <li><HashLink to="/faq#infosheet">Fill Out Information Sheet</HashLink></li>
              <br />
            <h2 className="smallHeading"><HashLink to="/faq#about">About STAGE</HashLink></h2><br />
            <h2 className="smallHeading"><HashLink to="/faq#report">Report Errors</HashLink></h2><br /><br />

            <section id="profile">
            </section>

            <section id="audition">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              {/*<div style={{border: "2px solid #ebebeb", minWidth: "100%", borderBottom: "0 none", height: "501px"}}>
                  <iframe title="registerForAudition" style={{border: "0 none", borderBottom: "2px solid #ebebeb", minWidth: "100%"}} src="https://www.iorad.com/player/127222/Register-for-Audition?src=iframe" width="100%" height="500px" allowFullScreen="true"></iframe>
              </div>
               <div style={{display: "none"}}>
                  <p style={{display: "none"}}>Select the &lt;b&gt;number of pieces&lt;/b&gt;&amp;nbsp;that you are available for</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Confirm that you will be taking a&amp;nbsp;&lt;b&gt;technique class&lt;/b&gt; during the run of the show.</p>
                  <p style={{display: "none"}}>Click&lt;b&gt;&amp;nbsp;&lt;/b&gt;and drag to indicate when you are&amp;nbsp;&lt;b&gt;available&lt;/b&gt; to rehearse.&lt;font color=&quot;#1f8ceb&quot;&gt;&lt;/font&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>You can select across multiple&amp;nbsp;&lt;b&gt;times&amp;nbsp;&lt;/b&gt;and&amp;nbsp;&lt;b&gt;days&lt;/b&gt; at a time.</p>
                  <p style={{display: "none"}}>Drag and drop over selected times to&amp;nbsp;&lt;b&gt;delete&lt;/b&gt; your availability at that time.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.&lt;br&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;REGISTER&amp;nbsp;&lt;/b&gt;to confirm your information and register for the audition.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Change Availability&amp;nbsp;&lt;/b&gt;if you want to update your availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Confirm Availability&amp;nbsp;&lt;/b&gt;to resubmit your new availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Unregister&amp;nbsp;&lt;/b&gt;to remove your registration from the audition pool.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>That&apos;s it. You&apos;re done.</p>
              </div> */}
            </section>

            <section id="acceptcasting">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              {/* <div style={{border: "2px solid #ebebeb", minWidth: "100%", borderBottom: "0 none", height: "501px"}}>
                  <iframe title="registerForAudition" style={{border: "0 none", borderBottom: "2px solid #ebebeb", minWidth: "100%"}} src="https://www.iorad.com/player/127222/Register-for-Audition?src=iframe" width="100%" height="500px" allowFullScreen="true"></iframe>
              </div>
              <div style={{display: "none"}}>
                  <p style={{display: "none"}}>Select the &lt;b&gt;number of pieces&lt;/b&gt;&amp;nbsp;that you are available for</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Confirm that you will be taking a&amp;nbsp;&lt;b&gt;technique class&lt;/b&gt; during the run of the show.</p>
                  <p style={{display: "none"}}>Click&lt;b&gt;&amp;nbsp;&lt;/b&gt;and drag to indicate when you are&amp;nbsp;&lt;b&gt;available&lt;/b&gt; to rehearse.&lt;font color=&quot;#1f8ceb&quot;&gt;&lt;/font&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>You can select across multiple&amp;nbsp;&lt;b&gt;times&amp;nbsp;&lt;/b&gt;and&amp;nbsp;&lt;b&gt;days&lt;/b&gt; at a time.</p>
                  <p style={{display: "none"}}>Drag and drop over selected times to&amp;nbsp;&lt;b&gt;delete&lt;/b&gt; your availability at that time.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.&lt;br&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;REGISTER&amp;nbsp;&lt;/b&gt;to confirm your information and register for the audition.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Change Availability&amp;nbsp;&lt;/b&gt;if you want to update your availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Confirm Availability&amp;nbsp;&lt;/b&gt;to resubmit your new availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Unregister&amp;nbsp;&lt;/b&gt;to remove your registration from the audition pool.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>That&apos;s it. You&apos;re done.</p>
              </div> */}
            </section>

            <section id="viewdancerpiece">
              {/* <h2 className="smallHeading">How to Register for an Audition</h2>
              <div style={{border: "2px solid #ebebeb", minWidth: "100%", borderBottom: "0 none", height: "501px"}}>
                  <iframe title="registerForAudition" style={{border: "0 none", borderBottom: "2px solid #ebebeb", minWidth: "100%"}} src="https://www.iorad.com/player/127222/Register-for-Audition?src=iframe" width="100%" height="500px" allowFullScreen="true"></iframe>
              </div>
              <div style={{display: "none"}}>
                  <p style={{display: "none"}}>Select the &lt;b&gt;number of pieces&lt;/b&gt;&amp;nbsp;that you are available for</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Confirm that you will be taking a&amp;nbsp;&lt;b&gt;technique class&lt;/b&gt; during the run of the show.</p>
                  <p style={{display: "none"}}>Click&lt;b&gt;&amp;nbsp;&lt;/b&gt;and drag to indicate when you are&amp;nbsp;&lt;b&gt;available&lt;/b&gt; to rehearse.&lt;font color=&quot;#1f8ceb&quot;&gt;&lt;/font&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>You can select across multiple&amp;nbsp;&lt;b&gt;times&amp;nbsp;&lt;/b&gt;and&amp;nbsp;&lt;b&gt;days&lt;/b&gt; at a time.</p>
                  <p style={{display: "none"}}>Drag and drop over selected times to&amp;nbsp;&lt;b&gt;delete&lt;/b&gt; your availability at that time.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.</p>
                  <p style={{display: "none"}}>Enter any additional availability concerns here.&lt;br&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;REGISTER&amp;nbsp;&lt;/b&gt;to confirm your information and register for the audition.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Change Availability&amp;nbsp;&lt;/b&gt;if you want to update your availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}></p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Confirm Availability&amp;nbsp;&lt;/b&gt;to resubmit your new availability.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Unregister&amp;nbsp;&lt;/b&gt;to remove your registration from the audition pool.&lt;/i&gt;&lt;/span&gt;</p>
                  <p style={{display: "none"}}>That&apos;s it. You&apos;re done.</p>
              </div> */}
            </section>

            <section id="viewregistration">
              <h2 className="smallHeading">How to Register for an Audition</h2>
            </section>

            <section id="casting">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              
            </section>

            <section id="setrehearsals">
              <h2 className="smallHeading">How to Register for an Audition</h2>
            </section>

            <section id="editrehearsals">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              
            </section>

            <section id="editcast">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              
            </section>

            <section id="addcollaborators">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              
            </section>

            <section id="infosheet">
              <h2 className="smallHeading">How to Register for an Audition</h2>
              
            </section>

            <section id="about">
              <h2 className="smallHeading">About STAGE</h2>
              
            </section>

            <section id="report">
              <h2 className="smallHeading">Report Errors</h2>
            </section>
          </div>
        </div>
      </section>
    );
  };
}

export default FAQ;