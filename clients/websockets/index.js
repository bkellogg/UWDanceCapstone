"use strict";

//change this if you run your server on a different port number
const status = document.querySelector("#status")
const notifications = document.querySelector("#notifications");
const errors = document.querySelector("#errors");
const host = "dasc.capstone.ischool.uw.edu"

const loginForm = document.querySelector("#login-ws-form");
if (!loginForm) {
    console.error("login form not found");
}

let auth = localStorage.getItem("auth");
let websocket;
if (auth) {
    websocket = new WebSocket("wss://" + host + "/api/v1/updates?auth=" + auth);
    addEventListenersToWS();
}

loginForm.addEventListener("submit", (evt) => {
    evt.preventDefault();

    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;

    fetch("https://" + host + "/api/v1/sessions", {
        body: JSON.stringify({"email": email, "password": password}),
        method: "POST",
        headers: {"Content-Type": "application/json"}
    })
    .then((res) => {
        if (res.ok) {
            auth = res.headers.get("Authorization");
            return res.json();
        }
        return res.text().then((t) => Promise.reject());
    })
    .then((data) => {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("auth", auth);
        websocket = new WebSocket("wss://" + host + "/api/v1/updates?auth=" + auth);
        addEventListenersToWS();
    })
    .catch((err) => {
        console.error(err);
        alert(err);
    });
});

function addEventListenersToWS() {
    websocket.addEventListener("error", function(err) {
        errors.textContent = err.message;
    });
    websocket.addEventListener("open", function() {
        status.textContent = "Connected";
    });
    websocket.addEventListener("close", function() {
        status.textContent = "Closed";
    });
    websocket.addEventListener("message", function(event) {
        let data = JSON.parse(event.data);
    
        let messageWrapper = document.createElement("div");
        messageWrapper.classList.add("message-wrapper");

        messageWrapper.textContent = printObject(data.data);
        notifications.appendChild(messageWrapper);
    });
}

function printObject(o, indent = 0) {
    var out = '';
    if (typeof indent === 'undefined') {
        indent = 0;
    }
    for (var p in o) {
        if (o.hasOwnProperty(p)) {
            var val = o[p];
            out += new Array(4 * indent + 1).join(' ') + p + ': ';
            if (typeof val === 'object') {
                if (val instanceof Date) {
                    out += 'Date "' + val.toISOString() + '"';
                } else {
                    out += '{\n' + printObject(val, indent + 1) + new Array(4 * indent + 1).join(' ') + '}';
                }
            } else if (typeof val === 'function') {

            } else {
                out += '"' + val + '"';
            }
            out += ',\n';
        }
    }
    return out;
}