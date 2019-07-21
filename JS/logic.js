"use strict";

var current_test_object = tests[0];

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
    current_test_object.start_test();
    number_of_questions = test_object.number_of_questions;
    reset_progress_and_correctness();
    present_question();
    from_id("answer_box").focus();
}

function restart_test(){
    select_screen(screens.test);
    start_test(current_test_object);
}

function present_question(){
    from_id("expression").innerHTML = current_test_object.generate_expression();
}

function submit_answer(answer){
    var is_correct = current_test_object.submit_answer(answer);
    ++current_test_object.questions_done;
    if(is_correct){
        ++current_test_object.answers_correct;
    }else{
        ++current_test_object.answers_incorrect;
    }
    //handle the case where all of the questions have been done
    if(current_test_object.questions_done === number_of_questions){
        finish_test();
    }else{
        update_progress_and_correctness();
        present_question();
    }
}

function stop_tests(){
    current_test_object.stop_test();
}

function reset_progress_and_correctness(){
    current_test_object.answers_correct = current_test_object.answers_incorrect = current_test_object.questions_done = 0;
    update_progress_and_correctness();
}

function finish_test(){
    select_screen(screens.test_results);
    current_test_object.finish_test();
    show_results_answers_correct();
}