CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address TEXT NOT NULL,
  zones_json TEXT NOT NULL,
  towing_rules TEXT NOT NULL,
  default_tow_company TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS towing_companies (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  dispatch_contact TEXT NOT NULL,
  notes TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  property TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  plate TEXT NOT NULL,
  plate_state TEXT NOT NULL,
  vin TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year TEXT NOT NULL,
  color TEXT NOT NULL,
  body_style TEXT NOT NULL,
  property_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  exact_location TEXT NOT NULL,
  unit_association TEXT NOT NULL,
  tow_reason TEXT NOT NULL,
  notes TEXT NOT NULL,
  current_status TEXT NOT NULL,
  date_time_first_observed TEXT NOT NULL,
  date_time_warning_placed TEXT,
  date_time_marked_for_tow TEXT,
  date_time_tow_requested TEXT,
  date_time_tow_completed TEXT,
  towing_company TEXT NOT NULL,
  tow_reference_number TEXT,
  created_by TEXT NOT NULL,
  last_updated_by TEXT NOT NULL,
  watchlist INTEGER NOT NULL DEFAULT 0,
  repeat_offender INTEGER NOT NULL DEFAULT 0,
  prior_history INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS vehicle_photos (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  label TEXT NOT NULL,
  user_name TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vehicle_activity (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  type TEXT NOT NULL,
  by_user TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  detail TEXT NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
