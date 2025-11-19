INSERT INTO school (name, code, motto, established_year, contact_email, phone, address, website)
VALUES ('My School', 'SCH001', 'Knowledge is Power', 2001, 'info@myschool.edu', '+0000000000', '123 Main St', 'https://myschool.edu')
ON CONFLICT (code) DO NOTHING;
