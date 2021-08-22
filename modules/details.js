window.onload = () => {

    let movie_id = 299534 // Matrix: 603 Endgame: 299534// replace here
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    const PEOPLE_IMAGES_ENDPOINT = `https://api.themoviedb.org/3/person/{person_id}/images?api_key=${API_KEY}`;

    fetchMovie(movie_id, API_KEY);
}

const fetchMovie = async (movie_id, API_KEY) => {

    let container = document.getElementById('page__main-container');
    container.innerHTML = "<p>Getting movie information...</p>";

    const MOVIE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}&language=en-US`);

    const PEOPLE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${API_KEY}&language=en-US`)

    const CONFIG_IMAGES_ENDPOINT = fetch(`https://api.themoviedb.org/3/configuration?api_key=${API_KEY}`)

    try {
        let ENDPOINTS = await Promise.all([MOVIE_DATA_ENDPOINT, PEOPLE_DATA_ENDPOINT, CONFIG_IMAGES_ENDPOINT]);

        let parsedResponse = await parseResponse(ENDPOINTS);

        let movieData = await getMovieData(parsedResponse);
        let peopleData = await getPeopleData(parsedResponse);
        let imagesConfig = await getImagesConfig(parsedResponse);

        showData(movieData, peopleData, imagesConfig);
    } catch (error) {
        getError(error);
    }
}

const parseResponse = (endpointsResponse) => {

    for (let i = 0; i < endpointsResponse.length; i++) {
        if (!endpointsResponse[i].ok) {
            throw new Error('Error: ' + endpointsResponse.status);
        }
    }

    return [endpointsResponse[0].json(),
    endpointsResponse[1].json(),
    endpointsResponse[2].json()
    ];
}

const getMovieData = (data) => {

    let movieData = data[0];

    return movieData;
}

const getPeopleData = (data) => {

    let peopleData = data[1];

    return peopleData;
}

const getImagesConfig = (data) => {

    let configData = data[2];

    return configData;
}


const showData = (movieData, peopleData, configImages) => {

    let getCrewNames = (activity) => {

        let filteredPersons = [];
        let filteredPersonsNames = '';

        if (activity === 'Director') {
            filteredPersons = crew.filter(person => person.job == activity);
        } else if (activity === 'Writing') {
            filteredPersons = crew.filter(person => person.department == activity);
        }

        for (let i = 0; i < filteredPersons.length; i++) {
            if (i == (filteredPersons.length - 1)) {
                filteredPersonsNames += filteredPersons[i].name;
                break;
            }

            filteredPersonsNames += filteredPersons[i].name + ' & ';
        }

        if (!filteredPersonsNames) {
            console.log('test') /////////////////////////////////////////////////////////// TODO -> keep?
            return 'unknown';
        }
        return filteredPersonsNames;
    };

    // MOVIE DATA
    let title = movieData.original_title;
    let releaseDate = movieData.release_date; // TODO -> Show year only, full date or both?
    let synopsis = movieData.overview;

    // PEOPLE DATA
    let crew = peopleData.crew;
    let director = getCrewNames('Director');
    let screenplay = getCrewNames('Writing');

    let cast = peopleData.cast;
    let actorName = cast[0].name;
    let characterName = cast[0].character;

    // IMAGES    
    let baseURL = configImages.images.secure_base_url;
    let imageSize = 'original'; // TODO -> keep original size or reduce to w500/w780 for loading/performance purposes?    
    let poster = baseURL + imageSize + movieData.poster_path;
    let backdrop = baseURL + imageSize + movieData.backdrop_path;
    let actorPhoto = baseURL + imageSize + cast[0].profile_path;

    // HTML UPDATE

    let container = document.getElementById('page__main-container');

    container.innerHTML = `
    <img id='page__main-container__backdrop' src='${backdrop}' alt='${title} Background Image'>
    <img id='page__main-container__poster' src='${poster}' alt='${title} Poster'>    
    

    <div id='page__main-container__data'>            
    
        <h1 id='page__main-container__data__movie-title'>${title}</h1>
        <p id='page__main-container__data__release-date'>${releaseDate}</p>
        <p id='page__main-container__data__synopsis'>${synopsis}</p>

        <div id='page__main-container__data__credits'>
            Directed by <span id='page__main-container__data__credits__director'>${director}</span>
            <br>
            Written by <span id='page__main-container__data__credits__writer'>${screenplay}</span>
        </div>

        <div id='page__main-container__data__cast-data'>
            <p id='page__main-container__data__cast-data__starring'>Starring...</p>

            <div id='page__main-container__data__cast-data__actors-container'>
                <div id='page__main-container__data__cast__actors-container__item'>
                    <img id='page__main-container__data__cast__actors-container__item__photo' src='${actorPhoto}'>
                    <p id='page__main-container__data__cast__actors-container__item__name'>${actorName}</p>
                    <p id='page__main-container__data__cast__actors-container__item__character'>${characterName}</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

const getError = (error) => {
    console.log(error);
}