'use strict';
require('dotenv').config();
const client = require('./client.js');
const superagent = require('superagent');
const error=require('./error.js');

// function locationHandler(request, response) {
//   const city = request.query.city;
//   getLocation(city)
//     .then(locationData => response.status(200).json(locationData));
// }




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

module.exports =getLocation;