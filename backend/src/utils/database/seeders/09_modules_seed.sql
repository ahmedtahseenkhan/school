INSERT INTO modules (slug, name, description, is_enabled) VALUES
 ('users','User Management','Manage users, roles, profiles', TRUE),
 ('branches','Branch Management','Manage school branches', TRUE),
 ('announcements','Announcements','News and announcements', TRUE),
 ('academics','Academic Management','Classes, subjects, exams', TRUE),
 ('attendance','Attendance','Attendance tracking', TRUE),
 ('fees','Fee Management','Invoices and payments', TRUE),
 ('website','Website Management','CMS pages and content', TRUE),
 ('hr','Human Resources','Employee and HR operations', TRUE)
ON CONFLICT (slug) DO NOTHING;
