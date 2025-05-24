import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/app.types";
import { useToast } from "@/hooks/use-toast";

interface BookAppointmentDialogueProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentBook: (appointment: Appointment) => void;
  selectedHospital?: {
    id: string;
    name: string;
    doctors: Array<{
      id: string;
      name: string;
      specialty: string;
      availability: string[];
    }>;
  } | null;
}

const BookAppointmentDialogue: React.FC<BookAppointmentDialogueProps> = ({
  isOpen,
  onOpenChange,
  onAppointmentBook,
  selectedHospital
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patientName: '',
    reason: '',
    notes: '',
    selectedDoctor: '',
    selectedDate: undefined as Date | undefined,
    selectedTime: ''
  });

  const availableTimes = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.patientName || !formData.selectedDoctor || !formData.selectedDate || !formData.selectedTime || !formData.reason) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    if (!selectedHospital) {
      toast({
        variant: "destructive",
        title: "No Hospital Selected",
        description: "Please select a hospital first."
      });
      return;
    }

    const selectedDoc = selectedHospital.doctors.find(doc => doc.id === formData.selectedDoctor);
    
    const newAppointment: Appointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
      patientName: formData.patientName,
      patientId: 'current_user_id', // This should come from auth context
      hospitalName: selectedHospital.name,
      hospitalId: selectedHospital.id,
      doctorName: selectedDoc?.name || '',
      specialty: selectedDoc?.specialty || '',
      date: format(formData.selectedDate, 'yyyy-MM-dd'),
      time: formData.selectedTime,
      reason: formData.reason,
      status: 'confirmed',
      notes: formData.notes
    };

    onAppointmentBook(newAppointment);
    
    // Reset form
    setFormData({
      patientName: '',
      reason: '',
      notes: '',
      selectedDoctor: '',
      selectedDate: undefined,
      selectedTime: ''
    });
    
    onOpenChange(false);
    
    toast({
      title: "Appointment Booked",
      description: `Your appointment with Dr. ${selectedDoc?.name} has been confirmed for ${format(formData.selectedDate, 'PPP')} at ${formData.selectedTime}.`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {selectedHospital ? `Book an appointment at ${selectedHospital.name}` : 'Please select a hospital first'}
          </DialogDescription>
        </DialogHeader>

        {!selectedHospital ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Please select a hospital from the list to book an appointment.</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                placeholder="Enter patient name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doctor">Select Doctor *</Label>
              <Select value={formData.selectedDoctor} onValueChange={(value) => handleInputChange('selectedDoctor', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {selectedHospital.doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Appointment Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.selectedDate ? format(formData.selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.selectedDate}
                    onSelect={(date) => handleInputChange('selectedDate', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Preferred Time *</Label>
              <Select value={formData.selectedTime} onValueChange={(value) => handleInputChange('selectedTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="e.g., Regular checkup, Follow-up, etc."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information or special requests"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {selectedHospital && (
            <Button onClick={handleSubmit}>
              Book Appointment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookAppointmentDialogue;
