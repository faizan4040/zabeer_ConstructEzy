// Groups rows into the last 7 days (Indian time), including days with no money
export const dayKey = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });

export const last7Days = () => {
  const out = [];
  for (let i = 6; i >= 0; i--) out.push(dayKey(Date.now() - i * 86400000));
  return out;
};

// a little more than 7 days so the oldest day is never cut off
export const sevenDaysAgo = () => new Date(Date.now() - 8 * 86400000);

export function bucketize(rows, dateField, valueFn) {
  const map = Object.fromEntries(last7Days().map((d) => [d, 0]));
  rows.forEach((r) => {
    const k = dayKey(r[dateField]);
    if (k in map) map[k] += valueFn(r) || 0;
  });
  return Object.entries(map).map(([date, earnings]) => ({ date, earnings }));
}
