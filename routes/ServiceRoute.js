// Admin
export const ADMIN_SERVICE_CATEGORY = "/admin/service-category";
export const ADMIN_SERVICE_LABOUR_ADD = "/admin/service-labour/add";
export const ADMIN_SERVICE_LABOUR_SHOW = "/admin/service-labour";
export const ADMIN_SERVICE_LABOUR_EDIT = (id) => `/admin/service-labour/edit/${id}`;
export const ADMIN_REGISTERED_LABOURS = "/admin/registered-labours";
export const ADMIN_SERVICE_BOOKINGS = "/admin/service-bookings";
export const ADMIN_SERVICE_QUOTES = "/admin/service-quotes";
export const ADMIN_LABOUR_WITHDRAWALS = "/admin/labour-withdrawals";
export const ADMIN_LABOUR_JOBS = "/admin/labour-jobs";

// Website
export const WEBSITE_SERVICES = "/services";
export const WEBSITE_SERVICE_DETAILS = (id) => `/services/${id}`;
export const WEBSITE_SERVICE_BOOK = (id) => `/services/${id}/book`;
export const WEBSITE_SERVICE_CONFIRMED = (id) => `/services/confirmed/${id}`;
export const WEBSITE_MY_SERVICE_BOOKINGS = "/services/my-bookings";
export const WEBSITE_LOGIN = "/auth/login"; // <-- apne login page ka path yahan set karo
export const WEBSITE_MATERIAL_LIST = "/upload-material-list"; // <-- "Upload Your Material List" page ka path

// Labour
export const LABOUR_WALLET = "/labour/wallet";
