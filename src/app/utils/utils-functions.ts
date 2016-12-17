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
