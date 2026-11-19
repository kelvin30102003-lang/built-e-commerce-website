export const SHIPPING_METHODS = {
  standard: { label: "Standard Delivery (3-5 days)", fee: 3000 },
} as const;

export const YANGON_TOWNSHIPS = [
  "Ahlon", "Bahan", "Botataung", "Cocokyun", "Dagon", "Dagon Seikkan",
  "Dala", "Dawbon", "Hlaing", "Hlaingthaya", "Insein", "Kamayut",
  "Kawhmu", "Kayan", "Kungyangon", "Kyauktada", "Kyauktan", "Lanmadaw",
  "Latha", "Mayangon", "Mingaladon", "Mingalartaungnyunt", "North Okkalapa",
  "Pabedan", "Pazundaung", "Seikgyikanaungto", "Seikkan", "Shwepyitha",
  "South Okkalapa", "Tamwe", "Thaketa", "Thanlyin", "Thingangyun",
  "Thongwa", "Twantay", "Yankin",
] as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

export const MANUAL_PAYMENT_CODES = ["kbzpay", "wavepay", "ayapay", "cbpay"] as const;

export function isManualPaymentMethod(code: string): boolean {
  return (MANUAL_PAYMENT_CODES as readonly string[]).includes(code);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  payment_pending_review: "Pending Review",
  paid: "Paid",
  failed: "Failed",
  rejected: "Rejected",
  refunded: "Refunded",
  partial_refund: "Partial Refund",
};

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  not_shipped: "Not Shipped",
  preparing: "Preparing",
  shipped: "Shipped",
  in_transit: "In Transit",
  delivered: "Delivered",
  returned: "Returned",
};
