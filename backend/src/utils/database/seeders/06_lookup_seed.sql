-- Seed dynamic lookups for HR dropdowns
BEGIN;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'title','mr','Mr.',1),
 (NULL,'title','ms','Ms.',2),
 (NULL,'title','mrs','Mrs.',3),
 (NULL,'title','dr','Dr.',4),
 (NULL,'title','prof','Prof.',5)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'gender','male','Male',1),
 (NULL,'gender','female','Female',2),
 (NULL,'gender','other','Other',3)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'marital_status','single','Single',1),
 (NULL,'marital_status','married','Married',2),
 (NULL,'marital_status','divorced','Divorced',3),
 (NULL,'marital_status','widowed','Widowed',4)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'blood_group','a_pos','A+',1),
 (NULL,'blood_group','a_neg','A-',2),
 (NULL,'blood_group','b_pos','B+',3),
 (NULL,'blood_group','b_neg','B-',4),
 (NULL,'blood_group','ab_pos','AB+',5),
 (NULL,'blood_group','ab_neg','AB-',6),
 (NULL,'blood_group','o_pos','O+',7),
 (NULL,'blood_group','o_neg','O-',8)
ON CONFLICT DO NOTHING;

-- Example nationalities (add more via UI later)
INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'nationality','Pakistan','Pakistan',1),
 (NULL,'nationality','other','Other',999)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'employment_type','full_time','Full-time',1),
 (NULL,'employment_type','part_time','Part-time',2),
 (NULL,'employment_type','contract','Contract',3),
 (NULL,'employment_type','temporary','Temporary',4),
 (NULL,'employment_type','intern','Intern',5)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'employee_category','teaching','Teaching',1),
 (NULL,'employee_category','non_teaching','Non-Teaching',2),
 (NULL,'employee_category','administrative','Administrative',3),
 (NULL,'employee_category','support','Support Staff',4)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'employment_status','active','Active',1),
 (NULL,'employment_status','probation','Probation',2),
 (NULL,'employment_status','inactive','Inactive',3),
 (NULL,'employment_status','suspended','Suspended',4)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'bank_account_type','savings','Savings',1),
 (NULL,'bank_account_type','current','Current',2),
 (NULL,'bank_account_type','salary','Salary',3)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'payment_method','bank_transfer','Bank Transfer',1),
 (NULL,'payment_method','cheque','Cheque',2),
 (NULL,'payment_method','cash','Cash',3)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'payment_frequency','monthly','Monthly',1),
 (NULL,'payment_frequency','bi_weekly','Bi-weekly',2),
 (NULL,'payment_frequency','weekly','Weekly',3)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'relationship','spouse','Spouse',1),
 (NULL,'relationship','parent','Parent',2),
 (NULL,'relationship','sibling','Sibling',3),
 (NULL,'relationship','child','Child',4),
 (NULL,'relationship','friend','Friend',5),
 (NULL,'relationship','other','Other',6)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'qualification_type','high_school','High School',1),
 (NULL,'qualification_type','diploma','Diploma',2),
 (NULL,'qualification_type','bachelor','Bachelor',3),
 (NULL,'qualification_type','master','Master',4),
 (NULL,'qualification_type','phd','PhD',5),
 (NULL,'qualification_type','certificate','Certificate',6),
 (NULL,'qualification_type','other','Other',7)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'skill_proficiency','beginner','Beginner',1),
 (NULL,'skill_proficiency','intermediate','Intermediate',2),
 (NULL,'skill_proficiency','advanced','Advanced',3),
 (NULL,'skill_proficiency','expert','Expert',4)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
 (NULL,'document_type','resume','Resume',1),
 (NULL,'document_type','offer','Offer Letter',2),
 (NULL,'document_type','appointment','Appointment Letter',3),
 (NULL,'document_type','id_proof','ID Proof',4),
 (NULL,'document_type','address_proof','Address Proof',5),
 (NULL,'document_type','education','Educational Certificates',6),
 (NULL,'document_type','experience','Experience Certificates',7),
 (NULL,'document_type','pan','PAN Card',8),
 (NULL,'document_type','aadhaar','Aadhaar Card',9),
 (NULL,'document_type','passport','Passport',10),
 (NULL,'document_type','dl','Driving License',11),
 (NULL,'document_type','bank_proof','Bank Proof',12),
 (NULL,'document_type','medical','Medical Certificate',13),
 (NULL,'document_type','bg_check','Background Check',14),
 (NULL,'document_type','other','Other',99)
ON CONFLICT DO NOTHING;

COMMIT;
