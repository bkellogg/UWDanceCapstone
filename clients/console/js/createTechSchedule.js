"use strict";
refreshLocalUser();
let auth = getAuth();

var timeOptions = ["6:00am", "6:30am", "7:00am", "7:30am", "8:00am", "8:30am", "9:00am", "9:30am", "10:00am", "10:30am", "11:00am", "11:30am", "12:00pm",
    "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm", "3:00pm", "3:30pm", "4:00pm", "4:30pm", "5:00pm", "5:30pm", "6:00pm", "6:30pm", "7:00pm", "7:30pm",
    "8:00pm", "8:30pm", "9:00pm", "9:30pm", "10:00pm", "10:30pm", "11:00pm", "11:30pm"];
var dateRange = [];
var startTime;
var endTime;
var fieldCount = 0;

populateConcertNames();
createDates();
createTimes();
populateFieldTypes();

// Pick date
function createDates() {
    $("#start").datepicker();
    $("#end").datepicker();
}

// Get Current Year
$(document).ready(function () {
    var date = new Date();
    var year = date.getFullYear();
    document.getElementById("today").value = year;
});

// Create Times
function createTimes() {
    startTime = '<option value="">Start Time</option>' +
        '<option value=""><strong></strong></option>';
    endTime = '<option value=""><strong>End Time</strong></option>' +
        '<option value=""><strong></strong></option>' +
        '<option value="Call"><strong>Call</strong></option>' +
        '<option value="Curtain"><strong>Curtain</strong></option>';
    $(timeOptions).each(function (index, value) {
        startTime += '<option value="' + value + '">' + value + '</option>';
        endTime += '<option value="' + value + '">' + value + '</option>';
    });
}

// Get to show types
function populateConcertNames() {
    fetch(API_URL_BASE + "shows/types?includeDeleted=false&auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>Concert Name</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.desc + '">' + value.desc + '</option>';
            });
            $('#concert-name-input').html(options);
        })
}

// Reset Form
function reset_form() {
    location.reload();
}

// populate field types
function populateFieldTypes() {
    var fieldOptions = '<option value="">Slot Type</option>' +
        '<option value="showing"><strong>Showing</strong></option>' +
        '<option value="spacing"><strong>Spacing</strong></option>' +
        '<option value="load-in"><strong>Load-In</strong></option>' +
        '<option value="notes"><strong>Notes</strong></option>' +
        '<option value="tech-rehearsal"><strong>Tech Rehearsal</strong></option>' +
        '<option value="dress-rehearsal"><strong>Dress Rehearsal</strong></option>' +
        '<option value="preview"><strong>Preview</strong></option>' +
        '<option value="performance"><strong>Performance</strong></option>' +
        '<option value="misc"><strong>Misc</strong></option>';
    $('.slot-type-input').html(fieldOptions);
}

// populate studio/crew types
function populate_studio_crew_types() {
    var options = '<option value="">Studio/Crew Type</option>' +
        '<option value="dance studio"><strong>Dance Studio</strong></option>' +
        '<option value="peter only studio theater"><strong>Peter Only Studio Theater</strong></option>' +
        '<option value="peter only"><strong>Peter Only</strong></option>' +
        '<option value="house crew"><strong>House Crew</strong></option>' +
        '<option value="show crew"><strong>Show Crew</strong></option>'
    $('.studio-crew-input').html(options);
}

// Get date ranges and populate form with options for all dates
$('#get-date-range').on('click', function (e) {
    if (dateRange.length != 0) {
        console.log("swany");
        var myNode = document.getElementById("tech-rehearsal-form-body");
        while (myNode.hasChildNodes()) {
            myNode.removeChild(myNode.lastChild);
        }
        dateRange = [];
    }
    var start = $("#start").datepicker("getDate");
    var end = $("#end").datepicker("getDate");
    var currentDate = new Date(start);
    while (currentDate <= end) {
        var curDay = $.datepicker.formatDate('D', currentDate);
        var curDate = $.datepicker.formatDate("d MM", currentDate);
        var dateAdd = curDay + ". " + curDate;
        dateRange.push(dateAdd);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    $("#start").datepicker('setDate', null)
    $("#end").datepicker('setDate', null)

    e.preventDefault();
    $.each(dateRange, function (index, value) {
        $("#tech-rehearsal-form-body").append('<li id="date" class="has-submenu"><a id ="temp" href="#">' + value + '</a></li>');
        $("#date").append('<ul class="schedule-options"></ul>');
        $("#date ul").append('<li><a href="#" onclick="add_slot(this)">New Slot +</a></li>');
        $("#date li").addClass('date-' + index);
        $("#date").attr("id", "date-" + index);
        initial_slots("date-" + index);
    })
    // toggle date list options
    $(".has-submenu ul").hide();
    $(".has-submenu > a").click(function (e) {
        e.preventDefault();
        $(this).next("ul").toggle();
    });
    $("#start").val('');
    $("#end").val('');
    $("#get-date-range").attr("disabled", "disabled");
});

//Generic add field
function add_slot(element) {
    var id = $(element).closest("li").attr("class");
    fieldCount++;
    $("#" + id).append('<div id="slot"><select class="startTime-input"><option id="slot-startTime-input value=""></option></select><select class="endTime-input"><option id="slot-endTime-input" value=""></option></select><select class="slot-type-input"><option id="slot-type-input value=""></option></select><input type="text" id="slot-name-input" placeholder="Name" /><input type="text" id="slot-desc-input" placeholder="Desc" /><select class="studio-crew-input"><option id="slot-studio-crew-input" value=""></option></select><a href="#" class="delete">Delete</a></div>');
    $('#slot .startTime-input').html(startTime);
    $('#slot .endTime-input').html(endTime);
    $('#slot').attr("id", "slot-" + fieldCount);
    populateFieldTypes();
    populate_studio_crew_types();

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault();
        $(this).parent('div').remove();
    })
}

//Create intial fields
function initial_slots(element) {
    for (var i = 0; i < 2; i++) {
        fieldCount++;
        $("#" + element).append('<div id="slot"><select class="startTime-input"><option id="slot-startTime-input value=""></option></select><select class="endTime-input"><option id="slot-endTime-input" value=""></option></select><select class="slot-type-input"><option id="slot-type-input value=""></option></select><input type="text" id="slot-name-input" placeholder="Name" /><input type="text" id="slot-desc-input" placeholder="Desc" /><select class="studio-crew-input"><option id="slot-studio-crew-input" value=""></option></select><a href="#" class="delete">Delete</a></div>');
        $('#slot .startTime-input').html(startTime);
        $('#slot .endTime-input').html(endTime);
        $('#slot').attr("id", "slot-" + fieldCount);
        populateFieldTypes();
        populate_studio_crew_types();
    }
    $("#" + element).on("click", ".delete", function (e) {
        e.preventDefault();
        $(this).parent('div').remove();
        fieldCount--;
    })
}

// Prevent 
$(function () {
    $("#start, #end").bind("change keyup",
        function () {
            if ($("#start").val() != "" && $("#end").val() != "")
                $(this).closest("form").find(":button").removeAttr("disabled");
            else
                $(this).closest("form").find(":button").attr("disabled", "disabled");
        });
});