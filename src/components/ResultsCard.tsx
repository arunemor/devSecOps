import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryDisplay, estimatePrice, pricePerKg, type WasteCategory } from "@/utils/pricing";

interface Props {
  imageUrl?: string | null;
  label: string;
  confidence: number;
  category: WasteCategory;
}

export const ResultsCard: React.FC<Props> = ({ imageUrl, label, confidence, category }) => {
  const rate = pricePerKg[category];
  const estimate = estimatePrice(category, 1);

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Identified ${categoryDisplay[category]} sample`}
            loading="lazy"
            className="w-full md:w-56 h-40 object-contain rounded-md bg-secondary"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold">Detected: {categoryDisplay[category]}</h3>
            <Badge>{Math.round(confidence * 100)}% confidence</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Top label: {label}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Rate (per kg)</p>
              <p className="text-2xl font-semibold">₹ {rate}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Est. for 1 kg</p>
              <p className="text-2xl font-semibold">₹ {estimate}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-2xl font-semibold">{categoryDisplay[category]}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">Prices are indicative and vary by location and condition. Confirm with the center before selling.</p>
        </div>
      </div>
    </Card>
  );
};

export default ResultsCard;
