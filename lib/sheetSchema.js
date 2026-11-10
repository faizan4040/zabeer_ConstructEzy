import mongoose from "mongoose"

// Builds a mongoose schema from a SHEETS[...] config (lib/partnerSheets.js)
export function buildSheetSchema(sheet) {
  const fields = {
    seq: { type: Number, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    deletedAt: { type: Date, default: null, index: true },
  }
  for (const col of sheet.columns) {
    if (col.type === "code") continue
    if (["number", "percent", "rating"].includes(col.type)) fields[col.key] = { type: Number, default: null }
    else if (col.type === "date") fields[col.key] = { type: Date, default: null }
    else if (col.type === "status") fields[col.key] = { type: String, enum: col.options, default: col.default }
    else fields[col.key] = { type: String, default: "", trim: true }
  }
  const schema = new mongoose.Schema(fields, { timestamps: true })
  schema.index({ status: 1 })
  return schema
}
