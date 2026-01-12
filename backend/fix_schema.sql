-- 1. Allow users to insert their own profile (Critical for self-healing)
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. Retroactive Fix: Create profiles for existing users who don't have one
insert into public.profiles (id, full_name)
select id, raw_user_meta_data->>'full_name'
from auth.users
where id not in (select id from public.profiles);
