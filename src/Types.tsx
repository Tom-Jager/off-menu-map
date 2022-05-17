export type RestaurantData =  {restaurant: string, area: string, podcasters: [string], location: {lat: number, lng: number}, url: string}
export type S3RestaurantDataMap = {[restaurantName: string]: RestaurantData}
export type S3Data = { restaurants: S3RestaurantDataMap, chains: {}, not_founds: {[notFoundName: string]: {area: string, podcasters: [string]}}} | null
