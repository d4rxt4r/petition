'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import '@/i18n';

export default function Logo({ className }: { className?: string }) {
    const { t } = useTranslation();

    return (
        <Link href="/main" className={cn('flex gap-2 items-center font-semibold text-lg leading-[80%]', className)}>
            <Image src="/logo.svg" className="w-9 h-9" alt="Гражданская инициатива" width={36} height={36} />
            {t('header_logo.1')}
            <br />
            {t('header_logo.2')}
        </Link>
    );
}
