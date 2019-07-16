"use strict";

function from_id(id){
    return document.getElementById(id);
}

addEventListener("load", function(){
    screens = {
        "main": from_id("main_screen"),
        "tests": from_id("tests_screen"),
        "test": from_id("test_screen"),
        "settings": from_id("settings_screen"),
        "help": from_id("help_screen")
    }
    
    var static_options = {
        "main": from_id("main_option"),
        "settings": from_id("settings_option"),
        "tests": from_id("tests_option"),
        "help": from_id("help_option")
    }
    
    var static_screen_names = ["main", "settings", "tests", "help"];
    
    var test_choices = from_id("test_choices");
    
    var selected_screen = screens.main;
    
    var selected_option = static_options.main;
    
    //Add option event listeners
    for(var i = 0; i < static_screen_names.length; ++i){
        static_options[static_screen_names[i]].addEventListener(
            "click",
            (function(name){
                return function(){select_static_screen(name)};
            })(static_screen_names[i]));
    }
    
    function select_static_screen(screen_name){
        select_option(static_options[screen_name]);
        select_screen(screens[screen_name]);
        stop_tests();
    }
    
    //add left panel options for the tests (and add the elements to the test objects)
    //also add event listeners
    for(var i = 0; i < tests.length; ++i){
        var el = document.createElement("div");
        el.classList.add("option");
        el.innerHTML = tests[i].name;
        tests[i].option = el;
        test_choices.appendChild(el);
        
        el.addEventListener("click", test_select_handler(tests[i]));
    }
    
    select_option = function select_option(el){
        //no usability problems here, this just saves some DOM manipulations (for no really good reason)
        if(el === selected_option) return;
        
        selected_option.classList.remove("selected_option");
        selected_option = el;
        el.classList.add("selected_option");
    }
    
    select_screen = function select_screen(screen){
        selected_screen.style.display = "none";
        selected_screen = screen;
        screen.style.display = "block";
    }
    
    //Add event listeners for main page buttons
    from_id("main_screen_tests_button").addEventListener("click", function(){
        select_static_screen("tests");
    });
    
    from_id("main_screen_settings_button").addEventListener("click", function(){
        select_static_screen("settings");
    });
    
    //make the input on test_screen respond to input
    from_id("answer_box").addEventListener("keyup", function(e){
        if(e.key === "Enter"){
            submit_answer(from_id("answer_box").value);
            from_id("answer_box").value = "";
        }
    });
    
    update_progress_and_correctness = function update_progress_and_correctness(){
        from_id("test_progress").firstChild.nodeValue = "Question " + (questions_done + 1) + " of " + number_of_questions;
        from_id("answers_correct").firstChild.nodeValue = correct_answer_count;
        from_id("answers_wrong").firstChild.nodeValue = incorrect_answer_count;
    }
});

var screens;
var select_option;
var select_screen;
var update_progress_and_correctness;