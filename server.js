'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = express();

server.use(cors());

server.listen(PORT, () => {
    console.log(`Listening on PORT${PORT}`);
})


server.get('/', (request, response) => {
    response.status(200).send('it works');
})


server.get('/location', (request, response) => {
    const geoData = require('./data/geo.json');
    const cityName = request.query.display_name;
    const locationData = new Location(cityName,geoData);
    response.send(locationData);

})

function Location (city,geoData) {
    this.search_query =  geoData[0].display_name.replace(/ .*/,'');
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}



server.use('*', (request, response) => {
    response.status(404).send('NOT FOUND');
});

server.use((error, request, response) => {
    response.status(500).send(error);
})