'use client';

import { env } from 'next-runtime-env';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SignCounterProps {
    accentBackground?: boolean;
    className?: string;
    invert?: boolean;
}

export function SignCounter({ accentBackground, invert, className }: SignCounterProps) {
    const { t } = useTranslation();

    const [count, setCount] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchCount = async () => {
            const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
            const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/vote_info' : '/api/vote/vote_info';
            try {
                const res = await fetch(apiPath, {
                    signal: controller.signal,
                });
                const data = await res.json();
                setCount(data?.quantity);
            } catch (e) {
                console.error(e);
            }
        };

        fetchCount();

        return () => controller.abort();
    }, []);

    return (
        <div className={cn('rounded-lg py-3 px-4 md:px-10', accentBackground && 'bg-white', invert && 'bg-[#263796]', className)}>
            <span className={cn('text-3xl md:text-6xl font-semibold flex gap-2 items-center', invert && 'text-white')}>
                <Image src={invert ? '/dot-small-invert.svg' : '/dot-small.svg'} alt="sign" width={20} height={20} />
                {count ?? <Skeleton className="w-[80] md:w-[150] h-8 md:h-14" />}
            </span>
            <p className={cn('md:text-right text-sm md:text-lg', invert && 'text-white')}>
                {t('counter_text')}
            </p>
        </div>
    );
}
