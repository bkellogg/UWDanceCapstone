// Simple web server that will listen for requests and then will execute git pull
// on the host machine. Used as an API endpoint for github webhooks that will effectively
// deploy code when a push is received on the origin repo.

package main

import (
	"net/http"
	"log"
	"os/exec"
)

func main() {
	addr := ":4100"
	http.HandleFunc("/update", UpdateHandler)
	log.Println("update server is listenting on https://" + addr + "...")
	log.Fatal(http.ListenAndServeTLS(addr, "/root/dasc.capstone.ischool.uw.edu-cert.pem",
		"/root/dasc.capstone.ischool.uw.edu-key.pem", nil))
}

func UpdateHandler(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("git", "pull", "origin", "master")
	cmd.Dir = "/static"
	output, err := cmd.Output()
	if err != nil {
		http.Error(w, "error executing command: " + err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write(output)
}