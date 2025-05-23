
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Download, 
  FileText, 
  Hospital, 
  Plus, 
  Search, 
  Trash, 
  User, 
  X 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchAppointments, cancelAppointment, exportAppointmentsToCSV, Appointment } from "@/services/appointmentService";

const AppointmentManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAppointments(authState.user?.id);
        setAppointments(data);
        setFilteredAppointments(data);
      } catch (error) {
        console.error("Error loading appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (authState.isAuthenticated) {
      loadAppointments();
    }
  }, [authState.isAuthenticated, authState.user?.id, toast]);
  
  useEffect(() => {
    const filterResults = () => {
      if (!searchTerm.trim()) {
        setFilteredAppointments(appointments);
        return;
      }
      
      const term = searchTerm.toLowerCase().trim();
      const filtered = appointments.filter(apt => 
        apt.doctorName.toLowerCase().includes(term) ||
        apt.hospitalName.toLowerCase().includes(term) ||
        apt.specialty.toLowerCase().includes(term) ||
        apt.id.toLowerCase().includes(term) ||
        apt.status.toLowerCase().includes(term) ||
        apt.date.includes(term)
      );
      
      setFilteredAppointments(filtered);
    };
    
    filterResults();
  }, [searchTerm, appointments]);
  
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const success = await cancelAppointment(selectedAppointment.id);
      
      if (success) {
        // Update local state
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === selectedAppointment.id 
              ? { ...apt, status: 'cancelled' as const } 
              : apt
          )
        );
        
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
        
        toast({
          title: "Appointment Cancelled",
          description: `Your appointment has been successfully cancelled.`,
        });
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Cancellation Failed",
        description: "There was a problem cancelling your appointment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleExport = () => {
    exportAppointmentsToCSV(filteredAppointments);
  };
  
  const openCancelDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };
  
  const openDetailDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>View and manage your scheduled appointments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExport} 
                disabled={filteredAppointments.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => navigate('/book-appointment')}>
                <Plus className="h-4 w-4 mr-2" />
                Book New
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search by doctor, hospital, specialty or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-600 border-r-transparent align-[-0.125em]"></div>
              <p className="mt-4 text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Appointment ID</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Doctor & Specialty</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" /> 
                            {appointment.date}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {appointment.time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{appointment.doctorName}</div>
                          <div className="text-sm text-gray-500">{appointment.specialty}</div>
                        </div>
                      </TableCell>
                      <TableCell>{appointment.hospitalName}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDetailDialog(appointment)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                          
                          {appointment.status === 'confirmed' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => openCancelDialog(appointment)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No appointments found</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">
                {searchTerm ? "Try a different search term or" : "You don't have any appointments yet."} 
              </p>
              <Button onClick={() => navigate('/book-appointment')}>Book Your First Appointment</Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="py-4">
              <div className="rounded-lg border p-4 mb-4">
                <div className="flex items-center gap-4 mb-2">
                  <Hospital className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{selectedAppointment.hospitalName}</p>
                    <p className="text-xs text-gray-500">Hospital</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{selectedAppointment.doctorName}</p>
                    <p className="text-xs text-gray-500">{selectedAppointment.specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{selectedAppointment.date}, {selectedAppointment.time}</p>
                    <p className="text-xs text-gray-500">Appointment time</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              <Trash className="h-4 w-4 mr-2" />
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Appointment Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="py-2 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(selectedAppointment.status)}
              </div>
              
              <div className="space-y-3">
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500 mb-1">Appointment ID</p>
                  <p className="font-medium">{selectedAppointment.id}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                  <div className="flex gap-2 items-center">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p>{selectedAppointment.date}, {selectedAppointment.time}</p>
                  </div>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500 mb-1">Doctor</p>
                  <p className="font-medium">{selectedAppointment.doctorName}</p>
                  <p className="text-sm text-gray-600">{selectedAppointment.specialty}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500 mb-1">Hospital</p>
                  <p>{selectedAppointment.hospitalName}</p>
                </div>
                
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                  <p>{selectedAppointment.reason}</p>
                </div>
                
                {selectedAppointment.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Additional Notes</p>
                    <p className="text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setDetailDialogOpen(false)}
            >
              Close
            </Button>
            
            {selectedAppointment && selectedAppointment.status === 'confirmed' && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setDetailDialogOpen(false);
                  openCancelDialog(selectedAppointment);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentManagement;
