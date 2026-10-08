// @ts-nocheck

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import type { BlogPost } from "@/types/database";

export default function AdminBlogPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.slug) { toast.error("Title and slug required"); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title, slug: form.slug.toLowerCase().replace(/\s+/g, "-"),
      excerpt: form.excerpt || null, content: form.content, author_id: user.id,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [],
      published: form.published, published_at: form.published ? new Date().toISOString() : null,
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Post created!");
    setShowForm(false);
    setForm({ title: "", slug: "", excerpt: "", content: "", tags: "", published: false });
    load();
    setLoading(false);
  };

  const togglePublish = async (id: string, published: boolean) => {
    await supabase.from("blog_posts").update({ published: !published, published_at: !published ? new Date().toISOString() : null }).eq("id", id);
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, published: !published } : p));
    toast.success(`Post ${!published ? "published" : "unpublished"}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Post</>}
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => { setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }); }} className="mt-1" /></div>
              <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} className="mt-1" /></div>
            <div><Label>Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} className="mt-1" /></div>
            <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1" placeholder="seo, marketing, digital" /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Publish immediately
            </label>
            <Button onClick={create} disabled={loading} className="w-full">{loading ? "Creating..." : "Create Post"}</Button>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {posts.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  <Badge variant={p.published ? "success" : "secondary"}>{p.published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-gray-500">{p.slug} · {formatDate(p.created_at)}</p>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">{p.tags.map((t) => <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t}</span>)}</div>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => togglePublish(p.id, p.published)}>
                {p.published ? "Unpublish" : "Publish"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
