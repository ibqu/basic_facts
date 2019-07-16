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
    reset_test_screen();
    //assumes that the test screen is already visible
    current_test_object = test_object;
    correct_answer_count = incorrect_answer_count = questions_done = 0;
    number_of_questions = test_object.number_of_questions;
    update_progress_and_correctness();
    present_question();
    from_id("answer_box").focus();
}

function restart_test(){
    select_screen(screens.test);
    start_test(current_test_object);
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
    //handle the case where all of the questions have been done
    if(questions_done === number_of_questions){
        finish_test();
    }else{
        update_progress_and_correctness();
        present_question();
    }
}

function stop_tests(){
    //currently useless
}

function reset_progress_and_correctness(){
    correct_answer_count = 0;
    incorrect_answer_count = 0;
    questions_done = 0;
    number_of_questions = 0;
    update_progress_and_correctness();
}

function finish_test(){
    select_screen(screens.test_results);
    show_results_answers_correct();
}