import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  Building,
  Banknote,
  Settings,
  CalendarPlus,
  Stethoscope,
  Wallet,
  FileText,
} from "lucide-react";

interface PatientSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PatientSidebar: React.FC<PatientSidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, name: "Dashboard", path: "/patient-dashboard" },
    { icon: <CreditCard size={18} />, name: "Health Card", path: "/patient-dashboard?tab=healthcard" },
    { icon: <CalendarDays size={18} />, name: "Appointments", path: "/patient-dashboard?tab=appointments" },
    { icon: <Building size={18} />, name: "Hospital Visits", path: "/patient-dashboard?tab=hospitals" },
    { icon: <Banknote size={18} />, name: "Loans", path: "/patient-dashboard?tab=loans" },
    { icon: <Settings size={18} />, name: "Settings", path: "/patient-dashboard?tab=settings" },
  ];

  const quickActions = [
    { 
      icon: <CalendarPlus size={18} />, 
      name: "Book Appointment", 
      path: "/book-appointment",
      color: "text-blue-600" 
    },
    { 
      icon: <Stethoscope size={18} />, 
      name: "Find Doctor", 
      path: "/book-appointment",
      color: "text-green-600" 
    },
    { 
      icon: <Wallet size={18} />, 
      name: "Add Funds", 
      path: "/patient-dashboard?tab=healthcard",
      color: "text-purple-600" 
    },
    { 
      icon: <FileText size={18} />, 
      name: "Apply for Loan", 
      path: "/apply-loan",
      color: "text-orange-600" 
    }
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r h-full w-64 flex-col space-y-6 p-4 relative z-50",
        isOpen ? "flex" : "hidden"
      )}
    >
      <div className="pb-2 border-b">
        <Link to="/" className="flex items-center text-2xl font-semibold">
          <img src="/logo.svg" alt="Rimedicare Logo" className="mr-2 h-6 w-6" />
          Rimedicare
        </Link>
      </div>

      <div className="flex flex-col space-y-1">
        <h4 className="font-medium text-sm">Menu</h4>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-brand-600 hover:bg-brand-50 rounded-md transition-all",
              pathname === item.path
                ? "text-brand-600 bg-brand-50"
                : "text-gray-500"
            )}
          >
            <div className="mr-2">{item.icon}</div>
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col space-y-1">
        <h4 className="font-medium text-sm">Quick Actions</h4>
        {quickActions.map((action) => (
          <Link
            key={action.name}
            to={action.path}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-gray-100 rounded-md transition-all",
              "text-gray-500 hover:" + action.color
            )}
          >
            <div className="mr-2">{action.icon}</div>
            <span>{action.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default PatientSidebar;
