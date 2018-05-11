"use strict";

refreshLocalUser();

var page = 1;
var allUsers = [];
var done = false;


getUsers();

function getUsers() {
    makeRequest("users/all?page=" + page + "&includeInactive=false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.users).each(function (index, value) {
                var user = [];
                user.push(value.id);
                user.push(value.firstName);
                user.push(value.lastName);
                user.push(value.email);
                user.push(value.role.displayName);
                user.push('<a href="userProfile.html?user=' + value.id + '">Profile</a>');
                allUsers.push(user);
            });
        })
        .then(() => {
            populateUserTable(allUsers);
        })
}

function populateUserTable() {
    var table = $('#users_table').DataTable({
        "data": allUsers
    });
}
