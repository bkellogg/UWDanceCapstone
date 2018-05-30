"use strict";
refreshLocalUser();

var signupForm = document.querySelector(".signup-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");
var password = document.getElementById("password-input");
var passwordConf = document.getElementById("passwordconf-input");
var role = document.getElementById("roleName");
var roleName = "";

var roleDisplayNames = {};
vex.defaultOptions.className = 'vex-theme-default'

populateRoleOptions();

signupForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    vex.dialog.confirm({
        message: 'Are you sure you want to create a new user with the below information?',
        input: [
            '<p>First Name: ' + fname.value + ' </p>',
            '<p>Last Name: ' + lname.value + '</p>',
            '<p>Email: ' + email.value + '</p>',
            '<p>Role: ' + roleDisplayNames[role.value] + '</p>',
        ].join(''),
        callback: function (response) {
            if (response) {
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
                        let setRole = {
                            "roleName": roleName
                        }
                        makeRequest("users/" + data.id + "/role", setRole, "PATCH", true)
                            .then((res) => {
                                if (res.ok) {
                                    vex.dialog.alert(" User: " + fname.value + " " + lname.value + " with the role of " + roleDisplayNames[role.value] + " successfully created.");
                                    $('input').val('');
                                    $('.signup-form')[0].reset();
                                    return;
                                }
                                return res.text().then((t) => Promise.reject(t));
                            })
                            .catch((err) => {
                                errorBox.textContent = err;
                            })
                    })
                    .catch((err) => {
                        errorBox.textContent = err;
                    })
            } else {
                return;
            }
        }
    });
})

// get roles
function populateRoleOptions() {
    makeRequest("roles", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>User Role</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.name + '">' + value.displayName + '</option>';
                roleDisplayNames[value.name] = value.displayName;
            });
            $('#roleName').html(options);
        })
}

