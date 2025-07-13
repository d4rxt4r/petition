'use client';

import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { SignCounter } from '@/components/SignCounter';
import { PetitionStatus } from '@/enums';
import { cn } from '@/lib/utils';

interface PetitionStatusProps {
    status: PetitionStatus;
}

const textDisabled = 'text-black/30';
const borderEnabled = 'border-[#1A2B87]';
const borderDisabled = 'border-[#1A2B87]/30';

function PetitionStatusDisplay({ status }: PetitionStatusProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-[#F2F2F2] rounded-2xl p-10 px-4 md:px-10 relative">
            <SignCounter accentBackground className="absolute right-[60] top-[60] hidden md:block" />
            <h1 className="text-3xl md:text-6xl font-semibold mb-4 md:mb-10">
                {t('petition_status')}
            </h1>

            <p className="md:hidden">
                {t(`petition_status_${status}`)}
            </p>

            <div className="flex flex-col md:flex-row justify-between pt-8 gap-[56] md:gap-0 md:py-[100] relative">
                <div className="flex md:flex-col gap-2 md:gap-4 items-center md:items-start z-10 basis-1/3">
                    <span className="text-2xl md:text-3xl order-2 md:order-1">{t('petition_active')}</span>
                    <Image src="/dot.svg" alt="sign" width={44} height={44} className="order-1 md:order-2" />
                </div>

                <div className={cn('w-0 h-[35%] md:w-[50%] md:h-[0] border absolute top-[20%] md:top-[59%] left-[21] md:left-[0]', borderEnabled)}></div>

                <div className="flex md:flex-col gap-4 items-center z-10 basis-1/3">
                    <span className={cn('text-2xl md:text-3xl order-2 md:order-1', status < PetitionStatus.PENDING && textDisabled)}>{t('petition_pending')}</span>
                    <Image src={status < PetitionStatus.PENDING ? '/dot-disabled.svg' : '/dot.svg'} alt="sign" width={44} height={44} className="order-1 md:order-2" />
                </div>

                <div className={cn('w-0 h-[35%] md:w-[50%] md:h-[0] border absolute top-[60%] md:top-[59%] left-[21] md:left-[unset] md:right-[34]', status < PetitionStatus.PENDING ? borderDisabled : borderEnabled)}></div>

                <div className="flex  md:flex-col gap-4 items-center md:items-end z-10 basis-1/3">
                    <span className={cn('text-2xl md:text-3xl order-2 md:order-1', status < PetitionStatus.SIGNED && textDisabled)}>
                        {status === PetitionStatus.REJECTED ? t('petition_rejected') : t('petition_accepted')}
                    </span>
                    <Image src={status < PetitionStatus.SIGNED ? '/dot-disabled.svg' : '/dot.svg'} alt="sign" width={44} height={44} className="order-1 md:order-2" />
                </div>
            </div>

            <p className="hidden md:block text-2xl">
                {t(`petition_status_${status}`)}
            </p>
        </div>
    );
}

export default function StatusPage() {
    const status = PetitionStatus.ACTIVE;

    return (
        <section className="py-10 px-4 max-w-7xl m-auto flex flex-col md:flex-row min-h-[calc(100vh-190px)] items-center">
            <PetitionStatusDisplay status={status} />
            <div className="md:hidden w-full mt-4">
                <SignCounter invert />
            </div>
        </section>
    );
}
