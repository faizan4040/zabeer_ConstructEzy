import { createSheetHandlers } from "@/lib/sheetCrud"
import { SHEETS } from "@/lib/partnerSheets"
import LogisticPartnerModel from "@/models/LogisticPartner.model"

export const { GET, POST, PATCH, DELETE } = createSheetHandlers(LogisticPartnerModel, SHEETS.logistics)
