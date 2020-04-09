'use strict';
const superagent = require('superagent');

module.exports = Trail;



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
  