window.onload = () => {
	const API_KEY = "699c5ef1665132d7f67266a73389f90a";

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	//mindscreen.blah/results/?media_type=movie&search=star%20wars
	//mindscreen.blah/results/?media_type=tv&search=the%20walking%20dead

	const mediaType = urlParams.get("media_type");
	const searchQuery = urlParams.get("search");

	switch (mediaType) {
		case "tv":
			fetchSeries(API_KEY, searchQuery);
			break;
		case "movie":
		default:
			fetchMovies(API_KEY, searchQuery);
			break;
	}
};

const fetchMovies = (API_KEY, userInput) => {
	const gridContainer = document.getElementById("grid-container");

	fetch(
		`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${userInput}`
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.total_results > 0) {
				const movies = data.results;

				for (let i = 0; i < movies.length; i++) {
					const cell = document.createElement("div");
					cell.setAttribute("class", "poster__wrap");
					cell.setAttribute("onclick", "getDetails(this)");

					cell.innerHTML = `
						<img src="http://image.tmdb.org/t/p/original/${movies[i].poster_path}" 
							alt="${movies[i].original_title}" class="poster_result"
							id="${movies[i].id}" draggable='false'/>
						<div class='poster__description_layer'>
							<p class='poster__description'>${movies[i].original_title}<br>
								(${getYear(movies[i].release_date)})<br>
								${movies[i].vote_average}/10</p>
						</div>`;

					gridContainer.appendChild(cell);
				}
				$(document).ready(function () {
					$(".grid-container").slick({
						rows: 2,
						infinite: false,
						arrows: true,
						draggable: false,
						slidesToShow: 5,
						slidesToScroll: 6,
					});
				});
			} else {
				const p = document.createElement("p");
				p.innerHTML = "No results found";
				gridContainer.appendChild(p);
			}
		})
		.catch((err) => console.error(err));
};

const fetchSeries = (API_KEY, searchQuery) => {
	const gridContainer = document.getElementById("grid-container");

	fetch(
		`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=en-US&query=${searchQuery}`
	)
		.then((response) => response.json())
		.then((data) => {
			if (data.total_results > 0) {
				const series = data.results;

				for (let i = 0; i < series.length; i++) {
					const cell = document.createElement("div");
					cell.setAttribute("class", "poster__wrap");
					cell.setAttribute("onclick", "getDetails(this)");

					cell.innerHTML = `
						<img src="http://image.tmdb.org/t/p/original/${series[i].poster_path}" 
							alt="${series[i].name}" class="poster_result"
							id="${series[i].id}" draggable='false'/>
						<div class='poster__description_layer'>
							<p class='poster__description'>${series[i].name}<br>
								(${getYear(series[i].first_air_date)})<br>
								${series[i].vote_average}/10</p>
						</div>`;

					gridContainer.appendChild(cell);
				}

				$(document).ready(function () {
					$(".grid-container").slick({
						rows: 2,
						infinite: false,
						draggable: false,
						slidesToShow: 5,
						slidesToScroll: 6,
					});
				});
			} else {
				const p = document.createElement("p");
				p.innerHTML = "No results found";
				gridContainer.appendChild(p);
			}
		})
		.catch((err) => console.error(err));
};

const getYear = (resultDate) => {
	let date = new Date(resultDate);
	return date.getFullYear();
};

// const getDetails = async (mediaType, posterWrap) => {
// 	let poster = posterWrap.children[0];
// 	const mediaId = poster.id;
// 	window.location.replace(
// 		`../views/details.html?media_type=${mediaType}&media_id=${mediaId}`
// 	);
// };