function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        var rules = selectorRules[rule.selector];

        for (var i=0; i <rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else { 
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
            errorElement.innerText ='';
        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form)
    if (formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;

            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            });

            

            if(isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInput = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInput).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values;
                    },{})
                    options.onSubmit(formValues);
                }
            } else {
                // formElement.submit();
            }
            
        }
    
        options.rules.forEach(rule => {
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else { 
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector)
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
            if(inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                }

                inputElement.oninput = function() {
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
    }
}


// nguyen tac
//1.khi co loi -> message loi
//2.khi hop le -> ko tra ra gi ca
Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || "Vui lòng nhập mục này!";
        }
    }
}



Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Vui lòng nhập lại email!"
        }
    }    
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector,
        test: function(value) {
        return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự!`
    }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào ko đúng!'
        }
    }
}