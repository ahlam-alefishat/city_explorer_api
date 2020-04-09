'use strict';
const superagent = require('superagent');

module.exports =Yelp;


function Yelp(yelp) {
  this.name = yelp.name;
  this.image_url = yelp.image_url;
  this.price = yelp.price;
  this.rating = yelp.rating;
  this.url = yelp.url;
  this.created_at = Date.now();
}
  
  