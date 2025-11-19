-- Permissions to gate module access
INSERT INTO permissions (name, description, module) VALUES
  ('module:users:access','Access User Management module','modules'),
  ('module:branches:access','Access Branch Management module','modules'),
  ('module:announcements:access','Access Announcements module','modules'),
  ('module:academics:access','Access Academic Management module','modules'),
  ('module:attendance:access','Access Attendance module','modules'),
  ('module:fees:access','Access Fee Management module','modules'),
  ('module:website:access','Access Website Management module','modules'),
  ('module:hr:access','Access HR module','modules')
ON CONFLICT (name) DO NOTHING;
