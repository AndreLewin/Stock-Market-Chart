const express = require('express');
const app = express();
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const moment = require('moment');
const socketIO = require('socket.io');

const Stock = require('./model/Stock');
const StockData = require('./model/StockData');

// Get process.env.VARIABLES from .env
require('dotenv').load();

// Make the content of ./public accessible from URL
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Use and configure body-parser for reading the body of HTTP requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use the webpack dev server as a middleware, so we can launch it from this file
const config = require('../webpack.dev.config');
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {colors: true}
}));

// Configure Mongoose
mongoose.connect(process.env.DB_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;



// Get a list of all stock names in the database
// Stock names are kept in a different database so they don't expire after 24 hours
app.get('/stock-names', async (req, res) => {
  const stockObjects = await Stock.find().lean();
  const stockNameArray = stockObjects.map((stockObject) => stockObject.name);
  res.status(200).send(stockNameArray);
});


// Get all stockData from the stockNames
app.get('/stock-data-cache', async (req, res) => {

  // Get array of stock names from stockData database (to keep the same order)
  const stockObjects = await Stock.find().lean();
  const stockNameArray = stockObjects.map((stockObject) => stockObject.name);

  // Format Data
  const data = [];
  const dataFormated = [];

  const dateArray = createDateArray();
  for (let i = 0; i < dateArray.length; i++) {
    data[dateArray[i]] = {};
  }

  // Get the value of each stock and add it to date object that fits
  for (let j = 0; j < stockNameArray.length; j++) {
    const stockData = await getStockData(stockNameArray[j]);

    for (let i = 0; i < stockData.length; i++) {
      data[stockData[i][0]][stockNameArray[j]] = stockData[i][1];
    }
  }

  // Turn the name of the object to an attribute itself
  for (let name in data) { // let in loop over properties
    data[name].name = name;
  }

  // Make an array of the new objects
  for (let name in data) {
    dataFormated.push(data[name]);
  }

  res.status(200).send(dataFormated);
  // res.status(200).send([{name: "9239", GOOGL: 392}, {name: "2P0", GOOGL: 299}]);
});


// Create an array of dates for the specific format required by recharts.js
const createDateArray = () => {
  const dateArray = [];

  const format = "YYYY-MM-DD";
  const startMoment = moment("20170101");
  const endMoment = moment().add(1, 'days');

  let newMoment = startMoment;

  while ( newMoment.isBefore(endMoment, 'day') ) {
    dateArray.push(newMoment.format(format));
    newMoment = newMoment.add(1, 'days');
  }

  // Because some parts of the world can be in advance of 1 day
  dateArray.push(endMoment.format(format));

  return dateArray;
};



// Provide the data from a specific stockName
const getStockData = async (stockName) => {

  // Check in the cache database if the data is already present
  // Don't forget await, without await, stockData will be a promise (true-y)
  const stockData = await StockData.findOne({ name: stockName });
  if (stockData) {
    console.log(stockName+" stockData caught from the DB");
    return stockData.content;
  }

  // If the data is not in the cache database, make a call to Quandl API and store the data in the cache
  const response = await axios.get(
    'https://www.quandl.com/api/v3/datasets/WIKI/'
    +stockName+'.json'
    +'?start_date=2017-01-01'
    +'&order=asc'
    +'&column_index=4'
    +'&api_key='+process.env.QUANDL_API_KEY
  );

  console.log(stockName+" stockData caught from Quandl, make a temporary copy in the DB");
  const newStockData = new StockData({ name: stockName, content: response.data.dataset.data });
  newStockData.save();

  return response.data.dataset.data;
};


// Add a stock name to the database
app.post('/stock/new', async (req, res) => {

  const stockName = req.body.stockName.toUpperCase();

  // Check if the stockName is already present in the database
  const stockAlreadyPresent = await Stock.findOne({ name: stockName });
  if (stockAlreadyPresent) {
    res.status(409).send("Conflict: "+stockName +" already present in the database");
    return;
  }

  // Check if the stockName exists, if not, early return
  let response;
  try {
    response = await getStockData(stockName);
  } catch (err) {
    res.status(400).send("Bad request: Error at querying "+stockName);
    return;
  }

  // Add the stockName to the db
  const stock = new Stock({ name: stockName });
  stock.save();

  res.status(201).send("Created: "+stockName+" added to database to display");

});


// Remove a stock name (and eventually its data) from the database
app.delete('/stock/delete/:stockName', async (req, res) => {

  const stockName = req.params.stockName.toUpperCase();
  const stock = await Stock.findOne({ name: stockName });

  if (stock) {
    stock.remove();

    const stockData = await StockData.findOne({ name: stockName });
    stockData.remove();

    res.status(200).send(stockName +" removed from the database");
  } else {
    res.status(404).send("Not found:"+stockName+" is not present in the database");
  }
});


// Listen for requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


// Web Sockets
const io = socketIO(listener);

io.on('connection', function(socket){
  socket.on('stockUpdated', function(msg){
    io.emit('reloadPage', 'msg');
  });
});