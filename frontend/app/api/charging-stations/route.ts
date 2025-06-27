// /app/api/charging-stations/route.ts

import { NextResponse } from "next/server";

interface ChargingStation {
    station_name: string;
    station_address: string;
    station_town: string;
    station_status: string;
    connections: {
        type: string;
        power: string;
        status: string;
    }[];
    coords: [number, number];
    distance: number;
}

// Fallback data when backend is unavailable
const fallbackData: ChargingStation[] = [
    {
        station_name: "Sample Charging Station",
        station_address: "123 Main St",
        station_town: "Toronto",
        station_status: "available",
        connections: [
            {
                type: "Type 2 (Mennekes)",
                power: "22 kW",
                status: "Available"
            }
        ],
        coords: [-79.3832, 43.6532],
        distance: 0
    },
    {
        station_name: "Downtown EV Station",
        station_address: "456 Queen St",
        station_town: "Toronto",
        station_status: "available",
        connections: [
            {
                type: "CCS (Type 2)",
                power: "50 kW",
                status: "Available"
            },
            {
                type: "CHAdeMO",
                power: "50 kW",
                status: "Available"
            }
        ],
        coords: [-79.3764, 43.6532],
        distance: 0
    }
];

export async function POST(req: Request) {
    try {
        // Extract user location from the request body
        const { lat, lng } = await req.json();

        // Get backend URL from environment variable or use default
        const backendUrl = process.env.BACKEND_URL;

        console.log(`[API] Attempting to connect to backend at: ${backendUrl}`);
        console.log(`[API] User location: ${lat}, ${lng}`);

        // Send the user location to the backend
        const response = await fetch(
            `${backendUrl}/api/charging-stations`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lat, lng }),
            }
        );

        if (!response.ok) {
            console.error(`[API] Backend responded with status: ${response.status}`);
            console.log(`[API] Returning fallback data due to backend error`);
            // Return fallback data instead of error
            return NextResponse.json(fallbackData);
        }

        // Get data from backend
        const data: ChargingStation[] = await response.json();
        console.log(`[API] Successfully received ${data.length} stations from backend`);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] Error in route:", error);
        console.log(`[API] Returning fallback data due to exception`);
        // Return fallback data instead of error
        return NextResponse.json(fallbackData);
    }
}

export async function GET() {
    try {
        // Get backend URL from environment variable or use default
        const backendUrl = process.env.BACKEND_URL;

        console.log(`[API] Attempting to connect to backend at: ${backendUrl}`);

        // Fetch charging stations without user location
        const response = await fetch(
            `${backendUrl}/api/charging-stations`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            console.error(`[API] Backend responded with status: ${response.status}`);
            console.log(`[API] Returning fallback data due to backend error`);
            // Return fallback data instead of error
            return NextResponse.json(fallbackData);
        }

        const data: ChargingStation[] = await response.json();
        console.log(`[API] Successfully received ${data.length} stations from backend`);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[API] Error in route:", error);
        console.log(`[API] Returning fallback data due to exception`);
        // Return fallback data instead of error
        return NextResponse.json(fallbackData);
    }
} 