
"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatTime } from "@/lib/utils";
import { Send, Hash } from "lucide-react";
import type { Channel, Message, Profile } from "@/types/database";

export default function MessagesPage() {
  const supabase = createClient();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<(Message & { profiles?: { full_name: string; avatar_url: string | null } | null })[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
    supabase.from("channels").select("*").order("name").then(({ data }) => {
      setChannels(data ?? []);
      if (data && data.length > 0) setActiveChannel(data[0]);
    });
  }, []);

  useEffect(() => {
    if (!activeChannel) return;
    supabase.from("messages").select("*, profiles(full_name, avatar_url)").eq("channel_id", activeChannel.id).is("deleted_at", null).order("created_at").limit(50).then(({ data }) => {
      setMessages((data as typeof messages) ?? []);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    const sub = supabase.channel(`msg:${activeChannel.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannel.id}` }, async (payload) => {
        const { data: msg } = await supabase.from("messages").select("*, profiles(full_name, avatar_url)").eq("id", payload.new.id).single();
        if (msg) setMessages((prev) => [...prev, msg as typeof messages[0]]);
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [activeChannel?.id]);

  const sendMessage = async () => {
    if (!text.trim() || !activeChannel || !userId) return;
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({ channel_id: activeChannel.id, user_id: userId, content });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col bg-slate-900">
        <div className="p-4 border-b border-slate-700">
          <p className="text-white font-semibold text-sm">Channels</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                activeChannel?.id === ch.id ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Hash className="w-4 h-4 flex-shrink-0" />
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">{activeChannel.name}</span>
              {activeChannel.description && <span className="text-sm text-gray-500">— {activeChannel.description}</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => {
                const isOwn = m.user_id === userId;
                const showAvatar = i === 0 || messages[i - 1].user_id !== m.user_id;
                return (
                  <div key={m.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                    {showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {m.profiles?.avatar_url ? (
                          <img src={m.profiles.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                        ) : (
                          m.profiles?.full_name?.charAt(0).toUpperCase() ?? "?"
                        )}
                      </div>
                    )}
                    {!showAvatar && <div className="w-8 flex-shrink-0" />}
                    <div className={cn("max-w-xs lg:max-w-md", isOwn && "items-end flex flex-col")}>
                      {showAvatar && (
                        <p className={cn("text-xs text-gray-500 mb-1", isOwn && "text-right")}>
                          {isOwn ? "You" : m.profiles?.full_name} \u00b7 {formatTime(m.created_at)}
                        </p>
                      )}
                      <div className={cn(
                        "px-4 py-2 rounded-2xl text-sm",
                        isOwn ? "bg-blue-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a channel</div>
        )}
      </div>
    </div>
  );
}
