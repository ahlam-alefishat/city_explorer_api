'use strict';
const superagent = require('superagent');

module.exports =Movie;




function Movie(movie) {
  this.title = movie.title;
  this.overview = movie.overview;
  this.average_votes = movie.average_votes;
  this.total_votes = movie.total_votes;
  this.image_url = "https://image.tmdb.org/t/p/w500/afkYP15OeUOD0tFEmj6VvejuOcz.jpg";
  this.popularity = movie.popularity;
  this.released_on = movie.released_on;
}


  
