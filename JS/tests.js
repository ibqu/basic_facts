"use strict"

//default stuff provided
var OPERATION_TEXT = {"+": "+", "-": "&minus;", "*": "&times;", "/": "&divide;"};

var ARITHMETIC_4_OPERATIONS = ["+", "-", "*", "/"];

function random(a, b){
    return a + ~~(Math.random() * (b - a));
}

function random_select(a){
    if(!a.length) throw new Error("No elements to select from");
    return a[~~(Math.random() * a.length)]
}

var test_example = {
    "name": "example",
    "temp_data": {},
    "stored_data": {},
    "number_of_questions": 10,
    //the following are called after the major interface changes have been made
    
    //generate_expression will be called immediately after this
    "start_test": function(){},
    
    "finish_test": function(){
        //maybe use this for a custom results screen later
    },
    
    //stopping without completing
    "stop_test": function(){},
    
    "generate_expression": function(){return "abc";},
    
    //required
    "submit_answer": function(answer){
        //the only sort of thing needed if mutating internal data is unnecessary
        return answer === "abc";
    },
    
    //if this is true then the only keys which will modify the content of the answer box
    //are: the number keys, backspace, and the hyphen (for representing the minus sign)
    //(note that nothing is currently being done about copy and paste)
    "numeric": false,
    
    //something which will be called during the preparation
    //generally this can just do nothing
    "initialise": function(){},
    
    //defining these attributes here will do nothing
    "option": null,
    "answers_correct": 0,
    "answers_incorrect": 0,
    "questions_done": 0
}

//will be called automatically
function process_test_object(test_object){
    
    //add missing properties
    var default_property_names = Object.getOwnPropertyNames(test_example);
    for(var i = 0; i < default_property_names.length; ++i){
        var current_name = default_property_names[i];
        if(!(current_name in test_object)){
            test_object[current_name] = test_example[current_name]
        }
    }
    
    test_object.initialise();
}

function Simple1DAdaptiveArray(least, upper_bound){
    //note that asymptotically faster (O(log n)) ways of picking values and modifying weights are unnecessary at the moment.
    //the naive O(n) method is good enough when n is small
    
    this.least = least;
    this.upper_bound = upper_bound;
    this.array = (new Array(upper_bound - least)).fill(this.initial_weight);
    this.last_picked_value = least;
}

Simple1DAdaptiveArray.prototype = Object.assign(
    Object.create(null),
    {
        "initial_weight": 1,
        "malleability": 0.2,
        "pick": function(){
            var total = 0;
            for(var i = 0; i < this.array.length; ++i){
                total += this.array[i];
            }
            var random_value = total * Math.random();
            for(var i = 0; i < this.array.length - 1; ++i){
                random_value -= this.array[i];
                if(random_value < 0) break;
            }
            this.last_picked_element = i + this.least
            return this.last_picked_element;
        },
        "set": function(element, value){
            this.array[element - this.least] = value;
        },
        "tweak": function(element, value){
            var index = element - this.least;
            this.array[index] = this.array[index] * (1 - this.malleability) + value * this.malleability;
        },
        "last_picked_element": 0,
        "tweak_last_picked_element": function(value){
            this.tweak(this.last_picked_element, value);
        }
    }
);

var tests = [
    {
        "name": "4 operations",
        "temp_data": {
            "answer": 0,
            "question_generators": null
        },
        "number_of_questions": 25,
        "submit_answer": function(answer){
            return +answer === this.temp_data.answer;
        },
        "generate_expression": function(){
            return this.temp_data.question_generators[random_select(ARITHMETIC_4_OPERATIONS)]();
        },
        "numeric": true,
        "initialise": function(){
            this.temp_data.test_object = this;
            
            var test_object = this;
            
            this.temp_data.question_generators = {
                "+": function(){
                    var a = random(0, 10), b = random(0, 10);
                    test_object.temp_data.answer = a + b;
                    return a + OPERATION_TEXT["+"] + b;
                },
                "-": function(){
                    var a = random(0, 10), b = random(0, 10);
                    test_object.temp_data.answer = a - b;
                    return a + OPERATION_TEXT["-"] + b;
                },
                "*": function(){
                    var a = random(0, 10), b = random(0, 10);
                    test_object.temp_data.answer = a * b;
                    return a + OPERATION_TEXT["*"] + b;
                },
                "/": function(){
                    var a = random(0, 10), b = random(1, 10);
                    test_object.temp_data.answer = a;
                    return (a * b) + OPERATION_TEXT["/"] + b;
                }
            }
        }
    },
    {
        "name": "4 operations (adaptive)",
        
        "temp_data": {
            "answer": 0,
            "weights": null,
            "expression_generators": null,
            "last_operation": "+",
            "time_since_last_question": 0,
            "is_first_question": true,
            "log_weights": function(){
                function round(a){return Math.round(a * 1e3) / 1e3;}
                for(var i = 0; i < 4; ++i){
                    var operation = ARITHMETIC_4_OPERATIONS[i];
                    var weights = this.weights[operation];
                    console.log(operation, weights[0].array.map(round));
                    console.log(" ", weights[1].array.map(round));
                }
            }
        },
        
        "stored_data": {
            
        },
        
        "number_of_questions": 25,
        
        "start_test": function(){
            this.temp_data.is_first_question = true;
        },
        
        "finish_test": function(){
            
        },
        
        "stop_test": function(){
            
        },
        
        "generate_expression": function(){
            var operation = this.temp_data.last_operation = random_select(ARITHMETIC_4_OPERATIONS);
            var weights = this.temp_data.weights[operation];
            return this.temp_data.expression_generators[operation](
                weights[0].pick(),
                weights[1].pick());
        },
        
        "submit_answer": function(answer){
            //don't tweak the weights with information from the first question
            //only register the time
            var is_correct = (+answer === this.temp_data.answer);
            var now = performance.now();
            
            //use information to adjust weights if this is not the first question
            if(this.temp_data.is_first_question){
                this.temp_data.is_first_question = false;
            }else{
                var INTERVAL_CAP = 2000;
                var INCORRECTNESS_PENALTY = 0.5;
                var INSTANT_CORRECT_ANSWER_VALUE = 0.1;
                var LATE_ANSWER_PENALTY = 0.3;
                var weights = this.temp_data.weights[this.temp_data.last_operation];
                var capped_interval = Math.min(now - this.temp_data.time_since_last_question, INTERVAL_CAP);
                //current scheme:
                //value to tweak with is a linear function of capped_interval
                //fixed penalty for incorrectness
                var time_penalty = LATE_ANSWER_PENALTY * capped_interval / INTERVAL_CAP;
                var new_value = time_penalty + (is_correct ? 0 : INCORRECTNESS_PENALTY);
                weights[0].tweak_last_picked_element(new_value);
                weights[1].tweak_last_picked_element(new_value);
            }
            
            this.temp_data.time_since_last_question = now;
            return is_correct;
        },
        
        "numeric": true,
        
        "initialise": function(){
            //consider storing this in stored_data
            this.temp_data.weights = {
                "+": [new Simple1DAdaptiveArray(0, 10), new Simple1DAdaptiveArray(0, 10)],
                "-": [new Simple1DAdaptiveArray(0, 10), new Simple1DAdaptiveArray(0, 10)],
                "*": [new Simple1DAdaptiveArray(0, 10), new Simple1DAdaptiveArray(0, 10)],
                "/": [new Simple1DAdaptiveArray(0, 10), new Simple1DAdaptiveArray(1, 10)]
            }
            
            var test_object = this;
            
            function set_answer(a){
                test_object.temp_data.answer = a;
            }
            
            this.temp_data.expression_generators = {
                "+": function(a, b){
                    set_answer(a + b);
                    return a + OPERATION_TEXT["+"] + b;
                },
                "-": function(a, b){
                    set_answer(a - b);
                    return a + OPERATION_TEXT["-"] + b;
                },
                "*": function(a, b){
                    set_answer(a * b);
                    return a + OPERATION_TEXT["*"] + b;
                },
                "/": function(a, b){
                    set_answer(a);
                    return (a * b) + OPERATION_TEXT["/"] + b;
                }
            };
        }
    }
]