-- Map roles to permissions
-- Super Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin' AND p.name IN ('*:manage','system:configure')
ON CONFLICT DO NOTHING;

-- School Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN (
  '*:manage'
)
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Principal
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN (
  'user:create','user:read','user:update','teacher:delete','student:delete','role:read'
)
WHERE r.name = 'principal'
ON CONFLICT DO NOTHING;

-- Teacher
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN (
  'student:read','parent:read','user:read_own_profile','user:update_own_profile'
)
WHERE r.name = 'teacher'
ON CONFLICT DO NOTHING;

-- Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN (
  'user:read_own_profile','user:update_own_profile'
)
WHERE r.name = 'student'
ON CONFLICT DO NOTHING;

-- Parent (also student:read for linked children handled by app logic)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN (
  'user:read_own_profile','user:update_own_profile','student:read'
)
WHERE r.name = 'parent'
ON CONFLICT DO NOTHING;
