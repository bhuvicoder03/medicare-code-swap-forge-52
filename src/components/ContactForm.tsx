
import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import emailjs from 'emailjs-com';

// EmailJS configuration constants - replace with your own
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID"; 
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_USER_ID = process.env.EMAILJS_USER_ID || "YOUR_USER_ID";

// Initialize emailjs
if (EMAILJS_USER_ID !== "YOUR_USER_ID") {
  emailjs.init(EMAILJS_USER_ID);
}

interface ContactFormProps {
  className?: string;
}

const ContactForm = ({ className = '' }: ContactFormProps) => {
  const { toast } = useToast();
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sending, setSending] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      subject: '',
      message: '',
    };

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
      valid = false;
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    setFormData({
      ...formData,
      [id]: value,
    });
    
    // Clear error when user starts typing
    if (formErrors[id as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Form Validation Failed",
        description: "Please check all fields and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    
    try {
      console.log('Sending email with EmailJS...');
      
      if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" || 
          EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID" || 
          EMAILJS_USER_ID === "YOUR_USER_ID") {
        console.warn("EmailJS configuration is not set. Using mock success for demo purposes.");
        
        // Simulate a successful submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Message Sent! (Demo)",
          description: "This is a simulated success. To send real emails, please configure EmailJS.",
        });
        
        // Reset form data
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        
        setSending(false);
        return;
      }
      
      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }
      );
      
      console.log('EmailJS result:', result);
      
      if (result.status === 200) {
        toast({
          title: "Message Sent!",
          description: "We've received your message and will get back to you soon.",
        });
        
        // Reset form data
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        throw new Error(`Failed with status: ${result.status}`);
      }
      
    } catch (error) {
      console.error("Failed to send email:", error);
      toast({
        title: "Message Failed",
        description: "There was an issue sending your message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`glassmorphism p-8 rounded-2xl ${className}`}>
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h3>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            id="subject"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              formErrors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
          {formErrors.subject && <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <Textarea
            id="message"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              formErrors.message ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your message"
            value={formData.message}
            onChange={handleInputChange}
            required
          />
          {formErrors.message && <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>}
        </div>
        <Button 
          type="submit" 
          className="w-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center"
          disabled={sending}
        >
          {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {sending ? 'Sending...' : 'Send Message'}
        </Button>
        
        {(EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" || 
          EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID" || 
          EMAILJS_USER_ID === "YOUR_USER_ID") && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You need to configure your EmailJS credentials. 
              Please update the EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_USER_ID constants 
              in this file with your actual EmailJS credentials.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
