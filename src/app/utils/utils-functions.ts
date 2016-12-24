import { Notif } from '../schema/config';

export function copyToClipboard(evt) {
    let successCopyingToClipboard;
    try {
        // create selection range
        let rangeObj = document.createRange();
        rangeObj.selectNodeContents(evt.currentTarget.querySelector('.copy-me'));

        // copy to clipboard
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeObj);
        successCopyingToClipboard = document.execCommand('copy');

        // remove selection
        selection.removeAllRanges();
        selection.empty();

    } catch (err) {
        console.log('unable to copy to clipboard', err);
        successCopyingToClipboard = false;
    }
}

export function notifTranslator(notif:Notif):string {
    let msg:string;

    switch(notif.type) {
        case 'engine':
            switch(notif.subType) {
                case 'connection':
                    msg = 'PMP engine ';
                    msg = (notif.payload) ? msg + 'ESTABLISHED CONNECTION' : msg + 'LOST CONNECTION';
                break;

                case 'status':
                    msg = 'PMP engine is ' + notif.payload.toString().toUpperCase();
                break;
            }
        break;

        case 'config':
            switch(notif.subType) {
                case 'action':
                    msg = 'Pimp Config has been ' + notif.payload.toString().toUpperCase();
                break;
            }
        break;
    }

    return msg;
}
