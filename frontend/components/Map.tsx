"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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

// Set the access token from the environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map({
    data,
    handleMarkerClick,
    userPos,
    onMapMove,
    loading,
    activeStation,
}: {
    data: ChargingStation[];
    handleMarkerClick: (stationName: string) => void;
    userPos: any;
    onMapMove: (lat: number, lng: number) => void;
    loading: boolean;
    activeStation: string | null;
}) {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [center, setCenter] = useState<[number, number]>([-80.5425, 43.4695]);
    const [zoom, setZoom] = useState(8); // Zoomed out more for Ontario
    const [pitch, setPitch] = useState(52);
    const [mapInitialized, setMapInitialized] = useState(false);

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    function getColorByStatus(status: string, isActive: boolean = false) {
        const baseClasses = "h-3 w-3 rounded-full cursor-pointer transition-all duration-200";
        
        if (isActive) {
            // Highlighted state for selected station
            return `${baseClasses} bg-yellow-400 shadow-[0px_0px_12px_6px_rgba(250,204,21,0.8)] scale-125`;
        }
        
        switch (status) {
            case "available":
                return `${baseClasses} bg-green-400 shadow-[0px_0px_6px_3px_rgba(34,197,94,0.7)] hover:scale-110`;
            case "unavailable":
                return `${baseClasses} bg-red-400 shadow-[0px_0px_6px_3px_rgba(239,68,68,0.9)] hover:scale-110`;
            default:
                return `${baseClasses} bg-gray-400 shadow-[0px_0px_6px_3px_rgba(156,163,175,0.7)] hover:scale-110`;
        }
    }

    // Initialize map
    useEffect(() => {
        if (!mapboxToken) {
            console.error("Mapbox token is not defined");
            return;
        }
        
        mapboxgl.accessToken = mapboxToken;
        
        if (!mapContainerRef.current) {
            console.error("Map container not found");
            return;
        }
        
        try {
            mapRef.current = new mapboxgl.Map({
                style: "mapbox://styles/mapbox/dark-v11",
                container: mapContainerRef.current as HTMLElement,
                center: center,
                zoom: zoom,
                pitch: pitch,
            });

            mapRef.current.on("move", () => {
                if (mapRef.current) {
                    const mapCenter = mapRef.current.getCenter();
                    const mapZoom = mapRef.current.getZoom();
                    const mapPitch = mapRef.current.getPitch();

                    setCenter([mapCenter.lng, mapCenter.lat]);
                    setZoom(mapZoom);
                    setPitch(mapPitch);
                }
            });

            // Add moveend event listener for dynamic loading
            mapRef.current.on("moveend", () => {
                if (mapRef.current) {
                    const mapCenter = mapRef.current.getCenter();
                    onMapMove(mapCenter.lat, mapCenter.lng);
                }
            });

            setMapInitialized(true);
        } catch (error) {
            console.error("Error initializing map:", error);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [mapboxToken]); // Add mapboxToken as dependency

    // Center map on user location when available
    useEffect(() => {
        if (mapRef.current && userPos && mapInitialized) {
            const userLng = userPos[1];
            const userLat = userPos[0];
            
            // Center map on user location with a closer zoom
            mapRef.current.flyTo({
                center: [userLng, userLat],
                zoom: 12, // Closer zoom for user location
                duration: 2000, // Smooth animation
                essential: true
            });
            
            // Update center state
            setCenter([userLng, userLat]);
            setZoom(12);
        }
    }, [userPos, mapInitialized]);

    // Add effect to zoom to active station
    useEffect(() => {
        if (mapRef.current && activeStation && mapInitialized) {
            const selectedStation = data.find(station => station.station_name === activeStation);
            if (selectedStation && selectedStation.coords) {
                mapRef.current.flyTo({
                    center: [selectedStation.coords[0], selectedStation.coords[1]],
                    zoom: 15, // Closer zoom for selected station
                    duration: 1500, // Smooth animation
                    essential: true
                });
            }
        }
    }, [activeStation, data, mapInitialized]);

    // Add markers when data or userPos changes
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        // Clear existing markers (except user position)
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker:not(.user-marker)');
        existingMarkers.forEach(marker => marker.remove());

        // Add station markers
        data.forEach((station) => {
            const el = document.createElement("div");
            el.className = getColorByStatus(station.station_status, station.station_name === activeStation);

            el.addEventListener("click", () => {
                const accordionItem = document.getElementById(
                    station.station_name.replace(/\s+/g, '-').toLowerCase()
                );

                setTimeout(() => {
                    if (accordionItem) {
                        accordionItem.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }
                }, 300);

                handleMarkerClick(station.station_name);
            });

            if (station.coords) {
                new mapboxgl.Marker(el)
                    .setLngLat([station.coords[0], station.coords[1]])
                    .addTo(mapRef.current!);
            }
        });

        // Add user position marker
        if (userPos) {
            const e2 = document.createElement("div");
            e2.className =
                "h-4 w-4 border-[2px] border-zinc-50 rounded-full bg-blue-400 shadow-[0px_0px_6px_3px_rgba(14,165,233,1)] user-marker";

            new mapboxgl.Marker(e2)
                .setLngLat([userPos[1], userPos[0]])
                .addTo(mapRef.current);
        }
    }, [data, userPos, mapInitialized, handleMarkerClick, activeStation]);

    return (
        <div className="h-[60vh] sm:w-full sm:h-full relative bg-red-500/0 rounded-[20px] p-2 sm:p-0">
            {!mapboxToken ? (
                <div className="h-full w-full bg-[#27272a] rounded-[20px] flex items-center justify-center">
                    <div className="text-center text-white p-6">
                        <div className="text-4xl mb-4">🗺️</div>
                        <h3 className="text-lg font-semibold mb-2">Map Not Available</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Mapbox access token is not configured
                        </p>
                        <div className="text-xs text-gray-500">
                            Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div
                        id="map-container"
                        ref={mapContainerRef}
                        className="opacity-100"
                    />
                    
                    {/* Loading indicator for dynamic loading */}
                    {loading && (
                        <div className="absolute top-4 right-4 bg-[#27272a]/90 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Loading nearby stations...
                        </div>
                    )}
                    
                    <div className="bg-[#18181b]/90 absolute bottom-10 left-2 sm:bottom-8 sm:left-0 flex flex-col gap-2 m-1 py-2.5 p-2 rounded-[16px]">
                        <div className="flex items-center gap-0">
                            <div className="h-3 w-3 rounded-full bg-red-400 flex-none"></div>
                            <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-red-700/30 text-red-300/90">
                                unavailable
                            </div>
                        </div>
                        <div className="flex items-center gap-0">
                            <div className="h-3 w-3 rounded-full bg-green-400 flex-none"></div>
                            <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-green-800/30 text-green-300/90">
                                available
                            </div>
                        </div>
                        <div className="flex items-center gap-0">
                            <div className="h-4 w-4 border-[2px] border-zinc-50 rounded-full bg-blue-400 flex-none"></div>
                            <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-blue-700/30 text-blue-300/90">
                                your location
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
