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
              <li><HashLink to="/faq#profile">Edit your Profile</HashLink></li>
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

            <iframe width="550" height="400"
              src="https://www.youtube.com/embed/-aguBdDWThA">
            </iframe>

            <section id="viewdancerpiece-dupliate">
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

            <section id="profile">
              <h2 className="smallHeading">Edit your profile</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="audition">
              <h2 className="smallHeading">Register for an Audition</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="acceptcasting">
              <h2 className="smallHeading">Accept/Decline your Casting</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="viewdancerpiece">
              <h2 className="smallHeading">View Piece Information</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="viewregistration">
              <h2 className="smallHeading">View Dancers Registered for an Audition</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="casting">
              <h2 className="smallHeading">Cast your Piece</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="setrehearsals">
              <h2 className="smallHeading">Set Rehearsal Schedule</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="editrehearsals">
              <h2 className="smallHeading">Edit Rehearsals</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="editcast">
              <h2 className="smallHeading">Add/Remove Dancers to Cast</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="addcollaborators">
              <h2 className="smallHeading">Add Collaborators (Musicians, Production Staff)</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="infosheet">
              <h2 className="smallHeading">Fill Out Information Sheet</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel diam velit. Morbi et mi scelerisque, iaculis leo vitae, cursus velit.
                Phasellus in viverra mi. Curabitur eget neque quis risus tempus cursus in nec justo. Donec scelerisque ac nisi non sodales. Morbi sodales
                velit vel arcu vehicula laoreet. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                Donec id tellus elementum, rutrum eros ut, vehicula tortor. Ut non nibh eu elit viverra rhoncus sed tempus eros.
              </p>
              <p>
                Nam non eleifend elit. Nullam a odio non ex euismod mattis. Mauris lacinia sollicitudin nibh, et facilisis turpis. Vestibulum commodo ultrices pretium.
                Sed imperdiet urna felis. Nullam tristique, sem dignissim scelerisque ornare, nisi diam congue quam, id porta tellus magna sed massa. Maecenas at est
                sit amet lorem sodales elementum. Nam sodales ligula libero, eget tincidunt orci aliquam eget. Nam tincidunt arcu lectus, nec ultrices nisi rutrum quis.
                Maecenas ligula enim, auctor non elementum pellentesque, vestibulum at risus. Pellentesque non diam eget odio facilisis faucibus. Morbi et lacus accumsan,
                tristique neque at, viverra nibh. In hac habitasse platea dictumst. In lobortis massa in scelerisque porta.
              </p>
            </section>

            <section id="about">
              <h2 className="smallHeading">About STAGE</h2>
              <p>STAGE is the modern solution to an age old practice in the arts - producing a show.</p>

              <div>
                Our platform allows you to easily manage critical aspects of a production, by allowing every dancer to create a profile,
                every choreographer to easily select their star cast, and giving the director a comprehensive look at every piece. Our goal is to
                reduce the stress of scheduling and communication, and let you focus your energy on what really matters - getting your work on STAGE.
              </div>
            </section>

            <section id="report">
              <h2 className="smallHeading">Report Errors</h2>
              <div>Something not working right? We're sorry to hear that.</div>
              <div>We're always looking to improve STAGE and we would love your feedback!</div>
              <div>Go ahead and send us an email at <a href="mailto:adamsrc@uw.edu">adamsrc@uw.edu</a> with a description of your problem and we'll take a look!</div>
            </section>
          </div>
        </div>
      </section>
    );
  };
}

export default FAQ;