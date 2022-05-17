import { string } from "fp-ts";

interface ClickableMarkerOptions extends google.maps.MarkerOptions {
    restaurantName: string,
    podcasters: [string],
    openRestaurant: string,
    updateRestaurant: (newRestaurant: string) => void,
    map?: google.maps.Map,
    url: string;
}

export default ClickableMarkerOptions