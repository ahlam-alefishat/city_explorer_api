'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();

const superagent = require('superagent');



// function moviesHandler(request, response) {
//   let movie = request.query.search_query;
//   getMovies(movie)
//     .then(moviesData => {
//       response.status(200).json(moviesData);
//     });
// }


function getMovies(movie) {

  let key = process.env.MOVIE_API_KEY;
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${movie}`;
  return superagent.get(url)
    .then((moviesData) => {
      let movies = moviesData.body.results.map(movie => {
        return new Movie(movie, 'https://image.tmdb.org/t/p/w500/');
      }); return movies;
    });
  // .catch(err => errorHandler(err, request, response));
};




function Movie(movie, path) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.average_votes;
  this.total_votes = movie.total_votes;
  this.image_url = path + movie.poster_path;
  this.popularity = movie.popularity;
  this.released_on = movie.released_date;
}

module.exports=getMovies;
