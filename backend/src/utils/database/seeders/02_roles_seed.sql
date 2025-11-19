INSERT INTO roles (name, description) VALUES
('super_admin','Full system access'),
('admin','School admin with full school access'),
('principal','Branch principal'),
('teacher','Teacher'),
('student','Student'),
('parent','Parent'),
('accountant','Accounting staff'),
('librarian','Library staff')
ON CONFLICT (name) DO NOTHING;
