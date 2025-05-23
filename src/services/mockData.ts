
import { Appointment } from "@/types/app.types";

export const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    patientName: "John Doe",
    patientId: "P12345",
    hospitalName: "City General Hospital",
    hospitalId: "H001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2025-06-15",
    time: "10:00 AM",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: ""
  },
  {
    id: "apt-002",
    patientName: "Jane Smith",
    patientId: "P12345",
    hospitalName: "Metro Healthcare",
    hospitalId: "H002",
    doctorName: "Dr. Michael Chen",
    specialty: "Dermatology",
    date: "2025-06-22",
    time: "02:30 PM",
    status: "pending",
    reason: "Skin allergy consultation",
    notes: ""
  },
  {
    id: "apt-003",
    patientName: "Robert Brown",
    patientId: "P54321",
    hospitalName: "City General Hospital",
    hospitalId: "H001",
    doctorName: "Dr. Lisa Wong",
    specialty: "Orthopedics",
    date: "2025-05-30",
    time: "11:15 AM",
    status: "completed",
    reason: "Follow-up after knee surgery",
    notes: "Patient recovering well"
  }
];

export const mockTransactions = [
  {
    id: "trx-001",
    user_id: "P12345",
    amount: 1500,
    type: "payment",
    description: "Consultation fee",
    status: "completed",
    created_at: "2025-05-15T09:30:00Z"
  },
  {
    id: "trx-002",
    user_id: "P12345",
    amount: 5000,
    type: "payment",
    description: "Health card top-up",
    status: "completed",
    created_at: "2025-05-10T14:20:00Z"
  },
  {
    id: "trx-003",
    user_id: "P54321",
    amount: 3500,
    type: "payment",
    description: "Laboratory tests",
    status: "completed",
    created_at: "2025-05-12T11:45:00Z"
  }
];
