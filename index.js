//Import dotenv module
require('dotenv').config()

// Import the mongoose module
const mongoose = require("mongoose");
// Set up default mongoose connection
const mongoDB = process.env.DATABASE_URL;

const City = require("/home/ubuntu-0973013/CMTPRG04-6/models/citiesModel");

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });


// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection errortest:"));
db.once("open", () => console.log("Connected to database"));

//Import body-parser module
const bodyParser = require('body-parser');

//Import express module
const express = require("express");

const app = express();

const citiesRouter = require("/home/ubuntu-0973013/CMTPRG04-6/routers/citiesRouter");

// Function to delete all items in collection
// City.deleteMany().then(function(){
//     console.log("Data deleted"); // Success
//     process.exit()
// }).catch(function(error){
//     console.log(error); // Failure
// });


//Middleware
//Use bodyparser.urlencoded middleware to parse urlencoded
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
//Use bodyparser middleware to parse json data
app.use(bodyParser.json())
// app.use(express.json());
app.use("/cities/", citiesRouter)

//Listen on port 8000
app.listen(8000,() => {console.log("Express started");
})
