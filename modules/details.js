/**
 * On window load: gets parameters from the URL in order to use them in subsequent functions ("media_type" for the type of media ("movie" or "tv") and "media_id" for the respective media's ID), calling the fetchMedia function with our API key which will take care of all the work through the usage of promise-based behaviour with async/await.
 */
window.onload = () => {
    // URL EXAMPLES
    // http://127.0.0.1:5500/views/details.html?media_type=movie&media_id=603      <- Matrix
    // http://127.0.0.1:5500/views/details.html?media_type=tv&media_id=84958         <- Loki
    // #####
    // ID EXAMPLES
    // Matrix: 603 | Endgame: 299534 | Bo Burnham: 823754 | Occupy Wallstreet: 158993 | Hannibal: 40008 | GoT: 1399 | Firefly: 1437 | Loki: 84958

    let params = new URLSearchParams(document.location.search.substring(1));
    let media_type = params.get("media_type");
    let media_id = parseInt(params.get("media_id"), 10);
    const API_KEY = '699c5ef1665132d7f67266a73389f90a';

    fetchMedia(media_type, media_id, API_KEY);
}

/**
 * Fetches TMDB endpoints, fulfilling 3 promises (movie/series call, people involved endpoint and image URL configuration endpoint),
 * showing a placeholder paragraph stating it's "getting information" in case the call takes some time. The promises are then fulfilled and
 * their response is parsed and displayed
 * @param {*} media_type Type of media chosen by the user (movie ("movie") or series ("tv")) for the search
 * @param {*} media_id TMDB's ID for the chosen media, in the form of an integer
 * @param {*} API_KEY API Key used to fetch data from TMDB
 */
const fetchMedia = async (media_type, media_id, API_KEY) => {

    let container = document.getElementById('page__main-container');

    // Media type validation
    if (media_type != "movie" && media_type != "tv") {
        container.innerHTML = "<p>Invalid search, try again with valid search parameters or contact the dev team.</p>";
        return;
    }

    // Media id validation
    if (isNaN(media_id)) {
        container.innerHTML = "<p>Invalid ID, try again with a valid ID or contact the dev team.</p>";
        return;
    }

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

        let parsedResponse = parseResponse(ENDPOINTS);

        let mediaData = await getMediaData(parsedResponse);
        let peopleData = await getPeopleData(parsedResponse);
        let imagesConfig = await getImagesConfig(parsedResponse);

        showData(mediaData, peopleData, imagesConfig);
    } catch (error) {
        getError(error);
    }
}

/**
 * Parses given promises to return an accessible and displayable array of .json objects
 * @param {*} endpointsResponse Response which results from the fulfilled endpoint promises
 * @returns Array of responses in the .json format, with all three called endpoints (movie/series call, people involved endpoint and image URL configuration endpoint)
 */
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

/**
 * Getter for the specific object related with movie/series textual data (from the 1st element in the responses array)
 * @param {*} data Array of responses in the .json format, with all three called endpoints (movie/series call, people involved endpoint and image URL configuration endpoint)
 * @returns Object containing all movie/series textual data according to the requested media
 */
const getMediaData = (data) => {
    let mediaData = data[0];
    return mediaData;
}

/**
 * Getter for the specific object related with cast/crew textual data (from the 2nd element in the responses array)
 * @param {*} data Array of responses in the .json format, with all three called endpoints (movie/series call, people involved endpoint and image URL configuration endpoint)
 * @returns Object containing all cast/crew textual data according to the requested media
 */
const getPeopleData = (data) => {
    let peopleData = data[1];
    return peopleData;
}

/**
 * Getter for the specific object related with image configuration (from the 3nd element in the responses array). TMDB uses the related endpoint
 * to present how the image should be displayed (e.g. fetched image size) and its URL. The rest of the path for the requested image (e.g. poster,
 * backdrop or actor's photo) is available in the other endpoints.
 * @param {*} data Array of responses in the .json format, with all three called endpoints (movie/series call, people involved endpoint and image URL configuration endpoint)
 * @returns Object containing all image/URL configuration data necessary to display images
 */
const getImagesConfig = (data) => {
    let configData = data[2];
    return configData;
}

/**
 * Mother function for the details page. Reunites all available data from the obtained .json objects and stores various keys and values according to the requested media type in order to update/inject the necessary HTML.
 * Contains various getter functions for data which wasn't as easily accessible from the respective object (crew names, release year, formatted release data, genres and trailer URL), along with movie/series checker "checkpoints" where necessary (e.g. when requesting the media's title or how many seasons/episodes a series might have).
 * Contains usage of Magnific Popup for the trailer's pop-up window and slick for the cast display carousel.
 * @param {*} mediaData Object containing all movie/series textual data according to the requested media
 * @param {*} peopleData Object containing all cast/crew textual data according to the requested media
 * @param {*} configImages Object containing all image/URL configuration data necessary to display images
 */
const showData = (mediaData, peopleData, configImages) => {

    /**
     * Getter for necessary crew members' names. This function filters between the corresponding parameter according to the crew member's activity ("Director", in case the chosen media is a movie; "Creator", in case the chosen media is a series; "Writing" for both movies and series). They are subsequently added to the returned string, as various movies/series have multiple directors/creators/writers, and there's also validation to check if there's only one member in that specific department or if it's the penultimate one (in order to choose which separator shows: ",", incase there are multiple ones; "&", in case there are only two/for the penultimate one).
     * @param {*} activity String containing whichever activity/department the crew member belongs to, depending on whether the requested media is a movie or series
     * @returns String containing the names of the crew members in that specific activity/department. In case no value is found on TMDB, it returns "unknown" instead
     */
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

    /**
     * Getter for the release year. TMDB has a release date format which includes the whole date in the US format, this function splits it and gets the first element of the returned array (which is the year)
     * @returns First element of the returned array from the split, which refers to the year data
     */
    let getReleaseYear = () => {
        let year = releaseDateUSFormat.split('-');
        return year[0];
    }

    /**
     * Getter for the release date in European format. TMDB has a release data format which includes the whole date in the US format, this function splits it and reverses the array, joining its elements again afterwards with a different separator ("/" instead of "-").
     * @returns String containing the date in the European format (dd-MM-yyyy)
     */
    let getReleaseDateFormatted = () => {
        let releaseDateElementsArray = releaseDateUSFormat.split('-').reverse().join('/');
        return releaseDateElementsArray;
    }

    /**
     * Getter for the movie/series genres. If there are multiple genres, this function joins them with a " • " separator, in order for the display of such data to be clearer (as there are various single genres with multiple words)
     * @returns String containing available genres for the requested media
     */
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

    /**
     * Getter for the first released trailer. TMDB presents an array with all available trailers, teasers and featurettes for the requested media. The first result of this array refers to the first released video promotion material, which seems to be the ideal choice for anyone who hasn't watched the latest season of a series, for instance. TMDB's value for the trailer element is the video's key which is then added to the URL of the platform hosting it (e.g. Youtube).
     * @returns String containing the trailer's URL to be displayed on a pop-up. If no trailer is available for the request, the pop-up displays such information and if the user clicks YouTube's redirect button, a placeholder video is played.
     */
    let getTrailer = () => {
        let videos = mediaData.videos.results;
        let trailerURL = '';

        if (videos.length > 0) {
            let trailerKey = videos[videos.length - 1].key; // Returns the key for the first released video.
            trailerURL = 'https://www.youtube.com/watch?v=' + trailerKey;
        } else {
            /* If no trailer is found, pop-up will display that the video is unavailable and if the user clicks "Watch On YouTube", they are
            sent to a video of Baby Groot dancing. */
            trailerURL = 'https://www.youtube.com/watch?v=3YiIxopZKpY';
        }

        return trailerURL;
    }

    // ### MEDIA DATA ###
    // Movies contain mediaData.original_title, TV series contain mediaData.original_name
    // let isSeries = !mediaData.original_title;
    let isMovie = mediaData.original_title;

    let title = '';
    let releaseDateUSFormat = '';
    let numberOfSeasons = '';
    let numberOfEpisodes = '';

    // MOVIE/SERIES CHECKER
    /* TMDB has different keys inside the parent object in order to get similar data (e.g. "original_title" for movies and "original_name" for series instead*. This updates the data accordingly.*/
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

    // ### PEOPLE DATA ###
    let crew = peopleData.crew;
    let filmmaker = '';
    let roleBy = '';


    // MOVIE/SERIES CHECKER
    /* Seeing that series often have multiple directors per season (or even episode), series show their creators instead of directors, which is usually the person helming the whole production.*/
    if (isMovie) {
        filmmaker = getCrewNames('Director');
        roleBy = 'Directed by ';
    } else {
        filmmaker = getCrewNames('Creator');
        roleBy = 'Created by ';
    }

    let screenplay = getCrewNames('Writing');
    let cast = peopleData.cast;

    // ### IMAGES ###
    let baseURL = configImages.images.secure_base_url;
    let imageSize = 'original';
    let poster = baseURL + imageSize + mediaData.poster_path;
    let backdrop = baseURL + imageSize + mediaData.backdrop_path;
    let unavailableImage = '../resources/unavailable_image.png'; // In case TMDB has no images available for the requested section.

    // <NOT FOUND IMAGE> REPLACED BY OUR <UNAVAILABLE IMAGE> PLACEHOLDER
    if (poster.includes('null')) {
        poster = unavailableImage;
    }

    if (backdrop.includes('null')) {
        backdrop = unavailableImage;
    }

    // ### HTML UPDATE ###
    /* Usage of all previously stored variables/functions to update the displaying HTML present in the details page by injecting the "page__main-container" div with all necessary HTML elements and template literals */
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

    // If requested media is a series (!isMovie), the HTML above displays the amount of episodes and seasons. Otherwise, this remains hidden.
    if (!isMovie) {
        let showEpsAndSeason = document.getElementById('page__main-container__data__categories__amount');
        showEpsAndSeason.setAttribute('style', 'display: inline;');
    }

    // ### CAST UPDATE ###
    /* Usage of all previously stored variables/functions related to the cast in order to update the displaying HTML present in the cast section by injecting the "page__main-container__data__cast-data__actors-container" div with all necessary HTML elements and template literals and subsequently applying a carousel to display this data in a clearer and performance-friendly manner */
    let castContainer = document.getElementById('page__main-container__data__cast-data__actors-container');

    for (let i = 0; i < cast.length; i++) {
        let castContainerItem = document.createElement('div');
        castContainerItem.className = 'page__main-container__data__cast__actors-container__item';

        let actorPhoto = baseURL + imageSize + cast[i].profile_path;
        let actorName = cast[i].name;
        let characterName = '';

        // MOVIE/SERIES CHECKER
        /* Movies and series have different keys for the character being played by an actor (".character" for movies and ".roles[0].character" for the series */
        if (isMovie) {
            characterName = cast[i].character;
        } else {
            characterName = cast[i].roles[0].character;
        }

        // <NOT FOUND IMAGE> REPLACED BY OUR <UNAVAILABLE IMAGE> PLACEHOLDER
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

    // ### TRAILER POP-UP (MAGNIFIC POPUP) & CAST CAROUSEL (SLICK) ###
    $(document).ready(function () {
        // MAGNIFIC POPUP
        /* Upon clicking the trailer's button-looking link, a pop-up appears in the media's details page containing the first released trailer. This pop-up can be closed by pressing Escape, clicking the closing X icon on the top-right corner or clicking outside the video box.*/
        $('#page__main-container__data__categories__trailer').magnificPopup({
            type: 'iframe'
        });

        // SLICK
        /* Presents a carousel with the whole cast available for the media. This carousel can be used with the (left and right) arrow keys or by dragging to either side. In order to feel more intuitive, half of the first item of the next carousel "page" is shown so that users can understand there's more information to be shown if they so wish. 
        Images use lazy-load to load, in order not to consume resources/mobile data unnecessarily, as plenty of movies/series have hundreds of cast members. This way only 5-6 images are loaded at a time with each slide drag. 
        Also includes breakpoints for mobile/devices with lower resolution, in order to show fewer actor items (photo, name and role).*/
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
                        slidesToScroll: 3.5,
                        infinite: false,
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2.5,
                        slidesToScroll: 2
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 2.5,
                        slidesToScroll: 2
                    }
                }
            ],
        });
    });
}

/**
 * Error logger in case anything goes wrong in the promise chain
 * @param {*} error Error content logged in the console
 */
const getError = (error) => {
    console.log(error);
}