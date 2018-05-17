"use strict";
refreshLocalUser();

var showForm = document.querySelector(".show-form");
var errorBox = document.querySelector(".js-error");
var showType = document.getElementById("showType");
var auditionName = document.getElementById("audition-name-input");
var getLocation = document.getElementById("location-input");
var quarter = document.getElementById("quarter-name-input");

populateShowTypeOptions();
createDateTimes();

// Create date and time inputs
function createDateTimes() {
    $("#show-end-date").datepicker();
    $("#show-end-time-input").timepicker();

    $("#audition-date").datepicker();
    $("#audition-time-input").timepicker();

}
/*

showForm.addEventListener("submit", function (evt) {
    var auditionDate = document.getElementById("audition-date");
    var auditionTime = document.getElementById("audition-time-input");
    //alert(auditionDate.value)
    //alert(auditionTime.value)
    //var fd = moment(auditionDate.value).format()
    //alert(fd);
    //alert(ft)
})

showForm2.addEventListener("submit", function (evt) {
    var auditionDate = $("#audition-date");
    var auditionTime = $(".audition-time-input");
    console.log(auditionDate);
    console.log(auditionTime);
    console.log("swany");
    var finalAuditionTime = moment(auditionTime).format();
    evt.preventDefault();
    var payload = {
        "name": auditionName.value,
        "location": getLocation.value,
        "time": finalAuditionTime,
        "quarter": quarter.value
    }
    makeRequest("aud$$$itions", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var showTime = $("#datetimepicker1").data("DateTimePicker").viewDate();
            var finalShowTime = moment(showTime).format();
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
            alert("Show Successfully Created" )
            $('input').val('');
            $('.show-form')[0].reset();
            return data;
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})
*/
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