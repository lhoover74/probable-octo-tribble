import { PropertyRecord, TowStatus, TowingCompany, UserRecord, VehicleRecord } from "@/lib/types";

export const statuses: TowStatus[] = [
  "Observed",
  "Warning Placed",
  "Marked for Tow",
  "Tow Requested",
  "Awaiting Tow Truck",
  "Towed",
  "Released",
  "Cancelled",
  "Cleared/Resolved"
];

export const towReasons = [
  "No Permit",
  "Expired Registration",
  "Unauthorized Parking",
  "Reserved Space Violation",
  "Blocking Fire Lane",
  "Blocking Driveway",
  "Abandoned Vehicle",
  "No Plates",
  "Disabled Vehicle",
  "Resident Complaint",
  "Management Request",
  "Handicap Violation",
  "Other"
];

export const properties: PropertyRecord[] = [
  {
    id: "prop-1",
    name: "Northgate Apartments",
    code: "NGA",
    address: "1140 West Belmont Ave, Chicago, IL",
    zones: ["Lot A", "Lot B", "Visitor", "Fire Lane"],
    towingRules: "Tag after 15 minutes in fire lane. Overnight visitor parking requires permit.",
    defaultTowCompany: "Rapid Recovery Towing",
    notes: "High repeat-offender volume on visitor row."
  },
  {
    id: "prop-2",
    name: "Lakeview Plaza",
    code: "LVP",
    address: "900 North Clark St, Chicago, IL",
    zones: ["Garage", "North Surface", "South Surface", "Loading"],
    towingRules: "Commercial loading zone enforced 24/7.",
    defaultTowCompany: "CityLine Tow Services",
    notes: "Retail complaints rise on weekends."
  }
];

export const towingCompanies: TowingCompany[] = [
  {
    id: "tow-1",
    companyName: "Rapid Recovery Towing",
    phone: "(312) 555-0198",
    email: "dispatch@rapidrecovery.example",
    dispatchContact: "Dana Ruiz",
    notes: "Average ETA 18 minutes.",
    active: true
  },
  {
    id: "tow-2",
    companyName: "CityLine Tow Services",
    phone: "(773) 555-0110",
    email: "ops@citylinetow.example",
    dispatchContact: "Marcus Hall",
    notes: "Use for Lakeview Plaza by default.",
    active: true
  }
];

export const users: UserRecord[] = [
  {
    id: "user-1",
    name: "Ava Torres",
    email: "admin@towtrack.local",
    role: "Admin",
    property: "All Properties",
    status: "Active"
  },
  {
    id: "user-2",
    name: "Michael Reed",
    email: "manager@towtrack.local",
    role: "Manager",
    property: "Northgate Apartments",
    status: "Active"
  },
  {
    id: "user-3",
    name: "Jesse Cole",
    email: "officer@towtrack.local",
    role: "Officer/Staff",
    property: "Northgate Apartments",
    status: "Active"
  },
  {
    id: "user-4",
    name: "Nina Patel",
    email: "viewer@towtrack.local",
    role: "Viewer",
    property: "Lakeview Plaza",
    status: "Active"
  }
];

export const vehicles: VehicleRecord[] = [
  {
    id: "veh-1001",
    plate: "BXL-2041",
    plateState: "IL",
    vin: "1HGCM82633A004352",
    make: "Honda",
    model: "Accord",
    year: "2016",
    color: "Gray",
    bodyStyle: "Sedan",
    propertyName: "Northgate Apartments",
    zone: "Fire Lane",
    exactLocation: "Building 2 east curb",
    unitAssociation: "Unit 214",
    towReason: "Blocking Fire Lane",
    notes: "Resident advised twice. Front and side photos captured.",
    currentStatus: "Tow Requested",
    dateTimeFirstObserved: "2026-03-29T08:12",
    dateTimeWarningPlaced: "2026-03-29T08:19",
    dateTimeMarkedForTow: "2026-03-29T08:34",
    dateTimeTowRequested: "2026-03-29T08:39",
    towingCompany: "Rapid Recovery Towing",
    towReferenceNumber: "RR-66102",
    createdBy: "Jesse Cole",
    lastUpdatedBy: "Michael Reed",
    watchlist: true,
    repeatOffender: true,
    priorHistory: 4,
    photos: [
      { id: "ph-1", label: "Front Plate", user: "Jesse Cole", timestamp: "2026-03-29 08:13" },
      { id: "ph-2", label: "Parking Position", user: "Jesse Cole", timestamp: "2026-03-29 08:14" }
    ],
    activity: [
      {
        id: "act-1",
        type: "Record Created",
        by: "Jesse Cole",
        timestamp: "2026-03-29 08:12",
        detail: "Vehicle observed in fire lane."
      },
      {
        id: "act-2",
        type: "Status Change",
        by: "Jesse Cole",
        timestamp: "2026-03-29 08:19",
        detail: "Observed → Warning Placed"
      },
      {
        id: "act-3",
        type: "Status Change",
        by: "Jesse Cole",
        timestamp: "2026-03-29 08:34",
        detail: "Warning Placed → Marked for Tow"
      },
      {
        id: "act-4",
        type: "Tow Request",
        by: "Michael Reed",
        timestamp: "2026-03-29 08:39",
        detail: "Tow requested with Rapid Recovery Towing. Ref RR-66102."
      }
    ]
  },
  {
    id: "veh-1002",
    plate: "TQ9-1883",
    plateState: "IN",
    vin: "1FTRX18L1XKB50210",
    make: "Ford",
    model: "F-150",
    year: "2013",
    color: "White",
    bodyStyle: "Truck",
    propertyName: "Lakeview Plaza",
    zone: "Loading",
    exactLocation: "Dock 3 marked yellow curb",
    unitAssociation: "Retail Suite 108",
    towReason: "Unauthorized Parking",
    notes: "Driver returned before tow completed.",
    currentStatus: "Cleared/Resolved",
    dateTimeFirstObserved: "2026-03-29T06:55",
    dateTimeWarningPlaced: "2026-03-29T07:05",
    towingCompany: "CityLine Tow Services",
    createdBy: "Ava Torres",
    lastUpdatedBy: "Ava Torres",
    watchlist: false,
    repeatOffender: false,
    priorHistory: 1,
    photos: [{ id: "ph-3", label: "Violation Evidence", user: "Ava Torres", timestamp: "2026-03-29 06:57" }],
    activity: [
      {
        id: "act-5",
        type: "Record Created",
        by: "Ava Torres",
        timestamp: "2026-03-29 06:55",
        detail: "Vehicle blocking marked loading zone."
      },
      {
        id: "act-6",
        type: "Status Change",
        by: "Ava Torres",
        timestamp: "2026-03-29 07:17",
        detail: "Warning Placed → Cleared/Resolved"
      }
    ]
  },
  {
    id: "veh-1003",
    plate: "PARK-77",
    plateState: "IL",
    vin: "2T1BURHE6JC045612",
    make: "Toyota",
    model: "Corolla",
    year: "2018",
    color: "Blue",
    bodyStyle: "Sedan",
    propertyName: "Northgate Apartments",
    zone: "Visitor",
    exactLocation: "Visitor row space 12",
    unitAssociation: "",
    towReason: "No Permit",
    notes: "Unregistered visitor vehicle after midnight cutoff.",
    currentStatus: "Warning Placed",
    dateTimeFirstObserved: "2026-03-29T01:11",
    dateTimeWarningPlaced: "2026-03-29T01:16",
    towingCompany: "Rapid Recovery Towing",
    createdBy: "Jesse Cole",
    lastUpdatedBy: "Jesse Cole",
    watchlist: false,
    repeatOffender: true,
    priorHistory: 2,
    photos: [{ id: "ph-4", label: "Full Vehicle", user: "Jesse Cole", timestamp: "2026-03-29 01:12" }],
    activity: [
      {
        id: "act-7",
        type: "Record Created",
        by: "Jesse Cole",
        timestamp: "2026-03-29 01:11",
        detail: "Vehicle found without active visitor pass."
      }
    ]
  }
];

export const roleCapabilities = [
  {
    role: "Admin",
    detail: "Full access to records, users, properties, settings, exports, and reports."
  },
  {
    role: "Manager",
    detail: "Review, edit, assign, export, and manage property operations."
  },
  {
    role: "Officer/Staff",
    detail: "Create records, upload evidence, add notes, and update statuses."
  },
  {
    role: "Viewer",
    detail: "Read-only access to records, dashboards, and reports."
  }
];
