"use client"
import { Button } from "@/components/ui/button";
import { AuthApi } from "@/services";

export function LogoutButton() {
     const handleExit = async () => {
    try {
      await AuthApi.logout();
    } catch (error) {}
  };
    return <Button onClick={handleExit}>Выход</Button>
}
