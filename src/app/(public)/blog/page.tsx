// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("blog_posts").select("id,slug,title,excerpt,tags,published_at,cover_image").eq("published", true).order("published_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-8"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-4xl font-bold mb-10">Blog</h1>
        {(!posts || posts.length === 0) && (
          <p className="text-gray-500 text-center py-16">No posts published yet. Check back soon!</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts?.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-full h-48 object-cover" />}
              <div className="p-6">
                <h2 className="font-bold text-xl mb-2">{p.title}</h2>
                {p.excerpt && <p className="text-gray-500 text-sm mb-4">{p.excerpt}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {p.published_at && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(p.published_at)}</span>}
                  {p.tags && p.tags.length > 0 && (
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{p.tags.slice(0, 2).join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
