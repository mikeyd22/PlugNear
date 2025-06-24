import requests
import json

# Test the OpenChargeMap API directly
api_key = "f0d7fa58-8aa0-428a-bae6-c9f7b9a7185e"
url = "https://api.openchargemap.io/v3/poi"

params = {
    'key': api_key,
    'maxresults': 3,
    'compact': True,
    'verbose': False,
    'latitude': 43.4695,
    'longitude': -80.5425,
    'distance': 100,
    'distanceunit': 'km'
}

print("Making API request...")
response = requests.get(url, params=params)
print(f"Response status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"Number of stations: {len(data)}")
    
    if len(data) > 0:
        station = data[0]
        print(f"\nFirst station: {station.get('AddressInfo', {}).get('Title', 'Unknown')}")
        print(f"Connections: {station.get('Connections', [])}")
        
        connections = station.get('Connections', [])
        print(f"Number of connections: {len(connections)}")
        
        if len(connections) > 0:
            connection = connections[0]
            print(f"First connection: {connection}")
            print(f"Connection type: {connection.get('ConnectionType', {})}")
            print(f"Power KW: {connection.get('PowerKW', 'N/A')}")
        else:
            print("No connections found!")
else:
    print(f"Error: {response.text}") 