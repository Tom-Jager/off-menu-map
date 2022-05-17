import * as React from "react"
import ClickableMarkerOptions from "./ClickableMarkerOptions";

const Marker: React.FC<ClickableMarkerOptions> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>();
  const [infoWindow, setInfoWindow] = React.useState<google.maps.InfoWindow>();

  React.useEffect(() => {
    var markerListener: google.maps.MapsEventListener = {
      remove: () => {}
    }
    if (!marker) {
      const newMarker = new google.maps.Marker();
      markerListener = newMarker.addListener<"click">("click", () => options.updateRestaurant(options.restaurantName))
      setMarker(newMarker);
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
        google.maps.event.removeListener(markerListener)
      }
    };
  }, [marker, options, options.restaurantName, options.podcasters]);

  React.useEffect(() => {
    if (!infoWindow && marker) {
      const content = "<h4>" + options.restaurantName + "</h4>" + options.podcasters.map((podcaster) => {
        return "<p>" + podcaster + "</p>"
      }).join("") + "<a href=" + options.url + " target='_blank'>Google Maps Link</a>";
      setInfoWindow(new google.maps.InfoWindow({ content: content }))
    }
  }, [infoWindow, marker, options.podcasters, options.restaurantName, options.url])

  React.useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  React.useEffect(() => {
    if (marker && infoWindow) {
      if (options.restaurantName === options.openRestaurant) {
        infoWindow.open(undefined, marker);
      }
      else {
        infoWindow.close();
      }
    }
  }, [marker, options.restaurantName, options.openRestaurant, infoWindow])

  React.useEffect(() => {
    if(marker && options.map) {
      marker.setMap(options.map)
    }
  }, [marker, options.map])

  return null;
};
export default Marker;