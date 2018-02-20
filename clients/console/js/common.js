// Contains functionality needed between many files. Include before including page specific
// js.

"use strict";

const headerAuthorization = "Authorization";

const API_URL_BASE = "https://dasc.capstone.ischool.uw.edu/api/v1/";

function saveAuth(auth) {
    localStorage.setItem("auth", auth);
}

function setLocalUser(user) {
    localStorage.setItem("user", user);
}

function getLocalUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function getAuth() {
    return localStorage.getItem("auth");
}

function clearAuthAndUser() {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
}

function makeRequest(resource, payload = "", method = "GET", useAuth = false) {
    var reqURL = API_URL_BASE + resource;
    payload = JSON.stringify(payload)
    var headers = new Headers();
    if (useAuth) {
        headers.append(headerAuthorization, getAuth())
    }
    headers.append("Content-Type", "application/json");
    headers.append("Content-Length", payload.length.toString())
    var req = {
        method: method,
        headers: headers
    }
    if (method != "GET") {
        req.body = payload;
    }
    return fetch(reqURL, req);
}

function refreshLocalUser() {
    return makeRequest("users/me", {}, "GET", true)
    .then((res) => {
        if (res.ok) {
            return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        setLocalUser(JSON.stringify(data));
    })
    .catch((err) => {
        console.error(err);
        alert(err);
        signout();
    })
}

function signout() {
    makeRequest("sessions", {}, "DELETE", true);
    // no need to handle the respose here. If it fails, you can treat the auth and
    // user as invalid and clear their local storage entries anyway.
    clearAuthAndUser();
    window.location.href = "index.html";
}