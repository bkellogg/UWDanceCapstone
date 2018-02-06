"use strict";

var signupForm = document.querySelector(".signup-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");
var password = document.getElementById("password-input");
var passwordConf = document.getElementById("passwordconf-input");

signupForm.addEventListener("submit", function(evt) {
    evt.preventDefault();
    var payload = {
        "firstName": fname.value,
        "lastName": lname.value,
        "email": email.value,
        "password": password.value,
        "passwordConf": passwordConf.value
    };
    makeRequest("users", payload, "POST", false)
    .then((res) => {
        if (res.ok) {
            saveAuth(res.headers.get(headerAuthorization));
            return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        setLocalUser(JSON.stringify(data));
        window.location.href = "console.html";
    })
    .catch((err) => {
        errorBox.textContent = err;
    })
})