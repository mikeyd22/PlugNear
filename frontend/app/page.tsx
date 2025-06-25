"use client";
import Left from "@/components/Left";
import { useEffect, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Map from "@/components/Map";
import Loading from "@/components/Loading";
import Image from "next/image";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

export default function Home() {
    const [data, setData] = useState<ChargingStation[]>([]);
    const [activeStation, setActiveStation] = useState<string | null>(null);
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleMarkerClick = (stationName: string) => {
        setActiveStation(stationName);
    };

    // New function to handle station selection from list
    const handleStationSelect = (stationName: string) => {
        setActiveStation(stationName);
    };

    // Debounced function to fetch charging stations
    const debouncedFetchStations = useCallback(
        debounce(async (lat: number, lng: number) => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch("/api/charging-stations", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ lat, lng }),
                });
                
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                const newData = await res.json();
                setData(newData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setError("Unable to load charging stations. Please try again later.");
            } finally {
                setLoading(false);
            }
        }, 1000), // 1 second delay
        []
    );

    // Handle map movement
    const handleMapMove = useCallback((lat: number, lng: number) => {
        setMapCenter([lat, lng]);
        debouncedFetchStations(lat, lng);
    }, [debouncedFetchStations]);

    useEffect(() => {
        const fetchLocationAndData = async () => {
            setLoading(true);
            setError(null);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserPos([latitude, longitude]);

                        try {
                            // Send the user's location to the backend
                            const res = await fetch("/api/charging-stations", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    lat: latitude,
                                    lng: longitude,
                                }),
                            });

                            if (!res.ok) {
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }

                            const data = await res.json();
                            setData(data);
                        } catch (error) {
                            console.error(
                                "Failed to fetch data from backend:",
                                error
                            );
                            setError("Unable to load charging stations. Please try again later.");
                        } finally {
                            setLoading(false);
                        }
                    },
                    async (error) => {
                        console.error("Error fetching location here:", error);

                        try {
                            // Fallback to fetching unsorted data
                            const res = await fetch("/api/charging-stations");
                            
                            if (!res.ok) {
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }
                            
                            const defaultData = await res.json();
                            setData(defaultData);
                        } catch (error) {
                            console.error("Failed to fetch fallback data:", error);
                            setError("Unable to load charging stations. Please try again later.");
                        } finally {
                            setLoading(false);
                        }
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                try {
                    const res = await fetch("/api/charging-stations", {
                        method: "GET",
                    });
                    
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    
                    const defaultData = await res.json();
                    setData(defaultData);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                    setError("Unable to load charging stations. Please try again later.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchLocationAndData();
    }, []);

    if (loading && data.length === 0) {
        return <Loading />;
    }

    if (error) {
        return (
            <main className="flex h-screen bg-[#18181b] text-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="flex h-screen bg-[#18181b] text-white">
            <div className="basis-2/5 sm:basis-2/5 h-screen flex flex-col">
                <div className="w-full h-20 pl-8 pr-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Image
                            src={"/Plug_Near_logo.png"}
                            width={50}
                            height={50}
                            alt="PlugNear Logo"
                        />
                        <h1 className="text-2xl font-bold">PlugNear</h1>
                    </div>
                    <Popover>
                        <PopoverTrigger className="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width={28}
                                height={28}
                                fill={"none"}
                            >
                                <path
                                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                />
                                <path
                                    d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M11.2422 9H12.2422"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#27272a] border-[#3f3f46] text-white">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">
                                        PlugNear
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Find electric vehicle charging stations
                                        across Ontario. Green markers indicate
                                        available stations, red markers show
                                        unavailable ones. Move the map to load
                                        stations in new areas.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="text-sm font-medium">
                                            Data Source
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Open Charge Map API
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="text-sm font-medium">
                                            Coverage
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Ontario, Canada
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <div className="text-sm font-medium">
                                            Search Radius
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            100km
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <ScrollArea className="h-full">
                    <div className="w-full h-20 pl-8 pr-8 flex sm:hidden justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Image
                                src={"/Plug_Near_logo.png"}
                                width={50}
                                height={50}
                                alt="PlugNear Logo"
                            />
                            <h1 className="text-2xl font-bold">PlugNear</h1>
                        </div>
                        <Popover>
                            <PopoverTrigger className="">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width={28}
                                    height={28}
                                    fill={"none"}
                                >
                                    <path
                                        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <path
                                        d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M11.2422 9H12.2422"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 bg-[#27272a] border-[#3f3f46] text-white">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">
                                            PlugNear
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Find electric vehicle charging stations
                                            across Ontario. Green markers indicate
                                            available stations, red markers show
                                            unavailable ones. Move the map to load
                                            stations in new areas.
                                        </p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Left
                        data={data}
                        activeStation={activeStation}
                        setActiveStation={handleStationSelect}
                    />
                </ScrollArea>
            </div>
            <div className="basis-3/5 sm:basis-3/5 h-screen flex flex-col">
                <div className="w-full h-20 pl-8 pr-8 flex justify-between items-center">
                    <div className="text-2xl font-bold">Map</div>
                    <Popover>
                        <PopoverTrigger className="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width={28}
                                height={28}
                                fill={"none"}
                            >
                                <path
                                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                />
                                <path
                                    d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M11.2422 9H12.2422"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-[#27272a] border-[#3f3f46] text-white">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">
                                        PlugNear
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Find electric vehicle charging stations
                                        across Ontario. Green markers indicate
                                        available stations, red markers show
                                        unavailable ones. Move the map to load
                                        stations in new areas.
                                    </p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <Map 
                    data={data} 
                    handleMarkerClick={handleMarkerClick} 
                    userPos={userPos}
                    onMapMove={handleMapMove}
                    loading={loading}
                    activeStation={activeStation}
                />
            </div>
        </main>
    );
}
