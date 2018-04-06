"use strict";

var signupForm = document.querySelector(".signup-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");
var password = document.getElementById("password-input");
var passwordConf = document.getElementById("passwordconf-input");

signupForm.addEventListener("submit", function (evt) {
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
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var message = document.createElement('p');
            message.textContent = " User " + data.firstName + " " + 
            data.lastName + " with the role of " + data.role.displayName + " successfully created.";
            document.body.appendChild(message);
            
            var newUserName = document.createElement('p');
            var newUserPassword = document.createElement('p');
            newUserName.textContent = "Username: " + data.email;
            newUserPassword.textContent += "Password: " + password.value;
            document.body.appendChild(newUserName);
            document.body.appendChild(newUserPassword);
            $('input').val('');
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})