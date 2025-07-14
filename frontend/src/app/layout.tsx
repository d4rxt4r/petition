import type { Metadata } from 'next';
import type { Viewport } from 'next';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import './globals.css';

const SFPro = localFont({
    src: [
        {
            path: './fonts/sfpro/sf-pro-text-regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/sfpro/sf-pro-display-semibold.woff2',
            weight: '600',
            style: 'normal',
        },
    ],
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'Гражданская инициатива',
    description: 'Петиция граждан Молдавии, живущих в России',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${SFPro.className} antialiased flex flex-col min-h-screen m-auto`}
            >
                <Suspense>
                    {children}
                </Suspense>
            </body>
        </html>
    );
}
