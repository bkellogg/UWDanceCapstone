"use strict";
refreshLocalUser();
let auth = getAuth();

var signupForm = document.querySelector(".signup-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");
var password = document.getElementById("password-input");
var passwordConf = document.getElementById("passwordconf-input");
var role = document.getElementById("roleName");
var roleName = "";


populateRoleOptions();


signupForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "firstName": fname.value,
        "lastName": lname.value,
        "email": email.value,
        "password": password.value,
        "passwordConf": passwordConf.value
    };
    roleName = role.value
    makeRequest("users", payload, "POST", false)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            let payload2 = {
                "roleName": roleName
            }
            makeRequest("users/" + data.id + "/role", payload2, "PATCH", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return res.text().then((t) => Promise.reject(t));
                })
        })
        .then((data) => {
            var message = document.createElement("p");
            message.textContent = " User: " + fname.value + " " +
                lname.value + " with the role of " + roleName + " successfully created.";
            document.body.appendChild(message);
            $('input').val('');
            $('.signup-form')[0].reset();
            return data;
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})

// get roles
function populateRoleOptions() {
    fetch(API_URL_BASE + "roles?auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>Roles</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.name + '">' + value.displayName + '</option>';
            });
            $('#roleName').html(options);
        })

}