"use strict";

function random(a, b){
    return a + ~~(Math.random() * (b - a));
}

function random_select(a){
    if(!a.length) throw new Error("No elements to select from");
    return a[~~(Math.random() * a.length)]
}

var OPERATION_TEXT = {"+": "+", "-": "&minus;", "*": "&times;", "/": "&divide;"};

var current_test_object = tests[0];
var current_question_parameters = null;

var correct_answer_count = 0;
var incorrect_answer_count = 0;
var questions_done = 0;
var number_of_questions = 0;

function test_select_handler(test_object){
    return function(){
        select_option(test_object.option);
        select_screen(screens.test);
        start_test(test_object);
    }
}

function start_test(test_object){
    //assumes that the test screen is already visible
    current_test_object = test_object;
    correct_answer_count = incorrect_answer_count = questions_done = 0;
    number_of_questions = test_object.number_of_questions;
    present_question();
}

function present_question(){
    current_question_parameters = current_test_object.generate();
    from_id("expression").innerHTML = current_question_parameters.expression;
}

function submit_answer(answer){
    var is_correct = current_question_parameters.check(answer);
    ++questions_done;
    if(is_correct){
        ++correct_answer_count;
    }else{
        ++incorrect_answer_count;
    }
    update_progress_and_correctness();
    //maybe do something later relating to limiting the number of questions.
    present_question()
}

function stop_tests(){
    //just for safety
    reset_test_screen();
    reset_progress_and_correctness();
}

function reset_progress_and_correctness(){
    correct_answer_count = 0;
    incorrect_answer_count = 0;
    questions_done = 0;
    number_of_questions = 0;
    update_progress_and_correctness();
}

function reset_test_screen(){
    from_id("expression").innerHTML = "";
    from_id("answer_box").value = "";
}

//features to add
//timing
//right and wrong
//count of completed questions
//adaptive tests