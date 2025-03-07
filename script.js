document.addEventListener("DOMContentLoaded", () => {
    const genre = "Action"; 
    const url = `http://localhost:3001/api/movies/${genre}`; 
    const movieList = document.querySelector('.movie-list');
    
    const sortAZ = document.querySelector('[data-sort="asc"]'); // A-Z option
    const sortZA = document.querySelector('[data-sort="desc"]'); // Z-A option

    movieList.innerHTML = '<p style="color: white;">Loading movies...</p>'; 

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("No movies found for this genre.");
            }

            console.log("✅ Movie data received:", data);
            movieList.innerHTML = ''; 

            let movies = [...new Map(data.map(movie => [movie.id, movie])).values()]; // Remove duplicates

            // 🔹 Function to display movies
            function displayMovies(movieArray) {
                movieList.innerHTML = ''; // Clear current movies

                movieArray.forEach(movie => {
                    console.log("🔹 Image URL being used:", movie.poster_url);

                    const movieContainer = document.createElement('div');
                    movieContainer.className = 'movie-container';

                    const baseImageUrl = "http://localhost:3001/images/";

                    const movieImage = document.createElement('img');
                    movieImage.src = movie.poster_url.startsWith("http")
                        ? movie.poster_url
                        : baseImageUrl + movie.poster_url;
                    movieImage.alt = movie.title;
                    movieImage.className = 'movie-image';

                    const movieTitle = document.createElement('p');
                    movieTitle.className = 'movie-title';
                    movieTitle.textContent = movie.title;

                    movieContainer.appendChild(movieImage);
                    movieContainer.appendChild(movieTitle);
                    movieList.appendChild(movieContainer);
                });
            }

            // 🔹 Display initial movies
            displayMovies(movies);

            // 🔹 Add Sorting Functionality
            sortAZ.addEventListener("click", () => {
                console.log("Sorting A-Z");
                movies.sort((a, b) => a.title.localeCompare(b.title));
                displayMovies(movies); // Redisplay sorted movies
            });

            sortZA.addEventListener("click", () => {
                console.log("Sorting Z-A");
                movies.sort((a, b) => b.title.localeCompare(a.title));
                displayMovies(movies); // Redisplay sorted movies
            });
        })
        .catch(error => {
            console.error('❌ Error fetching movies:', error.message);
            movieList.innerHTML = `<p style="color: red;">Error loading movies: ${error.message}</p>`;
        });
});
