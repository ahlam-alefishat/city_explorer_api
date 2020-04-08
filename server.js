'use strict';


// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');


//Application Dependencies
const PORT = process.env.PORT;
const app = express();
app.use(cors());
const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();

app.get('/', (request, response) => {
  response.send('WELCOME TO THE HOME PAGE! ');
})

function errorHandler(error, request, response) {
  response.status(500).send(error);
}


//Route Definitions 
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);


//
function locationHandler(request, response) {
  const city = request.query.city;
  getLocation(city)
    .then(locationData => response.status(200).json(locationData));
}


let lat;
let lon;
let formatted_Query;

function getLocation(city) {

  let SQL = 'SELECT * FROM locations WHERE search_query=$1;';
  let safeValues = [city];

  return client.query(SQL, safeValues)
  
    .then(results => {
      console.log("/////////////////////////////",results.rows.length);
      if (results.rows.length) { 
        console.log("----------------------------",results.rows[0]);
        return results.rows[0]; }
      else {
        console.log("-+++++++++++++++++++++++++++++++++++++++++");
        let key = process.env.GEOCODE_API_KEY;
        const url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
        return superagent.get(url)
          .then(geoData => {
            const locationData = new Location(city, geoData.body);
            formatted_Query = locationData.formatted_query;
            lat = locationData.latitude;
            lon = locationData.longitude;
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

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}


function weatherHandler(request, response) {
  const city = request.query.search_query;
  getWeather(city)
    .then(weatherData => response.status(200).json(weatherData));

  const weatherSummaries = [];

  function getWeather(city) {
    let key = process.env.WEATHER_API_KEY;

    const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}`;

    return superagent.get(url)

      .then(weatherData => {
        //  console.log(weatherData.body.data);
        weatherData.body.data.map(val => {
          let weather = new Weather(val);
          weatherSummaries.push(weather);
        });

        return weatherSummaries;

      });
  }
}


function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}


function trailsHandler(request, response) {
  lat=request.query.lat;
  lon=request.query.lon;
  getTrails(lat,lon)
    .then(trailsData =>{ response.status(200).json(trailsData);
    })
}


function getTrails(lat,lon) {
  let key = process.env.TRAILS_API_KEY;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;
   return superagent.get(url)
    .then(trailsData => {
      trailsData.body.trails.map(val => {
        return new Trail(val);
      });
      return trailsData;
    });
}

function Trail(val) {
  this.id = val.id;
  this.name = val.name;
  this.location = val.location;
  this.length = val.length;
  this.stars = val.stars;
  this.star_votes = val.starVotes;
  this.summary = val.summary;
  this.trail_url = val.url;
  this.conditions = val.conditionStatus;
  this.condition_date = val.conditionDate.substring(0, 11);
  this.condition_time = val.conditionDate.substring(11);
}



client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on PORT${PORT}`);
    });
  })