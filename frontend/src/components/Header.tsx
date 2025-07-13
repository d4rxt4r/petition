'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LangSwitch } from './LangSwitch';

export function Header() {
    const { t } = useTranslation();

    return (
        <header className="shadow-2xs py-4">
            <div className="px-4 max-w-7xl flex justify-between items-center gap-4 m-auto">
                <Link href="/main" className="flex gap-2 items-center font-semibold text-lg leading-[80%]">
                    <Image src="/logo.svg" className="w-9 h-9" alt="Гражданская инициатива" width={36} height={36} />
                    {t('header_logo.1')}
                    <br />
                    {t('header_logo.2')}
                </Link>
                <div className="hidden md:flex items-baseline gap-9">
                    <Link href="/main#petition">{t('header_link.1')}</Link>
                    <Link href="/main#how-it-works">{t('header_link.2')}</Link>
                    <Link href="/main/status">{t('header_link.3')}</Link>
                    {/* <Link href="/main">{t('header_link.4')}</Link> */}
                    <LangSwitch />
                </div>
                <div className="md:hidden">
                    <LangSwitch />
                </div>
            </div>
        </header>
    );
}
