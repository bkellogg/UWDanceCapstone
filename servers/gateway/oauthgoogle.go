package main

const scopeGooglePlusLogin = "https://www.googleapis.com/auth/plus.login"

//OAuthEndPointGoogle contains the OAuth end-point URLs for Google
var OAuthEndPointGoogle = OAuthEndPoint{
	AuthURL:    "https://accounts.google.com/o/oauth2/v2/auth",
	TokenURL:   "https://www.googleapis.com/oauth2/v4/token",
	ProfileURL: "https://www.googleapis.com/plus/v1/people/me",
}
