$(document).ready(function () {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const popular_Movie_ENDPOINT=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    const popular_Series_ENDPOINT = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;
    

    $('#searchMovie').change((event) => {

        let type = document.getElementById('mediaType')

        let search = event.target.value

        if (!search) {
            return;
        }

        window.location.replace('../views/results.html' + '?type=' + type + '&search=' + search);
    });

    fetch(popular_Movie_ENDPOINT)
        .then(parsedResponse)
        .then(getPopularMovies)
        .then(renderResultsMovies)
        .catch((err) => console.error(err));

    fetch(popular_Series_ENDPOINT)
        .then(parsedResponse)
        .then(getPopularSeries)
        .then(renderResultsSeries)
        .catch((err) => console.error(err));
});

function parsedResponse(response) {
    
    if(!response.ok) {
        throw new Error ('Error: ' + endpointsResponse.status);
    }
    console.log('bla3');
    return response.json();
}

function getPopularMovies(data){
    console.log(data);
   let result = data.results.map((movies) => {
        return {
            img: movies.poster_path,
            title: movies.original_title,
            average: movies.vote_average,
        };
    });

    return result;
}

function getPopularSeries(data){
    console.log(data);
   let result = data.results.map((series) => {
        return {
            img: series.poster_path,
            title: series.original_name,
            average: series.vote_average,
        };
    });

    return result;
}

function renderResultsMovies(movies) {
    //page_list_popular

    const result = document.getElementById('page_popular_movies');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.innerHTML = `<img src="http://image.tmdb.org/t/p/original/${movies[i].img}"
        alt='${movies[i].title}' class='movie-poster_result' draggable='false'/>`

        result.appendChild(item);
    }

}

function renderResultsSeries(series) {
    //page_list_popular

    const result = document.getElementById('page_popular_series');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.innerHTML = `<img src="http://image.tmdb.org/t/p/original/${series[i].img}"
        alt='${series[i].title}' class='series-poster_result' draggable='false'/>`

        result.appendChild(item);
    }

}