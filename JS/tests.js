"use strict";

//features to add
//timing
//right and wrong
//count of completed questions
//adaptive tests
//you need to differentiate this from the others
//maybe you can publish the general quiz infrastructure separately (maybe not)

//Just do something simple and naive
//Just remember to prevent a positive feedback loop from constantly getting specific numbers picked again and again
//Possible solution:
/*
For some fraction of the time, just pick the number randomly.
For the other fraction of the time, pick using the adaptive range
*/
//Better idea of how it should work:
/*
Pick high and low values within the range (0, 1) corresponding to being correct and incorrect.
Ensure high and low are sufficiently far from the ends of the range.
To select from the adaptive range, just do random selection of indices weighted by their corresponding values.
To tweak the values in response to new information, do a weighted average.
*/
//The adaptive range function is supposed to be used for selecting from a range
function SimpleAdaptiveRange(start, upper_bound){
    if(start === upper_bound) throw new Error("no elements in range");
    //just equally distribute them first
    var number_of_elements = this.number_of_elements = upper_bound - start;
    this.start = start;
    this.array = (new Array(number_of_elements)).fill(1 / number_of_elements);
}

SimpleAdaptiveRange.prototype = Object.assign(
    Object.create(null),
    {
        "new_value_incorrect": 0.8,
        "new_value_correct": 0.2,
        "new_value_weight": 0.2,
        "pick": function(){
            //monitor the array and see if any elements don't get picked
            var sum = 0;
            for(var i = 0; i < this.number_of_elements; ++i){
                sum += this.array[i];
            }
            var random_value = Math.random() * sum;
            var sum2 = 0;
            for(var i = 0; i < this.number_of_elements - 1; ++i){
                sum2 += this.array[i];
                if(sum2 >= random_value) break;
            }
            return i + this.start;
        },
        
        "get_element": function(range_element){
            return this.array[range_element - this.start];
        },
        
        "set_element": function(range_element, new_value){
            this.array[range_element - this.start] = new_value;
        },
        
        "tweak_value": function(index, new_value){
            //monitor the array and see if any values change weirdly or don't change at all
            this.array[index] = this.array[index] * (1 - this.new_value_weight) + new_value * this.new_value_weight;
        },
        
        "register_correctness": function(range_element, is_correct){
            var index = range_element - this.start;
            this.tweak_value(index, is_correct ? this.new_value_correct : this.new_value_incorrect);
        }
    });

function compute_weight(existing_weight, is_correct, time_taken){
    //if the time taken is high, make the question more likely
    //if the answer is incorrect, make the question more likely
    //if the existing weight is higher, the question should be more likely
    //The objective is to make it better at improving basic facts skills
    //Possibly usable: exponential function
    //Wrong answers should be worse than answers which take a while to come(but not extremely long)
    
    //this is in milliseconds
    var time_taken_cap = 3000;
    var new_value;
    //influence of new_value on the resulting value
    var malleability = 0.2;
    
    if(is_correct){
        new_value = 0.1 + Math.max(time_taken / time_taken_cap, 1) * 0.3;
    }else{
        new_value = 0.4 + Math.max(time_taken / time_taken_cap, 1) * 0.5;
    }
    
    return existing_weight * (1 - malleability) + new_value * malleability;
}


//you will need to do some rewriting to make this more powerful
var tests = [
    (function(){
        var operation_generators = {
            "+": function(){
                var a = random(0, 10);
                var b = random(0, 10);
                return {
                    "expression": a + OPERATION_TEXT["+"] + b,
                    "check": function(answer){
                        return +answer === a + b;
                    }
                }
            },
            "-": function(){
                var a = random(0, 10);
                var b = random(0, 10);
                return {
                    "expression": a + OPERATION_TEXT["-"] + b,
                    "check": function(answer){
                        return +answer === a - b;
                    }
                }
            },
            "*": function(){
                var a = random(0, 10);
                var b = random(0, 10);
                return {
                    "expression": a + OPERATION_TEXT["*"] + b,
                    "check": function(answer){
                        return +answer === a * b;
                    }
                }
            },
            "/": function(){
                var a = random(0, 10);
                var b = random(1, 10);
                return {
                    "expression": (a * b) + OPERATION_TEXT["/"] + b,
                    "check": function(answer){
                        return +answer === a;
                    }
                }
            }
        }
        
        return {
            "name": "4 operations",
            "number_of_questions": 25,
            "numeric": true,
            //Returned format:
            /*
            {"expression": "", "check": function(answer){}}
            */
            "generate": function(){
                var operation = random_select(["+", "-", "*", "/"])
                return operation_generators[operation]();
            }
        }
    })(),
    
    (function(){
        /*it is necessary to include other information like timing to compensate for the lack of information coming from whether answers are correct or incorrect*/
        /*however times will need to be normalised to keep everything in the appropriate ranges*/
        /*a simple solution is to just cap the time used*/
        var operation_adaptive_ranges = {
            "+": [new SimpleAdaptiveRange(0, 10), new SimpleAdaptiveRange(0, 10)],
            "-": [new SimpleAdaptiveRange(0, 10), new SimpleAdaptiveRange(0, 10)],
            "*": [new SimpleAdaptiveRange(0, 10), new SimpleAdaptiveRange(0, 10)],
            "/": [new SimpleAdaptiveRange(0, 10), new SimpleAdaptiveRange(1, 10)],
        }
        
        var operation_generators = {
            "+": function(){
                var a = operation_adaptive_ranges["+"][0].pick();
                var b = operation_adaptive_ranges["+"][1].pick();
                return {
                    "expression": a + OPERATION_TEXT["+"] + b,
                    "check": function(answer){
                        return +answer === a + b;
                    }
                }
            },
            "-": function(){
                var a = operation_adaptive_ranges["-"][0].pick();
                var b = operation_adaptive_ranges["-"][1].pick();
                return {
                    "expression": a + OPERATION_TEXT["-"] + b,
                    "check": function(answer){
                        return +answer === a - b;
                    }
                }
            },
            "*": function(){
                var a = operation_adaptive_ranges["*"][0].pick();
                var b = operation_adaptive_ranges["*"][1].pick();
                return {
                    "expression": a + OPERATION_TEXT["*"] + b,
                    "check": function(answer){
                        return +answer === a * b;
                    }
                }
            },
            "/": function(){
                var a = operation_adaptive_ranges["/"][0].pick();
                var b = operation_adaptive_ranges["/"][1].pick();
                return {
                    "expression": (a * b) + OPERATION_TEXT["/"] + b,
                    "check": function(answer){
                        return +answer === a;
                    }
                }
            }
        }
        
        return {
            "name": "4 operations (adaptive)",
            "number_of_questions": 25,
            "numeric": true,
            //Returned format:
            /*
            {"expression": "", "check": function(answer){}}
            */
            "generate": function(){
                var operation = random_select(["+", "-", "*", "/"])
                return operation_generators[operation]();
            }
        }
    })()
];

var _unused_tests = [
    {
        "name": "abc",
        "number_of_questions": 10,
        "numeric": false,
        "generate": function(){
            return {
                "expression": "abc",
                "check": function(answer){
                    return answer === "abc";
                }
            }
        }
    }
]