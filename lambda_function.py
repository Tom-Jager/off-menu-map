import requests
import json
from bs4 import BeautifulSoup
import time
import os

def timeis(func):
    '''Decorator that reports the execution time.'''
  
    def wrap(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
          
        print(func.__name__, end-start, args, kwargs)
        return result
    return wrap

def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
        },
    }

def get_api_key_param():
    api_key = os.environ["GOOGLE_API_KEY"]
    return "&key=" + requests.utils.quote(api_key)



def get_point(place_id):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    url = url + "?place_id=" + requests.utils.quote(place_id) + get_api_key_param()
    url = url + "&fields=geometry"
    return requests.get(url).json()['result']['geometry']['location']

def get_nearby_field(lat, lng):
    return requests.utils.quote("point:" + str(lat) + "," + str(lng))


def get_place_id(place, nearby=None):
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    url = url + "?input=" + requests.utils.quote(place)
    url = url + "&inputtype=textquery"
    url = url + get_api_key_param()
    if nearby is not None:
        nearby_field = get_nearby_field(nearby['lat'], nearby['lng'])
        url = url + "&locationbias=" + nearby_field
    response = requests.get(url).json()
    if response['status'] == 'ZERO_RESULTS':
        return None
    return response['candidates'][0]['place_id']

def get_point_from_name(name, nearby=None):
    place_id = get_place_id(name, nearby)
    if place_id is None:
        return None
    return get_point(place_id)

# dict with restaurants and chains. 
# restaurants is a dict from the name of the restaurant to the area that its in and a list of podcasters
# chains is a dict from the name of the chain to the podcasters

def get_restaurants_and_chains():
    page = requests.get('https://www.offmenupodcast.co.uk/restaurants')
    soup = BeautifulSoup(page.content, "html.parser")
    restaurant_div = soup.find(id='page-5c920b83e5e5f0f33607b487')
    paragraphs = restaurant_div.findAll('p')
    paragraphs.pop(0)
    restaurants = {}
    area = "N/A"
    chains = {}
    # TODO remove this list limiter for real version
    for tag in paragraphs:
        strong = tag.find("strong")
        if strong is not None:
            area = strong.text.strip()
        if not strong:
            link = tag.find("a")
            if link and area != "Chains":
                restaurant_name = link.text.strip()
                podcaster_text = tag.text.strip()[(len(restaurant_name) + 1):]
                podcasters = podcaster_text.replace('(', '').replace(')', '').split(",")
                if area == "Chains":
                    chains.add(restaurant_name)
                    chains[restaurant_name] = {"podcasters": podcasters}

                else:
                    restaurants[restaurant_name] = { "area": area, "podcasters": podcasters }
    print("Parsed restaurants and chains")
    return restaurants, chains


def get_nearby_location_dict(restaurants: dict):
    areas = set()
    for _, values in restaurants.items():
        areas.add(values['area'])
    location_dict = {}
    for area in areas:
        location = get_point_from_name(area)
        location_dict[area] = location
    print("Built nearby location dict")
    return location_dict


def get_restaurant_with_locations_and_not_founds(restaurants: dict):
    nearby_location_dict = get_nearby_location_dict(restaurants)
    restaurants_with_locations = {}
    not_found = {}
    for restaurant, data in restaurants.items():
        area = data['area']
        location = get_point_from_name(restaurant, nearby_location_dict[area])
        if location is None:
            not_found[restaurant] = { "area": area, "podcasters": data["podcasters"] }
        else:
            restaurants_with_locations[restaurant] = { "area": area, "podcasters": data["podcasters"], "location": location }
        print("Retreieved location for restaurant: " + restaurant)
    return restaurants_with_locations, not_found
    
    
def lambda_handler(event, context):
    '''Demonstrates a simple HTTP endpoint using API Gateway. You have full
    access to the request and response payload, including headers and
    status code.
    '''
    #print("Received event: " + json.dumps(event, indent=2))
    operation = event['httpMethod']
    if operation == 'GET':
        restaurants, chains = get_restaurants_and_chains()
        restaurants_with_locations, not_founds = get_restaurant_with_locations_and_not_founds(restaurants)
        return respond(None, {'restaurants': restaurants_with_locations, 'chains': chains, 'not_founds': not_founds})
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))

print(lambda_handler({'httpMethod': 'GET'}, None)['body'])
