'use strict';

const superagent = require('superagent');



function Weather(day) {
  this.forecast = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}
module.exports =Weather;
