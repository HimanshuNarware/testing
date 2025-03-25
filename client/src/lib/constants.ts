// Application constants

// Specialties
export const SPECIALTIES = [
  { value: "Cardiology", label: "Cardiology" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Neurology", label: "Neurology" },
  { value: "Oncology", label: "Oncology" },
  { value: "Psychiatry", label: "Psychiatry" },
  { value: "Urology", label: "Urology" },
  { value: "Gynecology", label: "Gynecology" },
  { value: "Ophthalmology", label: "Ophthalmology" },
];

// Availability options
export const AVAILABILITY_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This Week" },
  { value: "next_week", label: "Next Week" },
  { value: "this_month", label: "This Month" },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "any", label: "Any" },
];

// Insurance options
export const INSURANCE_OPTIONS = [
  { value: "Medicare", label: "Medicare" },
  { value: "Blue Cross", label: "Blue Cross" },
  { value: "Cigna", label: "Cigna" },
  { value: "Aetna", label: "Aetna" },
  { value: "UnitedHealthcare", label: "UnitedHealthcare" },
  { value: "Humana", label: "Humana" },
];

// Sorting options
export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Rating" },
  { value: "availability", label: "Availability" },
  { value: "distance", label: "Distance" },
];

// Appointment types
export const APPOINTMENT_TYPES = [
  { value: "in-person", label: "In-person" },
  { value: "telehealth", label: "Telehealth" },
];

// Appointment statuses
export const APPOINTMENT_STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Medical record types
export const MEDICAL_RECORD_TYPES = [
  { value: "Lab Results", label: "Lab Results" },
  { value: "Examination", label: "Examination" },
  { value: "Imaging", label: "Imaging" },
  { value: "Immunization", label: "Immunization" },
  { value: "Surgery", label: "Surgery" },
  { value: "Prescription", label: "Prescription" },
];

// Navigation Items
export const NAV_ITEMS = [
  { path: "/find-doctors", label: "Find Doctors" },
  { path: "/appointments", label: "Appointments" },
  { path: "/community", label: "Community" },
  { path: "/video-reels", label: "Video Reels" },
];

// Routes that require authentication
export const PROTECTED_ROUTES = [
  "/appointments",
  "/patient-dashboard",
  "/doctor-dashboard",
];

// Dashboard Tabs
export const DASHBOARD_TABS = {
  PATIENT: [
    { id: "appointments", label: "Appointments" },
    { id: "records", label: "Medical Records" },
    { id: "prescriptions", label: "Prescriptions" },
  ],
  DOCTOR: [
    { id: "schedule", label: "Schedule" },
    { id: "patients", label: "Patients" },
    { id: "reviews", label: "Reviews" },
  ],
};

// Time slots for booking
export const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM"
];

// Format video view count
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}

// Default profile image placeholder
export const DEFAULT_PROFILE_IMAGE = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80";
