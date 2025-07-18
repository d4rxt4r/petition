'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import '@/i18n';

export function ThankYouBanner() {
    const { t } = useTranslation();

    return (
        <section className="px-4 max-w-7xl m-auto flex min-h-[calc(100vh-190px)] items-center">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="basis-1/2 shrink-0 pt-14 flex flex-col">
                    <h1 className="text-3xl text-center md:text-start md:text-6xl font-semibold md:mb-10">
                        {t('thank_you')}
                    </h1>
                    <div className="md:hidden basis-1/2 shrink-0 relative">
                        <Image alt="flag" src="/img/thank-you.png" width={660} height={720} />
                    </div>
                    <p className="mb-6 md:text-2xl">
                        {t('thank_you_text')}
                    </p>
                    <div className="mt-auto flex flex-col gap-2 mb-14 md:mb-0">
                        {/* <button type="button" className="rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-6">{t('share')}</button> */}
                        <Link href="/main" className="rounded-2xl text-black/50 text-center font-semibold bg-[#F2F2F2] py-6">{t('return')}</Link>
                    </div>
                </div>
                <div className="hidden md:block basis-1/2 shrink-0 relative">
                    <Image alt="flag" src="/img/thank-you.png" width={660} height={720} />
                </div>
            </div>
        </section>
    );
}
