import { createSheetHandlers } from "@/lib/sheetCrud"
import { SHEETS } from "@/lib/partnerSheets"
import VendorModel from "@/models/Vendor.model"

export const { GET, POST, PATCH, DELETE } = createSheetHandlers(VendorModel, SHEETS.vendors)
