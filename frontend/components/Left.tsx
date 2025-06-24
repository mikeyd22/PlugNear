"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Alert, AlertDescription } from "@/components/ui/alert";

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

function statusLabel(status: string) {
    switch (status) {
        case "available":
            return (
                <div className="rounded-lg px-2 py-1 text-sm w-fit bg-green-800/30 text-green-300/90">
                    available
                </div>
            );
        case "unavailable":
            return (
                <div className="rounded-lg px-2 py-1 text-sm w-fit bg-red-700/30 text-red-300/90">
                    unavailable
                </div>
            );
        default:
            return (
                <div className="rounded-lg px-2 py-1 text-sm w-fit bg-gray-700/30 text-gray-300/90">
                    unknown
                </div>
            );
    }
}

export default function Left({
    data,
    activeStation,
    setActiveStation,
}: {
    data: ChargingStation[];
    activeStation: string | null;
    setActiveStation: (station: string) => void;
}) {
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Alert className="w-80 bg-[#27272a] border-[#3f3f46] text-white">
                    <AlertDescription>
                        No charging stations found in your area. Try expanding
                        your search radius or check back later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="px-8 pb-8">
            <div className="text-2xl font-bold mb-4">Charging Stations</div>
            <div className="text-sm text-gray-400 mb-6">
                Found {data.length} charging stations
                {data.length > 0 && data[0].distance > 0 && (
                    <span> • Sorted by distance</span>
                )}
            </div>

            <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeStation || ""}
                onValueChange={(val) => setActiveStation(val)}
            >
                {data.map((station) => {
                    const isActive = station.station_name === activeStation;
                    
                    return (
                        <AccordionItem
                            id={station.station_name.replace(/\s+/g, '-').toLowerCase()}
                            value={station.station_name}
                            key={station.station_name}
                            className={`transition-all duration-200 ${
                                isActive 
                                    ? 'bg-[#3f3f46]/50 border-[#52525b] rounded-lg' 
                                    : 'hover:bg-[#27272a]/30'
                            }`}
                        >
                            <AccordionTrigger className={`${
                                isActive ? 'text-yellow-300' : ''
                            }`}>
                                <div className="flex justify-between w-[95%] text-left text-lg group items-center">
                                    <div className={`group-hover:underline underline-offset-8 pr-2 ${
                                        isActive ? 'font-semibold' : ''
                                    }`}>
                                        {station.station_name}
                                    </div>
                                    <div className="">
                                        {statusLabel(station.station_status)}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <div className="text-sm text-gray-400 mb-1">
                                            Address
                                        </div>
                                        <div className="text-sm">
                                            {station.station_address}
                                            {station.station_town && (
                                                <span>, {station.station_town}</span>
                                            )}
                                        </div>
                                    </div>

                                    {station.distance > 0 && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">
                                                Distance
                                            </div>
                                            <div className="text-sm">
                                                {station.distance.toFixed(1)} km away
                                            </div>
                                        </div>
                                    )}

                                    {station.connections && station.connections.length > 0 && (
                                        <div>
                                            <div className="text-sm text-gray-400 mb-2">
                                                Charging Connections
                                            </div>
                                            <div className="space-y-2">
                                                {station.connections.map((connection, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-[#27272a] rounded-lg p-3"
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-medium text-sm">
                                                                {connection.type}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {connection.power} kW
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Status: {connection.status}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}
