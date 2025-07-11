import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SignCounterProps {
    accentBackground?: boolean;
    className?: string;
    invert?: boolean;
}

export function SignCounter({ accentBackground, invert, className }: SignCounterProps) {
    return (
        <div className={cn('rounded-lg py-3 px-4 md:px-10', accentBackground && 'bg-white', invert && 'bg-[#263796]', className)}>
            <span className={cn('text-3xl md:text-6xl font-semibold flex gap-2 items-center', invert && 'text-white')}>
                <Image src={invert ? '/dot-small-invert.svg' : '/dot-small.svg'} alt="sign" width={20} height={20} />
                18945
            </span>
            <p className={cn('md:text-right text-sm md:text-lg', invert && 'text-white')}>
                человек подписало
            </p>
        </div>
    );
}
