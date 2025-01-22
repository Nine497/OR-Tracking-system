-- Patient insert
INSERT INTO patients (hn_code, dob, firstname, lastname, gender)
VALUES ('<hn_code>', '<dob>', '<first_name>', '<last_name>', '<gender>')
RETURNING patient_id;


--Doctors insert
INSERT INTO doctor (firstname, lastname, specialization, isactive, prefix)
VALUES ('<firstname>', '<lastname>', '<specialization>', true, '<prefix>')
RETURNING doctor_id;


-- Case insert
INSERT INTO surgery_case (
  doctor_id, 
  surgery_date, 
  estimate_start_time, 
  estimate_duration, 
  surgery_type_id, 
  operating_room_id, 
  status_id, 
  created_by, 
  patient_id, 
  created_at, 
  patient_history
)
VALUES (
  <doctor_id>, 
  '<surgery_date>', 
  '<estimate_start_time>', 
  <estimate_duration>, 
  <surgery_type_id>, 
  <operating_room_id>, 
  <status_id>, 
  <created_by>, 
  <patient_id>, 
  NOW(), 
  '<patient_history>'
)
RETURNING surgery_case_id;

-- Case History insert
INSERT INTO surgery_case_status_history (surgery_case_id, status_id, updated_at, updated_by)
VALUES (<surgery_case_id>, 0, NOW(), <created_by>);

-- Operation insert 
INSERT INTO operation (operation_name, surgery_case_id)
VALUES ('<operation_name>', <surgery_case_id>)
RETURNING operation_id, operation_name, surgery_case_id;
