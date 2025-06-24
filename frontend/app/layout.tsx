import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "PlugNear",
    description: "Find EV charging stations near you.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
                <link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
                <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64" />
                <link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96" />
                <link rel="icon" href="/favicon-180.png" type="image/png" sizes="180x180" />
                <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192" />
                <link rel="apple-touch-icon" href="/favicon-180.png" sizes="180x180" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
