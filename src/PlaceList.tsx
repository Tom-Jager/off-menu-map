import { Row, Col, ListGroup } from 'react-bootstrap';
import './OffMenuMap.css';
import { RestaurantData } from './Types';

function compareRestaurant(a: RestaurantData, b: RestaurantData) {
    return a.restaurant.localeCompare(b.restaurant)
}

function PlaceList(props: {
    restaurantData: RestaurantData[],
    setOpenRestaurant: (newRestaurant: string) => void,
    openRestaurant: string
}) {

    const listItems = props.restaurantData.sort(compareRestaurant).map(function (data) {
        const restaurantPodcasters = data.podcasters.sort().join(", ");
        return (<ListGroup.Item
            action
            onClick={() => props.setOpenRestaurant(data.restaurant)}
            variant={data.restaurant === props.openRestaurant ? "warning" : undefined}
            key={data.restaurant}>
            <Row>
                <Col>{data.restaurant}</Col><Col style={{ "textAlign": "right" }}>{restaurantPodcasters}</Col>
            </Row></ListGroup.Item>)
    })


    return (
        <Col>
            <ListGroup style={{ "overflowY": "auto", "overflowX": "hidden", "maxHeight": "60vh", "border": "1px solid #e9e9e9" }} variant="flush">
                {listItems}
            </ListGroup>
            <p style={{"color": "white"}}>Created by Tom Jager using data from <a href='https://www.offmenupodcast.co.uk/restaurants' style={{"color": "white"}}>https://www.offmenupodcast.co.uk/restaurants</a>. You can get in touch at tjager22@gmail.com</p>
        </Col>
    )
}
export default PlaceList;