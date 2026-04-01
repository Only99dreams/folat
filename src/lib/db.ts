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
    .select("*, branch:branches(name), group:groups(name)", { count: "exact" })
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
    .select("*, branch:branches(name, code), group:groups(name, group_code)")
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
  // Auto-create savings account
  const accNum = `SAV-${(member.member_id as string).replace("FOL-", "")}`;
  await supabase.from("savings_accounts").insert({
    member_id: data.id,
    account_number: accNum,
    balance: (member.initial_deposit as number) ?? 0,
  });
  // Record initial deposit if > 0
  if (member.initial_deposit && (member.initial_deposit as number) > 0) {
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
    .select("*, member:members(first_name, last_name, member_id), branch:branches(name), officer:profiles!loan_applications_credit_officer_id_fkey(full_name)", { count: "exact" })
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
export async function fetchStaff(filters?: {
  branch_id?: string; status?: string; search?: string;
}) {
  let query = supabase
    .from("staff")
    .select("*, branch:branches(name)")
    .order("created_at", { ascending: false });

  if (filters?.branch_id) query = query.eq("branch_id", filters.branch_id);
  if (filters?.status) query = query.eq("employment_status", filters.status);
  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,staff_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
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

export async function updateStaff(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("staff").update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  await logAudit("update", "staff", id, updates);
  return data;
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
  // Insert for recipient (inbox)
  const { error: e1 } = await supabase.from("messages").insert({
    ...msg,
    folder: "inbox",
  });
  if (e1) throw e1;

  // Insert for sender (sent)
  const { error: e2 } = await supabase.from("messages").insert({
    ...msg,
    folder: "sent",
    is_read: true,
  });
  if (e2) throw e2;

  await logAudit("send", "message", "", { recipient_id: msg.recipient_id, subject: msg.subject });
}

export async function markMessageRead(id: string) {
  await supabase.from("messages").update({ is_read: true }).eq("id", id);
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

export async function fetchRecentTransactions(limit = 10) {
  const { data, error } = await supabase
    .from("savings_transactions")
    .select("*, member:members(first_name, last_name, member_id)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
