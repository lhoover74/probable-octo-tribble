export type UserRole = "Admin" | "Manager" | "Officer/Staff" | "Viewer";

export type TowStatus =
  | "Observed"
  | "Warning Placed"
  | "Marked for Tow"
  | "Tow Requested"
  | "Awaiting Tow Truck"
  | "Towed"
  | "Released"
  | "Cancelled"
  | "Cleared/Resolved";

export interface ActivityEntry {
  id: string;
  type: string;
  by: string;
  timestamp: string;
  detail: string;
}

export interface PhotoEntry {
  id: string;
  label: string;
  user: string;
  timestamp: string;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  plateState: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  color: string;
  bodyStyle: string;
  propertyName: string;
  zone: string;
  exactLocation: string;
  unitAssociation: string;
  towReason: string;
  notes: string;
  currentStatus: TowStatus;
  dateTimeFirstObserved: string;
  dateTimeWarningPlaced?: string;
  dateTimeMarkedForTow?: string;
  dateTimeTowRequested?: string;
  dateTimeTowCompleted?: string;
  towingCompany: string;
  towReferenceNumber?: string;
  createdBy: string;
  lastUpdatedBy: string;
  watchlist: boolean;
  repeatOffender: boolean;
  priorHistory: number;
  photos: PhotoEntry[];
  activity: ActivityEntry[];
}

export interface PropertyRecord {
  id: string;
  name: string;
  code: string;
  address: string;
  zones: string[];
  towingRules: string;
  defaultTowCompany: string;
  notes: string;
}

export interface TowingCompany {
  id: string;
  companyName: string;
  phone: string;
  email: string;
  dispatchContact: string;
  notes: string;
  active: boolean;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  property: string;
  status: string;
}
