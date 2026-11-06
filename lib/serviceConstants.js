// Client + server dono me safe (mongoose import nahi)
export const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

// "2026-10-23" + "12:00 PM"  ->  Date (IST)
export const slotStart = (ymd, slot) => {
  const [t, ap] = slot.split(" ");
  let [h, m] = t.split(":").map(Number);
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return new Date(`${ymd}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+05:30`);
};

export const toYMD = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
export const istYMD = (date) => new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
