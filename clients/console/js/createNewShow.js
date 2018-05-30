"use strict";
refreshLocalUser();

vex.defaultOptions.className = 'vex-theme-default'

var showForm = document.querySelector(".show-form");
var errorBox = document.querySelector(".js-error");
var showType = document.getElementById("showType");
var auditionName = document.getElementById("audition-name-input");
var getBuilding = document.getElementById("building-input");
var getRoom = document.getElementById("room-input");
var quarter = document.getElementById("quarter-name-input");

var showDate = document.getElementById("show-end-date");
var showTime = document.getElementById("show-end-time-input");

populateShowTypeOptions();
createDateTimes();

var showTypeNames = {};

// Create date and time inputs
function createDateTimes() {
    $("#show-end-date").datepicker();
    $("#show-end-time-input").timepicker({
        timeFormat: 'h:i a'
    });

    $("#audition-date").datepicker();
    $("#audition-time-input").timepicker({
        timeFormat: 'h:i a'
    });

}

function am_pm_to_hours(time) {
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/\s(.*)$/)[1];
    if (AMPM == "pm" && hours < 12) hours = hours + 12;
    if (AMPM == "am" && hours == 12) hours = hours - 12;
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;
    return (sHours +':'+sMinutes +':00');
}


showForm.addEventListener("submit", function (evt) {
    var auditionDate = document.getElementById("audition-date");
    var auditionTime = document.getElementById("audition-time-input");
    var convertedTime = am_pm_to_hours(auditionTime.value);
    console.log(convertedTime);
    var auditionDateFormatted = moment(auditionDate.value).format();
    var audDate = moment(auditionDateFormatted).format('YYYY-MM-DD');
    var finalAuditionTime =  audDate + "T" + convertedTime + "-07:00";
    evt.preventDefault();
    vex.dialog.confirm({
        message: 'Are you sure you want to create a new show with the below information?',
        input: [
            '<p>Concert: ' + showTypeNames[showType.value] + ' </p>',
            '<p>Show End Date: ' + moment(showDate.value).format('MMM. Do, YYYY') + '</p>',
            '<p>Show End Time: ' + showTime.value + '</p>',
            '<p>Audition Name: ' + auditionName.value + '</p>',
            '<p>Audition Location: ' + getBuilding.value + " " + getRoom.value + '</p>',
            '<p>Audition Date: ' + moment(auditionDate.value).format('MMM. Do, YYYY') + '</p>',
            '<p>Audition Time: ' + auditionTime.value + '</p>',
            '<p>Quarter: ' + quarter.value + '</p>'
        ].join(''),
        callback: function (response) {
            if (response) {
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
                        var showDateFormatted = moment(showDate.value).format();
                        showDate = moment(showDateFormatted).format('YYYY-MM-DD');
                        var showConvertedTime = am_pm_to_hours(showTime.value);
                        console.log(showConvertedTime);
                        var finalShowTime = showDate + "T" + showConvertedTime + "-07:00";
                        let createShow = {
                            "typeName": showType.value,
                            "endDate": finalShowTime,
                            "auditionID": data.id
                        };
                        makeRequest("shows", createShow, "POST", true)
                            .then((res) => {
                                if (res.ok) {
                                    vex.dialog.alert("Show successfully created!");
                                    return res.json();
                                };
                                return res.text().then((t) => Promise.reject(t));
                            })
                    })
                    .then((data) => {
                        $('input').val('');
                        $('.show-form')[0].reset();
                    })
                    .catch((err) => {
                        errorBox.textContent = err;
                    })
            } else {
                return
            }
        }
    });
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
            var options = '<option value=""><strong>Concert Type</strong></option>';
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