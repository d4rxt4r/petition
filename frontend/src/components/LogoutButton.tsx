'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthApi } from '@/services';

export function LogoutButton() {
    const router = useRouter();
    const handleExit = async () => {
        try {
            await AuthApi.logout();
            router.push('/auth');
        } catch (error) {
            console.error(error);
        }
    };
    return <Button onClick={handleExit}>Выход</Button>;
}
