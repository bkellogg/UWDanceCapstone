##Current APIs
####New User Signup
###**POST** to */api/v1/users*

#### Request Headers:
None required

#### Request Body:

	{
		firstName: "<firstname">,
		lastName: "<lastname>",
		email: "<email>",
		password: "<password>",
		passwordConf: "<passwordConf>"
	}

#### Responses

#####201 Created - When user signup was successful
######Response Headers:
**Authorization:** Contains the current user's session id
######Response Body:

		{
			id: <id>,
			firstName: "<firstname">,
			lastName: "<lastname>",
			email: "<email>",
			password: "<password>",
			role: <role>
		}
		
#####400 Bad Request - When request failed because of supplied information
- email already exists in system
- password was less than 6 characters
- passwords didn't match
- any field was empty
- server given non JSON body

#####405 Method Not Allowed - Server rejected the request method
- If the request method to this resource was not POST

#####500 Internal Server Error - When request failed because of a server error
- Database look up failed
- Unable to store the new user
- Unable to create the new session
- Unable to store the newly created session

___

####New User Signin
###**POST** to */api/v1/sessions*

#### Request Headers:
None required

#### Request Body:

	{
		email: "<email>",
		password: "<password>"
	}

#### Responses

#####200 OK - When user signin was successful
######Response Headers:
**Authorization:** Contains the current user's session id
######Response Body:

		{
			id: <id>,
			firstName: "<firstname">,
			lastName: "<lastname>",
			email: "<email>",
			password: "<password>",
			role: <role>
		}
		
#####400 Bad Request - When request failed because of supplied information
- server given non JSON body

#####401 Unauthorized - Sign in failed
- Missing credentials
- Bad credentials (the server will not distinguish between a bad email or bad password)

#####405 Method Not Allowed - Server rejected the request method
- If the request method to this resource was not POST

#####500 Internal Server Error - When request failed because of a server error
- Database look up failed
- Unable to create the new session
- Unable to store the newly created session

##Running Locally

Content Forthcoming (maybe...)