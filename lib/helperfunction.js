import { NextResponse } from "next/server";

export const response = (success, statusCode, message, data = {}) => {
  return NextResponse.json({
    success,
    statusCode,
    message,
    data,
  })
}

/* ─────────────────────────── ERROR HANDLING ───────────────────────────
 * Every API route ends in catchError(error, "Failed to …"). The user sees:
 *   "<what failed>: <why> (Error ID: K3F9QX)"
 * and the server log gets the full error under the same ID, so any report
 * from a user can be matched to the exact log line.
 * Secrets (DB URLs, file paths, tokens, emails) are always stripped.
 * ───────────────────────────────────────────────────────────────────── */

const humanize = (field = '') =>
  String(field).split('.').pop().replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase() || 'value'

// Remove anything that could leak infrastructure details
const sanitize = (msg = '') =>
  String(msg)
    .replace(/mongodb(\+srv)?:\/\/\S+/gi, '[database]')
    .replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/[A-Za-z]:[\\/][^\s'"]+|\/(?:home|var|usr|opt|app|srv|root|tmp)\/[^\s'"]+/g, '[path]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[email]')
    .replace(/\b(?:sk|pk|rzp|key|secret|token)[_-][\w-]{6,}\b/gi, '[secret]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

// Known error types → clear message the user can act on
const knownMessage = (error) => {
  if (!error) return null

  // duplicate key (e.g. slug / email / phone already taken)
  if (error.code == 11000) {
    const field = humanize(Object.keys(error.keyPattern || error.keyValue || {})[0])
    const value = error.keyValue ? Object.values(error.keyValue)[0] : null
    return `This ${field}${value != null ? ` "${sanitize(value).slice(0, 60)}"` : ''} is already in use. Please use a different ${field}.`
  }
  // mongoose schema validation → every field problem
  if (error.name === 'ValidationError' && error.errors) {
    const msgs = Object.values(error.errors).map((e) =>
      e.kind === 'required' ? `${humanize(e.path)} is required`
        : e.kind === 'enum' ? `${humanize(e.path)} has an invalid value`
          : e.name === 'CastError' ? `${humanize(e.path)} is not valid`
            : sanitize(e.message))
    return `Please check: ${msgs.slice(0, 3).join(', ')}.`
  }
  // bad ObjectId / number etc.
  if (error.name === 'CastError') return `Invalid ${humanize(error.path)} — the value sent is not valid.`
  // zod (if thrown instead of safeParse)
  if (error.name === 'ZodError' && Array.isArray(error.issues)) {
    const i = error.issues[0]
    return `${humanize(i?.path?.join('.') || 'input')}: ${sanitize(i?.message)}`
  }
  // request body was not valid JSON / form data
  if (error instanceof SyntaxError && /JSON/i.test(error.message)) return 'The data sent was not in the right format. Please refresh the page and try again.'
  if (/formdata|multipart/i.test(error.message || '')) return 'The uploaded form could not be read. Please try again.'
  // database down / timeout
  if (/^Mongo(Network|ServerSelection|Timeout)/.test(error.name || '') || /ECONNREFUSED|ETIMEDOUT|buffering timed out/i.test(error.message || '')) {
    return 'Could not reach the database right now. Please try again in a minute.'
  }
  // cloudinary upload
  if (error.http_code || /cloudinary/i.test(error.message || '')) return `Image upload failed: ${sanitize(error.message || error.error?.message)}`
  // external API via axios (Razorpay, courier, maps …)
  if (error.isAxiosError || error.response?.data) {
    const d = error.response?.data
    const reason = d?.error?.description || d?.message || d?.error || error.message
    return `External service error${error.response?.status ? ` (${error.response.status})` : ''}: ${sanitize(typeof reason === 'string' ? reason : JSON.stringify(reason))}`
  }
  // session / auth
  if (/jwt|JWS|token/i.test(error.name || '') || /jwt|signature/i.test(error.message || '')) return 'Your session has expired. Please log in again.'
  return null
}

const errorId = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export const catchError = (error, customMessage ) => {
  const id = errorId()
  const known = knownMessage(error)
  const context = customMessage ? String(customMessage).replace(/[.\s]+$/, '') : 'Something went wrong'
  const reason = known || sanitize(error?.message) || 'Unexpected server error'

  // Full details in the server / hosting log, tagged with the same ID the user sees
  console.error(`[API ERROR ${id}]`, context, '|', error?.name, error?.code ?? '', '|', error?.message, '\n', error?.stack)

  // known → already a full sentence; unknown → "<what failed>: <why>"
  const message = `${known ? (customMessage ? `${context}: ${known}` : known) : `${context}: ${reason}`} (Error ID: ${id})`

  return NextResponse.json({
    success: false,
    statusCode: typeof error?.code === 'number' && error.code < 600 ? error.code : 500,
    message,
    errorId: id,
    ...(process.env.NODE_ENV === 'development' ? { error: { name: error?.name, message: error?.message, stack: error?.stack } } : {}),
  })
}


export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 90000).toString()
  return otp
}




// table
export const columnConfig = (
  columns, 
  isCreatedAt = false, 
  isUpdatedAt = false, 
  isDeletedAt= false
  ) =>{
   const newColumns = [...columns]

   if(isCreatedAt) {
    newColumns.push({
      accessorkey: 'createdAt',
      header: 'Created At',
      cell: ({ renderedCellValue }) => (new Date(renderedCellValue).
      toLocaleString())
    })
   }
   
   if(isUpdatedAt){
     newColumns.push({
      accessorkey: 'updatedAt',
      header: 'Updated At',
      cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
     })
   }


   if(isDeletedAt){
     newColumns.push({
      accessorkey: 'deletedAt',
      header: 'Deleted At',
      cell: ({renderCellValue}) => (new Date(renderCellValue).toLocaleString())
     })
   }

   return newColumns
}



export const statusBadge = (status) => {
  const statusColorConfig = {
    pending: 'bg-blue-500',
    processing: 'bg-yellow-500',
    shipped: 'bg-cyan-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
    unverified: 'bg-orange-500',
  }
  return <span className={`${statusColorConfig[status]} capitalize px-3 py-1 rounded-full text-xs text-white font-semibold`}>{status}</span>
}


