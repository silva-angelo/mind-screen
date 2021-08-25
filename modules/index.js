$(document).ready(function () {

    const API_KEY = '699c5ef1665132d7f67266a73389f90a';
    const popular_Movie_ENDPOINT=`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

    

    $('#searchMovie').change((event) => {

        let type = document.getElementById('mediaType')

        let search = event.target.value

        if (!search) {
            return;
        }

        window.location.replace('../views/results.html' + '?type=' + type + '&search=' + search);
    });

    console.log('bla2');

    fetch(popular_Movie_ENDPOINT)
        .then(parsedResponse)
        .then(getPopularMovies)
        .then(renderResults)
        .catch(console.log('ERROR!!!'));
});

//Get Popular

/*const fetchPopularMovie = async (popular_Movie_ENDPOINT) => {

    console.log(popular_Movie_ENDPOINT);

    let container = document.getElementById('page__main-container');
    container.innerHTML = "<p>Getting movie information...</p>";

    try {
        let parsedResponse = await parseResponse(popular_Movie_ENDPOINT);
        let popularData = await getPopularData(parsedResponse);
        console.log(popularData);
    } catch (error) {
        console.log('Problem!');
    }
}*/

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

function renderResults(movies) {
    //page_list_popular

    const result = document.getElementById('page_list_popular');

    for(let i=0; i<5; i++) {
        const item = document.createElement('div');
        item.innerHTML = `<img src="http://image.tmdb.org/t/p/original/${movies[i].img}"
        alt='${movies[i].title}' class='movie-poster_result' draggable='false'/>`

        result.appendChild(item);
    }

}