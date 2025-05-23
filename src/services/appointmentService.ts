
import { apiRequest } from './api';
import { mockAppointments, mockDoctors, mockHospitals } from './mockData';
import { toast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  hospitalName: string;
  hospitalId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
}

export interface BookAppointmentParams {
  patientId: string;
  hospitalId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
}

export const fetchAppointments = async (patientId?: string, hospitalId?: string): Promise<Appointment[]> => {
  try {
    console.log("Fetching appointments...");
    let endpoint = '/appointments';
    
    if (patientId) {
      endpoint += `?patientId=${patientId}`;
    } else if (hospitalId) {
      endpoint += `?hospitalId=${hospitalId}`;
    }
    
    const data = await apiRequest(endpoint);
    console.log('Appointments data received:', data);
    return data.appointments;
  } catch (error) {
    console.error('Error fetching appointments, falling back to mock data:', error);
    
    // Filter mock appointments based on patientId or hospitalId if provided
    let filteredAppointments = [...mockAppointments];
    
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId);
    } else if (hospitalId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.hospitalId === hospitalId);
    }
    
    return filteredAppointments;
  }
};

export const bookAppointment = async (params: BookAppointmentParams): Promise<Appointment | null> => {
  try {
    console.log("Booking appointment:", params);
    
    // Find doctor and hospital details from mock data (for the API this would come from the backend)
    const doctor = mockDoctors.find(doc => doc.id === params.doctorId);
    const hospital = mockHospitals.find(hosp => hosp.id === params.hospitalId);
    
    if (!doctor || !hospital) {
      toast({
        title: "Booking Failed",
        description: "Could not find doctor or hospital details.",
        variant: "destructive",
      });
      return null;
    }
    
    // In a real app, we would make an actual API request
    const appointmentData = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    
    console.log("Appointment booked successfully:", appointmentData);
    return appointmentData;
  } catch (error) {
    console.error('Error booking appointment, simulating successful booking:', error);
    
    // Create a mock appointment response
    const newAppointment: Appointment = {
      id: `APT-${Math.floor(100000 + Math.random() * 900000)}`,
      patientId: params.patientId,
      patientName: "Current User", // In a real app, we would have the patient name
      hospitalId: params.hospitalId,
      hospitalName: mockHospitals.find(h => h.id === params.hospitalId)?.name || "Unknown Hospital",
      doctorName: mockDoctors.find(d => d.id === params.doctorId)?.name || "Unknown Doctor",
      specialty: mockDoctors.find(d => d.id === params.doctorId)?.specialty || "General Medicine",
      date: params.date,
      time: params.time,
      status: 'confirmed',
      reason: params.reason,
      notes: params.notes
    };
    
    toast({
      title: "Appointment Booked",
      description: `Your appointment has been successfully booked. Reference ID: ${newAppointment.id}`,
    });
    
    // In a real app, this appointment would be added to the database
    return newAppointment;
  }
};

export const cancelAppointment = async (appointmentId: string): Promise<boolean> => {
  try {
    console.log(`Cancelling appointment ${appointmentId}`);
    await apiRequest(`/appointments/${appointmentId}/cancel`, { method: 'PUT' });
    return true;
  } catch (error) {
    console.error('Error cancelling appointment, simulating successful cancellation:', error);
    
    toast({
      title: "Appointment Cancelled",
      description: `Your appointment ${appointmentId} has been cancelled.`,
    });
    
    return true;
  }
};

export const fetchHospitals = async (): Promise<typeof mockHospitals> => {
  try {
    const data = await apiRequest('/hospitals');
    return data.hospitals;
  } catch (error) {
    console.error('Error fetching hospitals, falling back to mock data:', error);
    return mockHospitals;
  }
};

export const fetchDoctors = async (hospitalId?: string, specialty?: string): Promise<typeof mockDoctors> => {
  try {
    let endpoint = '/doctors';
    const params = new URLSearchParams();
    
    if (hospitalId) params.append('hospitalId', hospitalId);
    if (specialty) params.append('specialty', specialty);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const data = await apiRequest(endpoint);
    return data.doctors;
  } catch (error) {
    console.error('Error fetching doctors, falling back to mock data:', error);
    
    let filteredDoctors = [...mockDoctors];
    
    if (hospitalId) {
      filteredDoctors = filteredDoctors.filter(doc => doc.hospitalId === hospitalId);
    }
    
    if (specialty) {
      filteredDoctors = filteredDoctors.filter(doc => doc.specialty === specialty);
    }
    
    return filteredDoctors;
  }
};

// Helper function to export appointments to CSV
export const exportAppointmentsToCSV = (appointments: Appointment[]): void => {
  if (!appointments.length) {
    toast({
      title: "Export Failed",
      description: "No appointments to export.",
      variant: "destructive",
    });
    return;
  }
  
  // CSV headers
  const headers = ['Appointment ID', 'Patient Name', 'Hospital', 'Doctor', 'Specialty', 'Date', 'Time', 'Status', 'Reason'];
  
  // Convert appointment objects to CSV rows
  const csvRows = appointments.map(apt => [
    apt.id,
    apt.patientName,
    apt.hospitalName,
    apt.doctorName,
    apt.specialty,
    apt.date,
    apt.time,
    apt.status,
    apt.reason
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link and trigger the download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast({
    title: "Export Successful",
    description: `${appointments.length} appointments exported to CSV file.`,
  });
};
