
// Mock data for various services when API calls fail

// Mock appointments data
export const mockAppointments = [
  {
    id: "APT-001",
    patientName: "Rahul Sharma",
    patientId: "P12345",
    hospitalName: "Apollo Hospitals",
    hospitalId: "H001",
    doctorName: "Dr. Anjali Verma",
    specialty: "Cardiology",
    date: "2025-05-30",
    time: "10:30 AM",
    status: "confirmed",
    reason: "Heart checkup",
    notes: "Patient has history of high blood pressure"
  },
  {
    id: "APT-002",
    patientName: "Priya Patel",
    patientId: "P67890",
    hospitalName: "Apollo Hospitals",
    hospitalId: "H001",
    doctorName: "Dr. Raj Kumar",
    specialty: "Orthopedics",
    date: "2025-05-28",
    time: "02:00 PM",
    status: "confirmed",
    reason: "Shoulder pain evaluation",
    notes: "Previous injury from sports activity"
  },
  {
    id: "APT-003",
    patientName: "Amit Kumar",
    patientId: "P24680",
    hospitalName: "LifeCare Medical Center",
    hospitalId: "H002",
    doctorName: "Dr. Meera Singh",
    specialty: "Dermatology",
    date: "2025-06-02",
    time: "11:15 AM",
    status: "pending",
    reason: "Skin rash examination",
    notes: ""
  },
  {
    id: "APT-004",
    patientName: "Sneha Reddy",
    patientId: "P13579",
    hospitalName: "City Hospital",
    hospitalId: "H003",
    doctorName: "Dr. Vikram Shah",
    specialty: "Gastroenterology",
    date: "2025-06-05",
    time: "09:00 AM",
    status: "confirmed",
    reason: "Digestive issues",
    notes: "Following up on previous treatment"
  },
  {
    id: "APT-005",
    patientName: "Rahul Sharma",
    patientId: "P12345",
    hospitalName: "MediLife Hospital",
    hospitalId: "H004",
    doctorName: "Dr. Sanjay Gupta",
    specialty: "Neurology",
    date: "2025-06-10",
    time: "03:30 PM",
    status: "confirmed",
    reason: "Headache evaluation",
    notes: "Recurring migraines"
  }
];

// Mock hospitals data
export const mockHospitals = [
  {
    id: "H001",
    name: "Apollo Hospitals",
    address: "Plot No 1, Banjara Hills, Hyderabad",
    phone: "040-12345678",
    email: "info@apollohospitals.com",
    specialties: ["Cardiology", "Orthopedics", "Neurology", "General Medicine"],
    rating: 4.5,
    image: "/images/hospitals/apollo.jpg"
  },
  {
    id: "H002",
    name: "LifeCare Medical Center",
    address: "123 Health Avenue, Mumbai",
    phone: "022-87654321",
    email: "contact@lifecare.com",
    specialties: ["Dermatology", "Pediatrics", "Gynecology", "ENT"],
    rating: 4.2,
    image: "/images/hospitals/lifecare.jpg"
  },
  {
    id: "H003",
    name: "City Hospital",
    address: "456 Medical Road, Delhi",
    phone: "011-23456789",
    email: "info@cityhospital.com",
    specialties: ["Gastroenterology", "Urology", "Oncology", "Ophthalmology"],
    rating: 4.7,
    image: "/images/hospitals/city.jpg"
  },
  {
    id: "H004",
    name: "MediLife Hospital",
    address: "789 Healthcare Street, Bangalore",
    phone: "080-34567890",
    email: "care@medilifehosp.com",
    specialties: ["Neurology", "Cardiology", "Pulmonology", "Rheumatology"],
    rating: 4.4,
    image: "/images/hospitals/medilife.jpg"
  },
  {
    id: "H005",
    name: "Sunshine Medical Center",
    address: "321 Wellness Road, Chennai",
    phone: "044-45678901",
    email: "info@sunshinemc.com",
    specialties: ["Endocrinology", "Psychiatry", "Dentistry", "Physical Therapy"],
    rating: 4.0,
    image: "/images/hospitals/sunshine.jpg"
  }
];

// Mock doctors data
export const mockDoctors = [
  {
    id: "D001",
    name: "Dr. Anjali Verma",
    hospitalId: "H001",
    specialty: "Cardiology",
    qualification: "MD, DM (Cardiology)",
    experience: 15,
    availability: ["Mon-Wed: 9AM-1PM", "Fri: 4PM-8PM"],
    rating: 4.8,
    image: "/images/doctors/dr-anjali.jpg"
  },
  {
    id: "D002",
    name: "Dr. Raj Kumar",
    hospitalId: "H001",
    specialty: "Orthopedics",
    qualification: "MS (Orthopedics)",
    experience: 12,
    availability: ["Mon, Wed, Fri: 10AM-3PM", "Sat: 11AM-2PM"],
    rating: 4.6,
    image: "/images/doctors/dr-raj.jpg"
  },
  {
    id: "D003",
    name: "Dr. Meera Singh",
    hospitalId: "H002",
    specialty: "Dermatology",
    qualification: "MD (Dermatology)",
    experience: 8,
    availability: ["Tue, Thu: 9AM-5PM", "Sat: 9AM-1PM"],
    rating: 4.7,
    image: "/images/doctors/dr-meera.jpg"
  },
  {
    id: "D004",
    name: "Dr. Vikram Shah",
    hospitalId: "H003",
    specialty: "Gastroenterology",
    qualification: "MD, DM (Gastroenterology)",
    experience: 18,
    availability: ["Mon-Fri: 8AM-12PM"],
    rating: 4.9,
    image: "/images/doctors/dr-vikram.jpg"
  },
  {
    id: "D005",
    name: "Dr. Sanjay Gupta",
    hospitalId: "H004",
    specialty: "Neurology",
    qualification: "MD, DM (Neurology)",
    experience: 20,
    availability: ["Mon, Wed: 2PM-6PM", "Thu-Fri: 10AM-4PM"],
    rating: 4.7,
    image: "/images/doctors/dr-sanjay.jpg"
  },
  {
    id: "D006",
    name: "Dr. Priya Malhotra",
    hospitalId: "H002",
    specialty: "Pediatrics",
    qualification: "MD (Pediatrics)",
    experience: 10,
    availability: ["Mon-Wed: 9AM-1PM", "Thu-Fri: 3PM-7PM"],
    rating: 4.5,
    image: "/images/doctors/dr-priya.jpg"
  },
  {
    id: "D007",
    name: "Dr. Anil Sharma",
    hospitalId: "H003",
    specialty: "Oncology",
    qualification: "MD, DM (Oncology)",
    experience: 22,
    availability: ["Mon, Wed, Fri: 10AM-4PM"],
    rating: 4.8,
    image: "/images/doctors/dr-anil.jpg"
  }
];
