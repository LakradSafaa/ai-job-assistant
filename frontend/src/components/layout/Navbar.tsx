"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
};

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    };

    getProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold">
          AI Job Assistant
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">
            {profile?.name ?? "Utilisateur"}
          </p>

          <p className="text-sm text-gray-500">
            {profile?.email}
          </p>
        </div>

        <Avatar>
          <AvatarFallback>
            {profile?.name?.charAt(0).toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="outline"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </header>
  );
}