'use strict';
// Load Environment Variables from the .env file
require('dotenv').config();

const superagent = require('superagent');

// function yelpHandler(request, response) {
//   let yelp = request.query.search_query;
//   getYelp(yelp)
//     .then(yelpData => { 
//       response.status(200).json(yelpData)
//     });
// }



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


module.exports=getYelp;