// @ts-nocheck

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("website_pages").select("content").eq("slug", "about").single();
  const content = (data?.content ?? {}) as Record<string, string>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-8"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-4xl font-bold mb-6">{content.page_heading || "About Fast Digital 360"}</h1>
        <div className="prose text-gray-700">
          <p>{content.page_content || "Fast Digital 360 is a full-service digital marketing agency dedicated to helping businesses grow online. We combine data-driven strategies with creative execution to deliver measurable results for our clients."}</p>
        </div>
      </div>
    </div>
  );
}
