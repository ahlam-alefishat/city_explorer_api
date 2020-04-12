'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();
const superagent = require('superagent');

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

module.exports =getWeather;
