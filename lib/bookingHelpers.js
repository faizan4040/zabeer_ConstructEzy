export const COMMISSION_PERCENT = Number(process.env.COMMISSION_PERCENT || 0);
export const ACCEPT_TIMEOUT_MIN = Number(process.env.ACCEPT_TIMEOUT_MIN || 10);

export const splitFare = (fare) => {
  const adminCommission = Math.round((fare * COMMISSION_PERCENT) / 100);
  return { adminCommission, labourAmount: fare - adminCommission };
};

// labour's rate for "hourly" | "daily" (0 if the labour doesn't work that way)
export const rateFor = (labour, pricingType) => {
  if (pricingType === "hourly") {
    return ["hour", "both"].includes(labour.rateType) ? labour.pricePerHour || 0 : 0;
  }
  return ["day", "both"].includes(labour.rateType) ? labour.pricePerDay || 0 : 0;
};