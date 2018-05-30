"use strict";
vex.defaultOptions.className = 'vex-theme-default'

refreshLocalUser();

var newShowTypeForm = document.querySelector(".newShowType-form");
var errorBox = document.querySelector(".js-error");
var showTypeName = document.getElementById("showTypeName-input");
var description = document.getElementById("description-input");

var showTypes = [];

getShowTypes()

newShowTypeForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    vex.dialog.confirm({
        message: 'Are you sure you want to create a show type with the below information?',
        input: [
            '<p>Show Type: ' + showTypeName.value + ' </p>',
            '<p>Description: ' + description.value + '</p>',
        ].join(''),
        callback: function (response) {
            if (response) {
                var payload = {
                    "name": showTypeName.value,
                    "desc": description.value,
                };
                makeRequest("shows/types", payload, "POST", true)
                    .then((res) => {
                        if (res.ok) {
                            vex.dialog.alert({
                                message: "New show type successfully created.",
                                callback: function () {
                                    location.reload(true);
                                }
                            })
                            return res.json();
                        }
                        return res.text().then((t) => Promise.reject(t));
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


// get show types
function getShowTypes() {
    makeRequest("shows/types?includeDeleted-false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                var showInfo = [];
                showInfo.push(value.name);
                showInfo.push(value.desc)
                showTypes.push(showInfo)
            });
        })
        .then(() => {
            populateShowTypeTable();
        })
}

function populateShowTypeTable() {
    var rows = []
    rows.push('<tr>' +
        '<th>Show Name</th>' +
        '<th>Show Description</th></tr>')
    rows.push($.map(showTypes, function (value, index) {
        return '<tr><td>' + value[0] + '</td><td>' + value[1] + '</td></tr>';
    }));
    $('#show_type_info').html(rows.join(''));
}