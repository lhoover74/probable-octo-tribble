INSERT OR IGNORE INTO properties (id, name, code, address, zones_json, towing_rules, default_tow_company, notes) VALUES
  ('prop-1', 'Northgate Apartments', 'NGA', '1140 West Belmont Ave, Chicago, IL', '["Lot A","Lot B","Visitor","Fire Lane"]', 'Tag after 15 minutes in fire lane. Overnight visitor parking requires permit.', 'Rapid Recovery Towing', 'High repeat-offender volume on visitor row.'),
  ('prop-2', 'Lakeview Plaza', 'LVP', '900 North Clark St, Chicago, IL', '["Garage","North Surface","South Surface","Loading"]', 'Commercial loading zone enforced 24/7.', 'CityLine Tow Services', 'Retail complaints rise on weekends.');

INSERT OR IGNORE INTO towing_companies (id, company_name, phone, email, dispatch_contact, notes, active) VALUES
  ('tow-1', 'Rapid Recovery Towing', '(312) 555-0198', 'dispatch@rapidrecovery.example', 'Dana Ruiz', 'Average ETA 18 minutes.', 1),
  ('tow-2', 'CityLine Tow Services', '(773) 555-0110', 'ops@citylinetow.example', 'Marcus Hall', 'Use for Lakeview Plaza by default.', 1);

INSERT OR IGNORE INTO users (id, name, email, role, property, status) VALUES
  ('user-1', 'Ava Torres', 'admin@towtrack.local', 'Admin', 'All Properties', 'Active'),
  ('user-2', 'Michael Reed', 'manager@towtrack.local', 'Manager', 'Northgate Apartments', 'Active'),
  ('user-3', 'Jesse Cole', 'officer@towtrack.local', 'Officer/Staff', 'Northgate Apartments', 'Active'),
  ('user-4', 'Nina Patel', 'viewer@towtrack.local', 'Viewer', 'Lakeview Plaza', 'Active');

INSERT OR IGNORE INTO vehicles (
  id, plate, plate_state, vin, make, model, year, color, body_style, property_name, zone, exact_location,
  unit_association, tow_reason, notes, current_status, date_time_first_observed, date_time_warning_placed,
  date_time_marked_for_tow, date_time_tow_requested, date_time_tow_completed, towing_company, tow_reference_number,
  created_by, last_updated_by, watchlist, repeat_offender, prior_history
) VALUES
  (
    'veh-1001', 'BXL-2041', 'IL', '1HGCM82633A004352', 'Honda', 'Accord', '2016', 'Gray', 'Sedan',
    'Northgate Apartments', 'Fire Lane', 'Building 2 east curb', 'Unit 214', 'Blocking Fire Lane',
    'Resident advised twice. Front and side photos captured.', 'Tow Requested', '2026-03-29T08:12', '2026-03-29T08:19',
    '2026-03-29T08:34', '2026-03-29T08:39', NULL, 'Rapid Recovery Towing', 'RR-66102',
    'Jesse Cole', 'Michael Reed', 1, 1, 4
  ),
  (
    'veh-1002', 'TQ9-1883', 'IN', '1FTRX18L1XKB50210', 'Ford', 'F-150', '2013', 'White', 'Truck',
    'Lakeview Plaza', 'Loading', 'Dock 3 marked yellow curb', 'Retail Suite 108', 'Unauthorized Parking',
    'Driver returned before tow completed.', 'Cleared/Resolved', '2026-03-29T06:55', '2026-03-29T07:05',
    NULL, NULL, NULL, 'CityLine Tow Services', NULL,
    'Ava Torres', 'Ava Torres', 0, 0, 1
  ),
  (
    'veh-1003', 'PARK-77', 'IL', '2T1BURHE6JC045612', 'Toyota', 'Corolla', '2018', 'Blue', 'Sedan',
    'Northgate Apartments', 'Visitor', 'Visitor row space 12', '', 'No Permit',
    'Unregistered visitor vehicle after midnight cutoff.', 'Warning Placed', '2026-03-29T01:11', '2026-03-29T01:16',
    NULL, NULL, NULL, 'Rapid Recovery Towing', NULL,
    'Jesse Cole', 'Jesse Cole', 0, 1, 2
  );

INSERT OR IGNORE INTO vehicle_photos (id, vehicle_id, label, user_name, timestamp) VALUES
  ('ph-1', 'veh-1001', 'Front Plate', 'Jesse Cole', '2026-03-29 08:13'),
  ('ph-2', 'veh-1001', 'Parking Position', 'Jesse Cole', '2026-03-29 08:14'),
  ('ph-3', 'veh-1002', 'Violation Evidence', 'Ava Torres', '2026-03-29 06:57'),
  ('ph-4', 'veh-1003', 'Full Vehicle', 'Jesse Cole', '2026-03-29 01:12');

INSERT OR IGNORE INTO vehicle_activity (id, vehicle_id, type, by_user, timestamp, detail) VALUES
  ('act-1', 'veh-1001', 'Record Created', 'Jesse Cole', '2026-03-29 08:12', 'Vehicle observed in fire lane.'),
  ('act-2', 'veh-1001', 'Status Change', 'Jesse Cole', '2026-03-29 08:19', 'Observed → Warning Placed'),
  ('act-3', 'veh-1001', 'Status Change', 'Jesse Cole', '2026-03-29 08:34', 'Warning Placed → Marked for Tow'),
  ('act-4', 'veh-1001', 'Tow Request', 'Michael Reed', '2026-03-29 08:39', 'Tow requested with Rapid Recovery Towing. Ref RR-66102.'),
  ('act-5', 'veh-1002', 'Record Created', 'Ava Torres', '2026-03-29 06:55', 'Vehicle blocking marked loading zone.'),
  ('act-6', 'veh-1002', 'Status Change', 'Ava Torres', '2026-03-29 07:17', 'Warning Placed → Cleared/Resolved'),
  ('act-7', 'veh-1003', 'Record Created', 'Jesse Cole', '2026-03-29 01:11', 'Vehicle found without active visitor pass.');
