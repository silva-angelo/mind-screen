$(document).ready(function () {

    $('#searchMovie').change((event) => {
        let search = event.target.value

        const API_ENDPOINT = `https://api.themoviedb.org/3/search/movie?api_key=699c5ef1665132d7f67266a73389f90a&language=en-US&query=${search}&page=1&include_adult=false`;

        if (!search) {
            return;
        }
        changeWebPage();
    });
});

function changeWebPage() {
    window.location.replace('../views/resultPage.html');
}