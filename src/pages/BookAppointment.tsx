
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon, CheckCircle, Clock, Hospital, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchHospitals, fetchDoctors, bookAppointment } from "@/services/appointmentService";

interface BookingForm {
  hospitalId: string;
  doctorId: string;
  date: Date;
  timeSlot: string;
  reason: string;
  notes: string;
}

const BookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [loading, setLoading] = useState({
    hospitals: false,
    doctors: false,
    booking: false
  });
  
  const form = useForm<BookingForm>({
    defaultValues: {
      hospitalId: "",
      doctorId: "",
      date: new Date(),
      timeSlot: "",
      reason: "",
      notes: ""
    }
  });
  
  const hospitalId = form.watch("hospitalId");
  const selectedDate = form.watch("date");
  
  useEffect(() => {
    const loadHospitals = async () => {
      setLoading(prev => ({ ...prev, hospitals: true }));
      try {
        const hospitalsData = await fetchHospitals();
        setHospitals(hospitalsData);
        
        // Extract unique specialties
        const allSpecialties = hospitalsData.flatMap(hospital => hospital.specialties);
        const uniqueSpecialties = [...new Set(allSpecialties)];
        setSpecialties(uniqueSpecialties);
      } catch (error) {
        console.error("Error loading hospitals:", error);
        toast({
          title: "Error",
          description: "Failed to load hospitals. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, hospitals: false }));
      }
    };
    
    loadHospitals();
  }, [toast]);
  
  useEffect(() => {
    const loadDoctors = async () => {
      if (!hospitalId && !selectedSpecialty) {
        setDoctors([]);
        return;
      }
      
      setLoading(prev => ({ ...prev, doctors: true }));
      try {
        const doctorsData = await fetchDoctors(
          hospitalId || undefined,
          selectedSpecialty || undefined
        );
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoading(prev => ({ ...prev, doctors: false }));
      }
    };
    
    loadDoctors();
  }, [hospitalId, selectedSpecialty]);
  
  // Filter out past dates
  const isDateAvailable = (date: Date) => {
    return !isBefore(date, startOfToday());
  };
  
  // Get time slots based on selected doctor
  const getAvailableTimeSlots = () => {
    const doctorId = form.getValues("doctorId");
    if (!doctorId) return [];
    
    // In a real app, this would be dynamic based on the doctor's schedule
    const doctor = doctors.find(doc => doc.id === doctorId);
    if (!doctor) return [];
    
    // For demo purposes, create some time slots
    return [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
      "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
      "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
    ];
  };
  
  const onSubmit = async (data: BookingForm) => {
    if (!authState.isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to book an appointment.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setLoading(prev => ({ ...prev, booking: true }));
    
    try {
      const appointment = await bookAppointment({
        patientId: authState.user?.id || "anonymous",
        hospitalId: data.hospitalId,
        doctorId: data.doctorId,
        date: format(data.date, "yyyy-MM-dd"),
        time: data.timeSlot,
        reason: data.reason,
        notes: data.notes
      });
      
      if (appointment) {
        toast({
          title: "Appointment Booked",
          description: `Your appointment has been successfully scheduled for ${format(data.date, "PPP")} at ${data.timeSlot}.`,
        });
        
        // Navigate to appointments page in the dashboard
        navigate("/patient-dashboard?tab=appointments");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-brand-600 to-brand-800 text-white">
            <CardTitle>Find the Right Doctor</CardTitle>
            <CardDescription className="text-brand-100">
              Book an appointment with top healthcare specialists
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Hospital Selection */}
                  <FormField
                    control={form.control}
                    name="hospitalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={loading.hospitals}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {hospitals.map(hospital => (
                              <SelectItem key={hospital.id} value={hospital.id}>
                                {hospital.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose a hospital for your appointment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Specialty Filter */}
                  <div>
                    <FormLabel>Specialty (Optional)</FormLabel>
                    <Select 
                      onValueChange={setSelectedSpecialty} 
                      value={selectedSpecialty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Specialties</SelectItem>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Filter doctors by medical specialty
                    </p>
                  </div>
                </div>
                
                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctorId"
                  rules={{ required: "Please select a doctor" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loading.doctors || (!hospitalId && !selectedSpecialty)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.length > 0 ? (
                            doctors.map(doctor => (
                              <SelectItem key={doctor.id} value={doctor.id}>
                                {doctor.name} - {doctor.specialty} ({doctor.experience} yrs)
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled value="none">
                              No doctors available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a healthcare professional
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <FormField
                    control={form.control}
                    name="date"
                    rules={{ required: "Please select a date" }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Appointment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => !isDateAvailable(date) || date > addDays(new Date(), 30)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Choose from available dates (next 30 days)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Time Slot Selection */}
                  <FormField
                    control={form.control}
                    name="timeSlot"
                    rules={{ required: "Please select a time slot" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Slot</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!form.getValues("doctorId")}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getAvailableTimeSlots().map(slot => (
                              <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select an available time slot
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Reason for Visit */}
                <FormField
                  control={form.control}
                  name="reason"
                  rules={{ required: "Please provide a reason for visit" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Visit</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of your medical concern" {...field} />
                      </FormControl>
                      <FormDescription>
                        Briefly describe your symptoms or reason for consultation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Additional Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information for the doctor" 
                          className="resize-none" 
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include relevant medical history or specific concerns
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <CardFooter className="px-0 pb-0 pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full sm:w-auto"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700" 
                      disabled={loading.booking}
                    >
                      {loading.booking ? (
                        <>
                          <span className="animate-spin mr-2">■</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Book Appointment
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Find a Doctor</h3>
              <p className="text-muted-foreground text-sm">
                Choose from our network of specialized healthcare professionals
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Book Your Slot</h3>
              <p className="text-muted-foreground text-sm">
                Select a convenient date and time for your appointment
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                <Hospital className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Visit Hospital</h3>
              <p className="text-muted-foreground text-sm">
                Get quality care from our partner hospitals across the country
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default BookAppointment;
