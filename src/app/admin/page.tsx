// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Globe, Settings } from "lucide-react";
import Link from "next/link";
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [{ count: userCount }, { count: blogCount }, { data: activityLogs }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("activity_logs").select("action,created_at,user_id,profiles(full_name)").order("created_at", { ascending: false }).limit(10),
  ]);

  const quickLinks = [
    { href: "/admin/content", label: "Website Content", icon: Globe, desc: "Manage pages, sections, hero, services" },
    { href: "/admin/blog", label: "Blog Posts", icon: FileText, desc: `${blogCount ?? 0} posts published` },
    { href: "/admin/seo", label: "SEO Settings", icon: Settings, desc: "Meta tags, OG images, sitemap" },
    { href: "/admin/users", label: "All Users", icon: Users, desc: `${userCount ?? 0} total users` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {activityLogs?.map((log) => {
              const p = log.profiles as { full_name: string } | null;
              return (
                <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">
                    <span className="font-medium">{p?.full_name ?? "System"}</span> {log.action}
                  </span>
                  <span className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
