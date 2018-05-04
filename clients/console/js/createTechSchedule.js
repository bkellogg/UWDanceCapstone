"use strict";
refreshLocalUser();
let auth = getAuth();

var timeOptions = ["6:00am", "6:30am", "7:00am", "7:30am", "8:00am", "8:30am", "9:00am", "9:30am", "10:00am", "10:30am", "11:00am", "11:30am", "12:00pm",
    "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm", "3:00pm", "3:30pm", "4:00pm", "4:30pm", "5:00pm", "5:30pm", "6:00pm", "6:30pm", "7:00pm", "7:30pm",
    "8:00pm", "8:30pm", "9:00pm", "9:30pm", "10:00pm", "10:30pm", "11:00pm", "11:30pm"]

var startTime;
var endTime;
var spacingCount = 0;
var showingCount = 0;
var loadInCount = 0;
var notesCount = 0;
var techRehearsalCount = 0;
var dressRehearsalCount = 0;
var previewCount = 0;
var performanceCount = 0;
var miscCount = 0;
var fieldCount = 0;


populateConcertNames();
createDates();
createTimes();
//populateFieldTypes();

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
    startTime = '<option value=""><strong>Start Time</strong></option>' +
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

// fetch to show types
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
/*
// populate field types
function populateFieldTypes() {
    var fieldOptions = '<option value=""><strong>Slot Type</strong></option>' +
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
*/

// Get date ranges and populate form with options for all dates
$('#get-date-range').on('click', function (e) {
    var dateRange = [];
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
        $("#date").append('<a href="#" onclick ="delete_day(this)">[Delete]</a>');
        $("#date ul").append('<li><a href="#" onclick="add_showing(this)">Showing +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_spacing(this)">Spacing +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_load_in(this)">Load-In +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_notes(this)">Notes +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_tech_rehearsal(this)">Tech Rehearsal +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_dress_rehearsal(this)">Dress Rehearsal +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_preview(this)">Preview +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_performance(this)">Performance +</a></li>');
        $("#date ul").append('<li><a href="#" onclick="add_misc(this)">Misc +</a></li>');
        //$("#date ul").append('<li><a href="#" onclick="add_slot(this)">New Slot +</a></li>');

        $("#date li").addClass('date-' + index);
        $("#date").attr("id", "date-" + index);
    })
    // toggle date list options
    $(".has-submenu ul").hide();
    $(".has-submenu > a").click(function () {
        $(this).next("ul").toggle();
    });
});

// Add slots for showing field
function add_showing(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    showingCount++;
    $("#" + id).append('<div id="showing-slot"><select class="startTime-input"><option id="showing-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="showing-slot-endTime-input" value=""></option></select><input type="text" id="showing-slot-desc-input" value="Showing" /><input type="text" id="showing-slot-crew-input" placeholder="Notes" /><a href="#" class="delete">Delete</a></div>');
    $('#showing-slot .startTime-input').html(startTime);
    $('#showing-slot .endTime-input').html(endTime);
    $('#showing-slot').attr("id", "showing-slot" + showingCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); showingCount--;
    })
}

//Add slots for spacing field 
function add_spacing(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    spacingCount++;
    $("#" + id).append('<div id="spacing-slot"><select class="startTime-input"><option id="spacing-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="spacing-slot-endTime-input" value=""></option></select><input type="text" id="spacing-slot-desc-input" value="Spacing" /><input type="text" id="spacing-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#spacing-slot .startTime-input').html(startTime);
    $('#spacing-slot .endTime-input').html(endTime);
    $('#spacing-slot').attr("id", "spacing-slot" + spacingCount);


    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); spacingCount--;
    })
}

//Add slot for load-in field 
function add_load_in(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    loadInCount++;
    $("#" + id).append('<div id="load-in-slot"><select class="startTime-input"><option id="load-in-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="load-in-slot-endTime-input" value=""></option></select><input type="text" id="load-in-slot-desc-input" value="Load-in: " /><input type="text" id="load-in-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#load-in-slot .startTime-input').html(startTime);
    $('#load-in-slot .endTime-input').html(endTime);
    $('#load-in-slot').attr("id", "load-in-slot" + loadInCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); loadInCount--;
    })
}

//Add slot for notes field 
function add_notes(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    notesCount++;
    $("#" + id).append('<div id="notes-slot"><select class="startTime-input"><option id="notes-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="notes-slot-endTime-input" value=""></option></select><input type="text" id="notes-slot-desc-input" value="Notes" /><input type="text" id="notes-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#notes-slot .startTime-input').html(startTime);
    $('#notes-slot .endTime-input').html(endTime);
    $('#notes-slot').attr("id", "notes-slot" + notesCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); notesCount--;
    })
}

//Add slot for tech rehearsal field 
function add_tech_rehearsal(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    techRehearsalCount++;
    $("#" + id).append('<div id="tech-rehearsal-slot"><select class="startTime-input"><option id="tech-rehearsal-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="tech-rehearsal-slot-endTime-input" value=""></option></select><input type="text" id="tech-rehearsal-slot-desc-input" value="Technical Rehearsal" /><input type="text" id="tech-rehearsal-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#tech-rehearsal-slot .startTime-input').html(startTime);
    $('#tech-rehearsal-slot .endTime-input').html(endTime);
    $('#tech-rehearsal-slot').attr("id", "tech-rehearsal-slot" + techRehearsalCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); techRehearsalCount--;
    })
}

//Add slot for dress rehearsal field 
function add_dress_rehearsal(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    dressRehearsalCount++;
    $("#" + id).append('<div id="dress-rehearsal-slot"><select class="startTime-input"><option id="dress-rehearsal-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="dress-rehearsal-slot-endTime-input" value=""></option></select><input type="text" id="dress-rehearsal-slot-desc-input" value="Dress Rehearsal" /><input type="text" id="dress-rehearsal-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#dress-rehearsal-slot .startTime-input').html(startTime);
    $('#dress-rehearsal-slot .endTime-input').html(endTime);
    $('#dress-rehearsal-slot').attr("id", "dress-rehearsal-slot" + dressRehearsalCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); dressRehearsalCount--;
    })
}

//Add slot for dress rehearsal field 
function add_preview(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    previewCount++;
    $("#" + id).append('<div id="preview-slot"><select class="startTime-input"><option id="preview-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="preview-slot-endTime-input" value=""></option></select><input type="text" id="preview-slot-desc-input" value="Preview" /><input type="text" id="preview-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#preview-slot .startTime-input').html(startTime);
    $('#preview-slot .endTime-input').html(endTime);
    $('#preview-slot').attr("id", "preview-slot" + previewCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); previewCount--;
    })
}

//Add slot for performance field 
function add_performance(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    performanceCount++;
    $("#" + id).append('<div id="performance-slot"><select class="startTime-input"><option id="performance-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="performance-slot-endTime-input" value=""></option></select><input type="text" id="performance-slot-desc-input" value="Performance #"/><input type="text" id="performance-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#performance-slot .startTime-input').html(startTime);
    $('#performance-slot .endTime-input').html(endTime);
    $('#performance-slot').attr("id", "performance-slot" + performanceCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); performanceCount--;
    })
}

//Add slot for misc field 
function add_misc(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    miscCount++;
    $("#" + id).append('<div id="misc-slot"><select class="startTime-input"><option id="misc-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="misc-slot-endTime-input" value=""></option></select><input type="text" id="misc-slot-desc-input" placeholder="Misc"/><input type="text" id="misc-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#misc-slot .startTime-input').html(startTime);
    $('#misc-slot .endTime-input').html(endTime);
    $('#misc-slot').attr("id", "misc-slot" + miscCount);

    $("#" + id).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); miscCount--;
    })
}

// Deletes day from form and reduces count of any slots deleted from that day
function delete_day(element) {
    var siblings = $(element).siblings('div');
    $(siblings).each(function (index, value) {
        if (value.id.startsWith("showing")) {
            showingCount--;
        } else if (value.id.startsWith("spacing")) {
            spacingCount--;
        } else if (value.id.startsWith("load")) {
            loadInCount--;
        } else if (value.id.startsWith("notes")) {
            notesCount--;
        } else if (value.id.startsWith("tech")) {
            techRehearsalCount--;
        } else if (value.id.startsWith("dress")) {
            dressRehearsalCount--;
        } else if (value.id.startsWith("preview")) {
            previewCount--;
        } else if (value.id.startsWith("performance")) {
            performanceCount--;
        } else if (value.id.startsWith("misc")) {
            miscCount--
        } else {

        }
    })
    $(element).parent('li').remove();
}

/*Generic add field
function add_slot(element) {
    $(".has-submenu ul").hide();
    var id = $(element).closest("li").attr("class");
    fieldCount++;
    $(""#" + id").append('<div id="slot"><select class="startTime-input"><option id="slot-startTime-input value=""></option></select><select class="endTime-input"><option id="slot-endTime-input" value=""></option></select><select class="slot-type-input"><option id="slot-type-input value=""></option></select><input type="text" id="slot-desc-input" placeholder="Desc" /><input type="text" id="slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
    $('#slot').attr("id", "slot" + fieldCount);
    createDates();
    createTimes();
    populateFieldTypes();

    $(""#" + id").on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); fieldCount--;
    })
}
*/