-- Run this SQL in your Supabase SQL Editor to set up the profiles table.

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'front_desk'
    check (role in ('super_admin','branch_manager','finance_officer','loan_officer','front_desk','auditor','hr_manager')),
  branch text not null default '',
  avatar_initials text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. Allow users to read their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 4. Allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. Allow inserts (needed for signup to create the profile row)
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 6. Auto-create a profile when a new user signs up via a database trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, role, avatar_initials)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'front_desk',
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', ''), 1) ||
          left(split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 2), 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
