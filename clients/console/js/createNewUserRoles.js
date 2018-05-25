"use strict";

refreshLocalUser();

var newRoleForm = document.querySelector(".newRole-form");
var errorBox = document.querySelector(".js-error");
var roleName = document.getElementById("roleName-input");
var displayName = document.getElementById("displayName-input");
var level = document.getElementById("level-input");

var roles = [];

getRoles();

newRoleForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "name": roleName.value,
        "displayName": displayName.value,
        "level": Number(level.value),
    };
    makeRequest("roles", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            alert("New user role successfully created.");
            location.reload();
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})


// get roles
function getRoles() {
    makeRequest("roles", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                var roleInfo = [];
                roleInfo.push(value.name);
                roleInfo.push(value.displayName);
                roleInfo.push(value.level);
                roles.push(roleInfo);
            });
        })
        .then(() => {
            populateRoleTable();
        })
}

function populateRoleTable() {
    var rows = []
    rows.push('<tr>' +
        '<th>Role Name</th>' +
        '<th>Role Display Name</th>' +
        '<th>Permission Level</th></tr>')
    rows.push($.map(roles, function (value, index) {
        return '<tr><td>' + value[0] + '</td><td>' + value[1] + '</td><td>' + value[2] + '</td></tr>';
    }));
    $('#role_info').html(rows.join(''));
}