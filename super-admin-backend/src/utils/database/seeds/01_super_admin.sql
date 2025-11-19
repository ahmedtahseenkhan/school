INSERT INTO super_admins (email, password_hash, name, role, permissions)
VALUES ('owner@saas.com', '$2a$10$7s7a1s5dE3JcVygB5xS1UuTRfS3k8w9Z1fOedp5RcbE0Ww3wC2.2u', 'Owner', 'super_admin', '["*"]')
ON CONFLICT (email) DO NOTHING;
-- password hash corresponds to: Owner@123 (change in production)
