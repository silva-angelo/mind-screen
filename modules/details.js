window.onload = () => {

    let media_type = 'tv'; // 'movie' or 'tv'
    let media_id = 40008; // Matrix: 603 Endgame: 299534 Bo Burnham: 823754 Occupy Wallstreet: 158993 Hannibal: 40008 GoT: 1399
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    fetchMovie(media_type, media_id, API_KEY);
}

const fetchMovie = async (media_type, media_id, API_KEY) => {

    let container = document.getElementById('page__main-container');
    container.innerHTML = "<p>Getting information...</p>";

    const MEDIA_DATA_ENDPOINT = fetch(`https://api.themoviedb.org/3/${media_type}/${media_id}?api_key=${API_KEY}&language=en-US`);

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

    // MOVIE/TV SHOW CHECKER

    let title = '';
    let releaseDateUSFormat = '';

    if (mediaData.original_title) {
        title = mediaData.original_title;
        releaseDateUSFormat = mediaData.release_date;

    } else {
        title = mediaData.original_name;
        releaseDateUSFormat = mediaData.first_air_date;
    }
    // MOVIE DATA
    //let title = mediaData.original_title;
    //let releaseDateUSFormat = mediaData.release_date;
    let releaseDateFormatted = getReleaseDateFormatted();
    let releaseYear = getReleaseYear();
    let synopsis = mediaData.overview;

    // PEOPLE DATA
    let crew = peopleData.crew;
    let filmmaker = '';
    let roleBy = '';

    if (mediaData.original_title) {
        filmmaker = getCrewNames('Director');
        roleBy = 'Directed by ';
    } else {
        filmmaker = getCrewNames('Creator');
        roleBy = 'Created by ';
    }

    let screenplay = getCrewNames('Writing');

    let cast = peopleData.cast;

    console.log(cast);
    /*let actorName = cast[0].name;
    let characterName = cast[0].character; 
    let actorPhoto = baseURL + imageSize + cast[0].profile_path;*/

    // IMAGES    
    let baseURL = configImages.images.secure_base_url;
    let imageSize = 'original'; // TODO -> keep original size or reduce to w500/w780 for loading/performance purposes?    
    let poster = baseURL + imageSize + mediaData.poster_path;
    let backdrop = baseURL + imageSize + mediaData.backdrop_path;
    let unavailableImage = '../resources/unavailable_image.png';

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

    // CAST UPDATE

    let castContainer = document.getElementById('page__main-container__data__cast-data__actors-container');

    for (let i = 0; i < cast.length; i++) {
        let castContainerItem = document.createElement('div');
        castContainerItem.className = 'page__main-container__data__cast__actors-container__item';

        let actorPhoto = baseURL + imageSize + cast[i].profile_path;
        let actorName = cast[i].name;
        let characterName = '';

        if (mediaData.original_title) {
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
// ADD GENRES
// ADD TOTAL SEASONS + TOTAL EPS IN TV SHOWS
// REPLACE TV DIRECTOR WITH TV CREATOR

// ADD FAVICON TO ALL HTMLs
// ADD PLACEHOLDER FOR UNAVAILABLE IMAGES IN ALL HTMLs
// ADD TMBD LOGO/CREDITS
// CHECK IF ALL IMGS HAVE ALT FOR ACCESSIBILITY
// HIDE APIKEY?