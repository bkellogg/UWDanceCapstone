"use strict";

let nameLoc = document.querySelector(".user-name-loc");
let bioContent = document.querySelector(".bio-content");
let imgLoc = document.querySelector(".image-loc");

var roleChangeForm = document.querySelector(".roleChange-form");
var errorBox = document.querySelector(".js-error");
var role = document.getElementById("roleName");

let userID = getQueryParam("user");
if (!userID) {
    // TODO HANDLE ME ===========
    console.error("TODO: HANLDE THIS CASE: no user to get");
}

populateRoleOptions();
getResume();

let user;
makeRequest("users/" + userID, {}, "GET", true)
    .then((res) => {
        if (res.ok) {
            return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        nameLoc.textContent = data.firstName + " " + data.lastName + " (" + data.role.displayName + ")";
        bioContent.textContent = data.bio;
    })
    .catch((error) => {
        console.error(error);
    });


let image = document.querySelector(".profile-picture");
if (!image) {
    image = document.createElement("img");
    image.classList.add("profile-picture");
    imgLoc.appendChild(image);
}
makeRequest("users/" + userID + "/photo", {}, "GET", true)
    .then((res) => {
        if (res.ok) {
            return res.blob();
        }
        return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        image.src = URL.createObjectURL(data);
    })
    .catch((err) => {
        let p = document.createElement("p");
        p.textContent = "image unavailable: " + err;
        content.appendChild(p);
    });


function getResume() {
    makeRequest("users/" + userID + "/resume", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.blob();
            }
            if(res.status != 200) {
                $("#user-resume").hide();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var link = URL.createObjectURL(data);
            $("#user-resume").attr("href", link);
        })
        .catch((err) => {
            let m = document.createElement("p");
            m.textContent = "resume unavailable: " + err;
            content.appendChild(m);
        });
}

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
            });
            $('#roleName').html(options);
        })

}

roleChangeForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    let setRole = {
        "roleName": role.value
    }
    makeRequest("users/" + userID + "/role", setRole, "PATCH", true)
        .then((data) => {
            alert("Role successfully changed to " + role.value + ".");
            location.reload();
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})