'use client';

import Link from 'next/link';

import { useTranslation } from 'react-i18next';
import { LangSwitch } from './LangSwitch';
import Logo from './Logo';

import '@/i18n';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-[#F2F2F2] py-6 mt-auto">
            <div className="px-4 max-w-7xl m-auto">
                <div className="flex flex-wrap md:flex-nowrap justify-between mb-4">
                    <Logo className="mb-4" />
                    <div className="flex flex-wrap md:flex-nowrap gap-6 md:justify-end">
                        <Link href="/main#petition">{t('header_link.1')}</Link>
                        <Link href="/main#how-it-works">{t('header_link.2')}</Link>
                        <Link href="/main/status">{t('header_link.3')}</Link>
                        {/* <Link href="/main">{t('header_link.4')}</Link> */}
                        <Link href="/main/privacy-policy">{t('header_link.5')}</Link>
                    </div>
                </div>
                <div className="flex justify-between">
                    <div className="gap-2 hidden md:flex">
                        <a href="https://telegram.me/share/url?url=http://moldovavote.ru&text=Петиция граждан Молдавии, живущих в России" target="_blank" rel="noreferrer noopener">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="16" fill="#2E40A2" />
                                <path d="M22.4 10.0819L19.9956 22.6339C19.9956 22.6339 19.6592 23.5042 18.7351 23.0868L13.1876 18.6822L13.1619 18.6692C13.9112 17.9724 19.7219 12.5622 19.9758 12.317C20.369 11.9372 20.1249 11.7111 19.6684 11.998L11.0854 17.6425L7.77406 16.4887C7.77406 16.4887 7.25296 16.2968 7.20283 15.8794C7.15203 15.4613 7.79121 15.2352 7.79121 15.2352L21.2905 9.75126C21.2905 9.75126 22.4 9.24644 22.4 10.0819V10.0819Z" fill="white" />
                            </svg>
                        </a>
                        <a href="https://vk.com/share.php?url=http://moldovavote.ru" target="_blank" rel="noreferrer noopener">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="16" fill="#2E40A2" />
                                <path d="M16.7862 21.5999C10.773 21.5999 7.34311 17.3957 7.2002 10.3999H10.2123C10.3113 15.5346 12.5319 17.7096 14.2908 18.1581V10.3999H17.127V14.8283C18.8639 14.6377 20.6888 12.6197 21.3044 10.3999H24.1406C23.9086 11.5512 23.4462 12.6412 22.7823 13.6019C22.1183 14.5626 21.2672 15.3732 20.282 15.9831C21.3817 16.5403 22.353 17.3291 23.1318 18.2973C23.9106 19.2655 24.4793 20.3911 24.8002 21.5999H21.6781C21.39 20.55 20.8045 19.6101 19.9949 18.8982C19.1853 18.1862 18.1877 17.7337 17.127 17.5975V21.5999H16.7862Z" fill="white" />
                            </svg>
                        </a>
                        <a href="whatsapp://send?text=http://moldovavote.ru" data-action="share/whatsapp/share">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="16" fill="#2E40A2" />
                                <path d="M22.3415 9.64995C20.761 8.07495 18.6537 7.19995 16.4293 7.19995C11.8049 7.19995 8.05854 10.9333 8.05854 15.5416C8.05854 17 8.46829 18.4583 9.17073 19.6833L8 24L12.4488 22.8333C13.6781 23.475 15.0244 23.825 16.4293 23.825C21.0537 23.825 24.8 20.0916 24.8 15.4833C24.7415 13.325 23.9219 11.225 22.3415 9.64995ZM20.4683 18.5166C20.2927 18.9833 19.4732 19.45 19.0634 19.5083C18.7122 19.5666 18.2439 19.5666 17.7756 19.45C17.4829 19.3333 17.0732 19.2166 16.6049 18.9833C14.4976 18.1083 13.1512 16.0083 13.0341 15.8333C12.9171 15.7166 12.1561 14.7249 12.1561 13.675C12.1561 12.6249 12.6829 12.1583 12.8585 11.925C13.0341 11.6916 13.2683 11.6916 13.4439 11.6916C13.561 11.6916 13.7366 11.6916 13.8537 11.6916C13.9707 11.6916 14.1463 11.6333 14.322 12.0416C14.4976 12.45 14.9073 13.5 14.9659 13.5583C15.0244 13.675 15.0244 13.7916 14.9659 13.9083C14.9073 14.025 14.8488 14.1416 14.7317 14.2583C14.6146 14.3749 14.4976 14.55 14.439 14.6083C14.3219 14.725 14.2049 14.8416 14.322 15.0166C14.439 15.2499 14.8488 15.8916 15.4927 16.4749C16.3122 17.1749 16.9561 17.4083 17.1902 17.525C17.4244 17.6416 17.5415 17.5833 17.6585 17.4666C17.7756 17.3499 18.1854 16.8833 18.3024 16.65C18.4195 16.4166 18.5951 16.475 18.7707 16.5333C18.9463 16.5916 20 17.1166 20.1756 17.2333C20.4098 17.35 20.5268 17.4083 20.5854 17.4666C20.6439 17.6416 20.6439 18.0499 20.4683 18.5166Z" fill="white" />
                            </svg>
                        </a>
                    </div>
                    <div className="flex gap-2 items-baseline w-full md:w-auto justify-between">
                        <span className="text-sm text-black/50">
                            {t('footer_license')}
                            {' '}
                            © 2025
                        </span>
                        <LangSwitch />
                    </div>
                </div>
            </div>
        </footer>
    );
}
