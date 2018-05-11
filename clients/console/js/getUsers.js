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
                user.push('<a target="_blank" href="userProfile.html?user=' + value.id + '">Profile</a>');
                allUsers.push(user);
            });
        })
        .then(() => {
            populateUserTable(allUsers);
        })
}
 
function populateUserTable(allUsers) {
    var table = $('#users_table').DataTable({
        "data": allUsers
    });

    $('#users_table tbody').on('click', 'button', function () {
        var data = table.row($(this).parents('tr')).data();
        console.log(data);
        window.location.href = "userProfile.html"
    });
}
