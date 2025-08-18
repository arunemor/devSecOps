import { pipeline } from "@huggingface/transformers";
import type { WasteCategory } from "@/utils/pricing";

let classifier: any | null = null;

const modelId = "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k";

export interface ClassificationResult {
  label: string;
  score: number;
  category: WasteCategory;
}

function mapLabelToCategory(label: string): WasteCategory {
  const l = label.toLowerCase();
  // Paper and cardboard
  if (/(newspaper|paper(?!\s*cup)|cardboard|carton|corrugated|magazine|notebook|book|page|sheet|paper\s*bag|carton\s*box|cardboard\s*box)/.test(l)) return "paper";
  // Glass containers
  if (/(glass\s*bottle|bottle\s*of\s*glass|glass.*(bottle|jar)|jar|goblet|wineglass|beer\s*bottle|wine\s*bottle|champagne\s*bottle|milk\s*bottle)/.test(l)) return "glass";
  // Metal cans and objects
  if (/(steel|metal|aluminium|aluminum|tin(\s*can)?|soda\s*can|soft\s*drink\s*can|iron|scrap|bolt|screw)/.test(l)) return "metal";
  // Plastics (ensure not glass)
  if (/(plastic|polyethylene|pet\b|polypropylene|water\s*bottle|soda\s*bottle|plastic\s*bottle|pet\s*bottle|disposable\s*cup)/.test(l) && !/glass/.test(l)) return "plastic";
  return "mixed";
}

async function ensureClassifier() {
  if (classifier) return classifier;
  // Try WebGPU, then WASM, then default as final fallback
  try {
    classifier = await pipeline("image-classification", modelId, { device: "webgpu" });
  } catch {
    try {
      classifier = await pipeline("image-classification", modelId, { device: "wasm" });
    } catch {
      classifier = await pipeline("image-classification", modelId);
    }
  }
  return classifier;
}

export async function classifyImageFromDataURL(dataUrl: string): Promise<ClassificationResult> {
  let clf = await ensureClassifier();
  let outputs: any;
  try {
    outputs = await clf(dataUrl, { topk: 5 });
  } catch (err) {
    try { console.warn("[wasteClassifier] initial inference failed, retrying on wasm", err); } catch {}
    // Re-init on WASM and retry once
    try {
      classifier = await pipeline("image-classification", modelId, { device: "wasm" });
      clf = classifier;
      outputs = await clf(dataUrl, { topk: 5 });
    } catch (err2) {
      try { console.error("[wasteClassifier] inference failed on all backends", err2); } catch {}
      return { label: "unknown", score: 0, category: "mixed" };
    }
  }
  // Debug: log top-k predictions for better mapping and troubleshooting
  try { console.debug("[wasteClassifier] top-k outputs", outputs); } catch {}
  const arr = Array.isArray(outputs) ? outputs : [outputs];
  const mapped = arr.map((p: any) => ({ ...p, category: mapLabelToCategory(String(p?.label || "")) }));
  const picked = mapped.find((p: any) => p.category !== "mixed") ?? mapped[0] ?? { label: "unknown", score: 0, category: "mixed" };
  const label = String(picked.label ?? "unknown");
  const score = typeof picked.score === "number" ? picked.score : 0;
  const category = picked.category as WasteCategory;
  return { label, score, category };
}
