
import React from "react";

interface PersonalDetailsFormProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ formData, handleInputChange }) => (
  <div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Full Name</label>
      <input
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Phone</label>
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Date of Birth</label>
      <input
        type="date"
        name="dateOfBirth"
        value={formData.dateOfBirth}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Address</label>
      <textarea
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">PAN Number</label>
      <input
        type="text"
        name="panNumber"
        value={formData.panNumber}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
    <div className="mb-4">
      <label className="block mb-1 font-medium">Aadhaar Number</label>
      <input
        type="text"
        name="aadhaarNumber"
        value={formData.aadhaarNumber}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
        required
      />
    </div>
  </div>
);

export default PersonalDetailsForm;
