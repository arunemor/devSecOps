export type WasteCategory = "paper" | "plastic" | "glass" | "metal" | "mixed";

export const categoryDisplay: Record<WasteCategory, string> = {
  paper: "Paper / Newspaper",
  plastic: "Plastic (Bottles & More)",
  glass: "Glass (Bottles & Jars)",
  metal: "Metal (Steel/Aluminum)",
  mixed: "Mixed Scrap",
};

// Approximate market rates (example values). Adjust per region.
export const pricePerKg: Record<WasteCategory, number> = {
  paper: 12, // INR per kg
  plastic: 18,
  glass: 3,
  metal: 45,
  mixed: 8,
};

export function estimatePrice(category: WasteCategory, weightKg = 1): number {
  const rate = pricePerKg[category] ?? 0;
  return Math.round(rate * weightKg * 100) / 100;
}
