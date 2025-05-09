-- Enable uuid generation extension if not already enabled
-- (comment this out if already enabled in Supabase)
-- create extension if not exists "pgcrypto";

-- Seed companies
insert into companies (id, name, website)
values
  (gen_random_uuid(), 'OpenAI', 'https://openai.com'),
  (gen_random_uuid(), 'Google', 'https://careers.google.com'),
  (gen_random_uuid(), 'Amazon', 'https://amazon.jobs');

-- Seed tags
insert into tags (id, name)
values
  (gen_random_uuid(), 'Machine Learning'),
  (gen_random_uuid(), 'Frontend'),
  (gen_random_uuid(), 'Backend'),
  (gen_random_uuid(), 'Remote'),
  (gen_random_uuid(), 'Full-time');

-- Seed interview types
insert into interview_types (code, label)
values
  ('phone', 'Phone Interview'),
  ('coding', 'Coding Interview'),
  ('system_design', 'System Design Interview'),
  ('behavioral', 'Behavioral Interview'),
  ('other', 'Other');

-- Seed action types
insert into action_types (code, label)
values
  ('applied', 'Applied'),
  ('interview_scheduled', 'Interview Scheduled'),
  ('interview_finished', 'Interview Finished'),
  ('follow_up_sent', 'Follow-Up Sent'),
  ('denied', 'Denied'),
  ('offered', 'Offered'),
  ('onboarding', 'Onboarding');

-- Seed job positions (example: link to first company)
insert into job_positions (id, company_id, title, description, location, post_url, posted_at)
select
  gen_random_uuid(),
  id,
  'Machine Learning Engineer',
  'Work on AI systems with large-scale deployment.',
  'San Francisco, CA',
  'https://openai.com/careers/ml-engineer',
  current_date - interval '7 days'
from companies where name = 'OpenAI';

-- Link some tags to the above position
insert into position_tags (position_id, tag_id)
select
  p.id, t.id
from job_positions p
join companies c on p.company_id = c.id
join tags t on t.name in ('Machine Learning', 'Remote', 'Full-time')
where c.name = 'OpenAI';

-- Seed an application for that position
insert into applications (id, position_id, current_status, applied_at)
select
  gen_random_uuid(),
  p.id,
  'applied',
  now() - interval '6 days'
from job_positions p
join companies c on p.company_id = c.id
where c.name = 'OpenAI';

-- Record action history for the application
insert into application_actions (id, application_id, action_code, happened_at, note)
select
  gen_random_uuid(),
  a.id,
  'applied',
  a.applied_at,
  'Resume submitted via online portal'
from applications a;

-- Seed interviewers
insert into interviewers (id, full_name, email)
values
  (gen_random_uuid(), 'Alice Johnson', 'alice@openai.com'),
  (gen_random_uuid(), 'Bob Smith', 'bob@openai.com');

-- Seed interview for the application
insert into interviews (
  id, application_id, interview_type, scheduled_start, scheduled_end, actual_start, actual_end, self_feeling, recall_summary
)
select
  gen_random_uuid(),
  a.id,
  'coding',
  now() + interval '2 days',
  now() + interval '2 days' + interval '1 hour',
  null,
  null,
  null,
  null
from applications a;

-- Link interviewers to the interview
insert into interview_participants (interview_id, interviewer_id, role)
select
  i.id, iv.id, 'Interviewer'
from interviews i
join interviewers iv on iv.full_name = 'Alice Johnson'
limit 1;

-- Add a comment to the application
insert into comments (id, application_id, body_md)
select
  gen_random_uuid(),
  a.id,
  'Looking forward to hearing back from OpenAI.'
from applications a;

-- Add an attachment to the application
insert into attachments (id, application_id, file_path, label)
select
  gen_random_uuid(),
  a.id,
  'applications/openai/resume.pdf',
  'Resume'
from applications a;