"use strict";

const status = document.querySelector("#users")
let auth = getAuth();

refreshLocalUser();


$(document).ready(function () {
    $('#users_table').dataTable({
        "ajax": {
            "url": API_URL_BASE + "users/all?page=1&includeInactive=true&auth=" + auth,
            "dataSrc": "users"
        },
        "columns": [
            { "data": "id"},
            { "data": "firstName" },
            { "data": "lastName" },
            { "data": "role.displayName" },
            { "data": "email" },
            { "data": "active" }
        ]
    });
});
