
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
export const dynamic = 'force-dynamic';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile || profile.status === "deactivated") redirect("/login");
  if (profile.role === "employee") redirect("/dashboard");
  if (profile.role === "super_admin") redirect("/admin");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role="owner" userName={profile.full_name} userAvatar={profile.avatar_url} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Owner Dashboard" userId={user.id} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
