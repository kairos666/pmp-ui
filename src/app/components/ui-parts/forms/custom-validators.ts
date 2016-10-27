import {FormControl} from '@angular/forms';

/* PORTS RANGE VALIDATOR (5000 is reserved for socket connection) */
function validatePortRange(c:FormControl) {
    let portNumber = c.value;
    
    if (0 <= portNumber && portNumber <= 65535 && portNumber !== 5000) { return null; }

    return {
        validatePortNumber: { valid:false }
    };
}

export const CustomValidators = {
    portRange: validatePortRange
};
