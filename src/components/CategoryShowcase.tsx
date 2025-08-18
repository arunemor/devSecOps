import React from "react";
import { Card } from "@/components/ui/card";
import { categoryDisplay, pricePerKg, type WasteCategory } from "@/utils/pricing";

import paperImg from "@/assets/category-paper.jpg";
import plasticImg from "@/assets/category-plastic.jpg";
import glassImg from "@/assets/category-glass.jpg";
import metalImg from "@/assets/category-metal.jpg";
import mixedImg from "@/assets/category-mixed.jpg";

const images: Record<WasteCategory, string> = {
  paper: paperImg,
  plastic: plasticImg,
  glass: glassImg,
  metal: metalImg,
  mixed: mixedImg,
};

const items: WasteCategory[] = ["paper", "plastic", "glass", "metal", "mixed"];

const CategoryShowcase: React.FC = () => {
  return (
    <section aria-labelledby="showcase-title" className="w-full">
      <div className="container px-0">
        <h2 id="showcase-title" className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
          Popular recyclables and prices
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {items.map((cat) => (
            <Card key={cat} className="overflow-hidden">
              <figure className="aspect-square overflow-hidden bg-secondary/40">
                <img
                  src={images[cat]}
                  alt={`${categoryDisplay[cat]} example for recycling price`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{categoryDisplay[cat]}</p>
                <p className="text-xl font-semibold">₹ {pricePerKg[cat]} / kg</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
