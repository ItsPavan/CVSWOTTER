-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  subscription_tier text default 'free', -- 'free', 'pro'
  credits_remaining int default 5,
  created_at timestamptz default now()
);

-- 3. RESUMES (Stores raw files)
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  file_name text not null,
  storage_path text not null, -- Supabase Storage path
  parsed_text text, -- Extracted raw text
  created_at timestamptz default now()
);

-- 4. ANALYSES (Stores AI results)
create table public.analyses (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes(id) not null,
  jd_text text not null,
  match_score int,
  swot_data jsonb, -- { strengths: [], weaknesses: [], ... }
  recommendations jsonb, -- [{ original: "...", suggested: "...", accepted: false }]
  created_at timestamptz default now()
);

-- 5. RLS POLICIES (Security)
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.analyses enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Resumes Policies
create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can upload own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

-- Analyses Policies
create policy "Users can view own analyses" on public.analyses for select using (auth.uid() = (select user_id from public.resumes where id = resume_id));
create policy "Users can create analyses" on public.analyses for insert with check (
  auth.uid() = (select user_id from public.resumes where id = resume_id)
);

-- 6. TRIGGER for Profile Creation (Bonus: Auto-create profile on signup)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
