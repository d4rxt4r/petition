import { SignCounter } from '@/components/SignCounter';
import { PetitionStatusDisplay } from '@/components/StatusDisplay';

export default async function StatusPage() {
    const petition = await fetch('/api/vote_info').then((res) => res.json());

    return (
        <section className="py-10 px-4 max-w-7xl m-auto flex flex-col md:flex-row min-h-[calc(100vh-190px)] items-center">
            <PetitionStatusDisplay status={petition?.status} />
            <div className="md:hidden w-full mt-4">
                <SignCounter invert />
            </div>
        </section>
    );
}
