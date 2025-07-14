'use client';

import { env } from 'next-runtime-env';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { SignCounter } from '@/components/SignCounter';

import { PetitionStatusDisplay } from '@/components/StatusDisplay';
import { VoteForm } from '@/components/VoteForm';
import { PetitionStatus } from '@/enums';

import '@/i18n';

export default function MainPage() {
    const { t } = useTranslation();

    const [status, setStatus] = useState(PetitionStatus.ACTIVE);

    useEffect(() => {
        const controller = new AbortController();

        const fetchStatus = async () => {
            const NEXT_PUBLIC_ENV = env('NEXT_PUBLIC_ENV');
            const apiPath = NEXT_PUBLIC_ENV === 'dev' ? 'http://localhost/api/vote/vote_info' : '/api/vote/vote_info';
            try {
                const res = await fetch(apiPath, {
                    signal: controller.signal,
                });
                const data = await res.json();
                if (new Date(data?.end_date).getTime() <= new Date().getTime()) {
                    setStatus(PetitionStatus.PENDING);
                } else {
                    setStatus(data?.status);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchStatus();

        return () => controller.abort();
    }, []);

    return (
        <>
            <section id="jumbo" className="px-4 flex items-center m-auto max-w-7xl md:min-h-[calc(100vh-68px)]">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1 shrink-0 pt-14 flex flex-col">
                        <h1 className="text-3xl md:text-6xl font-semibold mb-4 md:mb-10">
                            {t('jambo_header')}
                        </h1>
                        <div className="mb-4 bg-[#F2F2F2] rounded-md md:hidden basis-1/2 shrink-0 relative">
                            <Image alt="flag" src="/img/flag.png" width={660} height={720} />
                            <SignCounter accentBackground className="absolute bottom-[10] left-[100] md:right-[100] md:bottom-[60]" />
                        </div>
                        <p className="mb-4 md:mb-0 md:text-2xl">
                            {t('jambo_description')}
                        </p>

                        <a href="/main#petition-form" className="mt-auto text-center cursor-pointer rounded-2xl text-white font-semibold bg-linear-to-t from-[#1A2B87] to-[#4155C7] py-4 md:py-6">
                            {t('sign_petition')}
                        </a>
                    </div>
                    <div className="hidden bg-[#F2F2F2] rounded-md md:block basis-1/2 shrink-0 relative">
                        <Image alt="flag" src="/img/flag.png" width={660} height={720} />
                        <SignCounter accentBackground className="absolute right-[100] bottom-[20]" />
                    </div>
                </div>
            </section>

            <main id="petition" className="px-4 max-w-7xl m-auto md:text-2xl mb-16">
                <h2 className="text-3xl md:text-6xl font-semibold mb-5 md:mb-10 pt-10">
                    {t('petition_title')}
                </h2>
                <p className="pb-4 md:pb-8">
                    {t('petition.p1')}
                </p>
                <p className="pb-4 md:pb-8">
                    {t('petition.p2')}
                </p>
                <p className="pb-4 md:pb-8">
                    {t('petition.p3')}
                </p>
                <p className="pb-4 md:pb-8">
                    <a target="_blank" rel="noreferrer noopener" className="underline font-semibold" href="https://www.constcourt.md/public/files/file/Baza%20legala/constitutia_ro_22.05.17_ru.pdf">
                        {t('petition.a1')}
                    </a>
                    {t('petition.p4')}
                </p>
                <p className="pb-4 md:pb-8">
                    <a target="_blank" rel="noreferrer noopener" className="underline font-semibold" href="https://www.un.org/ru/documents/decl_conv/declarations/declhr.shtml">
                        {t('petition.a2')}
                    </a>
                    {t('petition.p5')}
                </p>
                <p className="pb-4 md:pb-8">
                    <a target="_blank" rel="noreferrer noopener" className="underline font-semibold" href="https://docs.cntd.ru/document/901867999">
                        {t('petition.a3')}
                    </a>
                    {t('petition.p6')}
                </p>
                <p className="pb-4 md:pb-8">
                    <a target="_blank" rel="noreferrer noopener" className="underline font-semibold" href="https://hrlibrary.umn.edu/russian/gencomm/Rhrcom25.html">
                        {t('petition.a4')}
                    </a>
                    {t('petition.p7')}
                </p>
                <p className="pb-4 md:pb-8">
                    <a target="_blank" rel="noreferrer noopener" className="underline font-semibold" href="https://docs.cntd.ru/document/901836765">
                        {t('petition.a5')}
                    </a>
                    {t('petition.p8')}
                </p>
                <p className="pb-4 md:pb-8">
                    {t('petition.p9')}
                </p>
                <p className="pb-4 md:pb-8">
                    {t('petition.p10')}
                </p>
                <div className="flex gap-6">
                    <div className="basis-[calc(50%-24px)] shrink-0 flex flex-col gap-2">
                        <span className="font-semibold">{t('addressee')}</span>
                        <p>{t('addressee_name')}</p>
                    </div>
                    {/* <div className="basis-[calc(50%-24px)] shrink-0 flex flex-col gap-2">
                        <span className="font-semibold">{t('author')}</span>
                        <p>{t('author_name')}</p>
                    </div> */}
                </div>
            </main>

            <section id="attention" className="py-12 bg-linear-to-t from-[#1A2B87] to-[#4155C7]">
                <h3 className="text-white text-2xl md:text-4xl px-4 max-w-7xl m-auto md:leading-[50px]">
                    {t('attention_text')}
                </h3>
            </section>

            <section id="petition-form" className="px-4 w-full max-w-7xl m-auto py-14 md:py-[100px]">
                {status === PetitionStatus.ACTIVE
                    ? (
                            <div className="flex gap-14">
                                <VoteForm />

                                <div className="hidden md:flex shrink-0 bg-[#F2F2F2] rounded-2xl relative flex-col justify-end w-[380px] overflow-hidden">
                                    <SignCounter className="absolute top-[50] z-10" />

                                    <div className="text-white bg-linear-to-t from-[#1A2B87] to-[#4155C7] pt-[330px] p-6">
                                        <Image src="/img/form.svg" className="absolute bottom-0 left-0 right-0 z-0" alt="form" width={380} height={600} />
                                        <div className="relative z-10 pb-4">
                                            {t('share_text')}
                                        </div>
                                        <div className="flex gap-3 relative z-10">
                                            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect width="64.0001" height="64" rx="32" fill="#F2F2F2" />
                                                <path d="M44.8 20.1638L39.9913 45.2678C39.9913 45.2678 39.3185 47.0084 37.4702 46.1736L26.3752 37.3643L26.3238 37.3384C27.8225 35.9448 39.4438 25.1245 39.9517 24.634C40.738 23.8744 40.2498 23.4222 39.3369 23.996L22.1708 35.2849L15.5481 32.9774C15.5481 32.9774 14.5059 32.5935 14.4057 31.7588C14.3041 30.9226 15.5824 30.4704 15.5824 30.4704L42.581 19.5025C42.581 19.5025 44.8 18.4929 44.8 20.1638V20.1638Z" fill="#1A2B87" />
                                            </svg>
                                            <svg width="65" height="64" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="0.328125" width="64.0001" height="64" rx="32" fill="#F2F2F2" />
                                                <path d="M33.9001 43.2001C21.8736 43.2001 15.0138 34.7916 14.728 20.8H20.7523C20.9501 31.0695 25.3914 35.4195 28.9092 36.3164V20.8H34.5817V29.6569C38.0555 29.2757 41.7052 25.2397 42.9364 20.8H48.6089C48.145 23.1026 47.2201 25.2827 45.8922 27.2041C44.5644 29.1254 42.862 30.7467 40.8917 31.9664C43.0911 33.0809 45.0337 34.6584 46.5913 36.5948C48.1489 38.5312 49.2862 40.7825 49.9281 43.2001H43.684C43.1078 41.1002 41.9367 39.2205 40.3175 37.7966C38.6983 36.3726 36.703 35.4677 34.5817 35.1952V43.2001H33.9001Z" fill="#1A2B87" />
                                            </svg>
                                            <svg width="65" height="64" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="0.667969" width="64.0001" height="64" rx="32" fill="#F2F2F2" />
                                                <path d="M45.3509 19.3001C42.19 16.1501 37.9753 14.4001 33.5265 14.4001C24.2777 14.4001 16.785 21.8668 16.785 31.0835C16.785 34.0001 17.6046 36.9168 19.0094 39.3668L16.668 48.0001L25.5655 45.6668C28.0241 46.9501 30.7168 47.6501 33.5265 47.6501C42.7753 47.6501 50.268 40.1835 50.268 30.9668C50.151 26.6501 48.5119 22.4501 45.3509 19.3001ZM41.6046 37.0335C41.2534 37.9668 39.6143 38.9001 38.7948 39.0168C38.0924 39.1335 37.1558 39.1335 36.2192 38.9001C35.6339 38.6668 34.8143 38.4335 33.8778 37.9668C29.6631 36.2168 26.9704 32.0168 26.7363 31.6668C26.5021 31.4335 24.9802 29.4501 24.9802 27.3501C24.9802 25.2501 26.0338 24.3168 26.3851 23.8501C26.7363 23.3835 27.2046 23.3835 27.5558 23.3835C27.7899 23.3835 28.1412 23.3835 28.3753 23.3835C28.6094 23.3835 28.9607 23.2668 29.3119 24.0835C29.6631 24.9001 30.4826 27.0001 30.5997 27.1168C30.7168 27.3501 30.7168 27.5835 30.5997 27.8168C30.4826 28.0501 30.3655 28.2835 30.1314 28.5168C29.8973 28.7501 29.6631 29.1001 29.546 29.2168C29.3119 29.4501 29.0777 29.6835 29.3119 30.0335C29.546 30.5001 30.3656 31.7835 31.6534 32.9501C33.2924 34.3501 34.5802 34.8168 35.0485 35.0501C35.5168 35.2835 35.7509 35.1668 35.9851 34.9335C36.2192 34.7001 37.0387 33.7668 37.2729 33.3001C37.507 32.8335 37.8582 32.9501 38.2095 33.0668C38.5607 33.1835 40.668 34.2335 41.0192 34.4668C41.4875 34.7001 41.7217 34.8168 41.8387 34.9335C41.9558 35.2835 41.9558 36.1001 41.6046 37.0335Z" fill="#1A2B87" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    : <PetitionStatusDisplay status={status} />}
            </section>

            <section id="how-it-works" className="px-4 max-w-7xl m-auto pb-14 md:pb-[100px]">
                <div className="text-4xl md:text-5xl font-semibold mb-7 md:mb-14">
                    {t('how_it_works')}
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="h-[380px] flex flex-col flex-1 gap-4 md:gap-0 bg-[#F2F2F2] rounded-2xl p-6 md:p-8">
                        <h4 className="font-semibold text-2xl md:text-4xl">
                            {t('step')}
                            {' '}
                            1
                        </h4>
                        <div className="mt-auto flex flex-col gap-2">
                            <span className="font-semibold md:text-2xl">
                                {t('step_1.title')}
                            </span>
                            <p className="text-black/60 md:text-xl">
                                {t('step_1.description')}
                            </p>
                        </div>
                    </div>
                    <div className="h-[380px] flex flex-col flex-1 gap-4 md:gap-0 bg-[#F2F2F2] rounded-2xl p-6 md:p-8">
                        <h4 className="font-semibold text-2xl md:text-4xl">
                            {t('step')}
                            {' '}
                            2
                        </h4>
                        <div className="mt-auto flex flex-col gap-2">
                            <span className="font-semibold md:text-2xl">
                                {t('step_2.title')}
                            </span>
                            <p className="text-black/60 md:text-xl">
                                {t('step_2.description')}
                            </p>
                        </div>
                    </div>
                    <div className="h-[380px] flex flex-col flex-1 gap-4 md:gap-0 bg-[#F2F2F2] rounded-2xl p-6 md:p-8">
                        <h4 className="font-semibold text-2xl md:text-4xl">
                            {t('step')}
                            {' '}
                            3
                        </h4>
                        <div className="mt-auto flex flex-col gap-2">
                            <span className="font-semibold md:text-2xl">
                                {t('step_3.title')}
                            </span>
                            <p className="text-black/60 md:text-xl">
                                {t('step_3.description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
