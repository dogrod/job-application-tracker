-- Seed data for job application tracking app

-- Action Types
INSERT INTO action_types (code, label) VALUES
  ('created', 'Application Created'),
  ('applied', 'Applied'),
  ('interview_scheduled', 'Interview Scheduled'),
  ('interview_completed', 'Interview Completed'),
  ('follow_up_sent', 'Follow-up Sent'),
  ('rejected', 'Rejected'),
  ('offer_received', 'Offer Received'),
  ('offer_accepted', 'Offer Accepted'),
  ('offer_declined', 'Offer Declined'),
  ('withdrawn', 'Application Withdrawn'),
  ('onboarding', 'Onboarding');

-- Interview Types
INSERT INTO interview_types (code, label) VALUES
  ('phone', 'Phone Screening'),
  ('hr', 'HR Interview'),
  ('technical', 'Technical Interview'),
  ('coding', 'Coding Assessment'),
  ('system_design', 'System Design'),
  ('behavioral', 'Behavioral Interview'),
  ('culture_fit', 'Culture Fit'),
  ('manager', 'Hiring Manager'),
  ('panel', 'Panel Interview'),
  ('onsite', 'Onsite Interview'),
  ('final', 'Final Interview'); 