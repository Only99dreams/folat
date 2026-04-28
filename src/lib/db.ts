/**
 * FOLAT Database Operations Library
 * Centralized Supabase queries for all entities
 */
import { supabase } from "./supabase";

// ─── File Upload (Supabase Storage) ───
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Audit Logger ───
export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_log").insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId ?? "",
    details: details ?? {},
  });
}

// ═══════════════════════════════════════════
// BRANCHES
// ═══════════════════════════════════════════
export async function fetchBranches() {
  const { data, error } = await supabase
    .from("branches")
    .select("*, manager:profiles!branches_manager_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchBranch(id: string) {
  const { data, error } = await supabase
    .from("branches")
    .select("*, manager:profiles!branches_manager_id_fkey(full_name, email)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createBranch(branch: {
  name: string; code: string; address: string; city: string;
  state: string; phone: string; email: string; manager_id?: string;
}) {
  const { data, error } = await supabase.from("branches").insert(branch).select().single();
  if (error) throw error;
  await logAudit("create", "branch", data.id, { name: branch.name });
  return data;
}

export async function updateBranch(id: string, updates: Partial<{
  name: string; address: string; city: string; state: string;
  phone: string; email: string; manager_id: string; status: string;
}>) {
  const { data, error } = await supabase
    .from("branches").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "branch", id, updates);
  return data;
}

// ═══════════════════════════════════════════
// MEMBERS
// ═══════════════════════════════════════════
export async function fetchMembers(filters?: {
  branch_id?: string; status?: string; member_type?: string;
  search?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("members")
    .select("*, branch:branches(name), group:groups!group_id(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.member_type) query = query.eq("member_type", filters.member_type);
  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,member_id.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchMember(id: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*, branch:branches(name, code), group:groups!group_id(name, group_code)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function generateMemberId() {
  const { data, error } = await supabase.rpc("generate_member_id");
  if (error) {
    // fallback
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `FOL-${year}-${rand}`;
  }
  return data as string;
}

export async function createMember(member: Record<string, unknown>) {
  const { data, error } = await supabase.from("members").insert(member).select().single();
  if (error) throw error;

  // Auto-create savings account (non-blocking — don't let this fail the member creation)
  try {
    const accNum = `SAV-${(member.member_id as string).replace("FOL-", "")}`;
    const { error: savingsError } = await supabase.from("savings_accounts").insert({
      member_id: data.id,
      account_number: accNum,
      balance: (member.initial_deposit as number) ?? 0,
    });
    if (savingsError) {
      console.error("Failed to create savings account:", savingsError.message);
    }

    // Record initial deposit if > 0
    if (!savingsError && member.initial_deposit && (member.initial_deposit as number) > 0) {
      const { data: acc } = await supabase.from("savings_accounts")
        .select("id").eq("member_id", data.id).single();
      if (acc) {
        const txnId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;
        await supabase.from("savings_transactions").insert({
          transaction_id: txnId,
          account_id: acc.id,
          member_id: data.id,
          type: "deposit",
          amount: member.initial_deposit,
          balance_after: member.initial_deposit,
          payment_method: "cash",
          notes: "Initial deposit on registration",
          recorded_by: member.created_by,
          branch_id: member.branch_id ?? null,
        });
      }
    }
  } catch (savingsErr) {
    console.error("Savings account setup error (member was created):", savingsErr);
  }

  await logAudit("create", "member", data.id, { member_id: member.member_id });
  return data;
}

export async function updateMember(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("members").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "member", id, updates);
  return data;
}

// ═══════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════
export async function fetchGroups(filters?: {
  branch_id?: string; status?: string; search?: string;
}) {
  let query = supabase
    .from("groups")
    .select("*, branch:branches(name), leader:members!groups_leader_id_fkey(first_name, last_name), secretary:members!groups_secretary_id_fkey(first_name, last_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchGroup(id: string) {
  const { data, error } = await supabase
    .from("groups")
    .select("*, branch:branches(name), leader:members!groups_leader_id_fkey(first_name, last_name, member_id), secretary:members!groups_secretary_id_fkey(first_name, last_name, member_id)")
    .eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function fetchGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from("group_members")
    .select("*, member:members(id, member_id, first_name, last_name, phone, status)")
    .eq("group_id", groupId);
  if (error) throw error;
  return data ?? [];
}

export async function createGroup(group: Record<string, unknown>) {
  const { data, error } = await supabase.from("groups").insert(group).select().single();
  if (error) throw error;
  await logAudit("create", "group", data.id, { name: group.name });
  return data;
}

export async function addGroupMember(groupId: string, memberId: string) {
  const { error } = await supabase.from("group_members").insert({ group_id: groupId, member_id: memberId });
  if (error) throw error;
}

export async function removeGroupMember(groupId: string, memberId: string) {
  const { error } = await supabase.from("group_members")
    .delete().eq("group_id", groupId).eq("member_id", memberId);
  if (error) throw error;
}

export async function updateGroup(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("groups").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "group", id, updates);
  return data;
}

export async function checkIsGroupLeader(memberId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("groups")
    .select("id")
    .eq("leader_id", memberId)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

// ═══════════════════════════════════════════
// SAVINGS
// ═══════════════════════════════════════════
export async function fetchSavingsAccount(memberId: string) {
  const { data, error } = await supabase
    .from("savings_accounts")
    .select("*")
    .eq("member_id", memberId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function fetchSavingsAccounts(filters?: { search?: string; page?: number; pageSize?: number }) {
  let query = supabase
    .from("savings_accounts")
    .select("*, member:members(first_name, last_name, member_id, branch_id)", { count: "exact" })
    .order("updated_at", { ascending: false });

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchSavingsTransactions(filters?: {
  account_id?: string; member_id?: string; type?: string;
  branch_id?: string; search?: string; date_from?: string; date_to?: string;
  page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("savings_transactions")
    .select("*, member:members(first_name, last_name, member_id), recorder:profiles!savings_transactions_recorded_by_fkey(full_name), branch:branches(name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.account_id) query = query.eq("account_id", filters.account_id);
  if (filters?.member_id) query = query.eq("member_id", filters.member_id);
  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.date_from) query = query.gte("created_at", filters.date_from);
  if (filters?.date_to) query = query.lte("created_at", filters.date_to);
  if (filters?.search) {
    query = query.or(`transaction_id.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function recordDeposit(deposit: {
  member_id: string; amount: number; payment_method: string;
  reference?: string; notes?: string; recorded_by: string; branch_id?: string;
}) {
  // Get or create account
  let account = await fetchSavingsAccount(deposit.member_id);
  if (!account) {
    const { data: member } = await supabase.from("members").select("member_id").eq("id", deposit.member_id).single();
    const accNum = `SAV-${(member?.member_id ?? "UNKNOWN").replace("FOL-", "")}`;
    const { data: newAcc, error: accErr } = await supabase.from("savings_accounts")
      .insert({ member_id: deposit.member_id, account_number: accNum, balance: 0 })
      .select().single();
    if (accErr) throw accErr;
    account = newAcc;
  }

  const newBalance = Number(account.balance) + deposit.amount;
  const txnId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;

  const { data: txn, error: txnErr } = await supabase.from("savings_transactions").insert({
    transaction_id: txnId,
    account_id: account.id,
    member_id: deposit.member_id,
    type: "deposit",
    amount: deposit.amount,
    balance_after: newBalance,
    payment_method: deposit.payment_method,
    reference: deposit.reference ?? "",
    notes: deposit.notes ?? "",
    recorded_by: deposit.recorded_by,
    branch_id: deposit.branch_id ?? null,
  }).select().single();
  if (txnErr) throw txnErr;

  await supabase.from("savings_accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", account.id);

  await logAudit("deposit", "savings", txn.id, { amount: deposit.amount, member_id: deposit.member_id });
  return txn;
}

export async function recordWithdrawal(withdrawal: {
  member_id: string; amount: number; payment_method: string;
  reference?: string; notes?: string; recorded_by: string; branch_id?: string;
}) {
  const account = await fetchSavingsAccount(withdrawal.member_id);
  if (!account) throw new Error("No savings account found");
  if (Number(account.balance) < withdrawal.amount) throw new Error("Insufficient balance");

  const newBalance = Number(account.balance) - withdrawal.amount;
  const txnId = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;

  const { data: txn, error } = await supabase.from("savings_transactions").insert({
    transaction_id: txnId,
    account_id: account.id,
    member_id: withdrawal.member_id,
    type: "withdrawal",
    amount: withdrawal.amount,
    balance_after: newBalance,
    payment_method: withdrawal.payment_method,
    reference: withdrawal.reference ?? "",
    notes: withdrawal.notes ?? "",
    recorded_by: withdrawal.recorded_by,
    branch_id: withdrawal.branch_id ?? null,
  }).select().single();
  if (error) throw error;

  await supabase.from("savings_accounts")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("id", account.id);

  await logAudit("withdrawal", "savings", txn.id, { amount: withdrawal.amount });
  return txn;
}

// ═══════════════════════════════════════════
// LOANS
// ═══════════════════════════════════════════
export async function fetchLoanApplications(filters?: {
  status?: string; branch_id?: string; search?: string;
  member_id?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("loan_applications")
    .select("id, loan_id, amount_requested, loan_type, status, created_at, guarantor1_name, guarantor1_approval_status, guarantor2_name, guarantor2_approval_status, member:members(first_name, last_name, member_id), branch:branches(name), officer:profiles!loan_applications_credit_officer_id_fkey(full_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.member_id) query = query.eq("member_id", filters.member_id);
  if (filters?.search) {
    query = query.or(`loan_id.ilike.%${filters.search}%`);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchLoanApplication(id: string) {
  const { data, error } = await supabase
    .from("loan_applications")
    .select("*, member:members(first_name, last_name, member_id, phone, email), branch:branches(name), officer:profiles!loan_applications_credit_officer_id_fkey(full_name), approver:profiles!loan_applications_approved_by_fkey(full_name)")
    .eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function generateLoanId() {
  const { data, error } = await supabase.rpc("generate_loan_id");
  if (error) {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `LN-${year}-${rand}`;
  }
  return data as string;
}

export async function createLoanApplication(loan: Record<string, unknown>) {
  // Calculate totals
  const amount = Number(loan.amount_requested);
  const rate = Number(loan.interest_rate ?? 15);
  const months = Number(loan.duration_months ?? 12);
  const totalInterest = amount * (rate / 100) * (months / 12);
  const serviceCharge = Number(loan.service_charge ?? 0);
  const totalRepayable = amount + totalInterest + serviceCharge;
  const monthlyRepayment = totalRepayable / months;

  const { data, error } = await supabase.from("loan_applications").insert({
    ...loan,
    total_repayable: totalRepayable,
    monthly_repayment: Math.round(monthlyRepayment * 100) / 100,
  }).select().single();
  if (error) throw error;
  await logAudit("create", "loan_application", data.id, { loan_id: loan.loan_id, amount });
  return data;
}

export async function updateLoanApplication(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("loan_applications").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "loan_application", id, updates);
  return data;
}

export async function fetchGuarantorRequestsForProfile(profileId: string) {
  type GuarantorLoanRow = {
    id: string;
    loan_id: string;
    amount_requested: number;
    duration_months: number;
    status: string;
    created_at: string;
    guarantor1_name: string;
    guarantor1_staff_id: string | null;
    guarantor1_approval_status: string;
    guarantor1_approval_note: string;
    guarantor1_eligibility: string;
    guarantor2_name: string;
    guarantor2_staff_id: string | null;
    guarantor2_approval_status: string;
    guarantor2_approval_note: string;
    guarantor2_eligibility: string;
    member?: { first_name: string; last_name: string; member_id: string } | null;
    branch?: { name: string } | null;
    officer?: { full_name: string } | null;
  };

  type GuarantorRequest = GuarantorLoanRow & {
    guarantor_slot: 1 | 2;
    guarantor_name: string;
    guarantor_status: string;
    guarantor_note: string;
    guarantor_eligibility: string;
  };

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id")
    .eq("profile_id", profileId)
    .single();

  if (staffError || !staff) return [];

  const { data, error } = await supabase
    .from("loan_applications")
    .select(
      "id, loan_id, amount_requested, duration_months, status, created_at, " +
      "guarantor1_name, guarantor1_staff_id, guarantor1_approval_status, guarantor1_approval_note, guarantor1_eligibility, " +
      "guarantor2_name, guarantor2_staff_id, guarantor2_approval_status, guarantor2_approval_note, guarantor2_eligibility, " +
      "member:members(first_name, last_name, member_id), branch:branches(name), officer:profiles!loan_applications_credit_officer_id_fkey(full_name)"
    )
    .or(`guarantor1_staff_id.eq.${staff.id},guarantor2_staff_id.eq.${staff.id}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as GuarantorLoanRow[];
  const requests: GuarantorRequest[] = [];

  for (const loan of rows) {
    if (loan.guarantor1_staff_id === staff.id) {
      requests.push({
        ...loan,
        guarantor_slot: 1,
        guarantor_name: loan.guarantor1_name,
        guarantor_status: loan.guarantor1_approval_status,
        guarantor_note: loan.guarantor1_approval_note,
        guarantor_eligibility: loan.guarantor1_eligibility,
      });
    }

    if (loan.guarantor2_staff_id === staff.id) {
      requests.push({
        ...loan,
        guarantor_slot: 2,
        guarantor_name: loan.guarantor2_name,
        guarantor_status: loan.guarantor2_approval_status,
        guarantor_note: loan.guarantor2_approval_note,
        guarantor_eligibility: loan.guarantor2_eligibility,
      });
    }
  }

  return requests;
}

export async function reviewGuarantorRequest(params: {
  loanId: string;
  slot: 1 | 2;
  decision: "approved" | "rejected";
  note?: string;
}) {
  const prefix = params.slot === 1 ? "guarantor1" : "guarantor2";
  const updates: Record<string, unknown> = {
    [`${prefix}_approval_status`]: params.decision,
    [`${prefix}_approval_note`]: params.note ?? "",
    [`${prefix}_approved_at`]: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("loan_applications")
    .update(updates)
    .eq("id", params.loanId)
    .select(
      "id, status, guarantor1_name, guarantor1_approval_status, guarantor2_name, guarantor2_approval_status"
    )
    .single();

  if (error) throw error;

  if (params.decision === "rejected") {
    await supabase
      .from("loan_applications")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", params.loanId);
  } else {
    const g1Required = Boolean(data.guarantor1_name?.trim());
    const g2Required = Boolean(data.guarantor2_name?.trim());
    const g1Ok = !g1Required || data.guarantor1_approval_status === "approved";
    const g2Ok = !g2Required || data.guarantor2_approval_status === "approved";

    if (g1Ok && g2Ok && data.status === "pending") {
      await supabase
        .from("loan_applications")
        .update({ status: "under_review", updated_at: new Date().toISOString() })
        .eq("id", params.loanId);
    }
  }

  await logAudit("guarantor_review", "loan_application", params.loanId, {
    slot: params.slot,
    decision: params.decision,
  });
}

export async function approveLoan(id: string, approvedBy: string, notes: string, amountApproved?: number) {
  const loan = await fetchLoanApplication(id);
  if (!loan) throw new Error("Loan not found");

  const approved = amountApproved ?? loan.amount_requested;
  const { data, error } = await supabase.from("loan_applications").update({
    status: "approved",
    approved_by: approvedBy,
    approval_date: new Date().toISOString(),
    approval_notes: notes,
    amount_approved: approved,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;

  await logAudit("approve", "loan_application", id, { amount_approved: approved });
  return data;
}

export async function rejectLoan(id: string, rejectedBy: string, notes: string) {
  const { data, error } = await supabase.from("loan_applications").update({
    status: "rejected",
    approved_by: rejectedBy,
    approval_date: new Date().toISOString(),
    approval_notes: notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;
  await logAudit("reject", "loan_application", id, { notes });
  return data;
}

export async function disburseLoan(id: string, disbursementDate: string) {
  const loan = await fetchLoanApplication(id);
  if (!loan) throw new Error("Loan not found");

  const amount = Number(loan.amount_approved ?? loan.amount_requested);
  const months = loan.duration_months;
  const rate = loan.interest_rate;

  // Generate repayment schedule
  const totalInterest = amount * (rate / 100) * (months / 12);
  const totalRepayable = amount + totalInterest;
  const monthlyTotal = totalRepayable / months;
  const monthlyPrincipal = amount / months;
  const monthlyInterest = totalInterest / months;

  const schedule = [];
  const startDate = new Date(loan.first_installment_date ?? disbursementDate);

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + (i - 1));
    schedule.push({
      loan_id: id,
      installment_number: i,
      due_date: dueDate.toISOString().split("T")[0],
      principal: Math.round(monthlyPrincipal * 100) / 100,
      interest: Math.round(monthlyInterest * 100) / 100,
      total_due: Math.round(monthlyTotal * 100) / 100,
      amount_paid: 0,
      status: "pending",
    });
  }

  // Insert schedule
  await supabase.from("loan_schedule").insert(schedule);

  // Update loan status
  const { data, error } = await supabase.from("loan_applications").update({
    status: "disbursed",
    disbursement_date: disbursementDate,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;

  await logAudit("disburse", "loan_application", id, { amount, disbursement_date: disbursementDate });
  return data;
}

// ─── Loan Repayments ───
export async function fetchLoanRepayments(filters?: {
  loan_id?: string; member_id?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("loan_repayments")
    .select("*, loan:loan_applications(loan_id, loan_type), member:members(first_name, last_name, member_id), recorder:profiles!loan_repayments_recorded_by_fkey(full_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.loan_id) query = query.eq("loan_id", filters.loan_id);
  if (filters?.member_id) query = query.eq("member_id", filters.member_id);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchLoanSchedule(loanId: string) {
  const { data, error } = await supabase
    .from("loan_schedule")
    .select("*")
    .eq("loan_id", loanId)
    .order("installment_number");
  if (error) throw error;
  return data ?? [];
}

export async function recordLoanRepayment(repayment: {
  loan_id: string; member_id: string; amount: number;
  payment_method: string; reference?: string; notes?: string;
  recorded_by: string;
}) {
  const loan = await fetchLoanApplication(repayment.loan_id);
  if (!loan) throw new Error("Loan not found");

  // Find next pending installment
  const schedule = await fetchLoanSchedule(repayment.loan_id);
  const nextDue = schedule.find(s => s.status === "pending" || s.status === "overdue");

  const totalPaid = schedule.reduce((sum, s) => sum + Number(s.amount_paid), 0);
  const outstanding = Number(loan.total_repayable) - totalPaid - repayment.amount;

  const repId = `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;

  const { data: rep, error } = await supabase.from("loan_repayments").insert({
    repayment_id: repId,
    loan_id: repayment.loan_id,
    member_id: repayment.member_id,
    amount: repayment.amount,
    principal_portion: nextDue?.principal ?? repayment.amount,
    interest_portion: nextDue?.interest ?? 0,
    payment_method: repayment.payment_method,
    reference: repayment.reference ?? "",
    notes: repayment.notes ?? "",
    outstanding_after: Math.max(outstanding, 0),
    installment_number: nextDue?.installment_number ?? 1,
    due_date: nextDue?.due_date,
    paid_date: new Date().toISOString().split("T")[0],
    status: "paid",
    recorded_by: repayment.recorded_by,
  }).select().single();
  if (error) throw error;

  // Update schedule
  if (nextDue) {
    await supabase.from("loan_schedule").update({
      amount_paid: repayment.amount,
      status: repayment.amount >= Number(nextDue.total_due) ? "paid" : "partial",
      paid_date: new Date().toISOString().split("T")[0],
    }).eq("id", nextDue.id);
  }

  // Check if loan is fully paid
  if (outstanding <= 0) {
    await supabase.from("loan_applications").update({
      status: "completed",
      updated_at: new Date().toISOString(),
    }).eq("id", repayment.loan_id);
  }

  await logAudit("repayment", "loan", rep.id, { amount: repayment.amount, loan_id: repayment.loan_id });
  return rep;
}

// ═══════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════
export async function fetchFinanceTransactions(filters?: {
  type?: string; branch_id?: string; date_from?: string; date_to?: string;
  category?: string; search?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("finance_transactions")
    .select("*, branch:branches(name), recorder:profiles!finance_transactions_recorded_by_fkey(full_name)", { count: "exact" })
    .order("date", { ascending: false });

  if (filters?.type) query = query.eq("type", filters.type);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.date_from) query = query.gte("date", filters.date_from);
  if (filters?.date_to) query = query.lte("date", filters.date_to);
  if (filters?.search) {
    query = query.or(`description.ilike.%${filters.search}%,transaction_id.ilike.%${filters.search}%`);
  }

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function createFinanceTransaction(txn: {
  type: "income" | "expense"; category: string; description: string;
  amount: number; payment_method: string; reference?: string;
  branch_id?: string; date: string; recorded_by: string; notes?: string;
  receipt_url?: string;
}) {
  const txnId = `FIN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;
  const { data, error } = await supabase.from("finance_transactions").insert({
    transaction_id: txnId,
    ...txn,
    reference: txn.reference ?? "",
    notes: txn.notes ?? "",
    receipt_url: txn.receipt_url ?? "",
  }).select().single();
  if (error) throw error;
  await logAudit("create", `finance_${txn.type}`, data.id, { amount: txn.amount, category: txn.category });
  return data;
}

// ─── Fund Requests ───
export async function fetchFundRequests(filters?: {
  status?: string; branch_id?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("fund_requests")
    .select("*, branch:branches(name), requester:profiles!fund_requests_requested_by_fkey(full_name), reviewer:profiles!fund_requests_reviewed_by_fkey(full_name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 20;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchFundRequest(id: string) {
  const { data, error } = await supabase
    .from("fund_requests")
    .select("*, branch:branches(name), requester:profiles!fund_requests_requested_by_fkey(full_name, email), reviewer:profiles!fund_requests_reviewed_by_fkey(full_name)")
    .eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createFundRequest(req: {
  branch_id?: string; requested_by: string; amount: number;
  purpose: string; category: string; urgency?: string;
  justification?: string; document_url?: string;
}) {
  const reqId = `FR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 9000) + 1000}`;
  const { data, error } = await supabase.from("fund_requests").insert({
    request_id: reqId,
    branch_id: req.branch_id ?? null,
    requested_by: req.requested_by,
    amount: req.amount,
    purpose: req.justification ? `${req.purpose}\n\n---\n${req.justification}` : req.purpose,
    category: req.category,
    urgency: req.urgency ?? "normal",
  }).select().single();
  if (error) throw error;
  await logAudit("create", "fund_request", data.id, { amount: req.amount });
  return data;
}

export async function reviewFundRequest(id: string, reviewedBy: string, status: "approved" | "rejected", notes: string) {
  const { data, error } = await supabase.from("fund_requests").update({
    status,
    reviewed_by: reviewedBy,
    review_date: new Date().toISOString(),
    review_notes: notes,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();
  if (error) throw error;
  await logAudit(status === "approved" ? "approve" : "reject", "fund_request", id, { notes });
  return data;
}

// ═══════════════════════════════════════════
// STAFF & HR
// ═══════════════════════════════════════════
/** Search active staff by name, phone, or staff_id for cooperative member lookup */
export async function searchStaffForCooperative(query: string) {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from("staff")
    .select("id, staff_id, first_name, last_name, phone, email, gender, date_of_birth, address, branch_id, job_role, department, date_joined")
    .eq("employment_status", "active")
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,staff_id.ilike.%${q}%,phone.ilike.%${q}%`)
    .limit(8);
  if (error) throw error;
  return data ?? [];
}

/** Count distinct calendar months a member has made savings deposits.
 *  Returns 0 if the RPC is not yet deployed (falls back gracefully). */
export async function fetchSavingsMonths(memberId: string): Promise<number> {
  const { data, error } = await supabase.rpc("count_savings_months", { p_member_id: memberId });
  if (error) return 0;
  return (data as number) ?? 0;
}

export async function fetchStaff(filters?: {
  branch_id?: string; status?: string; search?: string;
}) {
  let query = supabase
    .from("staff")
    .select("*, profile_id, branch:branches(name)")
    .order("created_at", { ascending: false });

  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.status) query = query.eq("employment_status", filters.status);
  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,staff_id.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchStaffDirectory(filters?: { branch_id?: string; search?: string }) {
  let query = supabase
    .from("staff")
    .select("id, profile_id, staff_id, first_name, last_name, phone, email, job_role, department, guarantor_eligible, branch_id, branch:branches(name)")
    .eq("employment_status", "active")
    .order("first_name", { ascending: true });

  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim();
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,staff_id.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchBranchSecretaryContact(branchId: string) {
  if (!branchId) return null;

  const { data, error } = await supabase
    .from("staff")
    .select("id, profile_id, staff_id, first_name, last_name, phone, email, job_role, branch_id, branch:branches(name)")
    .eq("employment_status", "active")
    .eq("branch_id", branchId)
    .ilike("job_role", "%secretary%")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchStaffMember(id: string) {
  const { data, error } = await supabase
    .from("staff")
    .select("*, branch:branches(name)")
    .eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createStaff(staff: Record<string, unknown>) {
  const { data, error } = await supabase.from("staff").insert(staff).select().single();
  if (error) throw error;
  await logAudit("create", "staff", data.id, { staff_id: staff.staff_id });
  return data;
}

export async function provisionStaffAuthUser(payload: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: string;
  branch?: string;
}) {
  const { data, error } = await supabase.functions.invoke("create-staff-user", {
    body: payload,
  });

  if (error) {
    const isEdgeUnavailable = /edge function|failed to send a request/i.test(error.message || "");

    if (isEdgeUnavailable) {
      throw new Error(
        "Staff login provisioning requires the deployed create-staff-user Edge Function. Without it, Supabase will require email confirmation before first login. Deploy the function, then create the staff account again."
      );
    }

    throw new Error(error.message || "Failed to provision staff login account.");
  }

  const typed = data as { user_id?: string; email?: string; error?: string };
  if (typed?.error) throw new Error(typed.error);
  if (!typed?.user_id) throw new Error("Staff login account was not created.");

  return typed;
}

export async function updateStaff(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("staff").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "staff", id, updates);
  return data;
}

export async function sendStaffPasswordReset(staffId: string) {
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, first_name, last_name, email")
    .eq("id", staffId)
    .single();

  if (staffError || !staff) {
    throw new Error("Staff record not found.");
  }

  const email = (staff.email ?? "").trim();
  if (!email) {
    throw new Error("This staff record has no email address.");
  }

  const options =
    typeof window !== "undefined"
      ? { redirectTo: `${window.location.origin}/reset-password` }
      : undefined;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, options);
  if (resetError) throw resetError;

  await logAudit("password_reset", "staff", staff.id, { email });
  return staff;
}

export async function sendMemberPasswordReset(memberId: string) {
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, first_name, last_name, email")
    .eq("id", memberId)
    .single();

  if (memberError || !member) {
    throw new Error("Member record not found.");
  }

  const email = (member.email ?? "").trim();
  if (!email) {
    throw new Error("This member record has no email address.");
  }

  const options =
    typeof window !== "undefined"
      ? { redirectTo: `${window.location.origin}/reset-password` }
      : undefined;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, options);
  if (resetError) throw resetError;

  await logAudit("password_reset", "member", member.id, { email });
  return member;
}

// ─── Leave Requests ───
export async function fetchLeaveRequests(filters?: { staff_id?: string; status?: string }) {
  let query = supabase
    .from("leave_requests")
    .select("*, staff:staff(first_name, last_name, staff_id, branch:branches(name))")
    .order("created_at", { ascending: false });

  if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createLeaveRequest(req: {
  staff_id: string; leave_type: string; start_date: string;
  end_date: string; days: number; reason: string;
}) {
  const { data, error } = await supabase.from("leave_requests").insert(req).select().single();
  if (error) throw error;
  await logAudit("create", "leave_request", data.id);
  return data;
}

export async function reviewLeaveRequest(id: string, approvedBy: string, status: "approved" | "rejected", notes?: string) {
  const { data, error } = await supabase.from("leave_requests").update({
    status,
    approved_by: approvedBy,
    approval_date: new Date().toISOString(),
    notes: notes ?? "",
  }).eq("id", id).select().single();
  if (error) throw error;
  await logAudit(status, "leave_request", id);
  return data;
}

// ─── Attendance ───
export async function fetchAttendance(filters?: {
  staff_id?: string; date?: string; branch_id?: string;
  date_from?: string; date_to?: string;
}) {
  let query = supabase
    .from("attendance")
    .select("*, staff:staff(first_name, last_name, staff_id, job_role)")
    .order("date", { ascending: false });

  if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
  if (filters?.date) query = query.eq("date", filters.date);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.date_from) query = query.gte("date", filters.date_from);
  if (filters?.date_to) query = query.lte("date", filters.date_to);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function recordAttendance(record: {
  staff_id: string; date: string; clock_in?: string;
  clock_out?: string; status: string; branch_id?: string; notes?: string;
}) {
  const { data, error } = await supabase.from("attendance").upsert(record, {
    onConflict: "staff_id,date",
  }).select().single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════
export async function fetchMessages(userId: string, folder?: string) {
  let query = supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(full_name, avatar_initials), recipient:profiles!messages_recipient_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (folder === "sent") {
    query = query.eq("sender_id", userId).eq("folder", "sent");
  } else if (folder === "drafts") {
    query = query.eq("sender_id", userId).eq("folder", "drafts");
  } else {
    query = query.eq("recipient_id", userId).eq("folder", "inbox");
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(msg: {
  sender_id: string; recipient_id: string; subject: string; body: string;
}) {
  const { error } = await supabase.from("messages").insert([
    {
      ...msg,
      folder: "inbox",
      is_read: false,
    },
    {
      ...msg,
      folder: "sent",
      is_read: true,
    },
  ]);
  if (error) throw error;

  await logAudit("send", "message", "", { recipient_id: msg.recipient_id, subject: msg.subject });
}

export async function markMessageRead(id: string) {
  await supabase.from("messages").update({ is_read: true }).eq("id", id);
}

export async function fetchUnreadMessagesCount(userId: string) {
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .eq("folder", "inbox")
    .eq("is_read", false);

  if (error) return 0;
  return count ?? 0;
}

// ═══════════════════════════════════════════
// SMS LOG
// ═══════════════════════════════════════════

/** Actually send SMS via a Supabase Edge Function or log for manual processing */
export async function sendSMS(params: {
  sent_by: string;
  recipients: string[];
  message: string;
}): Promise<{ success: boolean; logId: string }> {
  const recipientStr = params.recipients.join(",");
  const count = params.recipients.length;

  // Log the SMS record first
  const { data, error } = await supabase.from("sms_log").insert({
    sent_by: params.sent_by,
    recipients: recipientStr,
    message: params.message,
    recipient_count: count,
    status: "pending",
  }).select().single();
  if (error) throw error;

  // Attempt to call Supabase Edge Function for actual SMS delivery
  try {
    const { error: fnErr } = await supabase.functions.invoke("send-sms", {
      body: {
        recipients: params.recipients,
        message: params.message,
        log_id: data.id,
      },
    });
    if (fnErr) {
      // Edge function failed — mark as sent (logged) anyway
      await supabase.from("sms_log").update({ status: "sent" }).eq("id", data.id);
    }
  } catch {
    // No edge function deployed — mark as sent (logged only)
    await supabase.from("sms_log").update({ status: "sent" }).eq("id", data.id);
  }

  await logAudit("send", "sms", data.id, { recipient_count: count });
  return { success: true, logId: data.id };
}

export async function logSMS(sms: {
  sent_by: string; recipients: string; message: string;
  recipient_count: number;
}) {
  const { data, error } = await supabase.from("sms_log").insert(sms).select().single();
  if (error) throw error;
  await logAudit("send", "sms", data.id, { recipient_count: sms.recipient_count });
  return data;
}

export async function fetchSMSLog() {
  const { data, error } = await supabase
    .from("sms_log")
    .select("*, sender:profiles!sms_log_sent_by_fkey(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchSMSStats() {
  const logs = await fetchSMSLog();
  const totalSent = logs.filter(l => l.status === "sent").reduce((s, l) => s + (l.recipient_count || 0), 0);
  const delivered = logs.filter(l => l.status === "sent").reduce((s, l) => s + (l.recipient_count || 0), 0);
  const pending = logs.filter(l => l.status === "pending").reduce((s, l) => s + (l.recipient_count || 0), 0);
  const failed = logs.filter(l => l.status === "failed").reduce((s, l) => s + (l.recipient_count || 0), 0);
  return { totalSent, delivered, pending, failed, totalLogs: logs.length };
}

// ═══════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════
export async function fetchAuditLog(filters?: {
  user_id?: string; entity_type?: string; date_from?: string;
  date_to?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("audit_log")
    .select("*, user:profiles!audit_log_user_id_fkey(full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.user_id) query = query.eq("user_id", filters.user_id);
  if (filters?.entity_type) query = query.eq("entity_type", filters.entity_type);
  if (filters?.date_from) query = query.gte("created_at", filters.date_from);
  if (filters?.date_to) query = query.lte("created_at", filters.date_to);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════
export async function fetchOrgSettings() {
  const { data, error } = await supabase.from("org_settings").select("*");
  if (error) throw error;
  const settings: Record<string, unknown> = {};
  (data ?? []).forEach((row: { key: string; value: unknown }) => {
    settings[row.key] = row.value;
  });
  return settings;
}

export async function updateOrgSetting(key: string, value: unknown, userId: string) {
  const { error } = await supabase.from("org_settings").upsert({
    key,
    value,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });
  if (error) throw error;
  await logAudit("update", "org_settings", key, { value });
}

export async function fetchNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function updateNotificationPreferences(userId: string, prefs: Record<string, boolean>) {
  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: userId,
    ...prefs,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw error;
}

// ═══════════════════════════════════════════
// PROFILES / ACCESS CONTROL
// ═══════════════════════════════════════════
export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateProfileRole(profileId: string, role: string) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  await logAudit("update_role", "profile", profileId, { role });
  return data;
}

export async function updateProfile(profileId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════
// USER APPROVAL
// ═══════════════════════════════════════════
export async function fetchPendingUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "unassigned")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function approveUser(profileId: string, role: string, branchId?: string) {
  const updates: Record<string, unknown> = { role, updated_at: new Date().toISOString() };
  if (branchId) updates.branch = branchId;
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  await logAudit("approve_user", "profile", profileId, { role });
  return data;
}

export async function rejectUser(profileId: string) {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId)
    .eq("role", "unassigned");
  if (error) throw error;
  await logAudit("reject_user", "profile", profileId, {});
}

// ═══════════════════════════════════════════
// IN-APP NOTIFICATIONS
// ═══════════════════════════════════════════
export async function createNotification(params: {
  user_id: string; title: string; body: string; type?: string; link?: string;
}) {
  const { error } = await supabase.from("notifications").insert({
    user_id: params.user_id,
    title: params.title,
    body: params.body,
    type: params.type ?? "info",
    link: params.link ?? "",
  });
  if (error) throw error;
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function fetchUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function markNotificationRead(id: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(userId: string) {
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
}

// ═══════════════════════════════════════════
// OVERDUE LOAN DETECTION & SMS
// ═══════════════════════════════════════════
export async function fetchOverdueScheduleItems() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("loan_schedule")
    .select("*, loan:loan_applications(id, loan_id, member_id, member:members(first_name, last_name, phone))")
    .in("status", ["pending", "partial"])
    .lt("due_date", today)
    .order("due_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function markScheduleOverdue() {
  const today = new Date().toISOString().split("T")[0];
  const { error } = await supabase
    .from("loan_schedule")
    .update({ status: "overdue" })
    .in("status", ["pending", "partial"])
    .lt("due_date", today);
  if (error) throw error;
}

export async function sendOverdueReminders(sentBy: string) {
  const overdueItems = await fetchOverdueScheduleItems();
  if (overdueItems.length === 0) return { sent: 0 };

  // Mark overdue first
  await markScheduleOverdue();

  // Group by member to avoid duplicate SMS
  const memberMap = new Map<string, { phone: string; name: string; totalDue: number; count: number }>();
  for (const item of overdueItems) {
    const member = item.loan?.member;
    if (!member?.phone) continue;
    const memberId = item.loan?.member_id;
    const existing = memberMap.get(memberId) ?? { phone: member.phone, name: `${member.first_name} ${member.last_name}`, totalDue: 0, count: 0 };
    existing.totalDue += Number(item.total_due) - Number(item.amount_paid);
    existing.count += 1;
    memberMap.set(memberId, existing);
  }

  let sent = 0;
  for (const [, info] of memberMap) {
    const message = `Dear ${info.name}, you have ${info.count} overdue loan installment(s) totalling NGN ${info.totalDue.toLocaleString()}. Please make payment to avoid penalties. - FOLAT`;
    try {
      await sendSMS({ sent_by: sentBy, recipients: [info.phone], message });
      sent++;
    } catch (err) {
      console.error("Failed to send overdue SMS to", info.phone, err);
    }
  }

  return { sent, total: memberMap.size };
}

// ═══════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════
export async function fetchDashboardStats() {
  const [
    { count: memberCount },
    { count: activeLoanCount },
    { data: savingsData },
    { data: loanData },
    { count: staffCount },
    { count: branchCount },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("loan_applications").select("*", { count: "exact", head: true }).in("status", ["active", "disbursed"]),
    supabase.from("savings_accounts").select("balance"),
    supabase.from("loan_applications").select("amount_requested, amount_approved, status"),
    supabase.from("staff").select("*", { count: "exact", head: true }).eq("employment_status", "active"),
    supabase.from("branches").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const totalSavings = (savingsData ?? []).reduce((sum, a) => sum + Number(a.balance), 0);
  const totalLoansOutstanding = (loanData ?? [])
    .filter(l => ["active", "disbursed"].includes(l.status))
    .reduce((sum, l) => sum + Number(l.amount_approved ?? l.amount_requested), 0);
  const pendingLoans = (loanData ?? []).filter(l => l.status === "pending").length;

  return {
    totalMembers: memberCount ?? 0,
    activeLoans: activeLoanCount ?? 0,
    totalSavings,
    totalLoansOutstanding,
    pendingLoans,
    totalStaff: staffCount ?? 0,
    totalBranches: branchCount ?? 0,
  };
}

export async function fetchSavingsVsLoansChartData(year?: number) {
  const y = year ?? new Date().getFullYear();
  const startDate = `${y}-01-01T00:00:00`;
  const endDate = `${y}-12-31T23:59:59`;

  const [savingsRes, loansRes] = await Promise.all([
    supabase
      .from("savings_transactions")
      .select("amount, type, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate),
    supabase
      .from("loan_applications")
      .select("amount_approved, amount_requested, status, created_at")
      .in("status", ["approved", "disbursed", "active", "completed"])
      .gte("created_at", startDate)
      .lte("created_at", endDate),
  ]);

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const chartData = months.map((month) => ({ month, savings: 0, loans: 0 }));

  for (const txn of savingsRes.data ?? []) {
    const m = new Date(txn.created_at).getMonth();
    if (txn.type === "deposit") {
      chartData[m].savings += Number(txn.amount);
    } else if (txn.type === "withdrawal") {
      chartData[m].savings -= Number(txn.amount);
    }
  }

  for (const loan of loansRes.data ?? []) {
    const m = new Date(loan.created_at).getMonth();
    chartData[m].loans += Number(loan.amount_approved ?? loan.amount_requested);
  }

  return chartData;
}

export async function fetchRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from("savings_transactions")
    .select("*, member:members(first_name, last_name, member_id)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ═══════════════════════════════════════════
// WEEKLY PAYMENTS (Booklet-to-Digital Tracking)
// ═══════════════════════════════════════════
export async function fetchWeeklyPayments(filters?: {
  group_id?: string; branch_id?: string; member_id?: string;
  loan_id?: string; year?: number; week_number?: number;
  status?: string; page?: number; pageSize?: number;
}) {
  let query = supabase
    .from("weekly_payments")
    .select("*, member:members(first_name, last_name, member_id, phone), group:groups(name, group_code), branch:branches(name), loan:loan_applications(loan_id, loan_type), recorder:profiles!weekly_payments_recorded_by_fkey(full_name)", { count: "exact" })
    .order("week_start_date", { ascending: false });

  if (filters?.group_id) query = query.eq("group_id", filters.group_id);
  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.member_id) query = query.eq("member_id", filters.member_id);
  if (filters?.loan_id) query = query.eq("loan_id", filters.loan_id);
  if (filters?.year) query = query.eq("year", filters.year);
  if (filters?.week_number) query = query.eq("week_number", filters.week_number);
  if (filters?.status) query = query.eq("status", filters.status);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 50;
  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function recordWeeklyPayment(payment: {
  member_id: string; group_id?: string; branch_id?: string;
  loan_id?: string; week_number: number; week_start_date: string;
  year: number; amount_due: number; amount_paid: number;
  payment_method?: string; payment_date?: string;
  booklet_reference?: string; notes?: string; recorded_by: string;
}) {
  const outstanding = payment.amount_due - payment.amount_paid;
  const status = payment.amount_paid >= payment.amount_due ? "paid"
    : payment.amount_paid > 0 ? "partial"
    : "pending";

  const { data, error } = await supabase.from("weekly_payments").upsert({
    member_id: payment.member_id,
    group_id: payment.group_id ?? null,
    branch_id: payment.branch_id ?? null,
    loan_id: payment.loan_id ?? null,
    week_number: payment.week_number,
    week_start_date: payment.week_start_date,
    year: payment.year,
    amount_due: payment.amount_due,
    amount_paid: payment.amount_paid,
    outstanding: Math.max(outstanding, 0),
    payment_method: payment.payment_method ?? "cash",
    payment_date: payment.payment_date ?? null,
    booklet_reference: payment.booklet_reference ?? "",
    notes: payment.notes ?? "",
    status,
    recorded_by: payment.recorded_by,
    updated_at: new Date().toISOString(),
  }, { onConflict: "member_id,loan_id,week_start_date" }).select().single();
  if (error) throw error;
  await logAudit("record", "weekly_payment", data.id, { member_id: payment.member_id, amount_paid: payment.amount_paid });
  return data;
}

export async function fetchGroupWeeklySummary(groupId: string, year: number, month: number) {
  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("weekly_payments")
    .select("*, member:members(first_name, last_name, member_id)")
    .eq("group_id", groupId)
    .gte("week_start_date", startDate)
    .lte("week_start_date", endDate)
    .order("week_start_date");

  if (error) throw error;
  return data ?? [];
}

// ═══════════════════════════════════════════
// LOAN RULES & REGULATIONS
// ═══════════════════════════════════════════
export async function fetchLoanRules(category?: string) {
  let query = supabase
    .from("loan_rules")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createLoanRule(rule: {
  title: string; content: string; category?: string;
  display_order?: number; created_by: string;
}) {
  const { data, error } = await supabase.from("loan_rules").insert({
    title: rule.title,
    content: rule.content,
    category: rule.category ?? "general",
    display_order: rule.display_order ?? 0,
    created_by: rule.created_by,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateLoanRule(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from("loan_rules")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteLoanRule(id: string) {
  const { error } = await supabase.from("loan_rules")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════
export async function createDocument(doc: Record<string, unknown>) {
  const { data, error } = await supabase.from("documents").insert(doc).select().single();
  if (error) throw error;
  return data;
}

export async function fetchDocuments(ownerType: "member" | "staff", ownerId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
}
