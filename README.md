## STAGE (Simple Tech Assisting Genuine Expression)

### Overview
STAGE is the modern solution to an age old practice in the arts - producing a show.

Our platform is a mobile friendly web application that allows you to easily manage critical aspects of a production, by allowing every dancer to create a profile, every choreographer to easily select their star cast, and giving the director a comprehensive look at every piece. Our goal is to reduce the stress of scheduling and communication, and let you focus your energy on what really matters - getting your work on STAGE.

The inspiration for STAGE comes from the Department of Dance at the University of Washington. Dancers repeatedly fill out availability forms during the audition process, choreographers must rely on the legibility of the forms during the casting process, and directors must painstakingly gather contact information from each choreographer. Auditions can have up to 100 people in them, and one piece of paper per dancer leads to hours of headache inducing casting.


### Content

* Dancers
	* Create online profile 
        * Headshots
        * Bios
        * Resumes
    * Register for auditions
* Choreographers
    * View dancer information
    * Resolve casting conflicts
    * Set rehearsal schedules
    * Send casting immediately
* Directors
    * View all casts
    * Manage auditions and choreographers
* Admins
    * Shows
        * Create new shows/show types
        * Delete shows
    * Annoucements
        * Create new announcements/announcement types
        * Delete announcements
    * Users
        * Create new users
        * Modify user roles
        * Create new user roles

### Technology Decisions

The decision to use React on the front end was informed by the developers skill and confidence in the framework, and it provided a flexible architecture that allowed the project to easily be worked on collaboratively and reduce redundant code. Golang was used as the primary (and only) backend language because of the robustness of its standard networking and HTTP libraries. Go afforded us the ability to design the webserver to fit out exact needs, such as being able to run multiple webclients each with their own requirements, support bi-directional connections between many clients and our webserver known as websockets. For our database platform we decided to use MySQL because of its open-source and feature rich nature.


### Contact Information

Rosemary Adams<br/>
rosemarycadams@gmail.com

Brendan Kellogg<br/>
brendan@dobsis.org

Saniya Mazmanova<br/>
mazman94.sm@gmail.com

Nathan Swanson<br/>
nathan.a.swanson@gmail.com

### [STAGE Live Site](https://dasc.capstone.ischool.uw.edu/)
