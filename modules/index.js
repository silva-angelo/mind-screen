/**
 * On document ready gets endpoints from API in order to use them in subsequent functions
 * @param {*} API_KEY API Key used to fetch data from TMDB
 */
$(document).ready(function () {
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const popular_movie_endpoint=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    const popular_series_endpoint = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;

    //$('#generate__random__movie').click(getRandomMovieClick());
    /**
     * Waiting the key press to read the input in the box
     * Read the input on the text box search refer to the name of the movie or the series
     * Get the value on the select form can be movie or series
     * take the two input and passed them in url to the next page html with location.assign
     */
    $('#searchMedia').keypress(function (e) {
        if (e.which == 13) {
            let search = document.getElementById('searchMedia').value.trim();
            if (!search) {
                return false;
            }
            let type = document.getElementById('mediaType').value;
            window.location.assign('../views/results.html?media_type=' + type + '&search=' + search);
            return false;
        }
    });
   /**
    * Fetches TMDB endpoint, fulfilling one promises get the popular movies from the day
    *@param {*} popular_movie_endpoint refers to the end point from TMDB
    */
    fetch(popular_movie_endpoint)
        .then(parsedResponse)
        .then(getPopularMovies)
        .then(renderResultsMovies)
        .catch((err) => console.error(err));
    /**
    * Fetches TMDB endpoint, fulfilling one promises get the popular series from the day
    *@param {*} popular_series_endpoint refers to the end point from TMDB
    */
    fetch(popular_series_endpoint)
        .then(parsedResponse)
        .then(getPopularSeries)
        .then(renderResultsSeries)
        .catch((err) => console.error(err));

});

/*function getRandomMovieClick() {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const latest_movie_endpoint = `https://api.themoviedb.org/3/movie/latest?api_key=${API_KEY}&language=en-US`;
    
    fetch(latest_movie_endpoint)
        .then(parsedResponse)
        //.then(getRandomMovie)
        .catch((err) => console.log(err));
}*/

/**
 * Parses given promises to return an accessible and displayable array of .json objects
 * @param {*} response Response which results from the fulfilled endpoint promises
 * @returns Array of responses in the .json format, with two called endpoint (popular_movie_endpoint and popular_series_endpoint)
 */
function parsedResponse(response) {
    
    if(!response.ok) {
        throw new Error ('Error: ' + endpointsResponse.status);
    }
    return response.json();
}

/**
 * Getter for the specific object related with movie/series textual data (from the 1st element in the responses array)
 * @param {*} data Array of responses in the .json format, with all one called endpoints (popular_movie_endpoint)
 * @returns Object containing all movie textual data according to the requested
 */
function getPopularMovies(data){
    console.log(data);
   let result = data.results.map((movies) => {
        return {
            id: movies.id,
            mediaType: 'movie',
            img: movies.poster_path,
            title: movies.original_title,
            average: movies.vote_average,
            release_date : movies.release_date,
        };
    });

    return result;
}

/**
 * Getter for the specific object related with movie/series textual data (from the 1st element in the responses array)
 * @param {*} data Array of responses in the .json format, with all one called endpoints (popular_series_endpoint)
 * @returns Object containing all series textual data according to the requested
 */
function getPopularSeries(data){
    //console.log(data);
   let result = data.results.map((tv) => {
        return {
            id: tv.id,
            mediaType: 'tv',
            img: tv.poster_path,
            title: tv.original_name,
            average: tv.vote_average,
            first_air_date: tv.first_air_date,
        };
    });

    return result;
}

/**
 * Render de result of movies to present in html the top 5 of popular movies
 * @param {*} movies list with data about all popular movies
 * Just the first 5 popular movies on the list are presented
 * The attribute on click are set to a new element because when click on it the details page html is open
 * For each movie the element creat to insert on html it's necessary the image, movie id, the release date and the rating average
 * This information is to append to the element created in html.
 */
function renderResultsMovies(movies) {
    const result = document.getElementById('page_popular_movies');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.setAttribute('class', 'poster__wrap__movies');
        item.setAttribute('onclick', 'getDetails(this)');

        item.innerHTML = `
            <img src="http://image.tmdb.org/t/p/original/${movies[i].img}"
                alt='${movies[i].title}' class='movie-poster_result' id='${movies[i].mediaType} ${movies[i].id}'draggable='false'/>
            <div class='poster__description_layer'>
                <p class='poster__description'>${movies[i].title}<br>
                (${getYear(movies[i].release_date)})<br>
                ${movies[i].average}/10</p>
            </div>`

        result.appendChild(item);
    }

}
/**
 * Render de result of series to present in html the top 5 of popular series
 * @param {*} series list with data about all popular series
 * Just the first 5 popular series on the list are presented
 * The attribute on click are set to a new element because when click on it the details page html is open
 * For each serie the element creat to insert on html it's necessary the image, serie id, the release date and the rating average
 * This information is to append to the element created in html.
 */
function renderResultsSeries(tv) {
    //page_list_popular

    const result = document.getElementById('page_popular_tv');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.setAttribute("class", "poster__wrap__tv");
        item.setAttribute('onclick', 'getDetails(this)');

        item.innerHTML = `<img src="http://image.tmdb.org/t/p/original/${tv[i].img}"
        alt='${tv[i].title}' class='tv-poster_result' id='${tv[i].mediaType} ${tv[i].id}'draggable='false'/>
        <div class='poster__description_layer'>
            <p class='poster__description'>${tv[i].title}<br>
            (${getYear(tv[i].first_air_date)})<br>
            ${tv[i].average}/10</p>
        </div>`

        result.appendChild(item);
    }

}

/**
 * Take the complete date of release movie or serie
 * @param {*} resultDate is the date of relase movie or series
 * @returns the year of release the movie or series
 */
const getYear = (resultDate) => {
	let date = new Date(resultDate);
	return date.getFullYear();
}

/**
 * This function get the information about the popular media select and send to the next html(details page)
 * @param {*} getMedia data about the select popular media
 */
const getDetails = (getMedia) => {
    console.log(getMedia);
    let poster = getMedia.children[0];
    console.log(poster);
    const idInfo = poster.id.split(' ');
    const id = idInfo[1];
    const mediaType = idInfo[0]
    window.location.assign('../views/details.html?media_type='+mediaType+'&media_id='+id);
}

/*const  getRandomMovie = (data) => {

    const lastIdMovie = data.id;

    let isValid = false;

    let idRandom = '';

    while (!isValid) {
        idRandom = getRandomId(lastIdMovie);
        let url = `https://api.themoviedb.org/3/movie/${idRandom}?api_key=699c5ef1665132d7f67266a73389f90a&language=en-US&append_to_response=videos`

        fetch(url)
            .then(response => {
                if(!response.ok) {
                    throw new Error ('Error: ' + endpointsResponse.status);
                }
                isValid = true;
            })
    }
    window.location.assign(`../views/details.html?media_type=movie&media_id=${idRandom}`)

}

const getRandomId = (id) => {
return Math.floor(Math.random() * (id - 0 + 1) );
}*/

