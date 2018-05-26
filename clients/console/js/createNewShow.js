"use strict";
refreshLocalUser();

var showForm = document.querySelector(".show-form");
var errorBox = document.querySelector(".js-error");
var showType = document.getElementById("showType");
var auditionName = document.getElementById("audition-name-input");
var getBuilding = document.getElementById("building-input");
var getRoom = document.getElementById("room-input");
var quarter = document.getElementById("quarter-name-input");

populateShowTypeOptions();
createDateTimes();

var showTypeNames = {};

// Create date and time inputs
function createDateTimes() {
    $("#show-end-date").datepicker();
    $("#show-end-time-input").timepicker({
        timeFormat: 'H:i:s'
    });

    $("#audition-date").datepicker();
    $("#audition-time-input").timepicker({
        timeFormat: 'H:i:s'
    });

}


showForm.addEventListener("submit", function (evt) {
    var auditionDate = document.getElementById("audition-date");
    var auditionTime = document.getElementById("audition-time-input");
    var auditionDateFormatted = moment(auditionDate.value).format();
    var audDate = moment(auditionDateFormatted).format('YYYY-MM-DD');
    var finalAuditionTime = audDate + "T" + auditionTime.value + "-07:00";
    evt.preventDefault();
    var payload = {
        "name": auditionName.value,
        "location": getBuilding.value + " " + getRoom.value,
        "time": finalAuditionTime,
        "quarter": quarter.value
    }
    makeRequest("auditions", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var showDate = document.getElementById("show-end-date");
            var showTime = document.getElementById("show-end-time-input");
            var showDateFormatted = moment(showDate.value).format();
            var showDate = moment(showDateFormatted).format('YYYY-MM-DD');
            var finalShowTime = showDate + "T" + showTime.value + "-07:00";
            let createShow = {
                "typeName": showType.value,
                "endDate": finalShowTime,
                "auditionID": data.id
            };
            makeRequest("shows", createShow, "POST", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    };
                    return res.text().then((t) => Promise.reject(t));
                })
        })
        .then((data) => {
            alert("Show Successfully Created")
            $('input').val('');
            $('.show-form')[0].reset();
            return data;
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
                showTypeNames[value.name] = value.desc;
            });
            $('#showType').html(options);
        })

}

$(document).ready(function () {
    $("#showType").on("change", function () {
        var defaultAudName = showTypeNames[$(this).val()]
        $("#audition-name-input").val(defaultAudName + " Audition");
    })
});