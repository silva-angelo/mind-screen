$(document).ready(function () {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const popular_Movie_ENDPOINT=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    const popular_Series_ENDPOINT = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;
    
    $('#searchMovie').keypress(function (e) {
        if (e.which == 13) {
            let search = e.target.value;
            let type = document.getElementById('mediaType');
            if (!search) {
                return;
            }
            window.location.replace('../views/results.html?type=' + type + '&search=' + search);
            //$('#searchForm').submit();
            return false;
        }
    })

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
            id: movies.id,
            img: movies.poster_path,
            title: movies.original_title,
            average: movies.vote_average,
            release_date : movies.release_date,
        };
    });

    return result;
}

function getPopularSeries(data){
    console.log(data);
   let result = data.results.map((series) => {
        return {
            id: series.id,
            img: series.poster_path,
            title: series.original_name,
            average: series.vote_average,
            first_air_date: series.first_air_date,
        };
    });

    return result;
}

function renderResultsMovies(movies) {
    //page_list_popular

    const result = document.getElementById('page_popular_movies');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.setAttribute('class', 'poster__wrap__movies');
        item.setAttribute('onclick', 'getDetails(this)');

        item.innerHTML = `
            <img src="http://image.tmdb.org/t/p/original/${movies[i].img}"
                alt='${movies[i].title}' class='movie-poster_result' id='${movies[i].id}'draggable='false'/>
            <div class='poster__description_layer'>
                <p class='poster__description'>${movies[i].title}<br>
                (${getYear(movies[i].release_date)})<br>
                ${movies[i].average}/10</p>
            </div>`

        result.appendChild(item);
    }

}

function renderResultsSeries(series) {
    //page_list_popular

    const result = document.getElementById('page_popular_series');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.setAttribute("class", "poster__wrap__series");

        item.innerHTML = `<img src="http://image.tmdb.org/t/p/original/${series[i].img}"
        alt='${series[i].title}' class='series-poster_result' id='${series[i].id}'draggable='false'/>
        <div class='poster__description_layer'>
            <p class='poster__description'>${series[i].title}<br>
            (${getYear(series[i].first_air_date)})<br>
            ${series[i].average}/10</p>
        </div>`

        result.appendChild(item);
    }

}

const getYear = (resultDate) => {
	let date = new Date(resultDate);
	return date.getFullYear();
}

const getDetails = (getMovie) => {
    let poster = getMovie.children[0];
    const id = getMovie.id;
    window.location.replace("../views/details.html" + "?movie_id=" + id);
}