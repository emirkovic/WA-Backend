const validator = require("validator");
const isEmpty = require('is-empty');

module.exports.loginValidator = (data) => {
    let errors = {};

    ["email", "password"].forEach(field => {
        data[field] = isEmpty(data[field]) ? '' : data[field];
    })

    if (validator.isEmpty(data.email)) errors.email = 'Email is required';
    else if (!validator.isEmail(data.email)) errors.email = 'Provide a valid email';

    if (validator.isEmpty(data.password)) errors.password = 'Password is required';

    return {
        errors,
        isValid: isEmpty(errors)
    };
}

module.exports.registerValidator = (data) => {
    let errors = {};

    ["email", "password", "firstName", "lastName"].forEach(field => {
        data[field] = isEmpty(data[field]) ? '' : data[field];
    })

    if (validator.isEmpty(data.email)) errors.email = 'Email is required';
    else if (!validator.isEmail(data.email)) errors.email = 'Provide a valid email';

    if (validator.isEmpty(data.password)) errors.password = 'Password is required';

    if (validator.isEmpty(data.firstName) || validator.isEmpty(data.lastName)) {
        errors.firstName = 'Full name is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
}