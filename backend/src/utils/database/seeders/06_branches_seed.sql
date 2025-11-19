-- Seed sample branches
INSERT INTO branches (school_id, name, code, type, address, phone, email)
SELECT s.id, 'Main Campus', 'MAIN', 'main', '1 Main St', '+1000000000', 'main@myschool.edu'
FROM school s
WHERE s.code = 'SCH001'
ON CONFLICT (code) DO NOTHING;

INSERT INTO branches (school_id, name, code, type, address, phone, email)
SELECT s.id, 'North Branch', 'BR1', 'branch', '100 North Ave', '+1000000001', 'north@myschool.edu'
FROM school s
WHERE s.code = 'SCH001'
ON CONFLICT (code) DO NOTHING;
