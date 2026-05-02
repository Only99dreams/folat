import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_ROLES = new Set([
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

type CreateStaffPayload = {
  email?: string;
  password?: string;
  full_name?: string;
  phone?: string;
  role?: string;
  branch?: string;
  branch_id?: string;
  staff_id?: string;
  create_staff_record?: boolean;
  job_role?: string;
  employment_type?: "full_time" | "part_time" | "contract";
  date_joined?: string;
};

type BulkCreatePayload = {
  role?: string;
  create_staff_record?: boolean;
  continue_on_error?: boolean;
  users?: CreateStaffPayload[];
};

type ProvisionResult = {
  ok: boolean;
  email: string;
  user_id?: string;
  role?: string;
  staff_id?: string;
  error?: string;
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

function parseNameParts(fullName: string) {
  const clean = fullName.trim().replace(/\s+/g, " ");
  const parts = clean.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Staff", lastName: "Member" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Member" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function buildStaffId() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `STF-${year}-${random}`;
}

function normalizeRole(role: string | undefined, fallback = "staff_member") {
  const candidate = (role || fallback).trim();
  return ALLOWED_ROLES.has(candidate) ? candidate : fallback;
}

async function resolveBranchId(
  adminClient: ReturnType<typeof createClient>,
  branchId?: string,
  branchNameOrCode?: string,
) {
  const normalizedBranchId = (branchId || "").trim();
  if (normalizedBranchId) return normalizedBranchId;

  const normalizedBranch = (branchNameOrCode || "").trim();
  if (!normalizedBranch) return null;

  const { data: exactData } = await adminClient
    .from("branches")
    .select("id")
    .or(`name.eq.${normalizedBranch},code.eq.${normalizedBranch}`)
    .limit(1)
    .maybeSingle();

  if (exactData?.id) return exactData.id;

  const { data: fuzzyData } = await adminClient
    .from("branches")
    .select("id")
    .or(`name.ilike.%${normalizedBranch}%,code.ilike.%${normalizedBranch}%`)
    .limit(1)
    .maybeSingle();

  return fuzzyData?.id ?? null;
}

async function ensureStaffRecord(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  payload: CreateStaffPayload,
  email: string,
  branchId: string | null,
) {
  const { data: existingStaff } = await adminClient
    .from("staff")
    .select("id, staff_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingStaff?.id) {
    return { staffId: existingStaff.staff_id as string | undefined, error: null as string | null };
  }

  const fullName = (payload.full_name || "").trim();
  const { firstName, lastName } = parseNameParts(fullName);

  const explicitStaffId = (payload.staff_id || "").trim();
  const maxAttempts = explicitStaffId ? 1 : 5;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidateStaffId = explicitStaffId || buildStaffId();

    const { data: insertedStaff, error: staffError } = await adminClient
      .from("staff")
      .insert({
        profile_id: userId,
        staff_id: candidateStaffId,
        first_name: firstName,
        last_name: lastName,
        phone: payload.phone || "",
        email,
        branch_id: branchId,
        job_role: (payload.job_role || "staff_member").trim() || "staff_member",
        employment_type: payload.employment_type || "full_time",
        date_joined: payload.date_joined || new Date().toISOString().split("T")[0],
        employment_status: "active",
      })
      .select("staff_id")
      .single();

    if (!staffError) {
      return { staffId: (insertedStaff?.staff_id as string | undefined) ?? candidateStaffId, error: null as string | null };
    }

    const duplicateStaffId = /staff_id|duplicate key/i.test(staffError.message || "");
    if (duplicateStaffId && !explicitStaffId) continue;

    return { staffId: null, error: staffError.message };
  }

  return { staffId: null, error: "Failed to generate unique staff ID" };
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

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const provisionOne = async (payload: CreateStaffPayload, fallbackRole: string, fallbackCreateStaffRecord: boolean): Promise<ProvisionResult> => {
    const email = (payload.email || "").trim().toLowerCase();
    const password = payload.password || "";
    const fullName = (payload.full_name || "").trim();
    const finalRole = normalizeRole(payload.role, fallbackRole);
    const shouldCreateStaff = payload.create_staff_record ?? fallbackCreateStaffRecord;

    if (!email || !password || !fullName) {
      return {
        ok: false,
        email,
        error: "email, password, and full_name are required",
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        email,
        error: "Password must be at least 6 characters",
      };
    }

    if (finalRole === "super_admin" && callerProfile.role !== "super_admin") {
      return {
        ok: false,
        email,
        error: "Only super admin can create another super admin",
      };
    }

    let userId: string | null = null;

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: payload.phone || "",
      },
    });

    if (createError || !created.user) {
      const duplicateEmail = /already been registered|already exists|duplicate/i.test(createError?.message || "");
      if (!duplicateEmail) {
        return {
          ok: false,
          email,
          error: createError?.message || "Failed to create auth user",
        };
      }

      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (!existingProfile?.id) {
        return {
          ok: false,
          email,
          error: "Email already exists but matching profile record was not found",
        };
      }

      userId = existingProfile.id;
    } else {
      userId = created.user.id;
    }

    if (!userId) {
      return {
        ok: false,
        email,
        error: "Unable to resolve user ID for provisioning",
      };
    }

    const branch = (payload.branch || "").trim();
    const branchId = await resolveBranchId(adminClient, payload.branch_id, branch);

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email,
      phone: payload.phone || "",
      role: finalRole,
      branch: branchId || branch,
      avatar_initials: getInitials(fullName),
    });

    if (profileError) {
      return { ok: false, email, error: profileError.message };
    }

    let createdStaffId: string | undefined;
    if (shouldCreateStaff) {
      const staffResult = await ensureStaffRecord(adminClient, userId, payload, email, branchId);
      if (staffResult.error) {
        return { ok: false, email, user_id: userId, role: finalRole, error: staffResult.error };
      }
      createdStaffId = staffResult.staffId || undefined;
    }

    return {
      ok: true,
      email,
      user_id: userId,
      role: finalRole,
      staff_id: createdStaffId,
    };
  };

  const rawBody = (await req.json()) as CreateStaffPayload | BulkCreatePayload;
  const maybeBulk = rawBody as BulkCreatePayload;

  if (Array.isArray(maybeBulk.users)) {
    const fallbackRole = normalizeRole(maybeBulk.role, "staff_member");
    const fallbackCreateStaffRecord = maybeBulk.create_staff_record ?? true;
    const continueOnError = maybeBulk.continue_on_error ?? true;

    const results: ProvisionResult[] = [];

    for (const userPayload of maybeBulk.users) {
      const result = await provisionOne(userPayload, fallbackRole, fallbackCreateStaffRecord);
      results.push(result);
      if (!result.ok && !continueOnError) break;
    }

    const successCount = results.filter((item) => item.ok).length;
    const failedCount = results.length - successCount;

    return jsonResponse(200, {
      total: results.length,
      created: successCount,
      failed: failedCount,
      results,
    });
  }

  const singleResult = await provisionOne(rawBody as CreateStaffPayload, "staff_member", false);
  if (!singleResult.ok) {
    return jsonResponse(400, { error: singleResult.error || "Failed to create auth user" });
  }

  return jsonResponse(200, {
    user_id: singleResult.user_id,
    email: singleResult.email,
    role: singleResult.role,
    staff_id: singleResult.staff_id,
  });
});
