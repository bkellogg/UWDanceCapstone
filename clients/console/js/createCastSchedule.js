"use strict";
refreshLocalUser();
var dateRange = [];
var fieldOptions = [];
var startTime;
var endTime;
var fieldCount = 0;


createDates();
populateConcertNames();
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

// Get to show types
function populateConcertNames() {
    makeRequest("shows/types?includeDeleted=false", {}, "GET", true)
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
    fieldOptions = '<option value="">Title</option>' +
        '<option value="spacing">Spacing</option>' +
        '<option value="tech">Tech</option>' +
        '<option value="call-dancers">Call: Dancers & crew meet in theatre</option>' +
        '<option value="call-dancers-warm-up">Call: Dancers / 6:15-7:00 warm-up in studio 265</option>' +
        '<option value="tech-run-call">TECH RUN Call</option>' +
        '<option value="tech-run-curtain">TECH RUN Curtain</option>' +
        '<option value="dress-rehearsal-call">DRESS REHEARSAL Call</option>' +
        '<option value="dress-rehearsal-curtain">DRESS REHEARSAL Curtain</option>' +
        '<option value="preview">PREVIEW</option>' +
        '<option value="performance"><strong>PERFORMANCE</strong></option>' 
}

// Get date ranges and populate form with options for all dates
$('#get-date-range').on('click', function (e) {
    if (dateRange.length != 0) {
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
        $("#date ul").append('<li><a href="#" onclick="add_slot(this)">New Slot</a></li>');
        $("#date li").addClass('date-' + index);
        $("#date").attr("id", "date-" + index);
        //initial_slots("date-" + index);
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
    $("#" + id).append('<div id="slot"><input class="startTime-input" placeholder="Start Time"><input class="endTime-input" placeholder="End Time"><select class="slot-title-input"><option id="slot-title-input value=""></option></select><a href="#" class="delete">Delete</a></div>');
    $('#slot .startTime-input').timepicker();
    $('#slot .endTime-input').timepicker();
    $('#slot .slot-title-input').html(fieldOptions);
    $('#slot').attr("id", "slot-" + fieldCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault();
        $(this).parent('div').remove();
    })
}

//Create intial fields
function initial_slots(element) {
    for (var i = 0; i < 2; i++) {
        fieldCount++;
        $("#" + element).append('<div id="slot"><input class="startTime-input" placeholder="Start Time"><input class="endTime-input" placeholder="End Time"><select class="slot-title-input"><option id="slot-title-input value=""></option></select><a href="#" class="delete">Delete</a></div>');
        $('#slot .startTime-input').timepicker();
        $('#slot .endTime-input').timepicker();
        $('#slot .slot-title-input').html(fieldOptions);
        $('#slot').attr("id", "slot-" + fieldCount);
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