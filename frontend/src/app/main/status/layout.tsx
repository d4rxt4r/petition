import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Статус голосования | Moldova Vote — Онлайн-проверка статуса',
    description: 'Проверьте актуальный статус вашего голосования на платформе Moldova Vote. Быстрая и безопасная проверка данных участия в выборах. Поддержка онлайн 24/7.',
    openGraph: {
        title: 'Статус голосования | Moldova Vote — Онлайн-проверка статуса',
        description: 'Проверьте актуальный статус вашего голосования на платформе Moldova Vote. Быстрая и безопасная проверка данных участия в выборах. Поддержка онлайн 24/7.',
    },
};

export default function StatusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
