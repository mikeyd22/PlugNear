"use client";

import { useState, useEffect } from "react";

interface DebugInfo {
    backendUrl: string;
    apiStatus: string;
    mapboxToken: string;
    userAgent: string;
    timestamp: string;
}

export default function Debug() {
    const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkEnvironment = async () => {
            try {
                // Test API endpoint
                const apiResponse = await fetch("/api/charging-stations", {
                    method: "GET",
                });
                
                const info: DebugInfo = {
                    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "Not set",
                    apiStatus: apiResponse.ok ? "Working" : `Error: ${apiResponse.status}`,
                    mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? "Set" : "Not set",
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                };
                
                setDebugInfo(info);
            } catch (error) {
                setDebugInfo({
                    backendUrl: "Error checking",
                    apiStatus: "Error",
                    mapboxToken: "Error checking",
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString(),
                });
            }
        };

        checkEnvironment();
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-red-600 text-white px-3 py-2 rounded-lg text-sm z-50"
            >
                Debug
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Debug Info</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ×
                </button>
            </div>
            {debugInfo ? (
                <div className="space-y-1">
                    <div><strong>Backend URL:</strong> {debugInfo.backendUrl}</div>
                    <div><strong>API Status:</strong> {debugInfo.apiStatus}</div>
                    <div><strong>Mapbox Token:</strong> {debugInfo.mapboxToken}</div>
                    <div><strong>Time:</strong> {debugInfo.timestamp}</div>
                </div>
            ) : (
                <div>Loading debug info...</div>
            )}
        </div>
    );
} 