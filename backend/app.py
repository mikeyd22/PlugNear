from flask import Flask, jsonify, request
from datetime import datetime
import requests
import json
import math
import time
from functools import lru_cache

app = Flask(__name__)

# Simple cache for API responses
api_cache = {}
CACHE_DURATION = 300  # 5 minutes cache

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c 

def get_charging_status(connection_type, status_type):
    """Determine charging station status based on connection type and status"""
    if status_type and status_type.get('IsOperational') == False:
        return "unavailable"
    elif connection_type and any(conn.get('StatusType', {}).get('IsOperational', True) for conn in connection_type):
        return "available"
    else:
        return "unavailable"

def get_cache_key(lat, lng):
    """Create a cache key based on rounded coordinates to group nearby locations"""
    # Round to 2 decimal places (roughly 1km precision)
    lat_rounded = round(lat, 2)
    lng_rounded = round(lng, 2)
    return f"{lat_rounded}_{lng_rounded}"

def is_cache_valid(cache_entry):
    """Check if cache entry is still valid"""
    return time.time() - cache_entry['timestamp'] < CACHE_DURATION

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Test route is working!"})

@app.route('/api/charging-stations', methods=['GET', 'POST'])
def get_charging_stations():
    global api_cache
    
    user_lat = 43.4695  # Default to Ontario center
    user_lng = -80.5425

    if request.method == 'POST':
        print("Method post")
        user_location = request.get_json()

        if user_location is None:
            return jsonify({"error": "No data provided"}), 400

        user_lat = user_location.get('lat')
        user_lng = user_location.get('lng')

        if user_lat is None or user_lng is None:
            return jsonify({"error": "Invalid location data. 'lat' and 'lng' are required."}), 400
    
    # Check cache first
    cache_key = get_cache_key(user_lat, user_lng)
    if cache_key in api_cache and is_cache_valid(api_cache[cache_key]):
        print(f"Returning cached data for {cache_key}")
        return jsonify(api_cache[cache_key]['data'])
    
    # Open Charge Map API call for Ontario
    api_key = "f0d7fa58-8aa0-428a-bae6-c9f7b9a7185e"
    
    # Ontario bounding box coordinates
    ontario_bounds = {
        'north': 56.9,
        'south': 41.7,
        'east': -74.3,
        'west': -95.2
    }
    
    url = f"https://api.openchargemap.io/v3/poi"
    
    # Try different parameter combinations
    params = {
        'key': api_key,
        'maxresults': 100,  # Reduced from 1000
        'compact': True,  # Keep compact for faster response
        'verbose': False,
        'latitude': user_lat,
        'longitude': user_lng,
        'distance': 150,  # Increased radius to 150km
        'distanceunit': 'km'
    }
    
    print(f"Making API request with params: {params}")
    
    try:
        r = requests.get(url, params=params)
        print(f"API Response Status: {r.status_code}")
        r.raise_for_status()
        data = r.json()
        print(f"Number of stations returned: {len(data)}")
        
        # If no data, try without distance filter
        if len(data) == 0:
            print("No stations found with distance filter, trying without...")
            params_no_distance = {
                'key': api_key,
                'maxresults': 100,
                'compact': True,
                'verbose': False,
                'latitude': user_lat,
                'longitude': user_lng,
            }
            r2 = requests.get(url, params=params_no_distance)
            print(f"Second API Response Status: {r2.status_code}")
            data = r2.json()
            print(f"Number of stations returned (no distance filter): {len(data)}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching charging stations: {e}")
        return jsonify({"error": "Failed to fetch charging station data"}), 500

    charging_stations_list = []

    for station in data:
        try:
            station_name = station.get('AddressInfo', {}).get('Title', 'Unknown Station')
            station_address = station.get('AddressInfo', {}).get('AddressLine1', '')
            station_town = station.get('AddressInfo', {}).get('Town', '')
            station_coords = [
                station.get('AddressInfo', {}).get('Longitude', 0),
                station.get('AddressInfo', {}).get('Latitude', 0)
            ]
            
            # Get connection information
            connections = station.get('Connections', [])
            connection_types = []
            station_status = "unavailable"
            
            for connection in connections:
                connection_type = connection.get('ConnectionType', {})
                status_type = connection.get('StatusType', {})
                
                # Handle compact format where ConnectionType is just an ID
                connection_type_title = 'Unknown'
                if connection.get('ConnectionTypeID'):
                    # Map common connection type IDs to names
                    connection_type_map = {
                        1: 'Type 1 (J1772)',
                        2: 'CHAdeMO',
                        3: 'Type 2 (Mennekes)',
                        32: 'CCS (Type 1)',
                        33: 'CCS (Type 2)',
                        34: 'Tesla Supercharger',
                        35: 'Tesla Destination'
                    }
                    connection_type_title = connection_type_map.get(connection.get('ConnectionTypeID'), f'Type {connection.get("ConnectionTypeID")}')
                elif isinstance(connection_type, dict) and connection_type.get('Title'):
                    connection_type_title = connection_type.get('Title')
                
                connection_info = {
                    "type": connection_type_title,
                    "power": connection.get('PowerKW', 'N/A'),
                    "status": status_type.get('Title', 'Unknown') if status_type else 'Unknown'
                }
                connection_types.append(connection_info)
                
                # Update station status if any connection is available
                if get_charging_status([connection], status_type) == "available":
                    station_status = "available"
            
            # Check station-level status
            station_status_type = station.get('StatusType', {})
            if station_status_type and station_status_type.get('IsOperational', False):
                station_status = "available"
            
            # Only include stations with valid coordinates
            if station_coords[0] != 0 and station_coords[1] != 0:
                station_info = {
                    "station_name": station_name,
                    "station_address": station_address,
                    "station_town": station_town,
                    "station_status": station_status,
                    "connections": connection_types,
                    "coords": station_coords,
                    "distance": haversine(user_lat, user_lng, station_coords[1], station_coords[0]) if user_lat != 43.4695 or user_lng != -80.5425 else 0
                }
                
                charging_stations_list.append(station_info)
                
        except Exception as e:
            print(f"Error processing station: {e}")
            continue
    
    print(f"Final number of processed stations: {len(charging_stations_list)}")
    
    # Sort by distance if user location is provided
    if user_lat != 43.4695 or user_lng != -80.5425:
        charging_stations_list = sorted(charging_stations_list, key=lambda x: x['distance'])
    
    # Cache the result
    api_cache[cache_key] = {
        'data': charging_stations_list,
        'timestamp': time.time()
    }
    
    # Clean up old cache entries
    current_time = time.time()
    api_cache = {k: v for k, v in api_cache.items() if current_time - v['timestamp'] < CACHE_DURATION}
    
    return jsonify(charging_stations_list)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
