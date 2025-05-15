
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { registerHospital } from '@/services/hospitalService';
import { Hospital } from '@/types/app.types';
import { useAuth } from '@/hooks/useAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Building, Check, ArrowRight } from 'lucide-react';

const HospitalRegistration: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Hospital>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPerson: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    hospitalType: 'private',
    specialties: [],
    services: [],
    website: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [serviceInput, setServiceInput] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSpecialty = () => {
    if (specialtyInput && !formData.specialties?.includes(specialtyInput)) {
      setFormData(prev => ({ 
        ...prev, 
        specialties: [...(prev.specialties || []), specialtyInput] 
      }));
      setSpecialtyInput('');
    }
  };
  
  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(s => s !== specialty)
    }));
  };
  
  const addService = () => {
    if (serviceInput && !formData.services?.includes(serviceInput)) {
      setFormData(prev => ({ 
        ...prev, 
        services: [...(prev.services || []), serviceInput] 
      }));
      setServiceInput('');
    }
  };
  
  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter(s => s !== service)
    }));
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields before proceeding."
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.contactPerson || !formData.contactEmail || !formData.contactPhone) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please provide contact information before proceeding."
        });
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast({
        variant: "destructive",
        title: "Terms Not Accepted",
        description: "Please accept the terms and conditions to register."
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await registerHospital(formData);
      
      toast({
        title: "Hospital Registration Submitted",
        description: "Your registration has been submitted for review.",
      });
      
      // Navigate to dashboard after successful submission
      setTimeout(() => {
        navigate('/hospital-dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "There was an error submitting your registration. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Hospital Registration</CardTitle>
          <CardDescription className="text-center">
            Register your hospital with RI Medicare to provide healthcare services to our members.
          </CardDescription>
          <div className="flex justify-center mt-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
              <div className={`h-1 w-12 ${currentStep >= 4 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 4 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                4
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Hospital Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter hospital name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Zip code"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hospitalType">Hospital Type</Label>
                    <Select 
                      value={formData.hospitalType || 'private'}
                      onValueChange={(value) => handleSelectChange('hospitalType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="nonprofit">Non-Profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="contactPerson">Contact Person Name *</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="Email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website || ''}
                      onChange={handleChange}
                      placeholder="https://yourhospital.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="registrationNumber">Registration Number (optional)</Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      value={formData.registrationNumber || ''}
                      onChange={handleChange}
                      placeholder="Official registration number"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Services & Specialties</h3>
                
                <div>
                  <Label htmlFor="specialties">Hospital Specialties</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="specialties"
                      value={specialtyInput}
                      onChange={(e) => setSpecialtyInput(e.target.value)}
                      placeholder="Add a specialty"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addSpecialty} variant="outline">Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.specialties?.map((specialty, index) => (
                      <div key={index} className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm flex items-center">
                        {specialty}
                        <button 
                          type="button" 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => removeSpecialty(specialty)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {formData.specialties?.length === 0 && (
                      <p className="text-sm text-muted-foreground">No specialties added yet</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="services">Services Offered</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="services"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      placeholder="Add a service"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addService} variant="outline">Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.services?.map((service, index) => (
                      <div key={index} className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm flex items-center">
                        {service}
                        <button 
                          type="button" 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => removeService(service)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {formData.services?.length === 0 && (
                      <p className="text-sm text-muted-foreground">No services added yet</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bedCount">Number of Beds</Label>
                  <Input
                    id="bedCount"
                    name="bedCount"
                    type="number"
                    min="0"
                    value={formData.bedCount || ''}
                    onChange={handleChange}
                    placeholder="Number of beds"
                  />
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review & Submit</h3>
                
                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Hospital Information</h4>
                    <p className="font-medium mt-1">{formData.name}</p>
                    <p>{formData.address}, {formData.city}, {formData.state} - {formData.zipCode}</p>
                    <p className="mt-1">Type: {formData.hospitalType?.charAt(0).toUpperCase() + formData.hospitalType?.slice(1)}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                    <p>{formData.contactPerson}</p>
                    <p>{formData.contactEmail}</p>
                    <p>{formData.contactPhone}</p>
                    {formData.website && <p>{formData.website}</p>}
                    {formData.registrationNumber && <p>Reg #: {formData.registrationNumber}</p>}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Services & Specialties</h4>
                    <div className="mt-2">
                      <h5 className="text-xs text-muted-foreground">Specialties</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.specialties && formData.specialties.length > 0 ? 
                          formData.specialties.map((specialty, index) => (
                            <span key={index} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                              {specialty}
                            </span>
                          )) : 
                          <p className="text-xs text-muted-foreground">None specified</p>
                        }
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h5 className="text-xs text-muted-foreground">Services</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {formData.services && formData.services.length > 0 ? 
                          formData.services.map((service, index) => (
                            <span key={index} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs">
                              {service}
                            </span>
                          )) : 
                          <p className="text-xs text-muted-foreground">None specified</p>
                        }
                      </div>
                    </div>
                    
                    {formData.bedCount && (
                      <p className="mt-2">Beds: {formData.bedCount}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the terms and conditions of RI Medicare and confirm that all information provided is accurate.
                  </label>
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button type="button" className="ml-auto" onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="ml-auto" 
              onClick={handleSubmit} 
              disabled={loading || !termsAccepted}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
              {!loading && <Check className="ml-2 h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default HospitalRegistration;
