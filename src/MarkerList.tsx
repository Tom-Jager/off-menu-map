import * as React from "react";
import Marker from "./Marker";
import MarkerListOptions from "./MarkerListOptions";

const MarkerList = (options: MarkerListOptions) => {
    const markers = []
    for(let restaurantName in options.restaurants){
        const restaurantData = options.restaurants[restaurantName]
        const marker = <Marker 
                          key={restaurantName} 
                          position={restaurantData.location}
                          restaurantName={restaurantName}
                          podcasters={restaurantData.podcasters}
                          openRestaurant={options.openRestaurant}
                          updateRestaurant={options.setOpenRestaurant}
                          map={options.map}
                          url={restaurantData.url}>  
                        </Marker>
        markers.push(marker)
    }
    return <>{markers}</>;
}

export default MarkerList;