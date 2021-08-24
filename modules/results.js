window.onload = async () => {
  const API_KEY = "699c5ef1665132d7f67266a73389f90a";

  let userInput = "star wars";
//   let userInput = "three billboards outside";
  // let userInput = "asdfasfsdaf";
  // let userInput = "!";

  fetchMovies(API_KEY, userInput);
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
					alt="${movies[i].original_title}" class="movie-poster_result" id="${movies[i].id}" draggable='false'/>
					<div class='poster__description_layer'>
					<p class='poster__description'>${movies[i].original_title}<br>
					(${getYear(movies[i].release_date)})<br>
					${movies[i].vote_average}/10</p>
					</div>`;

				gridContainer.appendChild(cell);
			}
		} else {
        const p = document.createElement("p");
        p.innerHTML = "No results found";
        gridContainer.appendChild(p);
      }
    })
    .catch((err) => console.error(err));
};


const getYear = (movieDate) => {
  let date = new Date(movieDate);
  return date.getFullYear();
};

const getDetails = async(posterWrap) => {
	let poster = posterWrap.children[0];
	const movieId = poster.id;
	window.location.replace('../views/details.html' + '?' + movieId);
}

// const moveOutPoster = async (poster) => {
// 	poster.style.filter = "blur(0px)";
// 	poster.style.border = "thick solid var(--alabaster)";
// 	poster.style.filter = "brightness(100%)";

// 	const posterWrap = poster.parentElement;
// 	const posterDescription = posterWrap.children[1];

// 	posterDescription.style.visibility = "hidden";
// };

// const mouseOverPoster = async (poster) => {
// 	poster.style.filter = "blur(2.5px)";
// 	poster.style.border = "thick solid var(--maizeCrayola)";
// 	poster.style.filter = "brightness(50%)";

// 	const posterWrap = poster.parentElement;
// 	const posterDescription = posterWrap.children[1];

// 	posterDescription.style.visibility = "visible";
// };

//onmouseover="mouseOverPoster(this)" 
// onmouseout="moveOutPoster(this)"