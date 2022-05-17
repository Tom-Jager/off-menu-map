import { S3RestaurantDataMap } from "./Types"
interface MarkerListOptions {
    restaurants: S3RestaurantDataMap,
    map?: google.maps.Map,
    openRestaurant: string,
    setOpenRestaurant: (restaurant: string) => void;
}

export default MarkerListOptions