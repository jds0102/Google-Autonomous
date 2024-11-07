import {MongoClient, ServerApiVersion, ObjectId} from 'mongodb';
import polylineCodec from '@googlemaps/polyline-codec';
import { AutonomousCar } from './autonomousCar.js';
const { decode } = polylineCodec;


const username = encodeURIComponent("eksmith26");
const password = encodeURIComponent("Grace27$$");  // URL encoded password
const dbName = "morecoffee_cars";
// const dbName = "Simu8"
const carsCollection = 'Autonomous Cars';
const API_KEY = "AIzaSyCzPvBLp1FInh8TivgxTr01GzsJO4S78VM";


const uri = `mongodb+srv://${username}:${password}@autosimulate.7qsly.mongodb.net/?retryWrites=true&w=majority&appName=AutoSimulate`;

// mongosh "mongodb+srv://autosimulate.7qsly.mongodb.net/" --apiVersion 1 --username eksmith26

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Create Car object which will be returned to the backend with the results from the query
let car = {
    id: null,
    currentLocation: [null, null], // Initialize with null indicating no value set yet
    destination: [null, null],     // Initialize with null as placeholder for future values
    inUse: "No"
};

// Generates numCars number of Cars within a rectangle created by provided min and max lat/lngs
//  numCars = 5 example In the Northern hemisphere, doesn't support crossing the prime meridian
//
//          *-----------------*maxLatLong
//           |  x          x  |
//           |      x         |
//           |             x  |
//           |   x            |
//  minLatLng*----------------*
//
// 
export async function insertCars(numCars, minLatLng, maxLatLng) {

    let newCars = []
    for (let carIndex = 0; carIndex < numCars; carIndex++) {
        let randomLat = (Math.random() * (maxLatLng.lat - minLatLng.lat) + minLatLng.lat).toFixed(6);
        let randomLng = (Math.random() * (maxLatLng.lng- minLatLng.lng) + minLatLng.lng).toFixed(6);
        // Create the car object using the factory function provided by autonomousCar.js
        let car = AutonomousCar({_id: null, currentLocation: [randomLat, randomLng], Destination: [randomLat, randomLng], inUse: false});
        newCars.push(car)
    }

    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection(carsCollection);

        const newCarsDbData = newCars.map((car) => car.getDbData())
        const insertResponse =  await cars.insertMany(newCarsDbData)

        const insertedIdsArray =  Object.values(insertResponse.insertedIds)
        console.log(insertedIdsArray)

        const insertedCars = await cars.find(
            { _id: { $in: insertedIdsArray} }).toArray()

        const insertedCarObjs = insertedCars.map((carData) => AutonomousCar(carData))

        return insertedCarObjs;
    } catch (err) {
        console.error("An error occurred trying to insert cars:", err);
    } finally {
        // Only close the client when you're done with all operations
        await client.close();
    }

    


    // try {
    //     await client.connect()
    //     const database = client.db(dbName);
    // }

};

function generateRandomCars(numCars) {

}



// return an array of all free cars to backend
export async function query() {
    try {
        await client.connect();  // Ensure connection is established
        
        const cars = database.collection(carsCollection);
        const query = {inUse: "No"};

        // Convert cursor to array so you can return the results
        const freeCars = await cars.find(query).toArray();
        console.log(freeCars);
        return freeCars;
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        // Only close the client when you're done with all operations
        await client.close();
    }
}

// function to update car location picked by backend for the ride
export async function updateCar(carId, destinationX, destinationY) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection(carsCollection);
        console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        const updateDoc = {
            $set: {
                "Destination.0": destinationX,
                "Destination.1": destinationY,
                "inUse": "Yes",
            },
        };

        const result = await cars.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log("Successfully updated one document.");
        } else {
            console.log("No documents matched the query. No update was made.");
        }

    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        await client.close();
    }
}

// return an array of all cars (free and used)
export async function getAllCars() {
    try {
        await client.connect();  // Ensure connection is established
        const database = client.db(dbName);
        const cars = database.collection(carsCollection);
        const allCars = await cars.find({}).toArray();
        return allCars;
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        // Only close the client when you're done with all operations
        await client.close();
    }
}

// function to free up car after the ride is completed. takes in carId and change the inuse status to No
export async function freeUpCar(carId) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const cars = database.collection(carsCollection);
        //console.log(carId);
        const filter = {_id: new ObjectId(carId)};
        const updateDoc = {
            $set: {
                inUse: "No"
            },
        };

        const result = await cars.updateOne(filter, updateDoc);

        if (result.modifiedCount === 1) {
            console.log("Successfully updated one document.");
        } else {
            console.log("No documents matched the query. No update was made.");
        }
    } catch (err) {
        console.error("An error occurred:", err);
    } finally {
        await client.close();
    }
}