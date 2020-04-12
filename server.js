'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


//Application Dependencies
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());


//Connecting to DataBase
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/', (request, response) => {
  response.send('WELCOME TO THE HOME PAGE! ');
})


//----------------------------------------
//API's
// let locationFun = require('./modules/locations.js');
// let weatherFun = require('./modules/weather.js');
// let trailsFun = require('./modules/trails.js');
// let moviesFun = require('./modules/movies.js');
// let yelpFun = require('./modules/yelps.js');


//----------------------------------------

//Route Definitions 
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);



//----------------------------------------
function locationHandler(request, response) {
  const city = request.query.city;
  getLocation(city)
    .then(locationData => response.status(200).json(locationData));
}
function getLocation(city) {
  let SQL = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];
  return client.query(SQL, safeValues)

    .then(results => {
      if (results.rows.length) {
        return results.rows[0];
      }
      else {
        let key = process.env.GEOCODE_API_KEY;
        const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        return superagent.get(url)
          .then(geoData => {
            const locationData = new Location(city, geoData.body);
            let formatted_Query = locationData.formatted_query;
            let lat = locationData.latitude;
            let lon = locationData.longitude;
            let SQL = 'INSERT INTO locations (search_query,formatted_address,latitude,longitude) VALUES($1,$2,$3,$4);';
            let safeValues = [city, formatted_Query, lat, lon];
            return client.query(SQL, safeValues)
              .then(results => {
                results.rows[0];
              })
          })
      }
    })
    .catch(error => errorHandler(error));
}


// constructor for location
function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}
// ----------------------------------------


function weatherHandler(request, response) {
  const city = request.query.search_query;
  getWeather(city)
    .then(weatherData => response.status(200).json(weatherData));
}

const weatherSummaries = [];
function getWeather(city) {
  let key = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;
  return superagent.get(url)
    .then(weatherData => {

      weatherData.body.data.map(val => {
        let weather = new Weather(val);
        weatherSummaries.push(weather);
      });
      return weatherSummaries;
    });
}


function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}


//----------------------------------------

function trailsHandler(request, response) {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  getTrails(lat, lon)
    .then(trailsData => {
      response.status(200).json(trailsData)
    });
}

function getTrails(lat, lon) {
  let key = process.env.TRAILS_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${key}`;
  return superagent.get(url)
    .then((trailsData) => {
      let trails = trailsData.body.trails.map(val => {
        return new Trail(val);
      }); return trails;
    });
}

function Trail(val) {
  this.name = val.name;
  this.location = val.location;
  this.length = val.length;
  this.stars = val.stars;
  this.star_votes = val.starVotes;
  this.summary = val.summary;
  this.trail_url = val.url;
  this.conditions = val.conditionDetails;
  this.condition_date = val.conditionDate.substring(0, 11);
  this.condition_time = val.conditionDate.substring(11);

}

//----------------------------------------


function moviesHandler(request, response) {
  let movie = request.query.search_query;
  getMovies(movie)
    .then(moviesData => {
      response.status(200).json(moviesData);
    });
}

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
// ------------------------------
function yelpHandler(request, response) {
  let yelp = request.query.search_query;
  getYelp(yelp)
    .then(yelpData => { 
      response.status(200).json(yelpData)
    });
}

function getYelp(yelp) {
  let yelps = [];
  const key = process.env.YELP_API_KEY;
  const url = `https://api.yelp.com/v3/businesses/search?location=${yelp}`;
  return superagent.get(url)
    .set("Authorization", `Bearer ${process.env.YELP_API_KEY}`)
    .then(yelpData => {
      yelps = yelpData.body.businesses.map(val => {
        return new Yelp(val);
      });
      return yelps;
    });
}

function Yelp(yelp) {
  this.name = yelp.name;
  this.image_url = yelp.image_url;
  this.price = yelp.price;
  this.rating = yelp.rating;
  this.url = yelp.url;
}
// ------------------------------
function errorHandler(error, request, response) {
  response.status(500).send(error);
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on PORT${PORT}`);
    });
  })