import React, { Component } from 'react';
import './styling/General.css';
import { HashLink } from "react-router-hash-link";

const styles = {
  paddingLeft: "30px"
}

class FAQ extends Component {

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1>Help</h1>
            <h2 className="smallHeading" style={{ paddingBottom: "0px", marginTop: "15px" }}>Tutorials</h2>
            <p style={{ paddingLeft: "15px", marginTop: "5px", marginBottom: "0px" }}>Dancers</p>
            <li style={styles}><HashLink to="/faq#audition">Register for an Audition</HashLink></li>
            <li style={styles}><HashLink to="/faq#profile">Edit your Profile</HashLink></li>
            <li style={styles}><HashLink to="/faq#acceptcasting">Accept/Decline your Casting</HashLink></li>
            <li style={styles}><HashLink to="/faq#viewdancerpiece">View Piece Information</HashLink></li>
            <p style={{ paddingTop: "5px", paddingLeft: "15px", marginBottom: "0px" }}>Choreographers</p>
            <li style={styles}><HashLink to="/faq#viewregistration">View Dancers Registered for an Audition</HashLink></li>
            <li style={styles}><HashLink to="/faq#casting">Cast your Piece</HashLink></li>
            <li style={styles}><HashLink to="/faq#editrehearsals">Edit Rehearsals</HashLink></li>
            <li style={styles}><HashLink to="/faq#editcast">Add/Remove Dancers to Cast</HashLink></li>
            <li style={styles}><HashLink to="/faq#addcollaborators">Add Collaborators (Musicians, Production Staff)</HashLink></li>
            <li style={styles}><HashLink to="/faq#infosheet">Fill Out Information Sheet</HashLink></li>
            <br />
            <h2 className="smallHeading"><HashLink to="/faq#about">About STAGE</HashLink></h2><br />
            <h2 className="smallHeading"><HashLink to="/faq#report">Report Errors</HashLink></h2><br /><br />

            <div style={{ borderTop: "solid lightgrey", height: "20px", width: "100%" }} ></div>
            <h2 className="smallHeading" style={{ paddingBottom: "0px", marginTop: "15px", fontSize: "20px" }}>Dancer Tutorials</h2>
            <br />
            <br />
            <br />
            <section id="audition">
              <h2 className="smallHeading">Register for an Audition</h2>
              <div style={{ border: "2px solid #ebebeb", minWidth: "100%", borderBottom: "0 none", height: "501px" }}>
                <iframe title="registerForAudition" style={{ border: "0 none", borderBottom: "2px solid #ebebeb", minWidth: "100%" }} src="https://www.iorad.com/player/127222/Register-for-Audition?src=iframe" width="100%" height="500px" allowFullScreen="true"></iframe>
              </div>
              <div style={{ display: "none" }}>
                <p style={{ display: "none" }}>Select the &lt;b&gt;number of pieces&lt;/b&gt;&amp;nbsp;that you are available for</p>
                <p style={{ display: "none" }}></p>
                <p style={{ display: "none" }}>Confirm that you will be taking a&amp;nbsp;&lt;b&gt;technique class&lt;/b&gt; during the run of the show.</p>
                <p style={{ display: "none" }}>Click&lt;b&gt;&amp;nbsp;&lt;/b&gt;and drag to indicate when you are&amp;nbsp;&lt;b&gt;available&lt;/b&gt; to rehearse.&lt;font color=&quot;#1f8ceb&quot;&gt;&lt;/font&gt;</p>
                <p style={{ display: "none" }}></p>
                <p style={{ display: "none" }}>You can select across multiple&amp;nbsp;&lt;b&gt;times&amp;nbsp;&lt;/b&gt;and&amp;nbsp;&lt;b&gt;days&lt;/b&gt; at a time.</p>
                <p style={{ display: "none" }}>Drag and drop over selected times to&amp;nbsp;&lt;b&gt;delete&lt;/b&gt; your availability at that time.</p>
                <p style={{ display: "none" }}>Enter any additional availability concerns here.</p>
                <p style={{ display: "none" }}>Enter any additional availability concerns here.&lt;br&gt;</p>
                <p style={{ display: "none" }}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;REGISTER&amp;nbsp;&lt;/b&gt;to confirm your information and register for the audition.&lt;/i&gt;&lt;/span&gt;</p>
                <p style={{ display: "none" }}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Change Availability&amp;nbsp;&lt;/b&gt;if you want to update your availability.&lt;/i&gt;&lt;/span&gt;</p>
                <p style={{ display: "none" }}></p>
                <p style={{ display: "none" }}></p>
                <p style={{ display: "none" }}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Confirm Availability&amp;nbsp;&lt;/b&gt;to resubmit your new availability.&lt;/i&gt;&lt;/span&gt;</p>
                <p style={{ display: "none" }}>Click &lt;span class=&quot;&quot;&gt;&lt;i&gt;&lt;b&gt;Unregister&amp;nbsp;&lt;/b&gt;to remove your registration from the audition pool.&lt;/i&gt;&lt;/span&gt;</p>
                <p style={{ display: "none" }}>That&apos;s it. You&apos;re done.</p>
              </div>
              <p>Helpful Tips</p>
              <ol>
                <li>You are required to take a technique class during the show run, and you will not be able to register until you confirm this.</li>
                <li>Your are filling in WHEN you are available to rehearse, NOT when you are NOT available to rehearse</li>
                <li>Your comment can only be 200 words long</li>
              </ol>
            </section>
            <br />
            <br />
            <section id="Profile">
              <h2 className="smallHeading">Edit your Profile</h2>
              <p>
                To edit your profile, simply click edit and then save your changes. You can upload a photo, resume, and bio, and change your first and last name.
              </p>
              <p>Helpful Tips</p>
              <ol>
                <li>You will see the "please complete your profile" tab until you complete your bio. This bio will be used in the program for the show, if you are cast, and choreographers can also view it during casting.</li>
                <li>Your resume and headshot are not required.</li>
                <li>Your piece history will be auto-populated by us as you use STAGE.</li>
              </ol>
            </section>
            <br />
            <br />
            <section id="acceptcasting">
              <h2 className="smallHeading">Accept/Decline your Casting</h2>
              <p>
                If you get cast in a piece, you will recieve an email and directions to go back to STAGE to accept your casting. If you do not recieve this email, then you have not been cast.
              </p>
              <p>
                You will have 48 hours to accept or decline your casting invitation, which will appear on the dashboard, along with rehearsal information and your choreographers name. If you do not respond within 48 hours, your invitation will be marked as declined.
              </p>
            </section>
            <br />
            <br />
            <section id="viewdancerpiece">
              <h2 className="smallHeading">View Piece Information</h2>
              <p>
                After accepting your casting, you will be able to see piece information under "My Piece". Your rehearsal times will be on the Calendar, as well as a link to the production website, which will contain tech and dress rehearsal information.
                You will also be able to see your cast members and your choreographers contact information. Check back regularly to see any changes to your rehearsal schedule!
              </p>
              <p>
                During a shift in quarters, when your availability for rehearsing is likely to change, you can go back into your audition registration and
                modify your availability. Your choreographer will be able to see your new availability and update the rehearsal schedule accordingly.
              </p>
            </section>
            <br />
            <br />
            <div style={{ borderTop: "solid lightgrey", height: "20px", width: "100%" }} ></div>
            <h2 className="smallHeading" style={{ paddingBottom: "0px", marginTop: "15px", fontSize: "20px" }}>Choreographer Tutorials</h2>
            <br />
            <br />
            <section id="viewregistration">
              <h2 className="smallHeading">View Dancers Registered for an Audition</h2>
              <p>
                Simply navigate to the "Audition" page under the show you are casting. You can see all dancers registration numbers and profiles.
              </p>
              <p>
                You can print this page and annotate it during an audition if you would like.
              </p>
            </section>
            <br />
            <br />
            <section id="casting">
              <h2 className="smallHeading">Cast your Piece</h2>
              <ol>
                <li>Navigate to the “Casting” tab under Faculty Dance Concert. Only enter this session while you are casting, and if you are the choreographer for this piece!</li>
                <li>On the “Select Cast” page, you can see the dancers audition number, name (and profile), and # of pieces they want to be in.</li>
                <li>Use the “Rank” buttons to select your desired cast. You can use the ranking to keep track of your favorites and backups, but that information is just for you to help you remember it later in the process and you don’t have to use it.</li>
                <li>Click the right arrow to move to the next phase of casting, “Check Availability”. </li>
                <li>Here you can filter dancers and view their overlapping availability, and if a dancer does not work in your idea of a schedule you can drop them from your cast here. Don’t worry, you can add them back in the next step if you change your mind.</li>
                <li>Click the right arrow to move to the next phase of casting, “Conflict Resolution”. </li>
                <li>NOTE: You can always go forward or backward in the casting session, and your choices will be saved.</li>
                <li>This is where if two or more choreographers desire the same dancer, you can view and resolve that conflict, as well as add and drop dancers from your cast. Results of conflict resolution are automatically updated in your session.</li>
                <li>Once you have your final desired cast, click the right arrow to move to the final step of casting “Post Casting”. </li>
                <li>This shows your casts availability, and allows you to set rehearsals. Make sure you select the first day of rehearsal, in addition to when those rehearsals will be recurring. If you have a special case, you can email your dancers after the fact to let them know - those are the only rehearsals captured in this step.</li>
                <li>Click “Post Casting” to send an email out to your dancers with their rehearsal times. They will have 48 hours to accept or decline their casting, via our site. You can exit the casting session at this point.</li>
              </ol>
            </section>
            <br />
            <br />
            <section id="editrehearsals">
              <h2 className="smallHeading">Edit Rehearsals</h2>
              <p>
                To edit rehearsals, go to My Piece and open the Calendar drop down. Rehearsals have been automatically populated from your casting rehearsals, and your cast will be able to see this calendar.
              </p>
              <ol>
                <li>Add a rehearsal by clicking and dragging to select the time slot. Add a name and save. We currently do not support creating recurring rehearsals.</li>
                <li>Edit a rehearsal by clicking on an existing rehearsal. Try editing the time slot and saving. You can always “Cancel” and not apply your changes.</li>
                <li>Delete a rehearsal by clicking on an existing rehearsal and clicking “Delete”</li>
              </ol>
            </section>
            <br />
            <br />
            <section id="editcast">
              <h2 className="smallHeading">Add/Remove Dancers to Cast</h2>
              <p>
                If you must remove a dancer from your cast, you can go to My Piece and open up Cast and click "Drop" next to their name. This will mean that they can no longer see your reharsals and will not be populated into the information sheet.
              </p>
              <p>
                To add a dancer, you don't need to go back to casting, You can search for them and add them like you would a collaborator. Make sure they have an account with STAGE so you can add them, but they don't need to register for an audition unless you want to see their availability.
              </p>
            </section>
            <br />
            <br />
            <section id="addcollaborators">
              <h2 className="smallHeading">Add Collaborators (Musicians, Production Staff)</h2>
              <p>
                Ensure that your collaborator has an account with STAGE, and that your Director or another Administrator has given them the appropraiate role. Then, you can simply search for them under Cast in My Piece and add them to your cast. If they are listed as a "dancer" role, then they will show up in your information sheet,
                which goes to other production staff and could be confusing, so make sure they have the correct role. They will be able to see your cast, your contact information, and your rehearsal schedule.
              </p>
            </section>
            <br />
            <br />
            <section id="infosheet">
              <h2 className="smallHeading">Fill Out Information Sheet</h2>
              <p>
                To fill out the information sheet, you can simply drop down the Information Sheet on My Piece and add information. All contact information for musicians in required. Make sure to save your sheet, and your Director or other Admins will be able to see what you need for your piece!
              </p>
            </section>
            <div style={{ borderTop: "solid lightgrey", height: "20px", width: "100%" }} ></div>
            <section id="about">
              <h2 className="smallHeading">About STAGE</h2>
              <p>STAGE is the modern solution to an age old practice in the arts - producing a show.</p>

              <div>
                <p>Our platform allows you to easily manage critical aspects of a production, by allowing every dancer to create a profile,
                every choreographer to easily select their star cast, and giving the director a comprehensive look at every piece. Our goal is to
                reduce the stress of scheduling and communication, and let you focus your energy on what really matters - getting your work on STAGE.</p>
                <p>Want to contribute? Check out our <a href="https://github.com/bkellogg/UWDanceCapstone">Github!</a></p>
              </div>
            </section>
            <div style={{ borderTop: "solid lightgrey", height: "20px", width: "100%" }} ></div>
            <section id="report">
              <h2 className="smallHeading">Report Errors</h2>
              <div>Something not working right? We're sorry to hear that.</div>
              <div>We're always looking to improve STAGE and we would love your feedback!</div>
              <div>Go ahead and send us an email at <a href="mailto:adamsrc@uw.edu">rosemarycadams@gmail.com</a> with a description of your problem and we'll take a look!</div>
            </section>
          </div>
        </div>
      </section>
    );
  };
}

export default FAQ;