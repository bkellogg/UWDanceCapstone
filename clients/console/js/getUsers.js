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
                user.push("");
                allUsers.push(user);
            });
        })
        .then(() => {
            populateUserTable(allUsers);
        })
}

function populateUserTable(allUsers) {
    var table = $('#users_table').DataTable({
        "data": allUsers,
        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": "<button href='userProfile.html'>Click!</button>"
        }]
    });

    $('#users_table tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        window.location.href = "userProfile.html"
    });
}
