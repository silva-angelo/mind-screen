window.onload = () => {

    let movie_id = 299534// Matrix: 603 replace here
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    // INSERT ENDPOINT FOR IMAGE CONFIG

    const PEOPLE_IMAGES_ENDPOINT = `https://api.themoviedb.org/3/person/{person_id}/images?api_key=${API_KEY}`;

    fetchMovie(movie_id, API_KEY);
}

const fetchMovie = async (movie_id, API_KEY) => {

    let container = document.getElementById('page__main-container');
    container.innerHTML = "<p>Getting movie information...</p>";

    const MOVIE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${API_KEY}&language=en-US`);

    const MOVIE_IMAGES_ENDPOINT = fetch(`
https://api.themoviedb.org/3/movie/${movie_id}/images?api_key=${API_KEY}&language=en-US&include_image_language=en`);

    const PEOPLE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${API_KEY}&language=en-US`)

    try {
        let ENDPOINTS = await Promise.all([MOVIE_DATA_ENDPOINT, MOVIE_IMAGES_ENDPOINT, PEOPLE_DATA_ENDPOINT]);

        let parsedResponse = await parseResponse(ENDPOINTS);

        let movieData = await getMovieData(parsedResponse);
        let movieImages = await getMovieImages(parsedResponse);
        let peopleData = await getPeopleData(parsedResponse);

        showData(movieData, movieImages, peopleData);
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
    endpointsResponse[2].json()];
}

const getMovieData = (data) => {

    let movieData = data[0];

    return movieData;
}

const getMovieImages = (data) => {

    let movieImages = data[1];

    return movieImages;
}

const getPeopleData = (data) => {

    let peopleData = data[2];

    return peopleData;
}


const showData = (movieData, movieImages, peopleData) => {

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
            console.log('test')
        }
        return filteredPersonsNames;
    };

    // MOVIE DATA
    let title = movieData.original_title;
    let releaseDate = movieData.release_date;
    let synopsis = movieData.overview;

    // MOVIE IMAGES


    // PEOPLE DATA
    let crew = peopleData.crew;
    let director = getCrewNames('Director');
    let screenplay = getCrewNames('Writing');

    // HTML UPDATE

    let container = document.getElementById('page__main-container');

    container.innerHTML = `
    <img id='page__main-container__poster'
                src='https://bloximages.chicago2.vip.townnews.com/newsbug.info/content/tncms/assets/v3/editorial/9/8e/98eb7be2-58c7-5a91-83f3-a11d8386b009/609940243eda1.image.jpg'
                alt='Movie poster'>

            <div id='page__main-container__data'>
                <!-- background-image is backdrop_path-->
                <h1 id='page__main-container__data__movie-title'>${title}</h1>
                <p id='page__main-container__data__release-date'>${releaseDate}</p>
                <p id='page__main-container__data__synopsis'>${synopsis}</p>

                <div id='page__main-container__data__credits'>
                    Directed by <span id='page__main-container__data__credits__director'>${director}</span>
                    <br>
                    Screenplay by <span id='page__main-container__data__credits__screenplay'>${screenplay}</span>
                </div>

                <div id='page__main-container__data__cast-data'>
                    <p id='page__main-container__data__cast-data__starring'>Starring...</p>

                    <div id='page__main-container__data__cast-data__actors-container'>
                        <div id='page__main-container__data__cast__actors-container__item'>
                            <img id='page__main-container__data__cast__actors-container__item__photo'>
                            <p id='page__main-container__data__cast__actors-container__item__name'>Actor Name</p>
                        </div>
                    </div>
                </div>
            </div>
    `;
}

const getError = (error) => {
    console.log(error);
}