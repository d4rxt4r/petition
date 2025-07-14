import { Button } from "@/components/ui/button";
import { AuthApi } from "@/services";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleExit = async () => {
    try {
      await AuthApi.logout();
    } catch (error) {}
  };
  return (
    <div className="p-4">
      <div className="flex gap-4 justify-end items-baseline">
        <span className="font-semibold text-lg">Администратор</span>
        <Button onClick={handleExit}>Выход</Button>
      </div>
      {children}
    </div>
  );
}
