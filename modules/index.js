$(document).ready(function () {

    $('#searchMovie').change((event) => {
        let search = event.target.value

        const API_KEY = '699c5ef1665132d7f67266a73389f90a';

        if (!search) {
            return;
        }

        window.location.replace('../views/resultPage.html' + '?' + search);
    });
});