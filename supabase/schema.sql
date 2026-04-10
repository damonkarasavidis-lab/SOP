-- ClaimTrack — Supabase Schema
-- Run this in the Supabase SQL editor to initialise the database.

-- ============================================================
-- TABLES
-- ============================================================

-- Organisations (one per subcontracting business)
create table organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abn text,
  state text not null check (state in ('NSW','VIC','QLD','SA','WA','TAS','NT','ACT')),
  created_at timestamptz default now()
);

-- Organisation members
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organisations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Projects (construction jobs)
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organisations(id) on delete cascade,
  name text not null,
  head_contractor text not null,
  contract_value numeric(12,2) not null,
  retention_percentage numeric(5,2) not null default 5.00,
  state text not null check (state in ('NSW','VIC','QLD','SA','WA','TAS','NT','ACT')),
  contract_start_date date not null,
  practical_completion_date date,
  defects_liability_period_days integer not null default 365,
  status text not null default 'active' check (status in ('active','completed','disputed','archived')),
  notes text,
  created_at timestamptz default now()
);

-- Payment claims
create table payment_claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  org_id uuid references organisations(id) on delete cascade,
  claim_number text not null,
  reference_date date not null,           -- date claim was submitted
  amount_claimed numeric(12,2) not null,
  amount_paid numeric(12,2),
  response_due_date date not null,         -- auto-calculated from state rules
  adjudication_window_end date not null,   -- auto-calculated
  status text not null default 'submitted' check (
    status in ('submitted','response_received','paid','disputed','adjudication','overdue')
  ),
  payment_schedule_received boolean default false,
  payment_schedule_date date,
  payment_schedule_amount numeric(12,2),
  notes text,
  document_path text,                      -- Supabase Storage path
  created_at timestamptz default now()
);

-- Retentions
create table retentions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  org_id uuid references organisations(id) on delete cascade,
  total_retention_held numeric(12,2) not null,
  pc_release_date date,                    -- practical completion release (usually 50%)
  pc_release_amount numeric(12,2),
  pc_release_status text default 'pending' check (pc_release_status in ('pending','released','overdue')),
  dlp_release_date date,                   -- defects liability period end release
  dlp_release_amount numeric(12,2),
  dlp_release_status text default 'pending' check (dlp_release_status in ('pending','released','overdue')),
  notes text,
  created_at timestamptz default now()
);

-- Notification log (prevent duplicate reminder emails)
create table notification_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organisations(id) on delete cascade,
  entity_type text not null check (entity_type in ('payment_claim','retention')),
  entity_id uuid not null,
  notification_type text not null,         -- e.g. 'response_due_5_days', 'retention_release_30_days'
  sent_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table organisations enable row level security;
alter table org_members enable row level security;
alter table projects enable row level security;
alter table payment_claims enable row level security;
alter table retentions enable row level security;
alter table notification_log enable row level security;

-- Organisations: any authenticated user can create a new org (they become owner immediately after)
create policy "organisations_insert" on organisations
  for insert with check (auth.uid() is not null);

-- Organisations: members can read/update/delete their own org
create policy "organisations_select" on organisations
  for select using (
    id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "organisations_update" on organisations
  for update using (
    id in (select org_id from org_members where user_id = auth.uid())
  );

create policy "organisations_delete" on organisations
  for delete using (
    id in (select org_id from org_members where user_id = auth.uid())
  );

-- Org members: users can only see/manage their own membership rows
create policy "org_members_own_org" on org_members
  for all using (user_id = auth.uid());

-- Allow insert so a new user can be added as owner of their new org
create policy "org_members_insert" on org_members
  for insert with check (auth.uid() is not null);

-- Projects: visible to org members
create policy "projects_own_org" on projects
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

-- Payment claims: visible to org members
create policy "claims_own_org" on payment_claims
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

-- Retentions: visible to org members
create policy "retentions_own_org" on retentions
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

-- Notification log: visible to org members
create policy "notification_log_own_org" on notification_log
  for all using (
    org_id in (select org_id from org_members where user_id = auth.uid())
  );

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_org_members_user_id on org_members(user_id);
create index idx_org_members_org_id on org_members(org_id);
create index idx_projects_org_id on projects(org_id);
create index idx_payment_claims_org_id on payment_claims(org_id);
create index idx_payment_claims_project_id on payment_claims(project_id);
create index idx_payment_claims_status on payment_claims(status);
create index idx_payment_claims_response_due_date on payment_claims(response_due_date);
create index idx_retentions_org_id on retentions(org_id);
create index idx_retentions_project_id on retentions(project_id);
create index idx_notification_log_entity on notification_log(entity_type, entity_id);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Private bucket for claim documents.
-- File path convention: {org_id}/{claim_id}/{filename}
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'claim-documents',
  'claim-documents',
  false,
  10485760,  -- 10 MB per file
  array['application/pdf','image/jpeg','image/png','image/webp']
);

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Members can upload documents for claims belonging to their org.
-- Path must start with their org_id.
create policy "claim_docs_insert_own_org" on storage.objects
  for insert with check (
    bucket_id = 'claim-documents'
    and (storage.foldername(name))[1] in (
      select org_id::text from org_members where user_id = auth.uid()
    )
  );

-- Members can read documents for claims belonging to their org.
create policy "claim_docs_select_own_org" on storage.objects
  for select using (
    bucket_id = 'claim-documents'
    and (storage.foldername(name))[1] in (
      select org_id::text from org_members where user_id = auth.uid()
    )
  );

-- Members can delete their org's documents.
create policy "claim_docs_delete_own_org" on storage.objects
  for delete using (
    bucket_id = 'claim-documents'
    and (storage.foldername(name))[1] in (
      select org_id::text from org_members where user_id = auth.uid()
    )
  );
