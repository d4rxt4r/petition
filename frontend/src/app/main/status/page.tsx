'use client';

import { env } from 'next-runtime-env';
import { useEffect, useState } from 'react';
import { SignCounter } from '@/components/SignCounter';
import { PetitionStatusDisplay } from '@/components/StatusDisplay';
import { PetitionStatus } from '@/enums';

import '@/i18n';

export default function StatusPage() {
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
                setStatus(data?.status);
            } catch (e) {
                console.error(e);
            }
        };

        fetchStatus();

        return () => controller.abort();
    }, []);

    return (
        <section className="py-10 px-4 max-w-7xl m-auto flex flex-col md:flex-row min-h-[calc(100vh-190px)] items-center">
            <PetitionStatusDisplay status={status} />
            <div className="md:hidden w-full mt-4">
                <SignCounter invert />
            </div>
        </section>
    );
}
