// server.js socket.io instance ko global.__io me rakhta hai (API routes same Node process me chalte hain).
// Event me sirf "kya badla" jaata hai; client authenticated API se fresh data khud laata hai.
export const ADMIN_JOBS_ROOM = "admin:labour-jobs";
export const labourRoom = (userId) => `labour:${userId}`;

export function emitLive(rooms, event, payload = {}) {
  const io = globalThis.__io;
  if (!io) return;
  try {
    for (const r of [].concat(rooms).filter(Boolean)) io.to(r).emit(event, { ...payload, at: Date.now() });
  } catch (e) {
    console.error("realtime emit failed:", e.message);
  }
}

// labour + admin dono ko batao ki ek job badli
export const emitJobUpdate = (booking, event = "job:updated") =>
  emitLive([ADMIN_JOBS_ROOM, booking?.labourUser && labourRoom(String(booking.labourUser))], event, {
    bookingId: String(booking?._id || ""),
    status: booking?.status,
    bookingCode: booking?.bookingCode,
  });
