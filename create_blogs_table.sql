-- Create blogs table
create table if not exists blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  image_url text,
  author_id uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table blogs enable row level security;

-- Policies
create policy "Blogs are viewable by everyone" 
  on blogs for select 
  using (true);

create policy "Admins can manage blogs" 
  on blogs for all 
  using (
    exists (
      select 1 from users 
      where users.auth_id = auth.uid() 
      and (users.is_admin = true or users.is_super_admin = true)
    )
  )
  with check (
    exists (
      select 1 from users 
      where users.auth_id = auth.uid() 
      and (users.is_admin = true or users.is_super_admin = true)
    )
  );
