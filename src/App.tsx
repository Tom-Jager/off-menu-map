import axios from "axios"
import * as React from "react";
import Map from "./Map";
import MarkerList from "./MarkerList";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import RestaurantList from "./RestaurantList";
import { S3Data } from "./Types";
import { Button, Col, Container, Row, Spinner } from "react-bootstrap";
import UserMarker from "./UserMarker";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import {Helmet} from "react-helmet";

const render = (status: Status) => {
  return <h1>{status}</h1>;
};

const londonLatLng = { lat: 51.5072, lng: 0.1276 }

function getRestaurantDataFromS3() {
  const url = 'https://bk3ucgz21i.execute-api.eu-west-1.amazonaws.com/default/getRestaurantDataFromS3'
  const AxiosInstance = axios.create(); // Create a new Axios Instance 
  // Send an async HTTP Get request to the url
  return AxiosInstance.get(url).then(
    function (result) {
      console.log("Retrieved S3 Data")
      return result.data as S3Data
    },
    function (_error) {
      return "Request failed"
    }
  )
}

function handleGetCurrentPosition(success: (lat: number, lng: number) => void, failure: () => void) {
  navigator.geolocation.getCurrentPosition(
    (result) => {
      success(result.coords.latitude, result.coords.longitude);
    },
    (_error) => {
      failure()
    });
}

function getUserLocation(success: (lat: number, lng: number) => void, failure: () => void) {
  var _sBrowser, sUsrAg = navigator.userAgent;
  var isSafari = sUsrAg.indexOf("Safari") > -1;
  
  if (isSafari) {
    if ('geolocation' in navigator) {
      handleGetCurrentPosition(success, failure)
    }
    else {
      failure();
    }
  }
  else if (navigator.geolocation) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then(function (result) {
        if (result.state === "granted") {
          handleGetCurrentPosition(success, failure)
        } else if (result.state === "prompt") {
          failure();
        } else if (result.state === "denied") {
          failure();
        }
        result.onchange = function (this: PermissionStatus, ev: Event) {
          console.log("Permission status change")
          if (this.state === "granted") {
            handleGetCurrentPosition(success, failure)
          }
          else {
            failure();
          }
        };
      });
  }
  else {
    failure();
  }
}

const ErrorMessage = ({ error, resetErrorBoundary }: FallbackProps) => (<div role="alert">
  <p>Sorry this service is unavailable</p>
</div>)

const App: React.VFC = () => {
  // [START maps_react_map_component_app_state]
  const [s3Data, setS3Data] = React.useState<S3Data>(null);
  const [openRestaurant, setOpenRestaurant] = React.useState<string>("");
  const [userLocation, setUserLocation] = React.useState<{ lat: number, lng: number } | null>(null)
  const [center, setCenter] = React.useState<{ lat: number, lng: number }>(londonLatLng)

  React.useEffect(() => {
    if (s3Data == null) {
      getRestaurantDataFromS3().then(success => setS3Data(success as S3Data))
    }
  })

  React.useEffect(() => {
    if (userLocation == null) {
      getUserLocation((lat, lng) => setUserLocation({ lat: lat, lng: lng }), () => { setUserLocation(null) });
    }
  });

  if (s3Data != null) {

    var restaurantList = <RestaurantList
      s3RestaurantData={s3Data.restaurants}
      setOpenRestaurant={(newRestaurant) => setOpenRestaurant(newRestaurant)}
      openRestaurant={openRestaurant}></RestaurantList>
    var markers = <MarkerList
      restaurants={s3Data.restaurants}
      openRestaurant={openRestaurant}
      setOpenRestaurant={(newRestaurant) => setOpenRestaurant(newRestaurant)}
    ></MarkerList>

    const buttonStyle = { "width": "100%" }
    var focusUserLocationButton = <Button disabled style={buttonStyle}>Find My Location</Button>
    var userLocationMarker = null
    if (userLocation) {
      focusUserLocationButton = <Button
        onClick={() => { setCenter(userLocation) }}
        style={buttonStyle}>Find My Location</Button>
      userLocationMarker = <UserMarker
        position={userLocation}
        icon={{
          fillColor: '#4272f5',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: "#ffffff",
          path: faCircle.icon[4] as string,
          scale: 0.02,
          anchor: {
            x: faCircle.icon[0] / 2,
            y: faCircle.icon[1],
            equals: (other) => {
              if (!other) return false;
              return other.x === faCircle.icon[0] / 2 && other.y === faCircle.icon[1];
            }
          }
        }}
        clickable={false} />
    }

    return (
      <ErrorBoundary
        FallbackComponent={ErrorMessage}>
        <Helmet> <style>{'body { background-color: #fcb345; }'}</style></Helmet>
        <Container style={{ "paddingTop": "3vh" }}>
          <Row><h1 style={{"textAlign": "center", "color": "white"}}>THE OFF MENU MAP</h1></Row>
          <Row>
            <Col sm="6" style={{ "padding": "1vh" }}>
              <Wrapper apiKey={"AIzaSyCXdXiYdIRNAinnF4qF5gu-3NZLhYL0NUU"} render={render}>
                <Map
                  center={center}
                  style={{ "flexGrow": "1", "height": "81vh" }}
                  zoom={8}>
                  {markers}
                  {userLocationMarker}
                </Map>
              </Wrapper>
              <Row style={{ "height": "2vh" }}></Row>
              {focusUserLocationButton}
            </Col>
            <Col sm="6" style={{ "padding": "1vh" }}>
              {restaurantList}
            </Col>
          </Row>
        </Container>
      </ErrorBoundary>
    );
  }
  else {
    return <ErrorBoundary
              FallbackComponent={ErrorMessage}>
              <Container style={{ "textAlign": "center", "lineHeight": "100vh" }}>
                <Spinner animation="border" variant="warning"></Spinner>
              </Container>
            </ErrorBoundary>
  }
  // [END maps_react_map_component_app_return]
};

      export default App;
