window.onload = () => {
	const API_KEY = "699c5ef1665132d7f67266a73389f90a";

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	//mindscreen.blah/results/?media_type=movie&search=star%20wars
	//mindscreen.blah/results/?media_type=tv&search=the%20walking%20dead

	let mediaType = urlParams.get("media_type");
	const searchQuery = urlParams.get("search");

	switch (mediaType) {
		case "tv":
			fetchResults(API_KEY, mediaType, searchQuery);
			break;
		case "movie":
		default:
			mediaType = "movie";
			fetchResults(API_KEY, mediaType, searchQuery);
			break;
	}
};

const fetchResults = (API_KEY, mediaType, searchQuery) => {
	fetch(
		`https://api.themoviedb.org/3/search/${mediaType}?api_key=${API_KEY}&language=en-US&query=${searchQuery}`
	)
		.then((response) => parseResponse(response))
		.then((data) => getResults(data, mediaType))
		.then((results) => displayResults(results))
		.catch((err) => console.error(err));
};

const parseResponse = (response) => {
	if (!response.ok) {
		throw new Error("Error: " + response.status);
	}

	return response.json();
};

const getResults = (data, mediaType) => {
	let result = data.results.map((results) => {
		switch (mediaType) {
			case "movie":
				return {
					id: results.id,
					title: results.original_title,
					poster: results.poster_path,
					date: results.release_date,
					rating: results.vote_average,
					media_type: mediaType,
				};
			case "tv":
				return {
					id: results.id,
					title: results.original_name,
					poster: results.poster_path,
					date: results.first_air_date,
					rating: results.vote_average,
					media_type: mediaType,
				};
		}
	});

	return result;
};

const displayResults = (results) => {
	const gridContainer = document.getElementById("grid-container");

	if (results.length > 0) {
		for (let i = 0; i < results.length; i++) {
			const cell = document.createElement("div");

			cell.setAttribute("class", "poster__wrap");
			cell.setAttribute("onclick", "getDetails(this)");

			cell.innerHTML = `
						<img src="${getPoster(results[i].poster)}" 
							alt="${results[i].title}" class="poster_result"
							id="${results[i].media_type} ${
				results[i].id
			}" draggable='false' loading='lazy'/>
						<div class='poster__description_layer'>
							<p class='poster__description'>${results[i].title}<br>
								(${getYear(results[i].date)})<br>
								${results[i].rating}/10</p>
						</div>`;

			gridContainer.appendChild(cell);
		}

		if (results.length > 10) {
			$(document).ready(function () {
				$(".grid-container").slick({
					rows: 2,
					infinite: false,
					arrows: true,
					dots: true,
					draggable: false,
					slidesToShow: 5,
					slidesToScroll: 5,
					prevArrow: `<div class='arrow-container'><div class='arrow' id='prev-arrow'></div></div>`,
					nextArrow: `<div class='arrow-container'><div class='arrow' id='next-arrow'></div></div>`,
				});

				$(".slick-dots").wrap(
					'<div id="dots-container" class="dots-container"></div>'
				);
			});

			setTimeout(() => {
				const dotsContainer = document.getElementById("dots-container");
				const pageMainContainer = document.getElementById("page__main-container");
				pageMainContainer.appendChild(dotsContainer);
			}, 1);
		} else {
			gridContainer.id = 'grid-container__few-results';
		}
	} else {
		const p = document.createElement("p");
		p.innerHTML = "No results found";
		gridContainer.appendChild(p);
	}
};

const getPoster = (posterPath) => {
	if (posterPath === null) {
		return "../resources/unavailable_image.png";
	}

	return `http://image.tmdb.org/t/p/original/${posterPath}`;
};

const getYear = (resultDate) => {
	let date = new Date(resultDate);
	return date.getFullYear();
};

const getDetails = async (posterWrap) => {
	let poster = posterWrap.children[0];
	const idInfo = poster.id.split(" ");
	const mediaType = idInfo[0];
	const mediaId = idInfo[1];

	window.location.assign(
		`../views/details.html?media_type=${mediaType}&media_id=${mediaId}`
	);
};
