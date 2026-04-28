import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateStaffPayload = {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  branch?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part.trim()[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse(500, { error: "Missing Supabase environment variables" });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Missing authorization token" });
  }

  const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  const {
    data: { user: callerUser },
    error: callerError,
  } = await callerClient.auth.getUser();

  if (callerError || !callerUser) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  const { data: callerProfile } = await callerClient
    .from("profiles")
    .select("role")
    .eq("id", callerUser.id)
    .single();

  if (!callerProfile || !["super_admin", "hr_manager"].includes(callerProfile.role)) {
    return jsonResponse(403, { error: "Insufficient permissions" });
  }

  const body = (await req.json()) as CreateStaffPayload;
  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const fullName = (body.full_name || "").trim();
  const role = (body.role || "staff_member").trim();
  const branch = (body.branch || "").trim();

  if (!email || !password || !fullName) {
    return jsonResponse(400, { error: "email, password, and full_name are required" });
  }

  if (password.length < 6) {
    return jsonResponse(400, { error: "Password must be at least 6 characters" });
  }

  const allowedRoles = new Set([
    "super_admin",
    "branch_manager",
    "finance_officer",
    "loan_officer",
    "staff_member",
    "front_desk",
    "auditor",
    "hr_manager",
    "unassigned",
  ]);

  const finalRole = allowedRoles.has(role) ? role : "staff_member";

  if (finalRole === "super_admin" && callerProfile.role !== "super_admin") {
    return jsonResponse(403, { error: "Only super admin can create another super admin" });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone: body.phone || "",
    },
  });

  if (createError || !created.user) {
    return jsonResponse(400, { error: createError?.message || "Failed to create auth user" });
  }

  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    phone: body.phone || "",
    role: finalRole,
    branch,
    avatar_initials: getInitials(fullName),
  });

  if (profileError) {
    return jsonResponse(400, { error: profileError.message });
  }

  return jsonResponse(200, {
    user_id: created.user.id,
    email,
    role: finalRole,
  });
});
