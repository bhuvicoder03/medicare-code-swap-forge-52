
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Remove Guarantor logic, simplify to just one "patient" path
const LoanApplicationForm = ({ onSubmit }: { onSubmit?: (data: any) => void }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    panNumber: "",
    aadhaarNumber: "",
    employmentType: "salaried",
    companyName: "",
    designation: "",
    monthlyIncome: "",
    workExperience: "",
    officeAddress: "",
    amount: "",
    purpose: "",
    tenure: "12",
    hospitalName: "",
    treatmentType: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.phone || !form.amount || !form.purpose) {
      toast({ variant: "destructive", title: "Missing information", description: "Please complete all required fields." });
      return;
    }
    if (onSubmit) {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-xl font-bold mb-2">Apply for Medical Loan</h2>
      {/* Personal Details */}
      <div className="space-y-2">
        <Label>Full Name *</Label>
        <Input value={form.fullName} onChange={e => handleChange("fullName", e.target.value)} placeholder="Full name" />
        <Label>Email *</Label>
        <Input value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="Email" type="email" />
        <Label>Phone *</Label>
        <Input value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="Phone number" />
        <Label>Date of Birth</Label>
        <Input value={form.dateOfBirth} onChange={e => handleChange("dateOfBirth", e.target.value)} type="date" />
        <Label>Address</Label>
        <Textarea value={form.address} onChange={e => handleChange("address", e.target.value)} placeholder="Address" />
        <Label>PAN Number</Label>
        <Input value={form.panNumber} onChange={e => handleChange("panNumber", e.target.value)} placeholder="PAN" />
        <Label>Aadhaar Number</Label>
        <Input value={form.aadhaarNumber} onChange={e => handleChange("aadhaarNumber", e.target.value)} placeholder="Aadhaar" />
      </div>
      {/* Employment Details */}
      <div className="space-y-2">
        <Label>Employment Type *</Label>
        <Select value={form.employmentType} onValueChange={value => handleChange("employmentType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="salaried">Salaried</SelectItem>
            <SelectItem value="self_employed">Self Employed</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Label>Company/Business Name *</Label>
        <Input value={form.companyName} onChange={e => handleChange("companyName", e.target.value)} />
        <Label>Designation</Label>
        <Input value={form.designation} onChange={e => handleChange("designation", e.target.value)} />
        <Label>Monthly Income *</Label>
        <Input type="number" value={form.monthlyIncome} onChange={e => handleChange("monthlyIncome", e.target.value)} />
        <Label>Work Experience (Years)</Label>
        <Input type="number" value={form.workExperience} onChange={e => handleChange("workExperience", e.target.value)} />
        <Label>Office Address</Label>
        <Input value={form.officeAddress} onChange={e => handleChange("officeAddress", e.target.value)} />
      </div>
      {/* Loan Details */}
      <div className="space-y-2">
        <Label>Loan Amount *</Label>
        <Input type="number" value={form.amount} onChange={e => handleChange("amount", e.target.value)} />
        <Label>Purpose *</Label>
        <Input value={form.purpose} onChange={e => handleChange("purpose", e.target.value)} />
        <Label>Tenure (months) *</Label>
        <Select value={form.tenure} onValueChange={value => handleChange("tenure", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="36">36</SelectItem>
            <SelectItem value="48">48</SelectItem>
            <SelectItem value="60">60</SelectItem>
          </SelectContent>
        </Select>
        <Label>Hospital Name</Label>
        <Input value={form.hospitalName} onChange={e => handleChange("hospitalName", e.target.value)} />
        <Label>Treatment Type</Label>
        <Input value={form.treatmentType} onChange={e => handleChange("treatmentType", e.target.value)} />
      </div>
      <div className="pt-8 flex justify-end">
        <Button type="submit">Submit Application</Button>
      </div>
    </form>
  );
};

export default LoanApplicationForm;
