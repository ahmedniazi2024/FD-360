
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";
import type { SeoSettings } from "@/types/database";

const PAGES = ["home", "about", "services", "contact", "blog", "seo", "web-development", "digital-marketing"];

export default function AdminSeoPage() {
  const supabase = createClient();
  const [selected, setSelected] = useState("home");
  const [settings, setSettings] = useState<Partial<SeoSettings>>({});
  const [saving, setSaving] = useState(false);

  const load = async (slug: string) => {
    const { data } = await supabase.from("seo_settings").select("*").eq("page_slug", slug).single();
    setSettings(data ?? { page_slug: slug });
  };

  useEffect(() => { load(selected); }, [selected]);

  const save = async () => {
    setSaving(true);
    const existing = await supabase.from("seo_settings").select("id").eq("page_slug", selected).single();
    if (existing.data) {
      await supabase.from("seo_settings").update({ ...settings }).eq("page_slug", selected);
    } else {
      await supabase.from("seo_settings").insert({ ...settings, page_slug: selected });
    }
    toast.success("SEO settings saved!");
    setSaving(false);
  };

  const set = (key: keyof SeoSettings, value: string | boolean) => setSettings({ ...settings, [key]: value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">SEO Settings</h2>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setSelected(p)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
              selected === p ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}>{p.replace("-", " ")}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="capitalize">{selected.replace("-", " ")} — SEO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>SEO Title</Label><Input value={settings.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} className="mt-1" placeholder="Page Title | Fast Digital 360" /></div>
          <div><Label>Meta Description</Label><Textarea value={settings.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} rows={3} className="mt-1" placeholder="Page meta description (150-160 chars recommended)" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>OG Title</Label><Input value={settings.og_title ?? ""} onChange={(e) => set("og_title", e.target.value)} className="mt-1" /></div>
            <div><Label>OG Image URL</Label><Input value={settings.og_image ?? ""} onChange={(e) => set("og_image", e.target.value)} className="mt-1" /></div>
          </div>
          <div><Label>OG Description</Label><Textarea value={settings.og_description ?? ""} onChange={(e) => set("og_description", e.target.value)} rows={2} className="mt-1" /></div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={settings.noindex ?? false} onChange={(e) => set("noindex", e.target.checked)} />
            No-index this page (prevent search engine indexing)
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
