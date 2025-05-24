
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface PatientInfo {
  id: string;
  name: string;
  email: string;
}

const GuarantorLoanApplication = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [patientId, setPatientId] = useState('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');
  
  const [formData, setFormData] = useState({
    // Guarantor details
    guarantorDetails: {
      fullName: '',
      email: '',
      phone: '',
      relationship: '',
      address: '',
      panNumber: '',
      aadhaarNumber: ''
    },
    // Employment details
    employmentDetails: {
      type: 'salaried',
      companyName: '',
      designation: '',
      monthlyIncome: '',
      workExperience: '',
      officeAddress: ''
    },
    // Loan details
    loanDetails: {
      amount: '',
      purpose: '',
      tenure: '12',
      hospitalName: '',
      treatmentType: ''
    }
  });

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const verifyPatientId = async () => {
    if (!patientId.trim()) {
      toast({
        variant: "destructive",
        title: "Patient ID Required",
        description: "Please enter a valid Patient ID"
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post(`/loans/verify-patient/${patientId}`);
      
      if (response.valid) {
        setPatientInfo(response.patient);
        setStep(2);
        toast({
          title: "Patient Verified",
          description: `Patient ${response.patient.name} found successfully`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Patient Not Found",
          description: response.message || "Invalid Patient ID"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Failed to verify Patient ID"
      });
    } finally {
      setVerifying(false);
    }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      const applicationData = {
        patientId: patientInfo?.id,
        applicantType: 'guarantor',
        personalDetails: {
          fullName: patientInfo?.name || '',
          email: patientInfo?.email || '',
          phone: '',
          dateOfBirth: new Date('1990-01-01'),
          address: '',
          panNumber: '',
          aadhaarNumber: ''
        },
        guarantorDetails: formData.guarantorDetails,
        employmentDetails: {
          ...formData.employmentDetails,
          monthlyIncome: Number(formData.employmentDetails.monthlyIncome),
          workExperience: Number(formData.employmentDetails.workExperience) || 0
        },
        loanDetails: {
          ...formData.loanDetails,
          amount: Number(formData.loanDetails.amount),
          tenure: Number(formData.loanDetails.tenure)
        }
      };

      const response = await api.post('/loans/apply', applicationData);
      
      setApplicationNumber(response.applicationNumber);
      setStep(3);
      
      toast({
        title: "Application Submitted",
        description: `Loan application submitted successfully. Reference: ${response.applicationNumber}`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit loan application"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPatientId('');
    setPatientInfo(null);
    setApplicationNumber('');
    setFormData({
      guarantorDetails: {
        fullName: '',
        email: '',
        phone: '',
        relationship: '',
        address: '',
        panNumber: '',
        aadhaarNumber: ''
      },
      employmentDetails: {
        type: 'salaried',
        companyName: '',
        designation: '',
        monthlyIncome: '',
        workExperience: '',
        officeAddress: ''
      },
      loanDetails: {
        amount: '',
        purpose: '',
        tenure: '12',
        hospitalName: '',
        treatmentType: ''
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Guarantor Loan Application
          </CardTitle>
          <CardDescription>
            Apply for a medical loan on behalf of a patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Step 1: Verify Patient ID</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientId">Patient ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="patientId"
                        placeholder="Enter Patient ID (e.g., P12345 or MongoDB ObjectId)"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={verifyPatientId} disabled={verifying}>
                        {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        Verify
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Enter the patient's unique ID to verify their identity and proceed with the loan application.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && patientInfo && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Patient Verified</h4>
                </div>
                <p className="text-sm text-green-700">
                  <strong>Name:</strong> {patientInfo.name}<br />
                  <strong>Email:</strong> {patientInfo.email}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Step 2: Guarantor & Loan Details</h3>
                
                {/* Guarantor Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium">Guarantor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="guarantorName">Full Name *</Label>
                      <Input
                        id="guarantorName"
                        value={formData.guarantorDetails.fullName}
                        onChange={(e) => handleInputChange('guarantorDetails', 'fullName', e.target.value)}
                        placeholder="Enter guarantor's full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorEmail">Email *</Label>
                      <Input
                        id="guarantorEmail"
                        type="email"
                        value={formData.guarantorDetails.email}
                        onChange={(e) => handleInputChange('guarantorDetails', 'email', e.target.value)}
                        placeholder="guarantor@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorPhone">Phone Number *</Label>
                      <Input
                        id="guarantorPhone"
                        value={formData.guarantorDetails.phone}
                        onChange={(e) => handleInputChange('guarantorDetails', 'phone', e.target.value)}
                        placeholder="+91-9876543210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Relationship to Patient *</Label>
                      <Select onValueChange={(value) => handleInputChange('guarantorDetails', 'relationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="relative">Relative</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="guarantorAddress">Address *</Label>
                      <Textarea
                        id="guarantorAddress"
                        value={formData.guarantorDetails.address}
                        onChange={(e) => handleInputChange('guarantorDetails', 'address', e.target.value)}
                        placeholder="Enter complete address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorPan">PAN Number *</Label>
                      <Input
                        id="guarantorPan"
                        value={formData.guarantorDetails.panNumber}
                        onChange={(e) => handleInputChange('guarantorDetails', 'panNumber', e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guarantorAadhaar">Aadhaar Number *</Label>
                      <Input
                        id="guarantorAadhaar"
                        value={formData.guarantorDetails.aadhaarNumber}
                        onChange={(e) => handleInputChange('guarantorDetails', 'aadhaarNumber', e.target.value)}
                        placeholder="1234-5678-9012"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium">Employment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employmentType">Employment Type *</Label>
                      <Select onValueChange={(value) => handleInputChange('employmentDetails', 'type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salaried">Salaried</SelectItem>
                          <SelectItem value="self_employed">Self Employed</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companyName">Company/Business Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.employmentDetails.companyName}
                        onChange={(e) => handleInputChange('employmentDetails', 'companyName', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.employmentDetails.designation}
                        onChange={(e) => handleInputChange('employmentDetails', 'designation', e.target.value)}
                        placeholder="Enter job title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.employmentDetails.monthlyIncome}
                        onChange={(e) => handleInputChange('employmentDetails', 'monthlyIncome', e.target.value)}
                        placeholder="75000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workExperience">Work Experience (Years)</Label>
                      <Input
                        id="workExperience"
                        type="number"
                        value={formData.employmentDetails.workExperience}
                        onChange={(e) => handleInputChange('employmentDetails', 'workExperience', e.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="officeAddress">Office Address</Label>
                      <Input
                        id="officeAddress"
                        value={formData.employmentDetails.officeAddress}
                        onChange={(e) => handleInputChange('employmentDetails', 'officeAddress', e.target.value)}
                        placeholder="Enter office address"
                      />
                    </div>
                  </div>
                </div>

                {/* Loan Details */}
                <div className="space-y-4 mb-6">
                  <h4 className="font-medium">Loan Requirements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loanAmount">Loan Amount *</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={formData.loanDetails.amount}
                        onChange={(e) => handleInputChange('loanDetails', 'amount', e.target.value)}
                        placeholder="500000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loanTenure">Tenure (Months) *</Label>
                      <Select onValueChange={(value) => handleInputChange('loanDetails', 'tenure', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenure" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 Months</SelectItem>
                          <SelectItem value="18">18 Months</SelectItem>
                          <SelectItem value="24">24 Months</SelectItem>
                          <SelectItem value="36">36 Months</SelectItem>
                          <SelectItem value="48">48 Months</SelectItem>
                          <SelectItem value="60">60 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="loanPurpose">Purpose *</Label>
                      <Input
                        id="loanPurpose"
                        value={formData.loanDetails.purpose}
                        onChange={(e) => handleInputChange('loanDetails', 'purpose', e.target.value)}
                        placeholder="e.g., Heart Surgery, Cancer Treatment"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hospitalName">Hospital Name</Label>
                      <Input
                        id="hospitalName"
                        value={formData.loanDetails.hospitalName}
                        onChange={(e) => handleInputChange('loanDetails', 'hospitalName', e.target.value)}
                        placeholder="Enter hospital name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatmentType">Treatment Type</Label>
                      <Input
                        id="treatmentType"
                        value={formData.loanDetails.treatmentType}
                        onChange={(e) => handleInputChange('loanDetails', 'treatmentType', e.target.value)}
                        placeholder="e.g., Cardiac, Oncology, Orthopedic"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={submitApplication} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Application
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Application Submitted Successfully!</h3>
                <p className="text-green-700 mb-4">
                  Your guarantor loan application has been submitted for patient <strong>{patientInfo?.name}</strong>
                </p>
                <div className="bg-white p-4 rounded border">
                  <p className="text-sm text-gray-600">Application Reference Number:</p>
                  <p className="text-lg font-mono font-bold text-gray-800">{applicationNumber}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  The loan application will be reviewed by the hospital and admin teams. 
                  You can check the status using the Patient ID and reference number.
                </p>
                <Button onClick={resetForm} variant="outline">
                  Submit Another Application
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuarantorLoanApplication;
