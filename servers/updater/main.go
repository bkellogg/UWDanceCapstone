// Simple web server that will listen for requests and then will execute git pull
// on the host machine. Used as an API endpoint for GitHub webhooks that will effectively
// deploy code when a push is received on the origin repo.

package main

import (
	"crypto/hmac"
	"crypto/sha1"
	"crypto/tls"
	"encoding/hex"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

const githubSecretHeader = "X-Hub-Signature"

// GithubHookSecret is the unhashed github webhook secret
// that will be used to confirm that the request originated from
// Github and not another source.
type GithubHookSecret string

func main() {

	secret := os.Getenv("GITHUB_HOOK_SECRET")
	if len(secret) == 0 {
		log.Fatal("GITHUB_HOOK_SECRET needs to be set")
	}

	addr := ":4100"

	mux := http.NewServeMux()
	mux.HandleFunc("/update", GithubHookSecret(secret).UpdateHandler)

	// define an http server with specific settings
	// that are safer when using the go http server
	// directly on the web.
	server := http.Server{
		Addr:    addr,
		Handler: mux,
		TLSConfig: &tls.Config{
			PreferServerCipherSuites: true,
			CurvePreferences: []tls.CurveID{
				tls.CurveP256,
				tls.X25519,
			},
			MinVersion: tls.VersionTLS12,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			},
		},
		ReadHeaderTimeout: time.Second * 5,
		ReadTimeout:       time.Second * 5,
		WriteTimeout:      time.Second * 10,
		IdleTimeout:       time.Second * 120,
	}

	log.Println("update server is listenting on https://" + addr + "...")
	log.Fatal(server.ListenAndServeTLS("/certs/dance/stage_fullchain.pem", "/certs/dance/stage.dance.uw.edu-key.pem"))
}

// UpdateHandler defines a handler function that pulls from master on the current
// git repo. Verifies the GithubHookSecret is valid.
func (ghs GithubHookSecret) UpdateHandler(w http.ResponseWriter, r *http.Request) {
	secretHash := r.Header.Get(githubSecretHeader)
	if len(secretHash) == 0 {
		http.Error(w, "unauthorized update request", http.StatusUnauthorized)
		log.Printf("received request with no %s header\n", githubSecretHeader)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "error reading body: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if !verifySignature([]byte(secretHash), []byte(ghs), body) {
		http.Error(w, "unauthorized update request", http.StatusUnauthorized)
		log.Printf("received request with invalid secret hash\n")
		return
	}

	cmd := exec.Command("git", "pull", "origin", "master")
	cmd.Dir = "/mnt/volume-sfo2-01/content/static"
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "error executing command: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(output)
}

// verifySignature verifies the given signature, secret, and body
// and returns true if it is valid, false if otherwise.
func verifySignature(signature, secret, body []byte) bool {
	const signaturePrefix = "sha1="
	const signatureLength = 45

	if len(signature) != signatureLength || !strings.HasPrefix(string(signature), signaturePrefix) {
		return false
	}

	h := hmac.New(sha1.New, secret)
	h.Write(body)
	computed := h.Sum(nil)

	actual := make([]byte, 20)
	hex.Decode(actual, signature[len(signaturePrefix):])

	return hmac.Equal(computed, actual)
}
