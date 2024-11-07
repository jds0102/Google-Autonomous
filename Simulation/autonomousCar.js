// "_id":"6706fa8bb25d3310bd0e84a7","currentLocation":["43.07480818037450","-89.439453224153170"],"Destination":[41.8781136,-87.6297982],"inUse":"No"
export function AutonomousCar(carData) {
    // Ideally do some validation here that carData is correct
    return {
        getId: () => carData._id,
        getCurrentLocation: () => carData.currentLocation,
        getDestination: () => carData.Destination,
        isInUse: () => carData.inUse,
        updateLocation: (lat, lng) => {
            carData.currentLocation = [lat, lng]
        },
        updateDestination: (lat, lng) => {
            carData.Destination = [lat, lng]
        },
        setInUse: (inUse) => {
            carData.inUse = inUse
        },
        getDbData: () => carData,
        debugData: () => {
            let data = carData
            data['locationMapsLink'] = "https://maps.google.com/?q=" + carData.currentLocation[0] + "," + carData.currentLocation[1]
            data['destinationMapsLink'] = "https://maps.google.com/?q=" + carData.Destination[0] + "," + carData.Destination[1]
            return data
        }
        
    };
}