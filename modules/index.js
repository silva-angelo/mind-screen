$(document).ready(function () {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    $('#searchMovie').change((event) => {
        let search = event.target.value

        if (!search) {
            return;
        }

        window.location.replace('../views/results.html' + '?' + search);
    });
});

//Get Popular


const popular_Movie_ENDPOINT='https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1';

const fetchPopularMovie = async (popular_Movie_ENDPOINT) {
    

}

//