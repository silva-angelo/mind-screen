window.onload = async () => {
  const API_KEY = "699c5ef1665132d7f67266a73389f90a";
  console.log("hello");

  let userInput = "star wars";
    // let userInput = "asdfasfsdaf";
    // let userInput = "!";

  fetchMovies(API_KEY, userInput);
};

const fetchMovies = (API_KEY, userInput) => {
  console.log("hello again");
  const gridContainer = document.getElementById("grid-container");

  // userInput = userInput.replace('\s', '%20');

  fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${userInput}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      console.log(data.results);
	  console.log(data.page);
	  console.log(data.page[0]);

      if (data.total_results > 0) {
        

        for (let j = 0; j < data.page; j++) {
			// const dataPage = data.page
			const movies = data.results;
          for (let i = 0; i < movies.length; i++) {
            const cell = document.createElement("div");

            cell.innerHTML = `
		<img src="http://image.tmdb.org/t/p/original/${movies[i].poster_path}" 
		alt="${movies[i].original_title}" class="movie-poster_result" draggable='false'/>`;

            console.log(cell);
            console.log(cell.value);

            gridContainer.appendChild(cell);
          }
        }
      } else {
        const p = document.createElement("p");
        p.innerHTML = "No results found";
        gridContainer.appendChild(p);
      }
    })
    .catch((err) => console.error(err));
};

// const getImages = (API_KEY, posterPath) => {
//   const config = `https://api.themoviedb.org/3/configuration?api_key=${API_KEY}`;
//   fetch(config)
//     .then((response) => response.json())
//     .then((data) => {
//       baseImageURL = data.images.secure_base_url;
//       configData = data.images;
//       console.log("config: ", data);
//     })
//     .catch((err) => console.error(err));
// };

// const showResults = async () => {};
