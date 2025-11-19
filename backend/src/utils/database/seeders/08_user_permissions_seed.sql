-- Example user-level permission overrides (ALLOW/DENY)
-- Deny user:delete for principal user
INSERT INTO user_permissions (user_id, permission_id, grant_type)
SELECT u.id, p.id, 'DENY'
FROM users u
JOIN permissions p ON p.name = 'user:delete'
WHERE u.email = 'principal@school.com'
ON CONFLICT (user_id, permission_id) DO NOTHING;

-- Allow extra permission for teacher: user:read (beyond default own-profile)
INSERT INTO user_permissions (user_id, permission_id, grant_type)
SELECT u.id, p.id, 'ALLOW'
FROM users u
JOIN permissions p ON p.name = 'user:read'
WHERE u.email = 'teacher@school.com'
ON CONFLICT (user_id, permission_id) DO NOTHING;
