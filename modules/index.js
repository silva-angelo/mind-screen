$(document).ready(function () {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const popular_Movie_ENDPOINT=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    const popular_Series_ENDPOINT = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=en-US&page=1`;
    
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
    return response.json();
}

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

function getPopularSeries(data){
    console.log(data);
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

function renderResultsMovies(movies) {
    //page_list_popular

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

const getYear = (resultDate) => {
	let date = new Date(resultDate);
	return date.getFullYear();
}

const getDetails = (getMedia) => {
    let poster = getMedia.children[0];
    const idInfo = poster.id.split(' ');
    const id = idInfo[1];
    const mediaType = idInfo[0]
    window.location.assign('../views/details.html?media_type='+mediaType+'&media_id='+id);
}