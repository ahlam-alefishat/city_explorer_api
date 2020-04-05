'use strict';
require('dotenv').config();

const express = require('express');

const cors = require('cors');


const PORT = process.env.PORT || 3000;

const server = express();

server.use(cors());




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
    this.search_query =  geoData[0].display_name;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}



 let fullResult=[];
server.get('/weather', (request, response) => {
    const weatherData = require('./data/weather.json');
    const cityName = request.query.city_name;
   
    weatherData.data.forEach((val) => {
        let description = val.weather.description;
        let date = val.valid_date;
        let weather= new weatherForecast(description, date);
        fullResult.push(weather);
    })
    response.send(fullResult);


})
function weatherForecast(description, date) {
    this.description = description;
    this.date=date; 
}




server.listen(PORT, () => {
    console.log(`Listening on PORT${PORT}`);
})
server.use('*', (request, response) => {
    response.status(500).send(' Sorry, something went wrong');
});

