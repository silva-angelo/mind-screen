window.onload = () => {

    let media_type = 'movie'; // 'movie' or 'tv'
    let media_id = 4512; // Matrix: 603 Endgame: 299534 Bo Burnham: 823754 Occupy Wallstreet: 158993 Hannibal: 40008 GoT: 1399 Firefly: 1437 Loki: 84958
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    fetchMovie(media_type, media_id, API_KEY);
}

const fetchMovie = async (media_type, media_id, API_KEY) => {

    let container = document.getElementById('page__main-container');
    container.innerHTML = "<p>Getting information...</p>";

    const MEDIA_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${API_KEY}&language=en-US&append_to_response=videos`);

    let PEOPLE_DATA_ENDPOINT;

    if (media_type === 'tv') {
        PEOPLE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/${media_type}/${media_id}/aggregate_credits?api_key=${API_KEY}&language=en-US`);
    } else if (media_type === 'movie') {
        PEOPLE_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/${media_type}/${media_id}/credits?api_key=${API_KEY}&language=en-US`);
    }

    const CONFIG_IMAGES_ENDPOINT = fetch(`https://api.themoviedb.org/3/configuration?api_key=${API_KEY}`);

    try {
        let ENDPOINTS = await Promise.all([MEDIA_DATA_ENDPOINT, PEOPLE_DATA_ENDPOINT, CONFIG_IMAGES_ENDPOINT]);

        let parsedResponse = await parseResponse(ENDPOINTS);

        let mediaData = await getMediaData(parsedResponse);
        let peopleData = await getPeopleData(parsedResponse);
        let imagesConfig = await getImagesConfig(parsedResponse);

        showData(mediaData, peopleData, imagesConfig);
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

const getMediaData = (data) => {

    let mediaData = data[0];

    return mediaData;
}

const getPeopleData = (data) => {

    let peopleData = data[1];

    return peopleData;
}

const getImagesConfig = (data) => {

    let configData = data[2];

    return configData;
}

const showData = (mediaData, peopleData, configImages) => {

    let getCrewNames = (activity) => {

        let filteredPersons = [];
        let filteredPersonsNames = '';

        if (activity === 'Director') {
            filteredPersons = crew.filter(person => person.job == activity);
        } else if (activity === 'Writing') {
            filteredPersons = crew.filter(person => person.department == activity);
        } else if (activity === 'Creator') {
            for (let c = 0; c < mediaData.created_by.length; c++) {
                filteredPersons[c] = mediaData.created_by[c];
            }
        }

        for (let i = 0; i < filteredPersons.length; i++) {
            if (i == (filteredPersons.length - 1)) {
                filteredPersonsNames += filteredPersons[i].name;
                break;
            }

            if (i == (filteredPersons.length - 2)) {
                filteredPersonsNames += filteredPersons[i].name + ' & ';
                continue;
            }

            filteredPersonsNames += filteredPersons[i].name + ', ';
        }

        if (!filteredPersonsNames) {
            return 'unknown';
        }

        return filteredPersonsNames;
    };

    let getReleaseYear = () => {

        let year = releaseDateUSFormat.split('-');

        return year[0];
    }

    let getReleaseDateFormatted = () => {

        let releaseDateElementsArray = releaseDateUSFormat.split('-').reverse().join('/');

        return releaseDateElementsArray;
    }

    let getGenres = () => {

        let genres = mediaData.genres;

        let genresString = ' ';

        for (let i = 0; i < genres.length; i++) {
            if (i === genres.length - 1) {
                genresString += genres[i].name;
                break;
            }

            genresString += genres[i].name + ' • ';
        }

        return genresString;
    }

    let getTrailer = () => {
        let videos = mediaData.videos.results; // Returns the first released video.
        let trailerURL = '';

        if (videos.length > 0) {
            let trailerKey = videos[videos.length - 1].key;
            trailerURL = 'https://www.youtube.com/watch?v=' + trailerKey;
        } else {
            trailerURL = 'https://www.youtube.com/watch?v=3YiIxopZKpY'; // TODO: Leave this if trailer not found?
        }

        return trailerURL;
    }

    // MEDIA DATA
    // Movies contain mediaData.original_title, TV series contain mediaData.original_name
    let isMovie = mediaData.original_title;
    // let isSeries = !mediaData.original_title;

    let title = '';
    let releaseDateUSFormat = '';
    let numberOfSeasons = '';
    let numberOfEpisodes = '';

    if (isMovie) {
        title = mediaData.original_title;
        releaseDateUSFormat = mediaData.release_date;
    } else {
        title = mediaData.original_name;
        releaseDateUSFormat = mediaData.first_air_date;

        // SEASON & EPISODE PLURALITY CHECKER
        if (mediaData.number_of_seasons === 1) {
            numberOfSeasons = mediaData.number_of_seasons + ' season';
        } else {
            numberOfSeasons = mediaData.number_of_seasons + ' seasons';
        }

        if (mediaData.number_of_episodes === 1) {
            numberOfEpisodes = mediaData.number_of_episodes + ' episode';
        } else {
            numberOfEpisodes = mediaData.number_of_episodes + ' episodes';
        }
    }

    let releaseDateFormatted = getReleaseDateFormatted();
    let releaseYear = getReleaseYear();
    let synopsis = mediaData.overview;
    let genres = getGenres();
    let trailer = getTrailer();

    // PEOPLE DATA
    let crew = peopleData.crew;
    let filmmaker = '';
    let roleBy = '';

    if (isMovie) {
        filmmaker = getCrewNames('Director');
        roleBy = 'Directed by ';
    } else {
        filmmaker = getCrewNames('Creator');
        roleBy = 'Created by ';
    }

    let screenplay = getCrewNames('Writing');

    let cast = peopleData.cast;

    // IMAGES    
    let baseURL = configImages.images.secure_base_url;
    let imageSize = 'original';
    let poster = baseURL + imageSize + mediaData.poster_path;
    let backdrop = baseURL + imageSize + mediaData.backdrop_path;
    let unavailableImage = '../resources/unavailable_image.png';

    // <NOT FOUND IMAGE> REPLACED BY OUR <UNAVAILABLE IMAGE> PLACEHOLDER
    if (poster.includes('null')) {
        poster = unavailableImage;
    }

    if (backdrop.includes('null')) {
        backdrop = unavailableImage;
    }

    // HTML UPDATE
    let container = document.getElementById('page__main-container');

    container.innerHTML = `
    <img id='page__main-container__backdrop' src='${backdrop}' alt='${title} Background Image'>
    <img id='page__main-container__poster' src='${poster}' alt='${title} Poster'>    

    <div id='page__main-container__data'>            
    
        <h1 id='page__main-container__data__movie-title'>${title}</h1>
        <p id='page__main-container__data__release-year'>${releaseYear}</p>
        <div id='page__main-container__data__categories'>
            <span id='page__main-container__data__categories__genres'>${genres}</span>
            <span id='page__main-container__data__categories__amount' style='display:none;'>
                —
                <span id='page__main-container__data__categories__amount__episodes'>${numberOfEpisodes}</span> in <span id='page__main-container__data__categories__amount__seasons'>${numberOfSeasons}</span>
            </span>
            —
            <a id='page__main-container__data__categories__trailer' href='${trailer}'>Trailer</a>
        </div>
        <p id='page__main-container__data__release-date'>Release Date: ${releaseDateFormatted}</p>        
        <p id='page__main-container__data__synopsis'>${synopsis}</p>

        <hr>

        <div id='page__main-container__data__credits'>
            <span id='page__main-container__data__credits__role-by'>${roleBy} </span><span id='page__main-container__data__credits__director'>${filmmaker}</span>
            <br>
            <br>
            Written by <span id='page__main-container__data__credits__writer'>${screenplay}</span>
        </div>

        <div id='page__main-container__data__cast-data'>
            <p id='page__main-container__data__cast-data__starring'>Starring:</p>
            <div id='page__main-container__data__cast-data__actors-container'>                
            </div>
        </div>
    </div>    
    `;

    if (!isMovie) {
        let showEpsAndSeason = document.getElementById('page__main-container__data__categories__amount');
        showEpsAndSeason.setAttribute('style', 'display: inline;');
    }

    // CAST UPDATE

    let castContainer = document.getElementById('page__main-container__data__cast-data__actors-container');

    for (let i = 0; i < cast.length; i++) {
        let castContainerItem = document.createElement('div');
        castContainerItem.className = 'page__main-container__data__cast__actors-container__item';

        let actorPhoto = baseURL + imageSize + cast[i].profile_path;
        let actorName = cast[i].name;
        let characterName = '';

        if (isMovie) {
            characterName = cast[i].character;
        } else {
            characterName = cast[i].roles[0].character;
        }

        if (actorPhoto.includes('null')) {
            actorPhoto = unavailableImage;
        }

        castContainer.appendChild(castContainerItem);

        castContainerItem.innerHTML += `                
                <img class='page__main-container__data__cast__actors-container__item__photo' data-lazy='${actorPhoto}' alt="${actorName}'s Photo">
                <p class='page__main-container__data__cast__actors-container__item__name'>${actorName}</p>       
                <hr>                
                <p class='page__main-container__data__cast__actors-container__item__character'>${characterName}</p>
                `
    }

    // CAST CAROUSEL (SLICK)



    $(document).ready(function () {

        $('#page__main-container__data__categories__trailer').magnificPopup({
            type: 'iframe'
        });

        $('#page__main-container__data__cast-data__actors-container').slick({
            infinite: false,
            lazyLoad: 'ondemand',
            slidesToShow: 5.5,
            slidesToScroll: 5,
            arrows: false,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: false,
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1
                    }
                }
            ],
        });


    });
}

const getError = (error) => {
    console.log(error);
}

// TODO
// RESPONSIVE CHECKS/MEDIA QUERIES

// ADD FAVICON TO ALL HTMLs
// CHANGE PAGE TITLES TO MINDSCREEN?
// ADD PLACEHOLDER FOR UNAVAILABLE IMAGES IN ALL HTMLs
// ADD TMBD LOGO/CREDITS
// CHECK IF ALL IMGS HAVE ALT FOR ACCESSIBILITY
// HIDE APIKEY?