// @ts-nocheck

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

const PAGE_SLUGS = ["home", "about", "services", "contact"];

export default function AdminContentPage() {
  const supabase = createClient();
  const [selectedPage, setSelectedPage] = useState("home");
  const [pageData, setPageData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadPage = async (slug: string) => {
    const { data } = await supabase.from("website_pages").select("*").eq("slug", slug).single();
    if (data) {
      setPageData(data.content as Record<string, string>);
    } else {
      setPageData({});
    }
  };

  useEffect(() => { loadPage(selectedPage); }, [selectedPage]);

  const save = async () => {
    setSaving(true);
    const existing = await supabase.from("website_pages").select("id").eq("slug", selectedPage).single();
    if (existing.data) {
      await supabase.from("website_pages").update({ content: pageData }).eq("slug", selectedPage);
    } else {
      await supabase.from("website_pages").insert({ slug: selectedPage, title: selectedPage, content: pageData });
    }
    toast.success("Page content saved!");
    setSaving(false);
  };

  const homeFields = [
    { key: "hero_heading", label: "Hero Heading" },
    { key: "hero_subheading", label: "Hero Subheading" },
    { key: "hero_cta_text", label: "CTA Button Text" },
    { key: "hero_cta_link", label: "CTA Button Link" },
    { key: "about_heading", label: "About Section Heading" },
    { key: "about_description", label: "About Description", multiline: true },
    { key: "services_heading", label: "Services Section Heading" },
    { key: "stats_clients", label: "Stat: Clients" },
    { key: "stats_projects", label: "Stat: Projects" },
    { key: "stats_experience", label: "Stat: Years Experience" },
    { key: "contact_email", label: "Contact Email" },
    { key: "contact_phone", label: "Contact Phone" },
    { key: "contact_address", label: "Contact Address", multiline: true },
  ];

  const otherFields = [
    { key: "page_title", label: "Page Title" },
    { key: "page_heading", label: "Main Heading" },
    { key: "page_content", label: "Page Content", multiline: true },
  ];

  const fields = selectedPage === "home" ? homeFields : otherFields;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Website Content</h2>
        <Button onClick={save} disabled={saving}><Save className="w-4 h-4" />{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
      <div className="flex gap-2">
        {PAGE_SLUGS.map((s) => (
          <button key={s} onClick={() => setSelectedPage(s)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              selectedPage === s ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}>{s}
          </button>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="capitalize">{selectedPage} Page</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {fields.map(({ key, label, multiline }) => (
            <div key={key}>
              <Label>{label}</Label>
              {multiline ? (
                <Textarea value={pageData[key] ?? ""} onChange={(e) => setPageData({ ...pageData, [key]: e.target.value })} rows={4} className="mt-1" />
              ) : (
                <Input value={pageData[key] ?? ""} onChange={(e) => setPageData({ ...pageData, [key]: e.target.value })} className="mt-1" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
