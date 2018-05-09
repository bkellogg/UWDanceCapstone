"use strict";
refreshLocalUser();
let auth = getAuth();

var showForm = document.querySelector(".show-form");
var errorBox = document.querySelector(".js-error");
var showType = document.getElementById("showType");
var auditionName = document.getElementById("audition-name-input");
var getLocation = document.getElementById("location-input");
var quarter = document.getElementById("quarter-name-input");
 

populateShowTypeOptions();


showForm.addEventListener("submit", function (evt) {
    var auditionTime = $("#datetimepicker2").find("input").val();
    evt.preventDefault();
    var payload = {
        "name": auditionName.value,
        "location": getLocation.value,
        "time": auditionTime,
        "quarter": quarter.value
    }
    console.log(payload);
    makeRequest("//", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            location.reload();
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})

// get show types
function populateShowTypeOptions() {
    makeRequest("shows/types?includeDeleted=false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>Show Type</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.name + '">' + value.desc + '</option>';
            });
            $('#showType').html(options);
        })

}

// Add datetimepicker
$(function () {
    $('#datetimepicker1').datetimepicker({
        //format: 'DD-MM-YYYY HH:mm:ss'
    });
    $('#datetimepicker2').datetimepicker();
});