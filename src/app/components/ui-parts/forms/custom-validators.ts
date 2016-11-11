import {FormControl} from '@angular/forms';

/* PORTS RANGE VALIDATOR (5000 is reserved for socket connection) */
function validatePortRange(c:FormControl) {
    let portNumber = c.value;
    /*
    * port can't be 5000 --> websocket communication port
    * port can't be 3001 --> BrowserSync UI port
    */
    if (0 <= portNumber && portNumber <= 65535 && portNumber !== 5000 && portNumber !== 3001) { return null; }

    return {
        validatePortNumber: { valid:false }
    };
}

/* check if a string is a well formed URL */
function validURLChecker(c:FormControl) {
    let urlString = c.value;

    return {
        validateURL: { valid:false }
    }
}

export const CustomValidators = {
    portRange: validatePortRange,
    validURL: validURLChecker
};
