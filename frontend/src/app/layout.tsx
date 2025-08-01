import type { Metadata } from 'next';
import type { Viewport } from 'next';
import { PublicEnvScript } from 'next-runtime-env';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
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
    title: 'Moldova Vote — Онлайн-сервис для голосования и проверки статуса',
    description: 'Платформа Moldova Vote — быстрый и удобный способ участия в голосовании и проверки статуса бюллетеня. Информация по выборам, простая регистрация, прозрачность и безопасность.',
    openGraph: {
        title: 'Moldova Vote — Онлайн-сервис для голосования и проверки статуса',
        description: 'Платформа Moldova Vote — быстрый и удобный способ участия в голосовании и проверки статуса бюллетеня. Информация по выборам, простая регистрация, прозрачность и безопасность.',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" className="scroll-smooth">
            <head>
                <PublicEnvScript />
            </head>
            <body
                className={`${SFPro.className} antialiased flex flex-col min-h-screen m-auto`}
            >
                <Suspense>
                    {children}
                </Suspense>
                <Toaster />
            </body>
        </html>
    );
}
