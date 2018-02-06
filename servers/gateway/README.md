# Current APIs

Base URL: **dasc.capstone.ischool.uw.edu**

## New User Signup
#### **POST** to */api/v1/users*

### Request Headers:
None required

### Request Body:

	{
		firstName: "<firstname">,
		lastName: "<lastname>",
		email: "<email>",
		password: "<password>",
		passwordConf: "<passwordConf>"
	}

### Responses

#### 201 Created - When user signup was successful
##### Response Headers:
- **Authorization:** Contains the current user's session id
##### Response Body:

		{
			id: <id>,
			firstName: "<firstname">,
			lastName: "<lastname>",
			email: "<email>",
			password: "<password>",
			role: <role>
		}
		
##### 400 Bad Request - When request failed because of supplied information
- email already exists in system
- password was less than 6 characters
- passwords didn't match
- any field was empty
- server given non JSON body

##### 405 Method Not Allowed - Server rejected the request method
- If the request method to this resource was not POST

##### 500 Internal Server Error - When request failed because of a server error
- Database look up failed
- Unable to store the new user
- Unable to create the new session
- Unable to store the newly created session

___

## New User Signin
#### **POST** to */api/v1/sessions*

#### Request Headers:
None required

#### Request Body:

	{
		email: "<email>",
		password: "<password>"
	}

### Responses

#### 200 OK - When user signin was successful
##### Response Headers:
- **Authorization:** Contains the current user's session id
##### Response Body:

		{
			id: <id>,
			firstName: "<firstname">,
			lastName: "<lastname>",
			email: "<email>",
			password: "<password>",
			role: <role>
		}
		
##### 400 Bad Request - When request failed because of supplied information
- server given non JSON body

##### 401 Unauthenticated - Sign in failed
- Missing credentials
- Bad credentials (the server will not distinguish between a bad email or bad password)

##### 405 Method Not Allowed - Server rejected the request method
- If the request method to this resource was not POST

##### 500 Internal Server Error - When request failed because of a server error
- Database look up failed
- Unable to create the new session
- Unable to store the newly created session

## The "users" Resource
### All Users
#### **GET** to */api/v1/users/all*
- Authorization Header required
- Returns a JSON array of every user in the system
- 401 if no auth provided
- 403 if current user does not have permission on this resource
- Will be paginated in the future

### Specific User
#### Get Specific User
#### **GET** to */api/v1/users/{userid}*
- Authorization Header required
- Can get current user with the "me" userid keyword
- Returns a JSON object of the user
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Delete Specific User
#### **DELETE** to */api/v1/users/{userid}*
- Authorization Header required
- Can delete current user with the "me" userid keyword
- Returns a text confirmation of the deletion
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Auditions a Specific User is in
#### **GET** to */api/v1/users/{userid}/auditions*
- Authorization Header required
- Supports "me" userid keyword
- Returns an array of all auditions the user is in
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Shows a Specific User is in
#### **GET** to */api/v1/users/{userid}/shows*
- Authorization Header required
- Supports "me" userid keyword
- Returns an array of all shows the user is in
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Pieces a Specific User is in
#### **GET** to */api/v1/users/{userid}/pieces*
- Authorization Header required
- Supports "me" userid keyword
- Returns an array of all pieces the user is in
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Add User to Piece
#### **LINK** to */api/v1/users/{userid}/pieces/{pieceid}*
- Authorization Header required
- Supports "me" userid keyword
- Returns a text confirmation of success
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Remove User from Piece
#### **UNLINK** to */api/v1/users/{userid}/pieces/{pieceid}*
- Authorization Header required
- Supports "me" userid keyword
- Returns a text confirmation of success
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

## The "auditions" Resource
#### Create New Audition
#### **POST** to */api/v1/auditions*
- Authorization Header required
- Returns the new audition with extra populated fields
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

REQUEST BODY:
	
	{
		"name": "<audition name>",
		"date": "<audition date>",
		"time": "<audition time>",
		"location": "<audition location>",
		"quarter": "<audition quarter>",
		"year": "<audition year>"
	}

#### Get Specific Audition
#### **GET** to */api/v1/auditions/{auditionid}*
- Authorization Header required
- Returns a JSON object of the audition
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Delete Specific Audition
#### **DELETE** to */api/v1/auditions/{auditionid}*
- Authorization Header required
- Returns a text confirmation of the success
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Users in Audition
#### **GET** to */api/v1/auditions/{auditionid}/users*
- Authorization Header required
- Returns an array of all users in the audition
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Shows in Audition
#### **GET** to */api/v1/auditions/{auditionid}/shows*
- Authorization Header required
- Returns an array of all shows in the audition
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Pieces in Audition
#### **GET** to */api/v1/auditions/{auditionid}/pieces*
- Authorization Header required
- Returns an array of all pieces in the audition
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

## The "shows" resource
#### Create New Show
#### **POST** to */api/v1/shows*
- Authorization Header required
- Returns the new show with extra populated fields
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

REQUEST BODY:
	
	{
		"name": "<show name>",
		"auditionID": <audition id> // the ID of the audition this piece is in AS AN INT
	}

#### Get Specific Show
#### **GET** to */api/v1/shows/{showid}*
- Authorization Header required
- Returns a JSON object of the show
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Delete Specific Show
#### **DELETE** to */api/v1/shows/{showid}*
- Authorization Header required
- Returns a text confirmation of the success
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Users in Show
#### **GET** to */api/v1/shows/{showid}/users*
- Authorization Header required
- Returns an array of all users in the show
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Pieces in Show
#### **GET** to */api/v1/shows/{showid}/pieces*
- Authorization Header required
- Returns an array of all pieces in the show
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

## The "pieces" Resource
#### Create New Piece
#### **POST** to */api/v1/pieces*
- Authorization Header required
- Returns the new piece with extra populated fields
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

REQUEST BODY:
	
	{
		"name": "<piece name>",
		"showID": <show id> // the ID of the show this piece is in AS AN INT
	}

#### Get Specific Piece
#### **GET** to */api/v1/pieces/{pieceid}*
- Authorization Header required
- Returns a JSON object of the piece
- 400 if unparsable id is given
- 401 if not authenticated
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Delete Specific Piece
#### **DELETE** to */api/v1/pieces/{pieceid}*
- Authorization Header required
- Returns a text confirmation of the success
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist

#### Get All Users in piece
#### **GET** to */api/v1/pieces/{pieceid}/users*
- Authorization Header required
- Returns an array of all users in the piece
- 400 if unparsable id is given
- 401 if not authenticatd
- 403 if current user does not have permission on this resource
- 404 if requested user does not exist
___

## Running Locally

Content Forthcoming (maybe...)