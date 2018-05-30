"use strict";

var signinForm = document.querySelector(".signin-form");
var errorBox = document.querySelector(".js-error");
var email = document.getElementById("email-input");
var password = document.getElementById("password-input");

checkForUser();
setLink();

signinForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "email": email.value,
        "password": password.value
    };
    makeRequest("sessions", payload, "POST", false)
        .then((res) => {
            if (res.ok) {
                saveAuth(res.headers.get(headerAuthorization));
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            if (data.role.level == 100) {
                setLocalUser(JSON.stringify(data));
                window.location.href = "console.html";
            } else {
                var message = document.createElement('p');
                message.textContent = "Your account does not have the proper role to access this console. Please contact your system admin if you have any questions.";
                document.body.appendChild(message);
                $('#email-input, #password-input').val('');
            }
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})


function checkForUser() {
    makeRequest("users/me", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return;
        })
        .then((data) => {
            if (!data || !data.role) {
                return;
            }
            if (data.role.level === 100) {
                window.location.href = "console.html";
            }
        });
}

function setLink() {
    var a = document.getElementById('link-dance-page');
    a.href = API_URL_BASE
}
