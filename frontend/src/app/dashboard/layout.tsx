import { Button } from '@/components/ui/button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="p-4">
            <div className="flex gap-4 justify-end items-baseline">
                <span className="font-semibold text-lg">Администратор</span>
                <Button>Выход</Button>
            </div>
            {children}
        </div>
    );
}
