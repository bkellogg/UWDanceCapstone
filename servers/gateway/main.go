package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/patrickmn/go-cache"
)

const defaultPort = "80"

const (
	apiRoot          = "/v1/"
	apiOAuthSessions = apiRoot + "oauth/sessions/"
	apiOAuthCodes    = apiRoot + "oauth/codes/"
	apiOAuthProfile  = apiRoot + "oauth/profile"
)

const (
	headerContentType   = "Content-Type"
	headerAuthorization = "Authorization"
)

const (
	charsetUTF8         = "charset=utf-8"
	contentTypeJSON     = "application/json"
	contentTypeJSONUTF8 = contentTypeJSON + "; " + charsetUTF8
)

//HandlerContext provides context values for several handlers
type HandlerContext struct {
	oauthProviderConfigs map[string]*OAuthConfig
	profileCache         *cache.Cache
}

func getAddr() string {
	host := os.Getenv("HOST")
	if len(host) == 0 {
		log.Fatal("you must set a HOST environment variable")
	}
	port := os.Getenv("PORT")
	if len(port) == 0 {
		port = defaultPort
	}
	return host + ":" + port
}

//OAuthSessionsHandler handles requests to the apiOAuthSessions path.
//The last part of the path should be the OAuth provider name
//(e.g., "/v1/oauth/sessions/google").
func (ctx *HandlerContext) OAuthSessionsHandler(w http.ResponseWriter, r *http.Request) {
	//get the OAuth provider name from the last segment of the request path
	_, provider := path.Split(r.URL.Path)

	//get the OAuth configuration for that provider name
	config := ctx.oauthProviderConfigs[provider]
	if config == nil {
		http.Error(w, "no configuration for OAuth provider "+provider, http.StatusBadRequest)
		return
	}

	//generate a random state value and drop that as a cookie in the response
	//the OAuth provider will send this value back to us so that we can validate
	//the redirect came from the OAuth provider and not a CSRF attacker
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		http.Error(w, "error generating random state value "+err.Error(), http.StatusInternalServerError)
		return
	}
	state := base64.URLEncoding.EncodeToString(buf)
	http.SetCookie(w, &http.Cookie{
		Name:     "state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
	})

	//also set a cookie with the redirURL query string param
	//so that we know where to redirect back to after we
	//get the user's profile data
	http.SetCookie(w, &http.Cookie{
		Name:     "redir",
		Value:    r.FormValue("redir"),
		Path:     "/",
		HttpOnly: true,
	})

	//redirect the client to the OAuth authorization end point
	http.Redirect(w, r, config.GetAuthURL(state).String(), http.StatusSeeOther)
}

//OAuthCodesHandler handles requests to the apiOAuthCodes path
func (ctx *HandlerContext) OAuthCodesHandler(w http.ResponseWriter, r *http.Request) {
	//get the OAuth provider name from the last segment of the request path
	_, provider := path.Split(r.URL.Path)

	//get the OAuth configuration for that provider
	config := ctx.oauthProviderConfigs[provider]
	if config == nil {
		http.Error(w, "no configuration for OAuth provider "+provider, http.StatusBadRequest)
		return
	}

	//check for an "error" query string parameter, which
	//is set if the user denies authorization
	errorMsg := r.URL.Query().Get("error")
	if len(errorMsg) > 0 {
		http.Error(w, fmt.Sprintf("error signing in via %s: %s", provider, errorMsg), http.StatusUnauthorized)
		return
	}

	//get the authorization code included in the query string
	//this will be set by the OAuth provider after a successful
	//authentication and authorization
	authCode := r.URL.Query().Get("code")
	if len(authCode) == 0 {
		http.Error(w, "no authorization code in query string", http.StatusBadRequest)
		return
	}

	//verify that the state parameter in the URL matches the state
	//value we dropped in the cookie during the initial redirect
	stateParam := r.URL.Query().Get("state")
	stateCookie, err := r.Cookie("state")
	if err != nil {
		http.Error(w, "no state cookie in request: "+err.Error(), http.StatusBadRequest)
		return
	}

	//if the state query string param and the cookie don't match
	//this is probably a CSRF attack
	if stateParam != stateCookie.Value {
		http.Error(w, "OAuth state value didn't match", http.StatusBadRequest)
		return
	}

	//get profile using the auth code
	profile, err := config.GetProfile(authCode)
	if err != nil {
		http.Error(w, "error getting user profile: "+err.Error(), http.StatusInternalServerError)
		return
	}

	//get the redir cookie value, which is the URL
	//the client wanted us to redirect back to
	redirCookie, err := r.Cookie("redir")
	if err != nil {
		http.Error(w, "no redir cookie in request: "+err.Error(), http.StatusBadRequest)
		return
	}

	//set the profile in the cache using the state param as the key
	ctx.profileCache.Set(stateParam, profile, 0)

	//redirect back to where the client wanted us to go
	http.Redirect(w, r, redirCookie.Value, http.StatusSeeOther)
}

//OAuthProfileHandler handles requests for the current OAuthProfile
func (ctx *HandlerContext) OAuthProfileHandler(w http.ResponseWriter, r *http.Request) {
	//CORS headers to allow AJAX request from the client's domain
	w.Header().Add("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	//this header allows the client to send cookies via fetch() request
	w.Header().Add("Access-Control-Allow-Credentials", "true")

	//get the state cookie value
	stateCookie, err := r.Cookie("state")
	if err != nil {
		http.Error(w, "no state cookie in request: "+err.Error(), http.StatusBadRequest)
		return
	}

	//get the associated profile data from the cache
	entry, found := ctx.profileCache.Get(stateCookie.Value)
	if !found {
		http.Error(w, "no profile data in cache for state value", http.StatusBadRequest)
		return
	}
	//type-assert to a byte slice and write it to the client
	buf := entry.([]byte)
	w.Write(buf)
}

func main() {
	addr := getAddr()

	//create the HandlerContext
	hctx := &HandlerContext{
		oauthProviderConfigs: make(map[string]*OAuthConfig),
		profileCache:         cache.New(time.Minute*5, time.Minute),
	}

	//add a provider for Google
	hctx.oauthProviderConfigs["google"] = &OAuthConfig{
		ClientID:     os.Getenv("CLIENTID_GOOGLE"),
		ClientSecret: os.Getenv("CLIENTSECRET_GOOGLE"),
		Endpoint:     OAuthEndPointGoogle,
		RedirURL:     "http://" + addr + apiOAuthCodes + "google",
		Scopes:       []string{scopeGooglePlusLogin},
	}

	//add the handlers
	http.HandleFunc(apiOAuthSessions, hctx.OAuthSessionsHandler)
	http.HandleFunc(apiOAuthCodes, hctx.OAuthCodesHandler)
	http.HandleFunc(apiOAuthProfile, hctx.OAuthProfileHandler)

	fmt.Printf("listening at %s...\n", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
