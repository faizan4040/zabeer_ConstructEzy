import dayjs from "dayjs";
import Chip from "@mui/material/Chip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

import { XCircle, AlertTriangle, CheckCircle, Flame } from "lucide-react"
import { IMAGES } from "@/routes/AllImages";


export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
        Cell: ({ row }) => {
            const { name, parent, childrenCount = 0 } = row.original
            const isSub = !!parent

            // Sub-category: indent + "└"
            if (isSub) {
                return (
                    <div className="flex items-center gap-2 pl-8 text-gray-700">
                        <span className="text-gray-400">└</span>
                        <span>{name}</span>
                    </div>
                )
            }

            // Top-level: bold + sub-category count
            return (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{name}</span>
                    {childrenCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-500">
                            {childrenCount} sub
                        </span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        id: 'parent',
        header: 'Parent',
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => {
            const parent = row.original?.parent

            if (!parent) {
                return (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                        Top-level
                    </span>
                )
            }

            return (
                <span className="text-sm text-gray-700">
                    {parent.name || '—'}
                </span>
            )
        },
    },
]


export const DT_PRODUCT_COLUMN = [
 {
  id: "product",
  header: "Product",
  Cell: ({ row }) => {
    const image =
      row.original?.image?.startsWith("http")
        ? row.original.image
        : row.original?.image
        ? `${process.env.NEXT_PUBLIC_API_URL}${row.original.image}`
        : IMAGES.image_placeholder

          const name = row.original?.name || "Product"

          return (
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 shrink-0">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="64px"
                  className="rounded-md border object-cover bg-white"
                  unoptimized
                />
              </div>
            </div>
          )
        },
      },
    {
        accessorKey: 'name',
        header: 'Product Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]



export const DT_PRODUCT_VARIANT_COLUMN = [
  {
  id: "product",
  header: "Product",
  Cell: ({ row }) => {
    const rawImage = row.original?.image

    const image = rawImage
      ? rawImage.startsWith("http")
        ? rawImage
        : `${process.env.NEXT_PUBLIC_API_URL}${rawImage}`
      : IMAGES.image_placeholder

    const name = row.original?.product || "Product"

    return (
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-14 h-14 shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="56px"
            className="rounded-md border object-cover bg-white"
            unoptimized
          />
        </div>

        <span className="font-medium truncate">{name}</span>
      </div>
    )
  },
},
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: "brand",
        header: "Brand",
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'stock',
        header: 'Stock',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]



export const DT_COUPON_COLUMN = [
    {
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'DiscountPercentage',
    },
    {
        accessorKey: 'minShoppingAmount',
        header: 'MinShoppingAmount',
    },
   

    {
    accessorKey: "validity",
    header: "Validity",
    Cell: ({ row }) => {
        const validity = row.original.validity;

        if (!validity) return null;

        const isExpired = dayjs(validity).isBefore(dayjs(), "day");

        return (
        <Chip
            label={dayjs(validity).format("DD MMM YYYY")}
            color={isExpired ? "error" : "success"}
            size="small"
        />
        );
    },
    }
]



export const DT_CUSTOMERS_COLUMN = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    Cell: ({ renderedCellValue }) => {
      const avatarUrl =
        typeof renderedCellValue === "string"
          ? renderedCellValue
          : renderedCellValue?.url;

      return (
        <Avatar>
          <AvatarImage
            src={avatarUrl || IMAGES.profile}
            onError={(e) => (e.currentTarget.src = IMAGES.profile)}
          />
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'isEmailVerified',
    header: 'Is Verified',
    Cell: ({ renderedCellValue }) => (
      renderedCellValue ? (
        <Chip color="success" label="Verified" />
      ) : (
        <Chip color="error" label="Not Verified" />
      )
    ),
  },
];





export const DT_REVIEW_COLUMN = [
  {
    accessorFn: row => row.product?.name ?? 'N/A',
    header: 'Product',
  },
  {
    accessorFn: row => row.user?.name ?? 'N/A',
    header: 'User',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
  },
  {
    accessorKey: 'review',
    header: 'Review',
  },
];



/* ===================== ORDER STATUS — UPDATED ===================== */
// Matches lib/utils.js orderstatus: on_hold, pending, ready_to_ship, shipped, delivered, cancelled
const normalizeStatus = (status) =>
  String(status || "on_hold").toLowerCase()   // ✅ fallback changed: "pending" → "on_hold"

const ORDER_STATUS_MAP = {
  on_hold: {
    label: "On Hold",
    class: "bg-gray-100 text-gray-700",
  },
  pending: {
    label: "Pending",
    class: "bg-orange-100 text-orange-700",
  },
  ready_to_ship: {
    label: "Ready to Ship",
    class: "bg-blue-100 text-blue-700",
  },
  shipped: {
    label: "Shipped",
    class: "bg-purple-100 text-purple-700",
  },
  delivered: {
    label: "Delivered",
    class: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    class: "bg-red-100 text-red-700",
  },
}


/* ===================== DT_ORDER_COLUMN — SIMPLIFIED (no-scroll) ===================== */
// Reduced from 16 columns to 6 core columns. Secondary fields (email,
// address, pincode, coupon, etc.) moved to the DatatableWrapper's
// renderDetailPanel (expandable row) instead of separate columns.
export const DT_ORDER_COLUMN = [
  {
    id: "product",
    header: "Product",
    grow: true,
    Cell: ({ row }) => {
      const product = row.original?.products?.[0]

      const rawImage =
        product?.variantId?.media?.[0]?.secure_url ||
        product?.variantId?.media?.[0]?.url ||
        product?.variantId?.media?.[0]?.path ||
        null

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""

      const finalImage =
        typeof rawImage === "string" && rawImage.trim()
          ? rawImage.startsWith("http")
            ? rawImage
            : `${apiUrl}${rawImage}`
          : IMAGES.image_placeholder

      return (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 shrink-0 rounded-md border bg-white overflow-hidden">
            <Image
              src={finalImage}
              alt={product?.productId?.name || "Product"}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate">
              {product?.productId?.name || "Product"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {product?.variantId?.sku || "SKU"}
            </span>
          </div>
        </div>
      )
    },
  },

  {
    accessorKey: "order_id",
    header: "Order ID",
    size: 130,
  },

  {
    id: "customer",
    header: "Customer",
    Cell: ({ row }) => (
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate">{row.original?.name}</span>
        <span className="text-xs text-muted-foreground truncate">{row.original?.phone}</span>
      </div>
    ),
  },

  {
    id: "items",
    header: "Items",
    size: 80,
    Cell: ({ row }) => row.original?.products?.length ?? 0,
  },

  {
    accessorKey: "totalAmount",
    header: "Total",
    size: 100,
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },

  {
    accessorKey: "status",
    header: "Status",
    size: 140,
    Cell: ({ renderedCellValue }) => {
      const key = normalizeStatus(renderedCellValue)
      const status = ORDER_STATUS_MAP[key] || ORDER_STATUS_MAP.on_hold

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${status.class}`}
        >
          {status.label}
        </span>
      )
    },
  },
]


export const DT_STOCK_COLUMN = [
  {
    header: "Product",
    Cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Image
          src={row.original.image || "/placeholder.png"}
          width={36}
          height={36}
          className="rounded-lg border"
          alt={row.original.productName || "Product"}
        />
        <div>
          <p className="font-medium">{row.original.productName}</p>
          <p className="text-xs text-muted-foreground">
            SKU: {row.original.sku}
          </p>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "totalSold",
    header: "Sold",
  },

  {
    accessorKey: "remainingStock",
    header: "Stock",
  },

  {
    header: "Status",
    Cell: ({ row }) => {
      const status = row.original.status

      if (status === "Out of Stock") {
        return (
          <span className="flex items-center gap-1 text-gray-500">
            <XCircle size={16} />
            Out of Stock
          </span>
        )
      }

      if (status === "Low Stock") {
        return (
          <span className="flex items-center gap-1 text-red-500 animate-pulse">
            <AlertTriangle size={16} />
            Low Stock
          </span>
        )
      }

      return (
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle size={16} />
          In Stock
        </span>
      )
    },
  },

  {
    header: "Trending",
    Cell: ({ row }) =>
      row.original.totalSold > 50 ? (
        <span className="flex items-center gap-1 text-yellow-500">
          <Flame size={16} />
          Most Sold
        </span>
      ) : (
        "—"
      ),
  },
]



export const DT_WAREHOUSE_COLUMN = [
  {
    accessorKey: 'name',
    header: 'Warehouse Name',
    size: 150,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    size: 120,
  },
  {
    accessorKey: 'city',
    header: 'City',
    size: 100,
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    size: 120,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    size: 110,
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    size: 100,
    cell: ({ row }) => {
      const capacity = row.getValue('capacity')
      return <span className='font-semibold'>{capacity.toLocaleString()} units</span>
    },
  },
  {
    accessorKey: 'currentStock',
    header: 'Current Stock',
    size: 120,
    cell: ({ row }) => {
      const currentStock = row.getValue('currentStock')
      const capacity = row.original.capacity
      const percentage = ((currentStock / capacity) * 100).toFixed(2)
      
      return (
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>{currentStock.toLocaleString()}</span>
          <div className='w-20 h-2 bg-gray-200 rounded-full overflow-hidden'>
            <div 
              className='h-full bg-orange-500' 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <span className='text-xs text-gray-500'>{percentage}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ row }) => {
      const status = row.getValue('status')
      const statusConfig = {
        'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
        'inactive': { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
        'maintenance': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' },
      }
      
      const config = statusConfig[status] || statusConfig['inactive']
      
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    size: 110,
    cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
  },
]



export const DT_MANUAL_ORDER_COLUM = [
{
  id: 'product',
  header: 'Product',
  Cell: ({ row }) => {
    const product = row.original?.products?.[0]

    const image =
      typeof product?.media === 'string' && product.media.trim()
        ? product.media
        : IMAGES.image_placeholder

    return (
      <div className="flex items-center gap-3 min-w-55">
        <div className="relative w-14 h-14 rounded-md border overflow-hidden">
          <Image
            src={image}
            alt={product?.name || 'Product'}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-medium">{product?.name}</p>
          <p className="text-xs text-muted-foreground">
            Qty: {product?.qty} × ₹{product?.price}
          </p>
        </div>
      </div>
    )
  },
},

  {
    accessorKey: "createdAt",
    header: "Order Date",
    Cell: ({ renderedCellValue }) => {
      if (!renderedCellValue) return "-"

      const date = new Date(renderedCellValue)

      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {date.toLocaleDateString("en-IN")}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )
    },
  },

  {
    id: "payment",
    header: "Payment",
    Cell: ({ row }) => {
      const paymentId = row.original?.payment_id
      const paymentStatus = row.original?.paymentStatus

      let label = "Pending"
      let color = "bg-yellow-100 text-yellow-700"

      if (paymentStatus === "Failed") {
        label = "Failed"
        color = "bg-red-100 text-red-700"
      } else if (paymentId || paymentStatus === "Paid") {
        label = "Paid"
        color = "bg-green-100 text-green-700"
      }

      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>
          {label}
        </span>
      )
    },
  },

  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "address", header: "Address" },

  {
    header: "Items",
    Cell: ({ row }) => row.original?.products?.length ?? 0,
  },

  {
    accessorKey: "discount",
    header: "Discount",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    Cell: ({ renderedCellValue }) =>
      `₹${Math.round(Number(renderedCellValue) || 0)}`,
  },

  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ renderedCellValue }) => {
      const key = String(renderedCellValue || "pending").toLowerCase()
      const status = ORDER_STATUS_MAP[key] || { label: key, class: "bg-gray-100 text-gray-700" }

      return (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${status.class}`}
        >
          {status.label}
        </span>
      )
    },
  },
]


