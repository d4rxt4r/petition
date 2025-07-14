import { LogoutButton } from "@/components/LogoutButton";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  return (
    <div className="p-4">
      <div className="flex gap-4 justify-end items-baseline">
        <span className="font-semibold text-lg">Администратор</span>
        <LogoutButton/>
      </div>
      {children}
    </div>
  );
}
