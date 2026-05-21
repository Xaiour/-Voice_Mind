"use client";

import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user: any;
}

export function Navbar({ user }: NavbarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h2 className="text-sm text-muted-foreground">
          Welcome back,{" "}
          <span className="text-foreground font-medium">
            {user?.firstName || "User"}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
