export const ADMIN_DASHBOARD = '/admin/dashboard'


// Media routes
export const ADMIN_MEDIA_SHOW = '/admin/media'
export const ADMIN_MEDIA_EDIT = (id) => id ? `/admin/media/edit/${id}` : ''


// Category routes
export const ADMIN_CATEGORY_ADD = '/admin/category/add'
export const ADMIN_CATEGORY_SHOW = '/admin/category'
export const ADMIN_CATEGORY_EDIT = (id) => id ? `/admin/category/edit/${id}` : ''


// WareHouse routes
export const ADMIN_WAREHOUSE_SHOW = '/admin/warehouse'
export const ADMIN_WAREHOUSE_ADD = '/admin/warehouse/add'
export const ADMIN_WAREHOUSE_EDIT = (id) => `/admin/warehouse/edit/${id}`


// Optional - for trash management
export const ADMIN_WAREHOUSE_TRASH = '/admin/warehouse/trash'


// WareHouse stock
export const ADMIN_STOCK_SHOW = '/admin/stock'


// Product routes
export const ADMIN_PRODUCT_ADD = '/admin/product/add'
export const ADMIN_PRODUCT_SHOW = '/admin/product'
export const ADMIN_PRODUCT_EDIT = (id) => id ? `/admin/product/edit/${id}` : ''


// Product Variant routes
export const ADMIN_PRODUCT_VARIANT_ADD = '/admin/product-variant/add'
export const ADMIN_PRODUCT_VARIANT_SHOW = '/admin/product-variant'
export const ADMIN_PRODUCT_VARIANT_EDIT = (id) => id ? `/admin/product-variant/edit/${id}` : ''


// Coupon routes
export const ADMIN_COUPON_ADD = '/admin/coupon/add'
export const ADMIN_COUPON_SHOW = '/admin/coupon'
export const ADMIN_COUPON_EDIT = (id) => id ? `/admin/coupon/edit/${id}` : ''


// Menual orders 
export const ADMIN_MANUAL_ORDERS_ADD = '/admin/manual-order'
export const ADMIN_MANUAL_ORDERS_DETAILS = '/admin/manual-order/show-manual-orders'
export const ADMIN_MANUAL_ORDER_DETAILS = (id) => `/admin/manual-order/details/${id}`


export const ADMIN_SHOPOWNER_TRACKER_SHOW = '/admin/shopowner-tracker'
export const ADMIN_SHOPOWNER_TRACKER_DETAILS = (id) => `/admin/shopowner-tracker/${id}`

export const ADMIN_LABOUR_VERIFY_SHOW = "/admin/labour-dashboard";




// Chat show
export const ADMIN_CHAT_SHOW = '/admin/chat'

// Todo show
export const ADMIN_TODO_SHOW = '/admin/todo'

// Calendar show
export const ADMIN_CALENDAR_SHOW = '/admin/calendar'


// Customers route
export const ADMIN_CUSTOMERS_SHOW = '/admin/customers'


// Review route
export const ADMIN_REVIEW_SHOW = '/admin/review'


// Trash route
export const ADMIN_TRASH = '/admin/trash'


// Trash route
export const ADMIN_ORDER_SHOW = '/admin/orders'


// Admin order details
export const ADMIN_ORDER_DETAILS = (order_id) => order_id ? `/admin/orders/details/${order_id}` : ''


export const ADMIN_ORDER_BY_USER = "/admin/order-by-user";