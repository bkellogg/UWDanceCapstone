// Contains functionality needed between many files. Include before including page specific
// js.

"use strict";

const headerAuthorization = "Authorization";

const HOST = "stage.dance.uw.edu";
const API_URL_BASE = "https://" + HOST + "/api/v1/";

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
        headers.append(headerAuthorization, getAuth());
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
            alert("Your session has expired. Please sign in again.");
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



function uploadResume() {
    let file = document.querySelector("#resume-selector");
    let data = new FormData();
    data.append("resume", file.files[0]);

    let xhr = new XMLHttpRequest();

    let resumeResult = document.querySelector(".resume-result");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                resumeResult.textContent = xhr.responseText;
            } else {
                resumeResult.textContent = "ERROR: " + xhr.responseText;
            }
        }
    };

    xhr.open("POST", API_URL_BASE + "users/me/resume");
    xhr.setRequestHeader("Authorization", auth);
    xhr.setRequestHeader("ResumeFieldName", "resume");

    xhr.send(data);
}

function uploadPhoto() {
    let file = document.querySelector("#photo-selector");
    let data = new FormData();
    data.append("image", file.files[0]);

    let xhr = new XMLHttpRequest();

    let photoResult = document.querySelector(".photo-result");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                photoResult.textContent = xhr.responseText;
                getImage();
            } else {
                photoResult.textContent = "ERROR: " + xhr.responseText;
            }
        }
    };

    xhr.open("POST", API_URL_BASE+ "users/me/photo");
    xhr.setRequestHeader("Authorization", auth);
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
}

function getQueryParam(param) {
    let sPageURL = window.location.search.substring(1);
    let sURLVariables = sPageURL.split('&');
    for (let i = 0; i < sURLVariables.length; i++) {
        let sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == param) {
            return sParameterName[1];
        }
    }
}
