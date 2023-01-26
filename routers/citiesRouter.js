const express = require("express");

const router = express.Router();

const City = require("/home/ubuntu-0973013/CMTPRG04-6/models/citiesModel");

const mongoose = require("mongoose");
const {response} = require("express");


// Middleware to check if Accept Headers are application/json when a GET request comes in
router.get("/", (req , res, next) => {
    console.log("Checking for Accept Headers ");
    if (req.header("Accept") === "application/json"){
        next();
    } else {
        res.status(400).json({message: "Accept Headers are not application/json"});
    }
})

//Getting all
router.get("/", async (req, res) => {
    //Log a message to the console
    console.log("GET collection");
    try {
        //Parse the limit and start query parameters from the request
        let limit = parseInt(req.query.limit);
        let start  = parseInt(req.query.start);
        // Count the total number of items in the City collection
        const total = await City.count();
        //If only one of limit or start is provided, set limit to the total number of items and start to 1
        if (req.query.limit && !req.query.start || req.query.start && !req.query.limit){
            limit = total;
            start= 1;
        }
        if (limit === 0 || !limit) {
            //If limit is 0 or not provided, set it to the total number of items.
            limit = total;
        }
        if (start === 0 || !start) {
            //If start is 0 or not provided, set it to 1.
            start = 1;
        }
        // Check if start is higher than total
        if (start > total) {
            return res.status(400).json({message: "Start index cannot be higher than total number of items in collection."});
        }
            if (limit > total) {
                return res.status(400).json({ message: `Limit  cannot be higher than total number ${total} of items in collection.`});
            }
        let cities = await City.find().skip(start - 1).limit(limit);
        // Create representation for collection
        let citiesCollection = {
            items: cities,
            _links: {
                self: {
                    href: `${process.env.BASE_URI}cities/`
                }
            },
            pagination: {
                currentPage: Math.ceil(start/limit),
                currentItems: limit,
                totalPages: Math.ceil(total / limit ),
                totalItems: total,
                _links: {
                    first: {
                        page: 1,
                        href: !req.query.limit || !req.query.start ? `${process.env.BASE_URI}cities/` : `${process.env.BASE_URI}cities/?start=1&limit=${limit}`
                    },
                    last: {
                        page: Math.ceil(total / limit ),
                        href: !req.query.limit || !req.query.start ? `${process.env.BASE_URI}cities/`: `${process.env.BASE_URI}cities/?start=${Math.ceil((total - limit) + 1)}&limit=${limit}`
                    },
                    previous: {
                        page: Math.max(1, Math.ceil((start / limit) - 1)),
                        href: !req.query.limit || !req.query.start ? `${process.env.BASE_URI}cities/` : `${process.env.BASE_URI}cities/?start=${Math.max(1, start - limit)}&limit=${limit}`
                    },
                    next: {
                        page: Math.ceil((start / limit) + 1),
                        href: !req.query.limit || !req.query.start ? `${process.env.BASE_URI}cities/`: `${process.env.BASE_URI}cities/?start=${Math.max(1, start + limit)}&limit=${limit}`
                    },
                }
            }
        }

        res.status(200).json(citiesCollection);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});



//Middleware checks if the Accept Header is set to application/json when a GET request comes in
router.get("/:id", (req , res, next) => {
    console.log("Checking for Accept Headers ");
    if (req.header("Accept") === "application/json"){
        next();
    } else {
        res.status(406).json({message: "Accept Headers are not application/json"});
    }

})

//Getting one item
router.get("/:id", getCity, (req , res) => {
    console.log("GET ID");
    res.status(200).json(res.city)
})

//Middleware checks for the header content-type when a POST request comes in
router.post("/", (req, res, next) => {
    console.log("POST middleware to check content-type")
if (req.header("Content-Type") === "application/json" || req.header("Content-Type") === "application/x-www-form-urlencoded" ){
    next();
}
else {
    res.status(415).json({message: "The Content-Type for your POST is wrong"});
}});

//Middleware checks for empty values when a POST request comes in
router.post("/", (req, res, next) => {
    console.log("POST middleware to check for empty values")
    if (req.body.city && req.body.population && req.body.country && req.body.skyscrapers ){
        next();
    } else {
        res.status(400).json({message: "There are empty values in your POST"});
    }
});

//Post one
router.post("/",async (req, res) => {
    console.log("POST");
    let city = new City(
        {
            city: req.body.city,
            population: req.body.population,
            country: req.body.country,
            skyscrapers: req.body.skyscrapers,
        }
    )
    try {
        const newCity = await city.save();
        res.status(201).json(newCity)
        console.log("saved");
    } catch (err){
        res.status(400).json({message: err.message})
    }

})
//Delete one
router.delete("/:id",getCity, async(req , res) => {
    console.log("DELETE");
    try {
        await res.city.remove()
        res.status(204).json({message: "Deleted city"});

    } catch(err){
        res.status(500).json({message: err.message})
    }

})
// Name the methods allowed for the collection
router.options("/", (req , res) => {
    console.log("OPTIONS")
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.send();

})
// Name the methods allowed for one item
router.options("/:id", (req , res) => {
    console.log("OPTIONS");
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods','GET, PUT, DELETE, OPTIONS' );
    res.setHeader("Allow", 'GET, PUT, DELETE, OPTIONS');
    res.send();

})

//Updating
router.put("/:id", getCity, async (req , res) => {
    console.log("PUT");
    if(req.body.city != null){
        res.city.city = req.body.city
    }
    if(req.body.population != null){
        res.city.population = req.body.population
    }
    if(req.body.country != null){
        res.city.country = req.body.country
    }
    if(req.body.skyscrapers != null){
        res.city.skyscrapers = req.body.skyscrapers
    }

    try{
        const updatedCity = await res.city.save()
        res.status(200).json(updatedCity)
    }catch (err){
        res.status(400).json({message: err.message})

    }

})

//Function that finds the item matching the id based on the incoming request
async function getCity(req,res,next) {
    let city
    try {
        city = await City.findById(req.params.id);
        if (city == null){
            return res.status(404).json({message: "Can not find city"})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.city = city
    next()
}
//Export router
module.exports = router;