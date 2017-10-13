package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strings"
)

//OAuthEndPoint represents the URLs an OAuth
//provider exposes as end points
type OAuthEndPoint struct {
	AuthURL    string
	TokenURL   string
	ProfileURL string
}

//OAuthConfig represents the configuration
//for a particular OAuth provider
type OAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirURL     string
	Scopes       []string
	Endpoint     OAuthEndPoint
}

//OAuthTokens represents the tokens returned
//by an OAuth provider
type OAuthTokens struct {
	AccessToken  string `json:"access_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
	RefreshToken string `json:"refresh_token"`
}

//GetAuthURL returns the URL the client should be redirected
//to for the OAuth confirmation
func (oac *OAuthConfig) GetAuthURL(state string) *url.URL {
	urlAuth, err := url.Parse(oac.Endpoint.AuthURL)
	if err != nil {
		panic("error parsing endpoint AuthURL!")
	}
	qs := urlAuth.Query()
	qs.Add("response_type", "code")
	qs.Add("client_id", oac.ClientID)
	qs.Add("scope", strings.Join(oac.Scopes, " "))
	qs.Add("redirect_uri", oac.RedirURL)
	qs.Add("state", state)
	qs.Add("prompt", "consent")
	qs.Add("access_type", "offline")
	qs.Add("hd", "uw.edu")
	urlAuth.RawQuery = qs.Encode()

	return urlAuth
}

//GetProfile returns the user's profile data as returned by
//the OAuth provider
func (oac *OAuthConfig) GetProfile(authCode string) ([]byte, error) {
	//get token using code
	tokens, err := oac.GetTokens(authCode)
	if err != nil {
		return nil, err
	}

	//get the profile
	req, _ := http.NewRequest("GET", oac.Endpoint.ProfileURL, nil)
	req.Header.Add(headerAuthorization, fmt.Sprintf("%s %s", tokens.TokenType, tokens.AccessToken))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error getting profile: %v", err)
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading profile response body: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error getting profile: %s", string(respBody))
	}
	return respBody, nil
}

//GetTokens returns the OAuth tokens given the auth code returned
//from the OAuth provider
func (oac *OAuthConfig) GetTokens(authCode string) (*OAuthTokens, error) {
	params := make(url.Values)
	params.Add("code", authCode)
	params.Add("client_id", oac.ClientID)
	params.Add("client_secret", oac.ClientSecret)
	params.Add("redirect_uri", oac.RedirURL)
	params.Add("grant_type", "authorization_code")

	resp, err := http.PostForm(oac.Endpoint.TokenURL, params)
	if err != nil {
		return nil, fmt.Errorf("error getting tokens: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		io.Copy(os.Stderr, resp.Body)
		return nil, fmt.Errorf("error getting tokens: %s", resp.Status)
	}

	decoder := json.NewDecoder(resp.Body)
	tokens := &OAuthTokens{}
	if err := decoder.Decode(tokens); err != nil {
		return nil, err
	}

	return tokens, nil
}
