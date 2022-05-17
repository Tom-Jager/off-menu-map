import * as React from "react";
import { Col, Row } from "react-bootstrap";
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import PlaceList from './PlaceList';
import { S3RestaurantDataMap, RestaurantData } from './Types';

function filterRestaurants(s3RestaurantData: S3RestaurantDataMap, area: string, podcaster: string, restaurant: string) {
    var restaurantsToDisplay: RestaurantData[] = []
    for (let key in s3RestaurantData) {
        let value = s3RestaurantData[key]
        const areaFilter = area === "" || area === value.area
        const podcasterFilter = podcaster === "" || value.podcasters.includes(podcaster)
        const restaurantFilter = restaurant === "" || restaurant === key
        if(areaFilter && podcasterFilter && restaurantFilter){
            restaurantsToDisplay.push(value)
        }
    }
    return restaurantsToDisplay;
}

function getListOfPodcasters(s3RestaurantData: S3RestaurantDataMap) {
    var podcasters: Set<string> = new Set();
    for (let key in s3RestaurantData) {
        let value = s3RestaurantData[key]
        for (var p of value.podcasters) {
            podcasters.add(p)
        }
    }
    return Array.from(podcasters.values());
}

function getListOfAreas(s3RestaurantData: S3RestaurantDataMap) {
    var areas: Set<string> = new Set();
    for (let key in s3RestaurantData) {
        let value = s3RestaurantData[key];
        areas.add(value.area);
    }
    return Array.from(areas.values());
}

type Item = { name: string }
function getItems(keys: string[]): Item[] {
    return keys.map((key) => { return { name: key, id: key } });
}

function clearFilterIfEmpty(inputEvent: React.FocusEvent<HTMLInputElement>, setSearchState: (s: string) => void) {
    if(inputEvent.target.value === ""){
        setSearchState("");
    }
}

function RestaurantList(props: {
    s3RestaurantData: S3RestaurantDataMap,
    setOpenRestaurant: (newRestaurant: string) => void,
    openRestaurant: string
}) {
    const [restaurant, setRestaurant] = React.useState<string>("")
    const [area, setArea] = React.useState<string>("")
    const [podcaster, setPodcaster] = React.useState<string>("")

    const listOfAreas = getListOfAreas(props.s3RestaurantData)
    const listOfPodcasters = getListOfPodcasters(props.s3RestaurantData)

    const areaItems = getItems(listOfAreas)
    const areaSearchBox = <ReactSearchAutocomplete<Item>
        showIcon={false}
        items={areaItems}
        onSelect={(result) => setArea(result.name)}
        onClear={() => setArea("")}
        onFocus={(input) => clearFilterIfEmpty(input, setArea)}></ReactSearchAutocomplete>

    const podcasterItems = getItems(listOfPodcasters)
    const podcasterSearchBox = <ReactSearchAutocomplete<Item>
        showIcon={false}
        items={podcasterItems}
        onSelect={(result) => setPodcaster(result.name)}
        onClear={() => setPodcaster("")}
        onFocus={(input) => clearFilterIfEmpty(input, setPodcaster)}></ReactSearchAutocomplete>

    const restaurantItems = getItems(Object.keys(props.s3RestaurantData))
    const restaurantSearchBox = <ReactSearchAutocomplete<Item>
        showIcon={false}
        items={restaurantItems}
        onSelect={(result) => setRestaurant(result.name)}
        onClear={() => setRestaurant("")}
        onFocus={(input) => clearFilterIfEmpty(input, setRestaurant)}></ReactSearchAutocomplete>

    const restaurantData = filterRestaurants(props.s3RestaurantData, area, podcaster, restaurant);
    const placeList = <PlaceList
        restaurantData={restaurantData}
        setOpenRestaurant={props.setOpenRestaurant}
        openRestaurant={props.openRestaurant} />

    var restaurantList = (<Row>
                            <Row>
                                <Row style={{"textAlign": "center"}}><h3 style={{"color": "white"}}>Filters</h3></Row>
                                <Row style={{"textAlign": "center"}}>
                                    <Col sm="4" style={{"zIndex": 3}}><h4 style={{"color": "white"}}>City</h4>{areaSearchBox}</Col>
                                    <Col sm="4" style={{"zIndex": 2}}><h4 style={{"color": "white"}}>Guest</h4>{podcasterSearchBox}</Col>
                                    <Col sm="4" style={{"zIndex": 1}}><h4 style={{"color": "white"}}>Restaurant</h4>{restaurantSearchBox}</Col>
                                </Row>
                            </Row>
                            <Row style={{"paddingTop": "2vh", "zIndex": 0}}>
                                {placeList}
                            </Row>
                        </Row>)

    return restaurantList
}

export default RestaurantList;