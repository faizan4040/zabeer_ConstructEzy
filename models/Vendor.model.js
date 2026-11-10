import mongoose from "mongoose"
import { SHEETS } from "@/lib/partnerSheets"
import { buildSheetSchema } from "@/lib/sheetSchema"

// fields come from SHEETS.vendors.columns (lib/partnerSheets.js)
const vendorSchema = buildSheetSchema(SHEETS.vendors)

const VendorModel = mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema, "vendors")
export default VendorModel
