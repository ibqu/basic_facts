var tests = [
    {
        "name": "4 operations",
        "number_of_questions": 10,
        //Returned format:
        /*
        {"expression": "", "check": function(answer){}}
        */
        "generate": function(){
            var operation = random_select(["+", "-", "*", "/"])
            return {
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
            }[operation]();
        }
    },
    {
        "name": "a",
        "number_of_questions": 10,
        "generate": function(){
            return {
                "expression": "abc",
                "check": function(answer){
                    return answer === "abc";
                }
            }
        }
    }
];