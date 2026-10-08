// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*, departments(name)").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">All Users ({users?.length ?? 0})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Email</th>
              <th className="pb-3 font-medium">Role</th>
              <th className="pb-3 font-medium">Department</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u) => {
              const dept = u.departments as { name: string } | null;
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" /> : u.full_name.charAt(0).toUpperCase()}
                      </div>
                      {u.full_name}
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3"><Badge variant={u.role === "super_admin" ? "destructive" : u.role === "owner" ? "info" : "secondary"} className="capitalize">{u.role.replace("_", " ")}</Badge></td>
                  <td className="py-3 text-gray-500">{dept?.name ?? "2014"}</td>
                  <td className="py-3"><Badge variant={u.status === "active" ? "success" : "destructive"} className="capitalize">{u.status}</Badge></td>
                  <td className="py-3 text-gray-500">{formatDate(u.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
