"use strict";

var resetform = document.querySelector(".reset-form");
var passwordInput = document.querySelector("#password-input");
var passwordConfInput = document.querySelector("#passwordconf-input");

var missingParamsWarning = document.querySelector(".missing-parameters-warning");
var formFillError = document.querySelector(".formfill-error");
var reqResult = document.querySelector(".req-result");

var email = getParameterByName("email");
var token = getParameterByName("token");

if (!email || !token) {
    console.warn("missing email or token; reset impossible");
    missingParamsWarning.textContent = "missing email or token; reset impossible";
} else {
    console.log("email: " + email);
    console.log("token: " + token);
}

resetform.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }
    var url = "https://dasc.capstone.ischool.uw.edu/api/v1/passwordreset?email=" + email;
    var payload = {
        "token": token,
        "password": passwordInput.value,
        "passwordConf": passwordConfInput.value
    }
    var headers = new Headers();
    headers.append("Content-Type", "application/json; charset=utf-8");
    fetch(url, {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(payload)
    })
        .then(function(res) {
            if (res.ok) {
                return res.text();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(function(text) {
            reqResult.textContent = text;
        })
        .catch(function(error) {
            reqResult.textContent = "ERROR: " + error;
        });
});

function validateForm() {
    var error;
    if (passwordInput.value < 6) {
        error = "Password must be at least 6 characters.";
    } else if (passwordInput.value !== passwordConfInput.value) {
        error = "Passwords do not match."
    }
    if (error) {
        formFillError.textContent = error;
        return false;
    }
    formFillError.textContent = "";
    return true;
}

// gets the value of the parameter of 'name'.
function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2]);
}