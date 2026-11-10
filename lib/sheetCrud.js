import mongoose from "mongoose"
import { isAuthenticated } from "@/lib/authentication"
import connectDB from "@/lib/databaseConnection"
import { catchError, response } from "@/lib/helperfunction"
import { coerceValue, editableColumns } from "@/lib/partnerSheets"

// Generic admin CRUD for spreadsheet pages (Vendor List, Logistic Partners).
//   GET    -> all rows (not deleted)
//   POST   -> { rows: [ {...}, ... ] }   create one or many (CSV import / add row)
//   PATCH  -> { ids: [...], updates: {field: value} }   single cell edit OR bulk update
//             { ids: [...], restore: true }               undo a delete
//   DELETE -> { ids: [...] }   soft delete
export function createSheetHandlers(Model, sheet) {
  const cols = editableColumns(sheet)
  const colMap = Object.fromEntries(cols.map((c) => [c.key, c]))

  const guard = async () => {
    const auth = await isAuthenticated("admin")
    if (!auth.isAuth) return response(false, 401, "Unauthorized.")
    await connectDB()
    return null
  }

  // validate a partial object; returns { data, errors }
  const clean = (input, { fillDefaults = false } = {}) => {
    const data = {}
    const errors = []
    for (const col of cols) {
      if (!(col.key in input)) {
        if (fillDefaults && col.default) data[col.key] = col.default
        continue
      }
      const r = coerceValue(col, input[col.key])
      if (r.ok) data[col.key] = r.value
      else errors.push(r.error)
    }
    return { data, errors }
  }

  const validIds = (ids) =>
    Array.isArray(ids) && ids.length > 0 && ids.length <= 2000 && ids.every((id) => mongoose.isValidObjectId(id))

  async function GET() {
    try {
      const denied = await guard()
      if (denied) return denied
      const rows = await Model.find({ deletedAt: null }).sort({ seq: 1 }).lean()
      return response(true, 200, "Fetched.", rows)
    } catch (error) {
      return catchError(error, "Failed to fetch records.")
    }
  }

  async function POST(request) {
    try {
      const denied = await guard()
      if (denied) return denied
      const body = await request.json()
      const input = Array.isArray(body?.rows) ? body.rows : [body || {}]
      if (input.length === 0) return response(false, 400, "Nothing to add.")
      if (input.length > 2000) return response(false, 400, "Maximum 2000 rows per import.")

      const docs = []
      const rowErrors = []
      input.forEach((row, i) => {
        const { data, errors } = clean(row || {}, { fillDefaults: true })
        if (errors.length) rowErrors.push(`Row ${i + 1}: ${errors.join("; ")}`)
        else docs.push(data)
      })
      if (rowErrors.length) return response(false, 400, rowErrors.slice(0, 5).join("\n"), { errors: rowErrors })

      // sequential IDs (VEN-0001...). retry if two admins insert at the same moment.
      for (let attempt = 0; attempt < 3; attempt++) {
        const last = await Model.findOne().sort({ seq: -1 }).select("seq").lean()
        let seq = last?.seq || 0
        const withIds = docs.map((d) => {
          seq += 1
          return { ...d, seq, code: `${sheet.codePrefix}-${String(seq).padStart(4, "0")}` }
        })
        try {
          const created = await Model.insertMany(withIds, { ordered: true })
          return response(true, 200, `${created.length} ${sheet.singular.toLowerCase()}(s) added.`, created)
        } catch (e) {
          if (e.code !== 11000 || attempt === 2) throw e
        }
      }
    } catch (error) {
      return catchError(error, "Failed to add records.")
    }
  }

  async function PATCH(request) {
    try {
      const denied = await guard()
      if (denied) return denied
      const { ids, updates, restore } = await request.json()
      if (!validIds(ids)) return response(false, 400, "Invalid ids.")

      if (restore) {
        await Model.updateMany({ _id: { $in: ids } }, { $set: { deletedAt: null } })
        const rows = await Model.find({ _id: { $in: ids } }).lean()
        return response(true, 200, "Restored.", rows)
      }

      if (!updates || typeof updates !== "object") return response(false, 400, "No updates.")
      const unknown = Object.keys(updates).filter((k) => !colMap[k])
      if (unknown.length) return response(false, 400, `Field(s) not editable: ${unknown.join(", ")}`)
      const { data, errors } = clean(updates)
      if (errors.length) return response(false, 400, errors.join("; "))
      if (!Object.keys(data).length) return response(false, 400, "No updates.")

      await Model.updateMany({ _id: { $in: ids }, deletedAt: null }, { $set: data }, { runValidators: true })
      const rows = await Model.find({ _id: { $in: ids } }).lean()
      return response(true, 200, ids.length > 1 ? `${ids.length} rows updated.` : "Saved.", rows)
    } catch (error) {
      return catchError(error, "Failed to save.")
    }
  }

  async function DELETE(request) {
    try {
      const denied = await guard()
      if (denied) return denied
      const { ids } = await request.json()
      if (!validIds(ids)) return response(false, 400, "Invalid ids.")
      const r = await Model.updateMany({ _id: { $in: ids }, deletedAt: null }, { $set: { deletedAt: new Date() } })
      return response(true, 200, `${r.modifiedCount} row(s) deleted.`)
    } catch (error) {
      return catchError(error, "Failed to delete.")
    }
  }

  return { GET, POST, PATCH, DELETE }
}
