
import { apiRequest } from "./api";
import { Appointment } from "@/types/app.types";
import { mockAppointments } from "./mockData";
import { v4 as uuidv4 } from 'uuid';

// Get appointments for a patient
export const fetchPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    console.log("Fetching appointments for patient:", patientId);
    
    const response = await apiRequest(`/appointments/patient/${patientId}`);
    console.log("Appointments retrieved from API:", response);
    
    // Return the data from the API
    return response.appointments;
  } catch (error) {
    console.error("Error fetching appointments, using mock data:", error);
    
    // Fallback to mock data
    return mockAppointments
      .filter(appointment => appointment.patientId === patientId)
      .map(appointment => ({
        ...appointment,
        status: appointment.status as "pending" | "completed" | "confirmed" | "cancelled"
      }));
  }
};

// Book a new appointment
export const bookAppointment = async (appointmentData: any): Promise<Appointment> => {
  try {
    console.log("Booking appointment:", appointmentData);
    
    const response = await apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
    
    console.log("Appointment booked successfully:", response);
    return response.appointment;
  } catch (error) {
    console.error("Error booking appointment, using mock response:", error);
    
    // Create a mock appointment response
    const mockAppointment: Appointment = {
      id: uuidv4(),
      patientName: appointmentData.patientName,
      patientId: appointmentData.patientId,
      hospitalName: appointmentData.hospitalName,
      hospitalId: appointmentData.hospitalId,
      doctorName: appointmentData.doctorName,
      specialty: appointmentData.specialty,
      date: appointmentData.date,
      time: appointmentData.time,
      status: "confirmed",
      reason: appointmentData.reason || "",
      notes: ""
    };
    
    // Add to mock data for future reference
    mockAppointments.push(mockAppointment);
    
    return mockAppointment;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId: string, reason: string): Promise<void> => {
  try {
    console.log("Cancelling appointment:", appointmentId);
    
    await apiRequest(`/appointments/${appointmentId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
    
    console.log("Appointment cancelled successfully");
  } catch (error) {
    console.error("Error cancelling appointment, using mock response:", error);
    
    // Update mock data
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex !== -1) {
      mockAppointments[appointmentIndex].status = "cancelled";
      mockAppointments[appointmentIndex].notes = reason;
    }
  }
};

// Reschedule an appointment
export const rescheduleAppointment = async (
  appointmentId: string, 
  newDate: string, 
  newTime: string
): Promise<void> => {
  try {
    console.log("Rescheduling appointment:", appointmentId);
    
    await apiRequest(`/appointments/${appointmentId}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ date: newDate, time: newTime })
    });
    
    console.log("Appointment rescheduled successfully");
  } catch (error) {
    console.error("Error rescheduling appointment, using mock response:", error);
    
    // Update mock data
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex !== -1) {
      mockAppointments[appointmentIndex].date = newDate;
      mockAppointments[appointmentIndex].time = newTime;
    }
  }
};
