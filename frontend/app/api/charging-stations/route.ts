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

export async function POST(req: Request) {
    try {
        // Extract user location from the request body
        const { lat, lng } = await req.json();

        // Get backend URL from environment variable or use default
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

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
            return NextResponse.json(
                { error: "Failed to fetch data" },
                { status: 500 }
            );
        }

        // Get data from backend
        const data: ChargingStation[] = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in route:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get backend URL from environment variable or use default
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

        // Fetch charging stations without user location
        const response = await fetch(
            `${backendUrl}/api/charging-stations`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch data" },
                { status: 500 }
            );
        }

        const data: ChargingStation[] = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in route:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
} 