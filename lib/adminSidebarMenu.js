import { MdSpaceDashboard } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { TbPaperBag } from "react-icons/tb";
import { GoPeople } from "react-icons/go";
import { MdOutlinePermMedia } from "react-icons/md";
import { CiStar } from "react-icons/ci";
import { RiCoupon2Fill } from "react-icons/ri";
import { MdOutlineInventory2 } from "react-icons/md";
import { Store } from "lucide-react"
import { HardHat, Truck, Building2 } from "lucide-react"
import { serviceAdminMenu } from "@/lib/serviceSidebarMenu"


import { ADMIN_CATEGORY_ADD, 
         ADMIN_CATEGORY_SHOW, 
         ADMIN_COUPON_ADD, 
         ADMIN_COUPON_SHOW, 
         ADMIN_CUSTOMERS_SHOW, 
         ADMIN_DASHBOARD, 
         ADMIN_MANUAL_ORDERS_DETAILS, 
         ADMIN_MEDIA_SHOW, 
         ADMIN_ORDER_SHOW, 
         ADMIN_PRODUCT_ADD,
         ADMIN_PRODUCT_SHOW,
         ADMIN_PRODUCT_VARIANT_ADD,
         ADMIN_PRODUCT_VARIANT_SHOW,
         ADMIN_REVIEW_SHOW,
         ADMIN_STOCK_SHOW,
         ADMIN_WAREHOUSE_SHOW,
        //  ADMIN_SHOPOWNER_TRACKER_SHOW,
         ADMIN_LABOUR_VERIFY_SHOW,
         ADMIN_ORDER_BY_USER,
         ADMIN_VENDOR_LIST,
         ADMIN_LOGISTIC_PARTNERS
        } from "@/routes/AdminPanelRoute";
        
        
// { section: "..." } entries render as a heading with an underline in AppSidebar
export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: MdSpaceDashboard
    },

    /* ───────── Catalog ───────── */
    { section: "Catalog" },
    {
        title: "Product",
        url: "#",
        icon: IoShirtOutline,
        submenu: [
            { title: "Add Product", url: ADMIN_PRODUCT_ADD },
            { title: "Add Variant", url: ADMIN_PRODUCT_VARIANT_ADD },
            { title: "All Products", url: ADMIN_PRODUCT_SHOW },
            { title: "Product Variants", url: ADMIN_PRODUCT_VARIANT_SHOW },
        ]
    },
    {
        title: "Category",
        url: "#",
        icon: BiCategory,
        submenu: [
            { title: "Add Category", url: ADMIN_CATEGORY_ADD },
            { title: "All Category", url: ADMIN_CATEGORY_SHOW },
        ]
    },
    {
        title: "Inventory",
        url: "#",
        icon: MdOutlineInventory2,
        submenu: [
            { title: "WareHouse", url: ADMIN_WAREHOUSE_SHOW },
            { title: "Stock", url: ADMIN_STOCK_SHOW },
        ]
    },
    {
        title: "Coupons",
        url: "#",
        icon: RiCoupon2Fill,
        submenu: [
            { title: "Add Coupon", url: ADMIN_COUPON_ADD },
            { title: "All Coupons", url: ADMIN_COUPON_SHOW },
        ]
    },

    /* ───────── Labour & Services ───────── */
    { section: "Labour & Services" },
    ...serviceAdminMenu,
    {
        title: "Verified Labour",
        icon: HardHat,
        submenu: [
            { title: "All Labour", url: ADMIN_LABOUR_VERIFY_SHOW },
        ],
    },

    /* ───────── Orders ───────── */
    { section: "Orders" },
    {
        title: "Orders",
        url: "#",
        icon: TbPaperBag,
        submenu: [
            { title: "List", url: ADMIN_ORDER_SHOW },
            { title: "Manual orders", url: ADMIN_MANUAL_ORDERS_DETAILS },
        ]
    },
    {
        title: "Order by User",
        icon: Store,
        submenu: [
            { title: "Material List Orders", url: ADMIN_ORDER_BY_USER },
        ],
    },

    /* ───────── Partners ───────── */
    { section: "Partners" },
    {
        title: "Vendor List",
        url: ADMIN_VENDOR_LIST,
        icon: Building2
    },
    {
        title: "Logistic Partners",
        url: ADMIN_LOGISTIC_PARTNERS,
        icon: Truck
    },

    /* ───────── Customers & Content ───────── */
    { section: "Customers & Content" },
    {
        title: "Customers",
        url: ADMIN_CUSTOMERS_SHOW,
        icon: GoPeople,
    },
    {
        title: "Rating & Review",
        url: ADMIN_REVIEW_SHOW,
        icon: CiStar,
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
]
