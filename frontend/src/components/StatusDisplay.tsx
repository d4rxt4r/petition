'use client';

import type { PetitionStatus } from '@/enums';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { SignCounter } from '@/components/SignCounter';
import { PetitionStatusCode, PetitionStatusMap } from '@/enums';
import { cn } from '@/lib/utils';

import '@/i18n';

interface PetitionStatusProps {
    status: PetitionStatus;
}

const textDisabled = 'text-black/30';
const borderEnabled = 'border-[#1A2B87]';
const borderDisabled = 'border-[#1A2B87]/30';

export function PetitionStatusDisplay({ status }: PetitionStatusProps) {
    const { t } = useTranslation();

    const _status = PetitionStatusMap[status];

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
                    <span className={cn('text-2xl md:text-3xl order-2 md:order-1', _status < PetitionStatusCode.PENDING && textDisabled)}>{t('petition_pending')}</span>
                    <Image src={_status < PetitionStatusCode.PENDING ? '/dot-disabled.svg' : '/dot.svg'} alt="sign" width={44} height={44} className="order-1 md:order-2" />
                </div>

                <div className={cn('w-0 h-[35%] md:w-[50%] md:h-[0] border absolute top-[60%] md:top-[59%] left-[21] md:left-[unset] md:right-[34]', _status < PetitionStatusCode.PENDING ? borderDisabled : borderEnabled)}></div>

                <div className="flex  md:flex-col gap-4 items-center md:items-end z-10 basis-1/3">
                    <span className={cn('text-2xl md:text-3xl order-2 md:order-1', _status < PetitionStatusCode.SIGNED && textDisabled)}>
                        {_status === PetitionStatusCode.REJECTED ? t('petition_rejected') : t('petition_accepted')}
                    </span>
                    <Image src={_status < PetitionStatusCode.SIGNED ? '/dot-disabled.svg' : '/dot.svg'} alt="sign" width={44} height={44} className="order-1 md:order-2" />
                </div>
            </div>

            <p className="hidden md:block text-2xl">
                {t(`petition_status_${status}`)}
            </p>
        </div>
    );
}
