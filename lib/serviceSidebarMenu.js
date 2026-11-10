import { Users, UserPlus, CalendarCheck, Settings2, Activity } from "lucide-react";
import {
  ADMIN_REGISTERED_LABOURS, ADMIN_SERVICE_LABOUR_ADD, ADMIN_SERVICE_LABOUR_SHOW,
  ADMIN_SERVICE_BOOKINGS, ADMIN_SERVICE_CATEGORY, ADMIN_SERVICE_QUOTES, ADMIN_LABOUR_WITHDRAWALS, ADMIN_LABOUR_JOBS,
} from "@/routes/ServiceRoute";

// adminAppSidebarMenu me:  ...serviceAdminMenu  daal do
export const serviceAdminMenu = [
  { title: "Labour Jobs (Live)", url: ADMIN_LABOUR_JOBS, icon: Activity },
  { title: "Registered Labours", url: ADMIN_REGISTERED_LABOURS, icon: Users },
  {
    title: "Labour Cards", url: "#", icon: UserPlus,
    submenu: [
      { title: "Add Labour", url: ADMIN_SERVICE_LABOUR_ADD },
      { title: "All Labour Cards", url: ADMIN_SERVICE_LABOUR_SHOW },
    ],
  },
  { title: "Service Bookings", url: ADMIN_SERVICE_BOOKINGS, icon: CalendarCheck },
  {
    title: "Service Setup", url: "#", icon: Settings2,
    submenu: [
      { title: "Service Categories", url: ADMIN_SERVICE_CATEGORY },
      { title: "Quote Requests", url: ADMIN_SERVICE_QUOTES },
      { title: "Labour Withdrawals", url: ADMIN_LABOUR_WITHDRAWALS },
    ],
  },
];
