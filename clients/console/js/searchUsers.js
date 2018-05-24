"use strict";

refreshLocalUser();

let searchForm = document.querySelector(".search-users-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");
var noUsersArea = document.getElementById("no-users-found");
var noUsersMessage = document.createElement("p");

var allSearchedUsers = [];

searchForm.addEventListener("submit", function (evt) {
    allSearchedUsers = [];
    evt.preventDefault();
    makeRequest("users/all?email=" + email.value + "&fname=" + fname.value + "&lname=" + lname.value, {}, "GET", true)
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
                user.push('<a href="userProfile.html?user=' + value.id + '"" target="_blank">Profile</a>');
                allSearchedUsers.push(user);
            });
        })
        .then(() => {
            populateSearchedUsersTable();
            $('input').val('');
            $('.search-users-form')[0].reset();
            document.getElementById("search-submit").disabled = true;
        })
})

function populateSearchedUsersTable() {
    var rows = []
    rows.push('<tr data-sort-method="none">' +
        '<th>ID</th>' +
        '<th>First Name</th>' +
        '<th>Last Name</th>' +
        '<th>Email</th>' +
        '<th>Role</th>' +
        '<th>View Profile</th></tr>')
    rows.push($.map(allSearchedUsers, function (value, index) {
        return '<tr><td>' + value[0] + '</td><td>' + value[1] +
            '</td><td>' + value[2] + '</td><td>' + value[3] +
            '</td><td>' + value[4] + '</td><td>' + value[5] +
            '</td><td></tr>';
    }));
    $('#users_table').html(rows.join(''));
    new Tablesort(document.getElementById('users_table'));
    $('#next').hide();
    $('#previous').hide();
    if (allSearchedUsers.length === 0) {
        noUsersMessage.textContent = "No users found matching your search criteria."
        noUsersArea.appendChild(noUsersMessage);
    }
    
}
