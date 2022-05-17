import * as React from "react"

const UserMarker: React.FC<google.maps.MarkerOptions> = (options) => {
  const [marker, setMarker] = React.useState<google.maps.Marker>();

  React.useEffect(() => {
    if (!marker) {
      const newMarker = new google.maps.Marker();
      setMarker(newMarker);
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  React.useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  React.useEffect(() => {
    if(marker && options.map) {
      marker.setMap(options.map)
    }
  }, [marker, options.map])

  return null;
};
export default UserMarker;