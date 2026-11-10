import mongoose from "mongoose"
import { SHEETS } from "@/lib/partnerSheets"
import { buildSheetSchema } from "@/lib/sheetSchema"

// fields come from SHEETS.logistics.columns (lib/partnerSheets.js)
const logisticPartnerSchema = buildSheetSchema(SHEETS.logistics)

const LogisticPartnerModel =
  mongoose.models.LogisticPartner || mongoose.model("LogisticPartner", logisticPartnerSchema, "logisticpartners")
export default LogisticPartnerModel
