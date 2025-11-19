-- Seed lookup values for work_shift and grade_band
BEGIN;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
  (NULL,'work_shift','day','Day Shift',1),
  (NULL,'work_shift','evening','Evening Shift',2),
  (NULL,'work_shift','night','Night Shift',3)
ON CONFLICT DO NOTHING;

INSERT INTO lookup_values(branch_id, category, code, name, sort_order) VALUES
  (NULL,'grade_band','A','Grade A',1),
  (NULL,'grade_band','B','Grade B',2),
  (NULL,'grade_band','C','Grade C',3),
  (NULL,'grade_band','D','Grade D',4)
ON CONFLICT DO NOTHING;

COMMIT;
