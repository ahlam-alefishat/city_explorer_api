'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();
const superagent = require('superagent');

// function trailsHandler(request, response) {
//   let lat = request.query.latitude;
//   let lon = request.query.longitude;
//   getTrails(lat, lon)
//     .then(trailsData => {
//       response.status(200).json(trailsData)
//     });
// }




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


module.exports = getTrails;
