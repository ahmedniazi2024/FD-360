
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Verify caller is owner or super_admin
  const callerClient = await createServerClient();
  const { data: { user } } = await callerClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await callerClient.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !(["owner", "super_admin"].includes(profile.role))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { full_name, email, password, job_title, department_id, phone } = await request.json();
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: "full_name, email and password are required" }, { status: 400 });
  }

  // Use service role to create user
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "employee" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Update profile with extra fields
  if (data.user) {
    await adminClient.from("profiles").update({
      job_title: job_title || null,
      department_id: department_id || null,
      phone: phone || null,
      joining_date: new Date().toISOString().split("T")[0],
    }).eq("id", data.user.id);

    // Log activity
    await callerClient.from("activity_logs").insert({
      user_id: user.id,
      action: "created_employee",
      entity_type: "profile",
      entity_id: data.user.id,
      details: { full_name, email },
    });
  }

  return NextResponse.json({ success: true, userId: data.user?.id });
}
